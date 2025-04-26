import { HistoryStorageMethod } from '../types/settings';
import type { Locale } from '../localization';
import type { RateLimitsType } from '../services/groqService';

/**
 * Настройки плагина Groq Chat
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
  language: Locale; // Язык интерфейса
  groqAvailableModels?: GroqModelInfo[];
  groqRateLimits?: RateLimitsType;
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
  notePath: 'groq-chat-history.md',
  displayMode: 'tab', // Значение по умолчанию
  language: 'en', // По умолчанию английский
});
