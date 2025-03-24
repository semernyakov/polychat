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
    if (!apiKey) return false;

    try {
      const isValid = await this.groqService.validateApiKey(apiKey);
      if (!isValid) {
        new Notice('Invalid API key');
      }
      return isValid;
    } catch (error) {
      console.error('API key validation error:', error);
      new Notice('API key validation failed');
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
