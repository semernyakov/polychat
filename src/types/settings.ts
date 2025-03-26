import { GroqModel } from './models';

/**
 * Способы хранения истории:
 * - memory: Только в оперативной памяти
 * - localStorage: Браузерное хранилище
 * - indexedDB: База данных в браузере
 * - file: Файл в хранилище Obsidian
 */
export type HistoryStorageMethod = 'memory' | 'localStorage' | 'indexedDB' | 'file';

/**
 * Настройки плагина
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
}

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
