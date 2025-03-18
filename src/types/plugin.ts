import { Plugin } from 'obsidian';
import { GroqModel } from '../constants/models';

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
    settings: GroqPluginSettings;
}