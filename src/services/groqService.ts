import { App } from 'obsidian';
import { GroqPlugin } from '../types/plugin';
import { Message } from '../types/message';
import { MODELS, ModelInfo } from '../constants';

export class GroqService {
  private app: App;
  private plugin: GroqPlugin;
  private readonly API_BASE = 'https://api.groq.com/openai/v1';

  constructor(app: App, plugin: GroqPlugin) {
    this.app = app;
    this.plugin = plugin;
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}/models`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('API ключ недействителен:', error.error?.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Ошибка проверки API ключа:', error);
      return false;
    }
  }

  async sendMessage(
    content: string,
    model: string = this.plugin.settings.model,
    temperature: number = this.plugin.settings.temperature,
    maxTokens: number = this.plugin.settings.maxTokens,
  ): Promise<Message> {
    if (!this.plugin.settings.apiKey) {
      throw new Error('API ключ не задан. Пожалуйста, введите API ключ в настройках.');
    }

    const modelInfo = MODELS[model];
    if (!modelInfo) {
      throw new Error('Неизвестная модель');
    }

    if (modelInfo.isPreview) {
      console.warn('Внимание: используется preview модель, не рекомендуется для production.');
    }

    // Проверяем и корректируем maxTokens если превышает лимит модели
    if (modelInfo.maxCompletionTokens && maxTokens > modelInfo.maxCompletionTokens) {
      console.warn(
        `Превышен лимит токенов для модели ${modelInfo.name}. Установлено максимальное значение ${modelInfo.maxCompletionTokens}`,
      );
      maxTokens = modelInfo.maxCompletionTokens;
    }

    try {
      const response = await fetch(`${this.API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.plugin.settings.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content }],
          temperature,
          max_tokens: maxTokens,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API ошибка: ${errorData.error?.message || 'Неизвестная ошибка'}`);
      }

      const data = await response.json();

      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Некорректный ответ от API');
      }

      return {
        id: data.id || Date.now().toString(),
        role: 'assistant',
        content: data.choices[0].message.content,
        timestamp: Date.now(),
        usage: data.usage,
      };
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      throw error;
    }
  }

  getAvailableModels(): Array<ModelInfo> {
    return Object.values(MODELS).sort((a, b) => {
      // Сначала production модели, потом preview
      if (a.isPreview !== b.isPreview) {
        return a.isPreview ? 1 : -1;
      }
      // В рамках каждой группы сортируем по имени
      return a.name.localeCompare(b.name);
    });
  }

  getModelInfo(modelId: string): ModelInfo | undefined {
    return MODELS[modelId];
  }

  isPreviewModel(modelId: string): boolean {
    return MODELS[modelId]?.isPreview ?? false;
  }

  getModelContextWindow(modelId: string): number | undefined {
    return MODELS[modelId]?.contextWindow;
  }
}
