import { App } from 'obsidian';
import { GroqChatSettings } from './types';
import { Message } from './types';
import { GroqModel } from './models';

export interface GroqPlugin {
  app: App;
  settings: GroqChatSettings;
  groqService: {
    sendMessage: (content: string, model: GroqModel) => Promise<Message>;
    getAvailableModels?: () => Promise<GroqModel[]>;
  };
  authService: {
    validateApiKey: (apiKey: string) => Promise<boolean>;
    setApiKey?: (apiKey: string) => Promise<boolean>;
  };
  saveSettings: () => Promise<void>;
  loadSettings?: () => Promise<void>;
}
