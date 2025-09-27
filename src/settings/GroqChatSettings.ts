import { HistoryStorageMethod } from '../types/settings';
import type { RateLimitsType } from '../services/groqService';

/**
 * Настройки плагина PolyChat
 */
export interface GroqModelInfo {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  created?: number;
  owned_by?: string;
  object?: string;
  // Новые поля для расширенной информации
  category?: string;
  developer?: { name: string; url?: string };
  maxTokens?: number;
  tokensPerMinute?: number;
  releaseStatus?: string;
}

export interface GroqChatSettings {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  historyStorageMethod: HistoryStorageMethod;
  maxHistoryLength: number;
  notePath: string;
  displayMode: 'tab' | 'sidepanel'; // Новое поле
  groqAvailableModels?: GroqModelInfo[];
  groqRateLimits?: RateLimitsType;
  /** Сколько последних сообщений показывать при открытии */
  messageTailLimit?: number;
  /** Шаг подгрузки истории (кнопка и автоподгрузка при прокрутке вверх) */
  messageLoadStep?: number;
}

/**
 * Настройки по умолчанию
 */
export const DEFAULT_SETTINGS: Readonly<GroqChatSettings> = Object.freeze({
  apiKey: '',
  model: 'LLAMA3_70B',
  temperature: 0.7,
  maxTokens: 4096,
  historyStorageMethod: 'memory',
  maxHistoryLength: 20,
  notePath: 'polychat-history.md',
  displayMode: 'tab', // Значение по умолчанию
  messageTailLimit: 10,
  messageLoadStep: 20,
});
