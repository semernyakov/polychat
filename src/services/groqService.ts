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

  async sendMessage(content: string, model: GroqModel): Promise<Message> {
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
      throw new Error(`API Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
