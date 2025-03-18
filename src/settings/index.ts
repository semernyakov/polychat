import { UISettings } from '../types/settings';

export interface ModelConfig {
    temperature: number;
    maxTokens: number;
}

export const DEFAULT_UI_SETTINGS: UISettings = {
    theme: 'system',
    fontSize: 14,
    showTimestamps: true
};

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
    temperature: 0.7,
    maxTokens: 8192
};

export const DEFAULT_MODEL = 'llama3-70b-8192'; 