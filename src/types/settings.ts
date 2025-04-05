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
  displayMode: 'tab' | 'sidepanel';
  apiKey: string;
  model: GroqModel;
  temperature: number;
  maxTokens: number;
  historyStorageMethod: HistoryStorageMethod;
  maxHistoryLength: number;
  notePath: string;
  storeHistory: boolean;
}
