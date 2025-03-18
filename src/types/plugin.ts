import { App } from 'obsidian';
import { GroqModel } from '../constants/models';

export interface ModelSettings {
    temperature: number;
    maxTokens: number;
}

export interface GroqChatSettings {
    apiKey: string;
    model: GroqModel;
    temperature: number;
    maxTokens: number;
    historyStorageMethod: 'memory' | 'file';
    maxHistoryLength: number;
    notePath: string;
}

export interface ModelConfig {
    temperature: number;
    maxTokens: number;
}

export interface ModelConfigMap {
    [key: string]: ModelConfig;
}

export const DEFAULT_SETTINGS: GroqChatSettings = {
    apiKey: '',
    model: 'llama3-70b-8192',
    temperature: 0.7,
    maxTokens: 4096,
    historyStorageMethod: 'memory',
    maxHistoryLength: 20,
    notePath: 'groq-chat-history.md'
};

export interface GroqPlugin {
    app: App;
    settings: GroqChatSettings;
    saveSettings(): Promise<void>;
    loadSettings(): Promise<void>;
    onSettingsUpdate(callback: (settings: GroqChatSettings) => void): void;
    onError(callback: (error: Error) => void): void;
}