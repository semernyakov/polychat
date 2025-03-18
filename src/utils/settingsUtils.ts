import { GroqChatSettings, DEFAULT_SETTINGS } from '../types/plugin';
import { ModelConfigMap, UISettings } from '../types/settings';
import { GROQ_MODELS, DEFAULT_MODEL_OPTIONS } from '../constants/models';
import { GroqModel } from '../constants';

export const settingsUtils = {
    getDefaultSettings(): GroqChatSettings {
        return {
            groqApiKey: '',
            defaultModel: GROQ_MODELS.LLAMA_3_8B,
            historyStorageMethod: 'local',
            maxHistoryLength: 100,
            temperature: DEFAULT_MODEL_OPTIONS.temperature,
            maxTokens: DEFAULT_MODEL_OPTIONS.max_tokens
        };
    },

    getDefaultModelConfig(): ModelConfigMap {
        return Object.values(GROQ_MODELS).reduce((config, model) => ({
            ...config,
            [model]: {
                temperature: DEFAULT_MODEL_OPTIONS.temperature,
                maxTokens: DEFAULT_MODEL_OPTIONS.max_tokens
            }
        }), {} as ModelConfigMap);
    },

    getDefaultUISettings(): UISettings {
        return {
            theme: 'system',
            fontSize: 14,
            showTimestamps: true
        };
    },

    validateSettings(settings: Partial<GroqChatSettings>): GroqChatSettings {
        return {
            ...DEFAULT_SETTINGS,
            ...settings
        };
    },

    getDefaultModelConfig(model: GroqModel) {
        return {
            temperature: 0.7,
            maxTokens: 2048
        };
    }
}; 