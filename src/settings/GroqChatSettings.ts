import { GroqModel } from '../types/models';
import { HistoryStorageMethod } from '../types/settings';

/**
 * Настройки плагина Groq Chat
 */
export interface GroqChatSettings {
  apiKey: string;
  model: GroqModel;
  temperature: number;
  maxTokens: number;
  historyStorageMethod: HistoryStorageMethod;
  maxHistoryLength: number;
  notePath: string;
  storeHistory: boolean;
  displayMode: 'tab' | 'sidepanel'; // Новое поле
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
  displayMode: 'tab' // Значение по умолчанию
});
