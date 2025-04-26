import { Groq } from 'groq-sdk';
import { GroqPluginInterface } from '../types/plugin';
import { Message } from '../types/types';
import type { GroqModelInfo } from '../settings/GroqChatSettings';
import { Notice } from 'obsidian';

// Тип для лимитов
export type RateLimitsType = {
  requestsPerDay?: number;
  tokensPerMinute?: number;
  remainingRequests?: number;
  remainingTokens?: number;
  resetRequests?: string;
  resetTokens?: string;
};

interface GroqServiceMethods {
  updateApiKey: (_apiKey: string) => void;
  validateApiKey: (_apiKey: string) => Promise<boolean>;
  sendMessage: (_content: string, _model: string) => Promise<Message>;
  getAvailableModels: () => Promise<{ id: string; name: string; description?: string }[]>;
  getAvailableModelsWithLimits: (_forceRefresh?: boolean) => Promise<{
    _models: GroqModelInfo[];
    rateLimits: RateLimitsType;
  }>;
  handleApiError: (error: unknown) => Error;
}

export class GroqService implements GroqServiceMethods {
  private client: Groq;
  public rateLimits: RateLimitsType = {};
  private _modelCache: {
    _models: GroqModelInfo[];
    rateLimits: RateLimitsType;
    timestamp: number;
  } | null = null;
  private readonly CACHE_TTL = 60 * 60 * 1000; // 1 час

  constructor(private readonly plugin: GroqPluginInterface) {
    this.client = new Groq({
      _apiKey: this.plugin.settings._apiKey,
      dangerouslyAllowBrowser: true,
    });
  }

  public updateApiKey(_apiKey: string): void {
    this.client = new Groq({
      _apiKey: _apiKey,
      dangerouslyAllowBrowser: true,
    });
    this._modelCache = null; // Сброс кэша при смене ключа
  }

  public async validateApiKey(_apiKey: string): Promise<boolean> {
    if (!_apiKey) return false;
    try {
      const { _models } = await this.getAvailableModelsWithLimits();
      const testModel = _models[0]?.id || 'llama3-8b-8192';
      const tempClient = new Groq({ _apiKey, dangerouslyAllowBrowser: true });
      await this.retryRequest(() =>
        tempClient.chat.completions.create({
          _model: testModel,
          messages: [{ role: 'user', _content: 'test' }],
          max_tokens: 1,
        }),
      );
      return true;
    } catch (error) {
      console.error('API key validation failed:', error);
      return false;
    }
  }

