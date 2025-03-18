import { Plugin } from 'obsidian';
import { GroqModel } from '../constants/models';

export interface ModelSettings {
    temperature: number;
    maxTokens: number;
}

export type ModelConfigMap = {
    [key in GroqModel]: ModelSettings;
};

export interface GroqChatSettings {
    apiKey: string;
    googleToken: string;
    defaultModel: GroqModel;
    temperature: number;
    maxTokens: number;
    historyStorageMethod: 'memory' | 'file';
    maxHistoryLength: number;
    notePath: string;
    modelConfig: ModelConfigMap;
}

export const DEFAULT_MODEL_OPTIONS: ModelConfigMap = {
    [GroqModel.MIXTRAL_8X7B]: {
        temperature: 0.7,
        maxTokens: 32768
    },
    [GroqModel.LLAMA_3_8B]: {
        temperature: 0.7,
        maxTokens: 8192
    },
    [GroqModel.GEMMA_7B]: {
        temperature: 0.7,
        maxTokens: 8192
    }
};

export const DEFAULT_SETTINGS: GroqChatSettings = {
    apiKey: '',
    googleToken: '',
    defaultModel: GroqModel.LLAMA_3_8B,
    temperature: 0.7,
    maxTokens: 8192,
    historyStorageMethod: 'memory',
    maxHistoryLength: 100,
    notePath: 'groq-chat-history.md',
    modelConfig: DEFAULT_MODEL_OPTIONS
};

export interface GroqPlugin extends Plugin {
    settings: GroqChatSettings;
    saveData: (settings: GroqChatSettings) => Promise<void>;
}