import { Plugin } from 'obsidian';
import { GroqChatView, VIEW_TYPE_GROQ_CHAT } from './views/GroqChatView';
import { GroqChatSettings } from './types/types';
import { getDefaultSettings } from './utils/settingsUtils';
import { AuthService } from './services/authService';
import { GroqService } from './services/groqService';
import { GroqChatSettingsTab } from './settings/GroqChatSettingsTab';
import './static/styles/chat.css'; // Основные стили для чата
import './static/styles/notice.css'; // Стили для уведомлений

export default class GroqChatPlugin extends Plugin {
  settings!: GroqChatSettings;
  authService!: AuthService;
  groqService!: GroqService;

  async onload() {
    await this.loadSettings();
    this.initializeServices();

    this.registerView(VIEW_TYPE_GROQ_CHAT, leaf => new GroqChatView(leaf, this));
    this.addRibbonIcon('message-square', 'Open Groq Chat', () => this.activateView());
    this.addSettingTab(new GroqChatSettingsTab(this.app, this));
  }

  private initializeServices(): void {
    this.groqService = new GroqService(this.app, this);
    this.authService = new AuthService(this.app, this, this.groqService);
  }

  async loadSettings(): Promise<void> {
    this.settings = { ...getDefaultSettings(), ...(await this.loadData()) };
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  private async activateView(): Promise<void> {
    const leaf = this.app.workspace.getLeaf('tab');
    await leaf.setViewState({ type: VIEW_TYPE_GROQ_CHAT, active: true });
    await this.app.workspace.revealLeaf(leaf);
  }
}
