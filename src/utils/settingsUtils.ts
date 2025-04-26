import { GroqChatSettings } from '../types/settings';
import { DEFAULT_SETTINGS } from '../settings/GroqChatSettings';

export function getDefaultSettings(): GroqChatSettings {
  return {
    ...DEFAULT_SETTINGS,
    groqAvailableModels: [],
  };
}

export function normalizeSettings(settings: GroqChatSettings): GroqChatSettings {
  return {
    ...settings,
    temperature: Math.max(0.1, Math.min(1.0, settings.temperature)),
    maxTokens: Math.max(1, settings.maxTokens),
    maxHistoryLength: Math.max(1, settings.maxHistoryLength),
    historyStorageMethod: settings.historyStorageMethod || 'memory',
    notePath: settings.notePath || 'groq-chat-history.md',
  };
}
