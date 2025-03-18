// Production Models
export enum GroqProductionModel {
  // Text Models
  LLAMA_3_70B = 'llama-3.3-70b-versatile',
  LLAMA_3_8B = 'llama-3.1-8b-instant',
  LLAMA_GUARD_8B = 'llama-guard-3-8b',
  LLAMA_3_70B_8K = 'llama3-70b-8192',
  LLAMA_3_8B_8K = 'llama3-8b-8192',
  MIXTRAL_8X7B = 'mixtral-8x7b-32768',
  GEMMA_9B = 'gemma2-9b-it',

  // Audio Models
  WHISPER_LARGE = 'whisper-large-v3',
  WHISPER_LARGE_TURBO = 'whisper-large-v3-turbo',
  WHISPER_DISTIL = 'distil-whisper-large-v3-en',
}

// Preview Models
export enum GroqPreviewModel {
  QWEN_32B = 'qwen-qwq-32b',
  MISTRAL_SABA_24B = 'mistral-saba-24b',
  QWEN_CODER_32B = 'qwen-2.5-coder-32b',
  QWEN_2_5_32B = 'qwen-2.5-32b',
  DEEPSEEK_QWEN_32B = 'deepseek-r1-distill-qwen-32b',
  DEEPSEEK_LLAMA_70B_SPEC = 'deepseek-r1-distill-llama-70b-specdec',
  DEEPSEEK_LLAMA_70B = 'deepseek-r1-distill-llama-70b',
  LLAMA_3_70B_SPEC = 'llama-3.3-70b-specdec',
  LLAMA_3_1B = 'llama-3.2-1b-preview',
  LLAMA_3_3B = 'llama-3.2-3b-preview',
  LLAMA_3_11B_VISION = 'llama-3.2-11b-vision-preview',
  LLAMA_3_90B_VISION = 'llama-3.2-90b-vision-preview',
}

export interface ModelInfo {
  id: string;
  name: string;
  developer: string;
  contextWindow?: number;
  maxCompletionTokens?: number;
  maxFileSize?: string;
  isPreview: boolean;
  category: 'text' | 'audio' | 'vision';
}

export const MODELS: Record<string, ModelInfo> = {
  [GroqProductionModel.LLAMA_3_70B]: {
    id: GroqProductionModel.LLAMA_3_70B,
    name: 'Llama 3 70B Versatile',
    developer: 'Meta',
    contextWindow: 128000,
    maxCompletionTokens: 32768,
    isPreview: false,
    category: 'text',
  },
  [GroqProductionModel.LLAMA_3_8B]: {
    id: GroqProductionModel.LLAMA_3_8B,
    name: 'Llama 3 8B Instant',
    developer: 'Meta',
    contextWindow: 128000,
    maxCompletionTokens: 8192,
    isPreview: false,
    category: 'text',
  },
  [GroqProductionModel.MIXTRAL_8X7B]: {
    id: GroqProductionModel.MIXTRAL_8X7B,
    name: 'Mixtral 8x7B',
    developer: 'Mistral',
    contextWindow: 32768,
    isPreview: false,
    category: 'text',
  },
  [GroqProductionModel.GEMMA_9B]: {
    id: GroqProductionModel.GEMMA_9B,
    name: 'Gemma 2 9B',
    developer: 'Google',
    contextWindow: 8192,
    isPreview: false,
    category: 'text',
  },
  [GroqPreviewModel.LLAMA_3_90B_VISION]: {
    id: GroqPreviewModel.LLAMA_3_90B_VISION,
    name: 'Llama 3 90B Vision',
    developer: 'Meta',
    contextWindow: 128000,
    maxCompletionTokens: 8192,
    isPreview: true,
    category: 'vision',
  },
  // Добавьте остальные модели по аналогии
};

export const DEFAULT_MODEL = GroqProductionModel.LLAMA_3_70B;

export const API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

export const VIEW_TYPE_GROQ_CHAT = 'groq-chat-view';

export const PLUGIN_NAME = 'groq-chat';
export const PLUGIN_ID = 'groq-chat-plugin';

export const DEFAULT_SETTINGS = {
  apiKey: '',
  defaultModel: 'llama-3-70b-v1',
  maxTokens: 2048,
  temperature: 0.7,
  historySize: 100,
  theme: 'system',
  fontSize: 14,
  showTimestamps: true,
};

export const SUPPORTED_MODELS = {
  production: [
    {
      id: 'llama-3-70b-v1',
      name: 'Llama 3 70B Versatile',
      contextWindow: 128000,
      maxResponseTokens: 32768,
      description: 'Recommended for general tasks',
    },
    {
      id: 'llama-3-8b-v1',
      name: 'Llama 3 8B Instant',
      contextWindow: 128000,
      maxResponseTokens: 8192,
      description: 'Recommended for quick responses',
    },
    {
      id: 'mixtral-8x7b-v1',
      name: 'Mixtral 8x7B',
      contextWindow: 32000,
      description: 'Recommended for complex computations',
    },
    {
      id: 'gemma-2-9b-v1',
      name: 'Gemma 2 9B',
      contextWindow: 8000,
      description: 'Recommended for efficient processing',
    },
    {
      id: 'llama-guard-3-8b-v1',
      name: 'Llama Guard 3 8B',
      contextWindow: 4000,
      description: 'For security checks',
    },
    {
      id: 'whisper-large-v3',
      name: 'Whisper Large V3',
      maxFileSize: 25,
      description: 'For audio transcription',
    },
  ],
  preview: [
    {
      id: 'llama-3-90b-vision-v1',
      name: 'Llama 3 90B Vision',
      contextWindow: 128000,
      maxResponseTokens: 8192,
      description: 'With image support',
    },
    {
      id: 'qwen-2-5-coder-32b-v1',
      name: 'Qwen 2.5 Coder 32B',
      contextWindow: 128000,
      description: 'For code processing',
    },
    {
      id: 'mistral-saba-24b-v1',
      name: 'Mistral Saba 24B',
      contextWindow: 32000,
      description: 'General purpose model',
    },
  ],
};
