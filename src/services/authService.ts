import { Notice } from 'obsidian';

export class AuthService {
  constructor() {}

  get isAuthenticated(): boolean {
    return this.validateApiKeyFormat('');
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    if (!this.validateApiKeyFormat(apiKey)) {
      new Notice('❌ Неверный формат API ключа');
      return false;
    }

    try {
      const isValid = await this.validateApiKey(apiKey);
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
      this.clearApiKey();
      return;
    }
  }

  async clearApiKey(): Promise<void> {
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
