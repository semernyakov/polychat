import { App, Plugin } from 'obsidian';
import { GroqChatSettings } from './settings';
import { Message } from './types';
import { GroqModel } from './models';

export interface GroqPluginInterface extends Plugin {
  readonly app: App;
  readonly settings: GroqChatSettings;
  readonly defaultSettings: Readonly<GroqChatSettings>;

  saveSettings(): Promise<void>;
  loadSettings(): Promise<void>;
  resetSettings(): Promise<void>;

  changeDisplayMode(mode: 'tab' | 'sidepanel'): Promise<void>;

  readonly groqService: {
    sendMessage(content: string, model: GroqModel): Promise<Message>;
    getAvailableModels(): Promise<GroqModel[]>;
  };

  readonly historyService: {
    getHistory(): Promise<Message[]>;
    addMessage(message: Message): Promise<void>;
    clearHistory(): Promise<void>;
  };

  readonly authService: {
    setApiKey(apiKey: string): Promise<void>;
  };
}
