import { GroqModel, DEFAULT_MODEL_OPTIONS } from '../constants/models';
import { GroqChatSettings, ModelConfigMap } from '../types/plugin';
import { UISettings } from '../types/settings';

export function getDefaultSettings(): GroqChatSettings {
    return {
        apiKey: '',
        model: 'llama3-70b-8192',
        temperature: 0.7,
        maxTokens: 4096,
        historyStorageMethod: 'memory',
        maxHistoryLength: 20,
        notePath: 'groq-chat-history.md'
    };
}

export function getDefaultModelConfig(): ModelConfigMap {
    return DEFAULT_MODEL_OPTIONS;
}

export function validateSettings(settings: GroqChatSettings): GroqChatSettings {
    // Проверка и коррекция настроек
    return {
        ...settings,
        temperature: Math.max(0.1, Math.min(1.0, settings.temperature || 0.7)),
        maxTokens: Math.max(1, settings.maxTokens || 4096),
        maxHistoryLength: Math.max(1, settings.maxHistoryLength || 20),
        historyStorageMethod: settings.historyStorageMethod || 'memory',
        model: settings.model || 'llama3-70b-8192'
    };
}

export const settingsUtils = {
    getDefaultUISettings(): UISettings {
        return {
            theme: 'system',
            fontSize: 14,
            showTimestamps: true
        };
    },

    getDefaultModelConfig() {
        return {
            temperature: 0.7,
            maxTokens: 2048
        };
    }
};

// Преобразование временной метки в строку времени
export function formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
} 