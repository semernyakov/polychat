import { GroqChatSettings } from '../types/types'; // Shortened import
import { DEFAULT_SETTINGS } from '../settings/GroqChatSettings'; // Shortened import

export function getDefaultSettings(): GroqChatSettings {
  return {
    ...DEFAULT_SETTINGS,
    history: [],
    storeHistory: DEFAULT_SETTINGS.storeHistory,
  };
}

// Consider removing this function if it's not used anywhere
export function normalizeSettings(settings: GroqChatSettings): GroqChatSettings {
  return {
    ...settings,
    temperature: Math.max(0.1, Math.min(1.0, settings.temperature)),
    maxTokens: Math.max(1, settings.maxTokens),
    maxHistoryLength: Math.max(1, settings.maxHistoryLength),
    historyStorageMethod: settings.historyStorageMethod || 'memory',
  };
}
