import { Plugin } from 'obsidian';

export interface ModelSettings {
    temperature: number;
    maxTokens: number;
}

export interface GroqChatSettings {
    apiKey: string;
    model: string;
    temperature: number;
    maxTokens: number;
    historyStorageMethod: 'file' | 'memory';
    maxHistoryLength: number;
    notePath: string;
}

export interface ModelConfigMap {
    [key: string]: {
        temperature: number;
        maxTokens: number;
    };
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
    app: any;
    settings: GroqChatSettings;
    saveSettings: () => Promise<void>;
    loadData: () => Promise<any>;
    saveData: (data: any) => Promise<void>;
}