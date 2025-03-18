import { GroqModel } from '../constants/models';

export interface ModelSettings {
    temperature: number;
    maxTokens: number;
    customPrompt?: string;
}

export interface ModelConfigMap {
    [key in GroqModel]: ModelSettings;
}

export interface StorageSettings {
    method: 'local' | 'note';
    maxHistoryLength: number;
    notePath?: string;
}

export interface UISettings {
    theme: 'light' | 'dark' | 'system';
    fontSize: number;
    showTimestamps: boolean;
}

export interface GroqChatSettingsData {
    models: ModelConfigMap;
    storage: StorageSettings;
    ui: UISettings;
} 