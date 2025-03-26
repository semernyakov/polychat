import './hot-reload';
import { Plugin } from 'obsidian';
import { GroqChatView, VIEW_TYPE_GROQ_CHAT } from './views/GroqChatView';
import { DEFAULT_SETTINGS, GroqChatSettings } from './settings/GroqChatSettings';
import { AuthService } from './services/authService';
import { GroqService } from './services/groqService';
import { HistoryService } from './services/historyService';
import { GroqChatSettingsTab } from './settings/GroqChatSettingsTab';
import { GroqPluginInterface } from './types/plugin';
import './styles/main.css'; // Добавлен импорт стилей

export default class GroqChatPlugin extends Plugin implements GroqPluginInterface {
  settings = { ...DEFAULT_SETTINGS };
  defaultSettings = { ...DEFAULT_SETTINGS };
  authService!: AuthService;
  groqService!: GroqService;
  historyService!: HistoryService;

  async onload() {
    await this.loadSettings();
    this.initializeServices();
    this.registerView(VIEW_TYPE_GROQ_CHAT, leaf => new GroqChatView(leaf, this));
    this.addRibbonIcon('message-square', 'Groq Chat', () => this.activateView());
    this.addSettingTab(new GroqChatSettingsTab(this.app, this));
  }

  private initializeServices(): void {
    this.groqService = new GroqService(this);
    this.authService = new AuthService(this, this.groqService);
    this.historyService = new HistoryService(this);
  }

  async loadSettings() {
    this.settings = { ...this.settings, ...(await this.loadData()) };
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  // Добавлен новый метод resetSettings
  async resetSettings() {
    this.settings = { ...this.defaultSettings };
    await this.saveSettings();
  }

  private async activateView(): Promise<void> {
    await this.app.workspace.getLeaf(true).setViewState({
      type: VIEW_TYPE_GROQ_CHAT,
      active: true,
    });
  }
}
