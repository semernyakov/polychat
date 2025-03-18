import { Plugin } from 'obsidian';
import { GroqModel } from '../constants';

export interface GroqChatSettings {
    apiKey: string;
    defaultModel: GroqModel;
    temperature: number;
    maxTokens: number;
    historyStorageMethod: 'memory' | 'file';
    maxHistoryLength: number;
    notePath: string;
}

export const DEFAULT_SETTINGS: GroqChatSettings = {
    apiKey: '',
    defaultModel: GroqModel.LLAMA_3_8B,
    temperature: 0.7,
    maxTokens: 2048,
    historyStorageMethod: 'memory',
    maxHistoryLength: 100,
    notePath: 'groq-chat-history.md'
};

export interface GroqPlugin extends Plugin {
    settings: GroqChatSettings;
    saveData: (settings: GroqChatSettings) => Promise<void>;
}