// src/types/models.ts

export enum GroqModel {
  // Основные модели
  LLAMA3_70B = 'llama3-70b-8192',
  LLAMA3_8B = 'llama3-8b-8192',
  MIXTRAL_8X7B = 'mixtral-8x7b-32768',
  GEMMA_7B = 'gemma-7b-it',

  // Claude модели
  CLAUDE_3_OPUS = 'claude-3-opus-20240229',
  CLAUDE_3_SONNET = 'claude-3-sonnet-20240229',
  CLAUDE_3_HAIKU = 'claude-3-haiku-20240307',

  // Аудио модели
  WHISPER_LARGE = 'whisper-large-v3',

  // Премиум модели
  LLAMA3_70B_PREMIUM = 'llama-3.3-70b-versatile',
  LLAMA3_8B_PREMIUM = 'llama-3.1-8b-instant',
}

export interface ModelInfo {
  id: GroqModel;
  name: string;
  description: string;
  maxTokens: number;
  maxResponseTokens?: number;
  category: 'text' | 'audio' | 'vision';
  developer?: string;
  contextWindow?: number;
  maxCompletionTokens?: number;
  isPreview?: boolean;
  maxFileSize?: number; // в мегабайтах для аудио/видео моделей
}

export const MODELS: Record<GroqModel, ModelInfo> = {
  [GroqModel.LLAMA3_70B]: {
    id: GroqModel.LLAMA3_70B,
    name: 'Llama 3 70B',
    description: 'Мощная модель общего назначения',
    maxTokens: 8192,
    category: 'text',
    developer: 'Meta',
  },
  [GroqModel.LLAMA3_8B]: {
    id: GroqModel.LLAMA3_8B,
    name: 'Llama 3 8B',
    description: 'Быстрая модель для повседневных задач',
    maxTokens: 8192,
    category: 'text',
    developer: 'Meta',
  },
  [GroqModel.MIXTRAL_8X7B]: {
    id: GroqModel.MIXTRAL_8X7B,
    name: 'Mixtral 8x7B',
    description: 'Экспертная модель для сложных задач',
    maxTokens: 32768,
    category: 'text',
    developer: 'Mistral',
  },
  [GroqModel.GEMMA_7B]: {
    id: GroqModel.GEMMA_7B,
    name: 'Gemma 7B',
    description: 'Эффективная модель от Google',
    maxTokens: 8192,
    category: 'text',
    developer: 'Google',
  },
  [GroqModel.CLAUDE_3_OPUS]: {
    id: GroqModel.CLAUDE_3_OPUS,
    name: 'Claude 3 Opus',
    description: 'Самая мощная модель Claude 3',
    maxTokens: 200000,
    category: 'text',
    developer: 'Anthropic',
  },
  [GroqModel.CLAUDE_3_SONNET]: {
    id: GroqModel.CLAUDE_3_SONNET,
    name: 'Claude 3 Sonnet',
    description: 'Сбалансированная модель Claude 3',
    maxTokens: 200000,
    category: 'text',
    developer: 'Anthropic',
  },
  [GroqModel.CLAUDE_3_HAIKU]: {
    id: GroqModel.CLAUDE_3_HAIKU,
    name: 'Claude 3 Haiku',
    description: 'Быстрая и компактная модель Claude 3',
    maxTokens: 200000,
    category: 'text',
    developer: 'Anthropic',
  },
  [GroqModel.WHISPER_LARGE]: {
    id: GroqModel.WHISPER_LARGE,
    name: 'Whisper Large',
    description: 'Транскрипция аудио',
    maxTokens: 0,
    category: 'audio',
    maxFileSize: 25,
    developer: 'OpenAI',
  },
  [GroqModel.LLAMA3_70B_PREMIUM]: {
    id: GroqModel.LLAMA3_70B_PREMIUM,
    name: 'Llama 3 70B Premium',
    description: 'Улучшенная версия Llama 3 70B',
    maxTokens: 32768,
    category: 'text',
    developer: 'Meta',
  },
  [GroqModel.LLAMA3_8B_PREMIUM]: {
    id: GroqModel.LLAMA3_8B_PREMIUM,
    name: 'Llama 3 8B Premium',
    description: 'Улучшенная версия Llama 3 8B',
    maxTokens: 8192,
    category: 'text',
    developer: 'Meta',
  },
};

export const DEFAULT_MODEL = GroqModel.LLAMA3_70B;

// Утилиты для работы с моделями
export const getModelInfo = (modelId: GroqModel): ModelInfo => MODELS[modelId];
export const isAudioModel = (modelId: GroqModel): boolean => MODELS[modelId]?.category === 'audio';
export const isVisionModel = (modelId: GroqModel): boolean =>
  MODELS[modelId]?.category === 'vision';
