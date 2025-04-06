import './hot-reload';
import { Plugin, WorkspaceLeaf } from 'obsidian';
import { GroqChatView, VIEW_TYPE_GROQ_CHAT } from './views/GroqChatView';
import { DEFAULT_SETTINGS, GroqChatSettings } from './settings/GroqChatSettings';
import { AuthService } from './services/authService';
import { GroqService } from './services/groqService';
import { HistoryService } from './services/historyService';
import { GroqChatSettingsTab } from './settings/GroqChatSettingsTab';
import { GroqPluginInterface } from './types/plugin';
import './styles.css';

export default class GroqChatPlugin extends Plugin implements GroqPluginInterface {
  settings: GroqChatSettings = { ...DEFAULT_SETTINGS };
  defaultSettings: Readonly<GroqChatSettings> = { ...DEFAULT_SETTINGS };
  authService!: AuthService;
  groqService!: GroqService;
  historyService!: HistoryService;
  private currentLeaf: WorkspaceLeaf | null = null;

  async onload() {
    await this.loadSettings();
    this.initializeServices();
    this.registerView(VIEW_TYPE_GROQ_CHAT, leaf => {
      this.currentLeaf = leaf;
      return new GroqChatView(leaf, this);
    });

    this.addCommands();
    this.addRibbonIcon('message-square', 'Groq Chat', () => this.activateView());
    this.addSettingTab(new GroqChatSettingsTab(this.app, this, this.authService));
  }

  private initializeServices(): void {
    this.groqService = new GroqService(this);
    this.authService = new AuthService(this, this.groqService);
    this.historyService = new HistoryService(this);
  }

  private addCommands(): void {
    this.addCommand({
      id: 'open-groq-chat-tab',
      name: 'Open in Tab',
      callback: () => this.changeDisplayMode('tab'),
    });

    this.addCommand({
      id: 'open-groq-chat-sidepanel',
      name: 'Open in Sidepanel',
      callback: () => this.changeDisplayMode('sidepanel'),
    });
  }

  async activateView() {
    await this.changeDisplayMode(this.settings.displayMode);
  }

  async changeDisplayMode(mode: 'tab' | 'sidepanel') {
    this.settings.displayMode = mode;
    await this.saveSettings();

    // Сохраняем текущее состояние чата
    const messages =
      this.currentLeaf?.view instanceof GroqChatView ? this.currentLeaf.view.getMessages() : [];

    // Закрываем текущий view
    if (this.currentLeaf) {
      this.app.workspace.detachLeavesOfType(VIEW_TYPE_GROQ_CHAT);
    }

    // Открываем в новом режиме
    const leaf =
      mode === 'tab'
        ? this.app.workspace.getLeaf(true)
        : this.app.workspace.getRightLeaf(false) || this.app.workspace.getLeaf('split', 'vertical');

    await leaf.setViewState({
      type: VIEW_TYPE_GROQ_CHAT,
      active: true,
      state: { messages }, // Передаем сохраненные сообщения
    });

    this.currentLeaf = leaf;
    this.app.workspace.revealLeaf(leaf);
  }

  async loadSettings() {
    this.settings = { ...this.settings, ...(await this.loadData()) };
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async resetSettings() {
    this.settings = { ...this.defaultSettings };
    await this.saveSettings();
  }
}
