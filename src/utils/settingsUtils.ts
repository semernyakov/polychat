import { GroqModel, DEFAULT_MODEL_OPTIONS } from '../constants/models';
import { GroqChatSettings, DEFAULT_SETTINGS, ModelConfigMap } from '../types/plugin';
import { UISettings } from '../types/settings';

export function getDefaultSettings(): GroqChatSettings {
    return {
        ...DEFAULT_SETTINGS,
        modelConfig: getDefaultModelConfig()
    };
}

export function getDefaultModelConfig(): ModelConfigMap {
    return DEFAULT_MODEL_OPTIONS;
}

export function validateSettings(settings: GroqChatSettings): GroqChatSettings {
    return {
        ...DEFAULT_SETTINGS,
        ...settings,
        modelConfig: {
            ...getDefaultModelConfig(),
            ...settings.modelConfig
        }
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

    getDefaultModelConfig(model: GroqModel) {
        return {
            temperature: 0.7,
            maxTokens: 2048
        };
    }
}; 