  public async sendMessage(_content: string, _model: string): Promise<Message> {
    if (!_content.trim()) throw new Error('Сообщение не может быть пустым');
    if (!_model || !this.plugin.settings.groqAvailableModels?.some(m => m.id === _model)) {
      throw new Error(`Модель "${_model}" не доступна`);
    }
    try {
      // Проверка лимитов перед запросом
      if (this.rateLimits.remainingRequests === 0 || this.rateLimits.remainingTokens === 0) {
        new Notice('Превышен лимит запросов или токенов. Попробуйте позже.');
        throw new Error('Лимиты запросов исчерпаны');
      }
      const response = await this.retryRequest(() =>
        this.client.chat.completions.create({
          _model,
          messages: [{ role: 'user', _content }],
          temperature: this.plugin.settings.temperature,
          max_tokens: Math.min(this.plugin.settings.maxTokens, this.getModelMaxTokens(_model)),
        }),
      );
      if (!response.choices[0]?.message?._content) throw new Error('Empty response from API');
      return {
        id: response.id,
        role: 'assistant',
        _content: response.choices[0].message._content,
        timestamp: Date.now(),
        usage: response.usage
          ? {
              prompt_tokens: response.usage.prompt_tokens,
              completion_tokens: response.usage.completion_tokens,
              total_tokens: response.usage.total_tokens,
            }
          : undefined,
      };
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  public async getAvailableModels(): Promise<{ id: string; name: string; description?: string }[]> {
    const { _models } = await this.getAvailableModelsWithLimits();
    return _models.map(_model => ({
      id: _model.id,
      name: _model.name,
      description: _model.description,
    }));
  }

  public async getAvailableModelsWithLimits(_forceRefresh = false): Promise<{
    _models: GroqModelInfo[];
    rateLimits: RateLimitsType;
  }> {
    // Проверка кэша
    if (
      !_forceRefresh &&
      this._modelCache &&
      Date.now() - this._modelCache.timestamp < this.CACHE_TTL
    ) {
      return { _models: this._modelCache._models, rateLimits: this._modelCache.rateLimits };
    }
    try {
      const resp = await this.retryRequest(() =>
        fetch('https://api.groq.com/openai/v1/_models', {
          headers: { Authorization: `Bearer ${this.plugin.settings._apiKey}` },
        }),
      );
      if (!resp.ok) throw new Error(`API error: ${resp.status}`);
      const data = await resp.json();
      const rl: RateLimitsType = {
        requestsPerDay: resp.headers.get('x-ratelimit-limit-requests')
          ? parseInt(resp.headers.get('x-ratelimit-limit-requests')!) || undefined
          : undefined,
        tokensPerMinute: resp.headers.get('x-ratelimit-limit-tokens')
          ? parseInt(resp.headers.get('x-ratelimit-limit-tokens')!) || undefined
          : undefined,
        remainingRequests: resp.headers.get('x-ratelimit-remaining-requests')
          ? parseInt(resp.headers.get('x-ratelimit-remaining-requests')!) || undefined
          : undefined,
        remainingTokens: resp.headers.get('x-ratelimit-remaining-tokens')
          ? parseInt(resp.headers.get('x-ratelimit-remaining-tokens')!) || undefined
          : undefined,
        resetRequests: resp.headers.get('x-ratelimit-reset-requests') || undefined,
        resetTokens: resp.headers.get('x-ratelimit-reset-tokens') || undefined,
      };
      this.rateLimits = rl;
      const filtered = (data.data || []).filter((m: any) => {
        const name = (m.name || m.id || '').toLowerCase();
        return !/speech\s*to\s*text|text\s*to\s*speech|audio|image|vision|multimodal/.test(name);
      });
      const sorted = filtered.sort((a: any, b: any) => {
        const idA = (a.id || '').toLowerCase();
        const idB = (b.id || '').toLowerCase();
        return idA.localeCompare(idB);
      });
      const _models = sorted.map((m: any) => ({
        id: m.id,
        name: m.name || m.id,
        description: m.description || '',
        developer: { name: m.owned_by || '—' },
        maxTokens: typeof m.max_completion_tokens === 'number' ? m.max_completion_tokens : undefined,
        active: typeof m.active === 'boolean' ? m.active : undefined,
        releaseStatus: m.release_status || m.releaseStatus || undefined,
      }));
      // ВРЕМЕННО: логируем все поля моделей для отладки
      if (Array.isArray(data.data)) {
        console.log('[GroqService] Получено моделей:', data.data.length);
        data.data.forEach((_model: any, idx: number) => {
          console.log(`[GroqService] Модель #${idx + 1}:`, _model);
        });
      }
      // Сохранение в кэш
      this._modelCache = { _models, rateLimits: rl, timestamp: Date.now() };
      return { _models, rateLimits: rl };
    } catch (error) {
      console.error('Error fetching available _models:', error);
      return { _models: [], rateLimits: {} };
    }
  }

  public handleApiError(error: unknown): Error {
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        return new Error('Неверный API ключ. Проверьте настройки.');
      }
      if (error.message.includes('429')) {
        return new Error('Превышен лимит запросов. Попробуйте позже.');
      }
      if (error.message.includes('503')) {
        return new Error('Сервис временно недоступен.');
      }
      if (error.message.includes('Failed to fetch')) {
        return new Error('Проблемы с интернет-соединением.');
      }
      return error;
    }
    return new Error('Неизвестная ошибка API');
  }

  private async retryRequest<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (
          i === retries - 1 ||
          !(
            error instanceof Error &&
            (error.message.includes('429') || error.message.includes('503'))
          )
        ) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
    throw new Error('Не удалось выполнить запрос после повторных попыток');
  }

  private getModelMaxTokens(_modelId: string): number {
    const _model = this.plugin.settings.groqAvailableModels?.find(m => m.id === _modelId);
    return _model?.maxTokens || 4096;
  }
}
