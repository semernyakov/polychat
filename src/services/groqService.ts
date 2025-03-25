import { App } from 'obsidian';
import { Groq } from 'groq-sdk';
import { GroqPlugin } from '../types/plugin';
import { GroqModel } from '../types/models';
import { Message } from '../types/types';

export class GroqService {
  private readonly client: Groq;

  constructor(
    private readonly app: App,
    private readonly plugin: GroqPlugin
  ) {
    this.client = new Groq({
      apiKey: this.plugin.settings.apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  /**
   * Validates the provided API key
   * @param apiKey - The API key to validate
   * @returns Promise<boolean> - True if the key is valid
   */
  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const tempClient = new Groq({ apiKey, dangerouslyAllowBrowser: true });
      await tempClient.chat.completions.create({
        model: 'llama3-70b-8192',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1,
      });
      return true;
    } catch (error) {
      console.error('Ошибка проверки API ключа:', error);
      return false;
    }
  }

  /**
   * Sends a message to the Groq API
   * @param content - The message content
   * @param model - The model to use
   * @returns Promise<Message> - The assistant's response
   * @throws Error if content is empty or API request fails
   */
  async sendMessage(content: string, model: GroqModel): Promise<Message> {
    if (!content.trim()) {
      throw new Error('Message content cannot be empty');
    }

    try {
      const response = await this.client.chat.completions.create({
        model,
        messages: [{ role: 'user', content }],
        temperature: this.plugin.settings.temperature,
        max_tokens: this.plugin.settings.maxTokens
      });

      return {
        id: response.id,
        role: 'assistant',
        content: response.choices[0].message.content || '',
        timestamp: Date.now()
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('401')) {
        throw new Error('Неверный API ключ. Пожалуйста, проверьте ключ в настройках.');
      }
      throw new Error(`API Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
