import { GroqChatSettings } from '../types/types';
import { DEFAULT_SETTINGS } from '../settings';

export function getDefaultSettings(): GroqChatSettings {
  return {
    ...DEFAULT_SETTINGS,
    history: [],
    storeHistory: DEFAULT_SETTINGS.storeHistory,
  };
}

export function normalizeSettings(settings: GroqChatSettings): GroqChatSettings {
  return {
    ...settings,
    temperature: Math.max(0.1, Math.min(1.0, settings.temperature)),
    maxTokens: Math.max(1, settings.maxTokens),
    maxHistoryLength: Math.max(1, settings.maxHistoryLength),
    historyStorageMethod: settings.historyStorageMethod || 'memory',
  };
}
