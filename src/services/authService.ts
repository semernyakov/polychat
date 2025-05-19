import { Notice } from 'obsidian';

export class AuthService {
  private apiKeyIsSet: boolean = false;
  private apiKey: string | null = null;

  // Теперь принимаем plugin с методами saveData/loadData
  constructor(
    private readonly groqService: { validateApiKey: (apiKey: string) => Promise<boolean> },
    private readonly plugin: { saveData: (data: any) => Promise<void>; loadData: () => Promise<any> }
  ) {
    if (!groqService || typeof groqService.validateApiKey !== 'function') {
      throw new Error('groqService with validateApiKey(apiKey) must be provided to AuthService');
    }
    if (!plugin || typeof plugin.saveData !== 'function' || typeof plugin.loadData !== 'function') {
      throw new Error('plugin with saveData/loadData methods must be provided to AuthService');
    }
  }

  get isAuthenticated(): boolean {
    return this.apiKeyIsSet;
  }

  /**
   * Загрузка сохранённого API-ключа при инициализации
   */
  async loadApiKey(): Promise<void> {
    const data = await this.plugin.loadData();
    if (data?.apiKey) {
      this.apiKey = data.apiKey;
      this.apiKeyIsSet = true;
    } else {
      this.apiKey = null;
      this.apiKeyIsSet = false;
    }
  }

  /**
   * Validate API key format and then via GroqService
   */
  async validateApiKey(apiKey: string): Promise<boolean> {
    if (!this.validateApiKeyFormat(apiKey)) {
      new Notice('❌ Invalid API key format');
      return false;
    }
    try {
      const isValid = await this.groqService.validateApiKey(apiKey);
      if (isValid) {
        new Notice('✅ Valid API key');
        return true;
      } else {
        new Notice('❌ Invalid API key');
        return false;
      }
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
    const isValid = await this.validateApiKey(apiKey);
    if (isValid) {
      await this.plugin.saveData({ apiKey });
      this.apiKey = apiKey;
      this.apiKeyIsSet = true;
      new Notice('API key set successfully.');
      return;
    } else {
      this.apiKeyIsSet = false;
      this.apiKey = null;
      return;
    }
  }

  async clearApiKey(): Promise<void> {
    await this.plugin.saveData({ apiKey: null });
    this.apiKeyIsSet = false;
    this.apiKey = null;
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
