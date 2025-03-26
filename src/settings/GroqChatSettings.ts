import { GroqModel } from '../types/models';
import { HistoryStorageMethod } from '../types/settings';

/**
 * Настройки плагина Groq Chat
 */
export interface GroqChatSettings {
  apiKey: string;
  model: GroqModel;
  temperature: number; // 0-2
  maxTokens: number; // 1-32768
  historyStorageMethod: HistoryStorageMethod;
  maxHistoryLength: number; // >=1
  notePath: string;
  storeHistory: boolean;
}

/**
 * Настройки по умолчанию
 */
export const DEFAULT_SETTINGS: Readonly<GroqChatSettings> = Object.freeze({
  apiKey: '',
  model: GroqModel.LLAMA3_70B,
  temperature: 0.7,
  maxTokens: 4096,
  historyStorageMethod: 'memory',
  maxHistoryLength: 20,
  notePath: 'groq-chat-history.md',
  storeHistory: true,
});
