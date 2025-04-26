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
  updateApiKey: (apiKey: string) => void;
  validateApiKey: (apiKey: string) => Promise<boolean>;
  sendMessage: (content: string, model: string) => Promise<Message>;
  getAvailableModels: () => Promise<{ id: string; name: string; description?: string }[]>;
  getAvailableModelsWithLimits: (_forceRefresh?: boolean) => Promise<{
    models: GroqModelInfo[];
    rateLimits: RateLimitsType;
  }>;
  handleApiError: (error: unknown) => Error;
}

export class GroqService implements GroqServiceMethods {
  private client: Groq;
  public rateLimits: RateLimitsType = {};
  private modelCache: {
    models: GroqModelInfo[];
    rateLimits: RateLimitsType;
    timestamp: number;
  } | null = null;
  private readonly CACHE_TTL = 60 * 60 * 1000; // 1 час

  constructor(private readonly _plugin: GroqPluginInterface) {
    this.client = new Groq({
      apiKey: this._plugin.settings.apiKey,
      dangerouslyAllowBrowser: true,
    });
  }

  public updateApiKey(apiKey: string): void {
    this.client = new Groq({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
    });
    this.modelCache = null; // Сброс кэша при смене ключа
  }

  public async validateApiKey(apiKey: string): Promise<boolean> {
    if (!apiKey) return false;
    try {
      const { models } = await this.getAvailableModelsWithLimits();
      const testModel = models[0]?.id || 'llama3-8b-8192';
      const tempClient = new Groq({ apiKey, dangerouslyAllowBrowser: true });
      await this.retryRequest(() =>
        tempClient.chat.completions.create({
          model: testModel,
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1,
        }),
      );
      return true;
    } catch (error) {
      console.error('API key validation failed:', error);
      return false;
    }
  }

  public async sendMessage(content: string, model: string): Promise<Message> {
    if (!content.trim()) throw new Error('Сообщение не может быть пустым');
    if (!model || !this._plugin.settings.groqAvailableModels?.some(m => m.id === model)) {
      throw new Error(`Модель "${model}" не доступна`);
    }
    try {
      // Проверка лимитов перед запросом
      if (this.rateLimits.remainingRequests === 0 || this.rateLimits.remainingTokens === 0) {
        new Notice('Превышен лимит запросов или токенов. Попробуйте позже.');
        throw new Error('Лимиты запросов исчерпаны');
      }
      const response = await this.retryRequest(() =>
        this.client.chat.completions.create({
          model,
          messages: [{ role: 'user', content }],
          temperature: this._plugin.settings.temperature,
          max_tokens: Math.min(this._plugin.settings.maxTokens, this.getModelMaxTokens(model)),
        }),
      );
      if (!response.choices[0]?.message?.content) throw new Error('Empty response from API');
      return {
        id: response.id,
        role: 'assistant',
        content: response.choices[0].message.content,
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
    const { models } = await this.getAvailableModelsWithLimits();
    return models.map(model => ({
      id: model.id,
      name: model.name,
      description: model.description,
    }));
  }

  public async getAvailableModelsWithLimits(_forceRefresh = false): Promise<{
    models: GroqModelInfo[];
    rateLimits: RateLimitsType;
  }> {
    // Проверка кэша
    if (
      !_forceRefresh &&
      this.modelCache &&
      Date.now() - this.modelCache.timestamp < this.CACHE_TTL
    ) {
      return { models: this.modelCache.models, rateLimits: this.modelCache.rateLimits };
    }
    try {
      const resp = await this.retryRequest(() =>
        fetch('https://api.groq.com/openai/v1/models', {
          headers: { Authorization: `Bearer ${this._plugin.settings.apiKey}` },
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
      const models = sorted.map((m: any) => ({
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
        data.data.forEach((model: any, idx: number) => {
          console.log(`[GroqService] Модель #${idx + 1}:`, model);
        });
      }
      // Сохранение в кэш
      this.modelCache = { models, rateLimits: rl, timestamp: Date.now() };
      return { models, rateLimits: rl };
    } catch (error) {
      console.error('Error fetching available models:', error);
      return { models: [], rateLimits: {} };
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

  private getModelMaxTokens(modelId: string): number {
    const model = this._plugin.settings.groqAvailableModels?.find(m => m.id === modelId);
    return model?.maxTokens || 4096;
  }
}
