import { Plugin } from 'obsidian';
import { GroqModel } from '../constants/models';
import { Message } from './chat';

export interface GroqChatSettings {
    groqApiKey: string;
    defaultModel: GroqModel;
    historyStorageMethod: 'local' | 'note';
    maxHistoryLength: number;
    googleToken?: string;
    temperature?: number;
    maxTokens?: number;
    notePath?: string;
    models?: GroqModel[];
    ui?: {
        fontSize?: number;
    };
}

export interface GroqPlugin extends Plugin {
    settings: GroqChatSettings;
    loadSettings(): Promise<void>;
    saveSettings(): Promise<void>;
    clearHistory(): Promise<void>;
}