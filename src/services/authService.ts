import { App, Notice } from 'obsidian';
import type { GroqPlugin } from '../types/plugin';
import type { GroqService } from './groqService';

export class AuthService {
  constructor(
    private readonly app: App,
    private readonly plugin: GroqPlugin,
    private readonly groqService: GroqService,
  ) {}

  get isAuthenticated(): boolean {
    return Boolean(this.plugin.settings.apiKey);
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    if (!apiKey) {
      new Notice('API ключ не может быть пустым');
      return false;
    }

    if (!/^(gsk_|sk-)[a-zA-Z0-9_]{32,}$/.test(apiKey)) {
      new Notice('Неверный формат API ключа');
      return false;
    }

    try {
      const isValid = await this.groqService.validateApiKey(apiKey);
      
      if (isValid) {
        new Notice('✅ API ключ действителен');
        return true;
      } else {
        new Notice('❌ API ключ недействителен');
        return false;
      }
    } catch (error) {
      console.error('Ошибка проверки API ключа:', error);
      new Notice('⚠️ Ошибка проверки API ключа');
      return false;
    }
  }

  async setApiKey(apiKey: string): Promise<boolean> {
    try {
      if (!apiKey) {
        await this.clearApiKey();
        return true;
      }

      const isValid = await this.validateApiKey(apiKey);
      if (isValid) {
        this.plugin.settings.apiKey = apiKey;
        await this.plugin.saveSettings();
        new Notice('API key saved successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save API key:', error);
      new Notice('Failed to save API key');
      return false;
    }
  }

  async clearApiKey(): Promise<void> {
    this.plugin.settings.apiKey = '';
    await this.plugin.saveSettings();
    new Notice('API key cleared');
  }
}
