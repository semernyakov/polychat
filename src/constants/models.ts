import { GroqChatSettings } from '../types/plugin';

export type GroqModel = string;

export const GROQ_MODELS: GroqModel[] = [
    'llama3-70b-8192',
    'llama3-8b-8192',
    'mixtral-8x7b-32768',
    'gemma-7b-it',
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307'
];

export const DEFAULT_MODEL_OPTIONS = {
    'llama3-70b-8192': {
        temperature: 0.7,
        maxTokens: 8192
    },
    'llama3-8b-8192': {
        temperature: 0.7,
        maxTokens: 8192
    },
    'mixtral-8x7b-32768': {
        temperature: 0.7,
        maxTokens: 32768
    },
    'gemma-7b-it': {
        temperature: 0.7,
        maxTokens: 8192
    },
    'claude-3-opus-20240229': {
        temperature: 0.7,
        maxTokens: 16384
    },
    'claude-3-sonnet-20240229': {
        temperature: 0.7,
        maxTokens: 12288
    },
    'claude-3-haiku-20240307': {
        temperature: 0.7,
        maxTokens: 4096
    }
};