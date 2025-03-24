import { GroqModel } from '../types/models';

export interface GroqChatSettings {
  apiKey: string;
  model: GroqModel;
  temperature: number;
  maxTokens: number;
  historyStorageMethod: 'memory' | 'localStorage' | 'indexedDB' | 'file';
  maxHistoryLength: number;
  notePath: string;
}

export const DEFAULT_SETTINGS: GroqChatSettings = {
  apiKey: '',
  model: GroqModel.LLAMA3_70B,
  temperature: 0.7,
  maxTokens: 4096,
  historyStorageMethod: 'memory',
  maxHistoryLength: 20,
  notePath: 'groq-chat-history.md',
};
