import { Notice } from 'obsidian';
import { GroqPluginInterface } from '../types/plugin';
import { GroqService } from './groqService';

export class AuthService {
  constructor(
    private readonly plugin: GroqPluginInterface,
    private readonly groqService: GroqService,
  ) {}

  get isAuthenticated(): boolean {
    return this.validateApiKeyFormat(this.plugin.settings.apiKey);
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    if (!this.validateApiKeyFormat(apiKey)) {
      return false;
    }

    try {
      const isValid = await this.groqService.validateApiKey(apiKey);
      new Notice(isValid ? '✅ Valid API key' : '❌ Invalid API key');
      return isValid;
    } catch (error) {
      console.error('API key validation error:', error);
      new Notice('⚠️ API key validation failed');
      return false;
    }
  }

  async setApiKey(apiKey: string): Promise<void> {
    if (!apiKey) {
      await this.clearApiKey();
      return;
    }

    if (await this.validateApiKey(apiKey)) {
      this.plugin.settings.apiKey = apiKey;
      await this.plugin.saveSettings();
      this.groqService.updateApiKey(apiKey);
      return;
    }
  }

  async clearApiKey(): Promise<void> {
    this.plugin.settings.apiKey = '';
    await this.plugin.saveSettings();
    this.groqService.updateApiKey('');
    new Notice('API key cleared');
  }

  private validateApiKeyFormat(apiKey: string): boolean {
    if (!apiKey) {
      return false;
    }

    if (!/^gsk_[a-zA-Z0-9]{32,}$/.test(apiKey)) {
      return false;
    }

    return true;
  }
}
