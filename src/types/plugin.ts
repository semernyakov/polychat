import { Plugin } from 'obsidian';
import { GroqModel } from '../constants/models';
import { GroqChatSettings } from '../settings';

export interface GroqPluginSettings {
    apiKey: string;
    defaultModel: GroqModel;
    temperature: number;
    maxTokens: number;
    historyStorageMethod: 'local' | 'note';
    maxHistoryLength: number;
    notePath: string;
}

export interface GroqPlugin extends Plugin {
    settings: GroqChatSettings;
    saveData: (settings: GroqChatSettings) => Promise<void>;
}