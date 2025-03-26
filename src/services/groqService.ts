import { Groq } from 'groq-sdk';
import { GroqPluginInterface } from '../types/plugin';
import { GroqModel } from '../types/models';
import { Message } from '../types/message';

export class GroqService {
  private client: Groq;

  constructor(private readonly plugin: GroqPluginInterface) {
    this.client = new Groq({
      apiKey: this.plugin.settings.apiKey,
      dangerouslyAllowBrowser: true,
    });
  }

  private initializeClient(): void {
    this.client = new Groq({
      apiKey: this.plugin.settings.apiKey,
      dangerouslyAllowBrowser: true,
    });
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    if (!apiKey) return false;

    try {
      const tempClient = new Groq({ apiKey, dangerouslyAllowBrowser: true });
      await tempClient.chat.completions.create({
        model: GroqModel.LLAMA3_8B, // Используем более легкую модель для проверки
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1,
      });
      return true;
    } catch (error) {
      console.error('API key validation failed:', error);
      return false;
    }
  }

  async sendMessage(content: string, model: GroqModel): Promise<Message> {
    if (!content.trim()) {
      throw new Error('Message content cannot be empty');
    }

    try {
      const response = await this.client.chat.completions.create({
        model,
        messages: [{ role: 'user', content }],
        temperature: this.plugin.settings.temperature,
        max_tokens: this.plugin.settings.maxTokens,
      });

      if (!response.choices[0]?.message?.content) {
        throw new Error('Empty response from API');
      }

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

  async getAvailableModels(): Promise<GroqModel[]> {
    try {
      const response = await this.client.models.list();
      return response.data.map(model => model.id as GroqModel);
    } catch (error) {
      console.error('Error fetching available models:', error);
      return [];
    }
  }

  private handleApiError(error: unknown): Error {
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        return new Error('Invalid API key. Please check your settings.');
      }
      return error;
    }
    return new Error('Unknown API error');
  }
}
