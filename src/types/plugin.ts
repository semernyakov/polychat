import { App, Plugin } from 'obsidian';
import { GroqChatSettings } from './settings';
import { Message } from './message';
import { GroqModel } from './models';

export interface GroqPluginInterface extends Plugin {
  readonly app: App;
  readonly settings: GroqChatSettings;
  readonly defaultSettings: Readonly<GroqChatSettings>;

  saveSettings(): Promise<void>;
  loadSettings(): Promise<void>;
  resetSettings(): Promise<void>;

  changeDisplayMode(mode: 'tab' | 'sidepanel'): Promise<void>; // Добавлен новый метод

  readonly groqService: {
    sendMessage(content: string, model: GroqModel): Promise<Message>;
    getAvailableModels(): Promise<GroqModel[]>;
    validateApiKey(apiKey: string): Promise<boolean>;
  };

  readonly historyService: {
    getHistory(): Promise<Message[]>;
    addMessage(message: Message): Promise<void>;
    clearHistory(): Promise<void>;
    getCurrentMessages(): Message[]; // Добавлен новый метод
  };

  readonly authService: {
    validateApiKey(apiKey: string): Promise<boolean>;
    setApiKey(apiKey: string): Promise<void>;
  };
}
