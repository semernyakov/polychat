export type ModelCategory = 'text' | 'audio' | 'vision';
export type ModelReleaseStatus = 'main' | 'preview';

export interface ModelDeveloper {
  name: string;
  url?: string;
}

export interface ModelParams {
  maxTokens: number;
  maxDuration?: number;
  maxFileSize?: number;
  tokensPerMinute?: number;  // TPM
  requestsPerMinute?: number; // RPM
}

export interface ModelInfo extends ModelParams {
  id: GroqModel;
  name: string;
  description: string;
  category: ModelCategory;
  developer: ModelDeveloper;
  releaseStatus: ModelReleaseStatus;
}

export enum GroqModel {
  QWEN_2_5_CODER_32B = 'qwen-2.5-coder-32b',
  WHISPER_LARGE_V3 = 'whisper-large-v3',
  LLAMA_4_SCOUT_17B = 'meta-llama/llama-4-scout-17b-16e-instruct',
  QWEN_2_5_32B = 'qwen-2.5-32b',
  WHISPER_LARGE_V3_TURBO = 'whisper-large-v3-turbo',
  GEMMA2_9B_IT = 'gemma2-9b-it',
  LLAMA_3_3_70B_VERSATILE = 'llama-3.3-70b-versatile',
  LLAMA_3_1_8B_INSTANT = 'llama-3.1-8b-instant',
  DEEPSEEK_R1_DISTILL_LLAMA_70B = 'deepseek-r1-distill-llama-70b',
  LLAMA3_8B = 'llama3-8b-8192',
  LLAMA_3_2_11B_VISION = 'llama-3.2-11b-vision-preview',
  PLAYAI_TTS_ARABIC = 'playai-tts-arabic',
  LLAMA3_70B = 'llama3-70b-8192',
  LLAMA_3_3_70B_SPECDEC = 'llama-3.3-70b-specdec',
  LLAMA_3_2_90B_VISION = 'llama-3.2-90b-vision-preview',
  LLAMA_GUARD_3_8B = 'llama-guard-3-8b',
  ALLAM_2_7B = 'allam-2-7b',
  MISTRAL_SABA_24B = 'mistral-saba-24b',
  PLAYAI_TTS = 'playai-tts',
  QWEN_QWQ_32B = 'qwen-qwq-32b',
  LLAMA_3_2_3B_PREVIEW = 'llama-3.2-3b-preview',
  LLAMA_3_2_1B_PREVIEW = 'llama-3.2-1b-preview',
  DEEPSEEK_R1_DISTILL_QWEN_32B = 'deepseek-r1-distill-qwen-32b',
  DISTIL_WHISPER_LARGE_V3_EN = 'distil-whisper-large-v3-en',
}

export const MODEL_INFO: Record<GroqModel, ModelInfo> = {
  [GroqModel.QWEN_2_5_CODER_32B]: {
    id: GroqModel.QWEN_2_5_CODER_32B,
    name: 'Qwen 2.5 Coder 32B',
    description: 'Модель для кодирования от Alibaba Cloud',
    maxTokens: 131072,
    category: 'text',
    developer: { name: 'Alibaba Cloud' },
    releaseStatus: 'main',
    tokensPerMinute: 6000,
    requestsPerMinute: 30,
  },
  [GroqModel.WHISPER_LARGE_V3]: {
    id: GroqModel.WHISPER_LARGE_V3,
    name: 'Whisper Large v3',
    description: 'Транскрипция аудио от OpenAI',
    maxTokens: 448,
    maxDuration: 300,
    maxFileSize: 25,
    category: 'audio',
    developer: { name: 'OpenAI' },
    releaseStatus: 'main',
    tokensPerMinute: 7200,
    requestsPerMinute: 20,
  },
  [GroqModel.LLAMA_4_SCOUT_17B]: {
    id: GroqModel.LLAMA_4_SCOUT_17B,
    name: 'Llama 4 Scout 17B Instruct',
    description: 'Модель Llama 4 Scout от Meta',
    maxTokens: 8192,
    category: 'text',
    developer: { name: 'Meta' },
    releaseStatus: 'preview',
    tokensPerMinute: 6000,
    requestsPerMinute: 30,
  },
  [GroqModel.QWEN_2_5_32B]: {
    id: GroqModel.QWEN_2_5_32B,
    name: 'Qwen 2.5 32B',
    description: 'Модель общего назначения от Alibaba Cloud',
    maxTokens: 131072,
    category: 'text',
    developer: { name: 'Alibaba Cloud' },
    releaseStatus: 'main',
    tokensPerMinute: 6000,
    requestsPerMinute: 30,
  },
  [GroqModel.WHISPER_LARGE_V3_TURBO]: {
    id: GroqModel.WHISPER_LARGE_V3_TURBO,
    name: 'Whisper Large v3 Turbo',
    description: 'Ускоренная транскрипция аудио от OpenAI',
    maxTokens: 448,
    category: 'audio',
    developer: { name: 'OpenAI' },
    releaseStatus: 'main',
    tokensPerMinute: 7200,
    requestsPerMinute: 20,
  },
  [GroqModel.GEMMA2_9B_IT]: {
    id: GroqModel.GEMMA2_9B_IT,
    name: 'Gemma2 9B IT',
    description: 'Инструктивная модель Gemma2 от Google',
    maxTokens: 8192,
    category: 'text',
    developer: { name: 'Google' },
    releaseStatus: 'main',
    tokensPerMinute: 15000,
    requestsPerMinute: 30,
  },
  [GroqModel.LLAMA_3_3_70B_VERSATILE]: {
    id: GroqModel.LLAMA_3_3_70B_VERSATILE,
    name: 'Llama 3.3 70B Versatile',
    description: 'Улучшенная универсальная Llama 3 70B',
    maxTokens: 32768,
    category: 'text',
    developer: { name: 'Meta' },
    releaseStatus: 'main',
    tokensPerMinute: 6000,
    requestsPerMinute: 30,
  },
  [GroqModel.LLAMA_3_1_8B_INSTANT]: {
    id: GroqModel.LLAMA_3_1_8B_INSTANT,
    name: 'Llama 3.1 8B Instant',
    description: 'Улучшенная быстрая Llama 3 8B',
    maxTokens: 131072,
    category: 'text',
    developer: { name: 'Meta' },
    releaseStatus: 'main',
    tokensPerMinute: 6000,
    requestsPerMinute: 30,
  },
  [GroqModel.DEEPSEEK_R1_DISTILL_LLAMA_70B]: {
    id: GroqModel.DEEPSEEK_R1_DISTILL_LLAMA_70B,
    name: 'DeepSeek R1 Distill Llama 70B',
    description: 'Дистиллированная модель DeepSeek/Meta',
    maxTokens: 131072,
    category: 'text',
    developer: { name: 'DeepSeek / Meta' },
    releaseStatus: 'main',
    tokensPerMinute: 6000,
    requestsPerMinute: 30,
  },
  [GroqModel.LLAMA3_8B]: {
    id: GroqModel.LLAMA3_8B,
    name: 'Llama 3 8B',
    description: 'Быстрая модель для повседневных задач',
    maxTokens: 8192,
    category: 'text',
    developer: { name: 'Meta' },
    releaseStatus: 'main',
    tokensPerMinute: 6000,
    requestsPerMinute: 30,
  },
  [GroqModel.LLAMA_3_2_11B_VISION]: {
    id: GroqModel.LLAMA_3_2_11B_VISION,
    name: 'Llama 3.2 11B Vision Preview',
    description: 'Предварительная версия Llama 3.2 Vision 11B',
    maxTokens: 8192,
    category: 'vision',
    developer: { name: 'Meta' },
    releaseStatus: 'preview',
    tokensPerMinute: 7000,
    requestsPerMinute: 30,
  },
  [GroqModel.PLAYAI_TTS_ARABIC]: {
    id: GroqModel.PLAYAI_TTS_ARABIC,
    name: 'PlayAI TTS Arabic',
    description: 'Синтез речи на арабском от PlayAI',
    maxTokens: 8192,
    category: 'audio',
    developer: { name: 'PlayAI' },
    releaseStatus: 'main',
    tokensPerMinute: 600,
    requestsPerMinute: 2,
  },
  [GroqModel.LLAMA3_70B]: {
    id: GroqModel.LLAMA3_70B,
    name: 'Llama 3 70B',
    description: 'Мощная модель общего назначения',
    maxTokens: 8192,
    category: 'text',
    developer: { name: 'Meta' },
    releaseStatus: 'main',
    tokensPerMinute: 6000,
    requestsPerMinute: 30,
  },
  [GroqModel.LLAMA_3_3_70B_SPECDEC]: {
    id: GroqModel.LLAMA_3_3_70B_SPECDEC,
    name: 'Llama 3.3 70B SpecDec',
    description: 'Llama 3.3 70B с Speculative Decoding',
    maxTokens: 8192,
    category: 'text',
    developer: { name: 'Meta' },
    releaseStatus: 'main',
    tokensPerMinute: 6000,
    requestsPerMinute: 30,
  },
  [GroqModel.LLAMA_3_2_90B_VISION]: {
    id: GroqModel.LLAMA_3_2_90B_VISION,
    name: 'Llama 3.2 90B Vision Preview',
    description: 'Предварительная версия Llama 3.2 Vision 90B',
    maxTokens: 8192,
    category: 'vision',
    developer: { name: 'Meta' },
    releaseStatus: 'preview',
    tokensPerMinute: 7000,
    requestsPerMinute: 15,
  },
  [GroqModel.LLAMA_GUARD_3_8B]: {
    id: GroqModel.LLAMA_GUARD_3_8B,
    name: 'Llama Guard 3 8B',
    description: 'Модель Llama Guard 3 8B для безопасности',
    maxTokens: 8192,
    category: 'text',
    developer: { name: 'Meta' },
    releaseStatus: 'main',
    tokensPerMinute: 15000,
    requestsPerMinute: 30,
  },
  [GroqModel.ALLAM_2_7B]: {
    id: GroqModel.ALLAM_2_7B,
    name: 'Allam 2 7B',
    description: 'Модель Allam 2 7B от SDAIA',
    maxTokens: 4096,
    category: 'text',
    developer: { name: 'SDAIA' },
    releaseStatus: 'main',
    tokensPerMinute: 6000,
    requestsPerMinute: 30,
  },
  [GroqModel.MISTRAL_SABA_24B]: {
    id: GroqModel.MISTRAL_SABA_24B,
    name: 'Mistral Saba 24B',
    description: 'Модель Mistral Saba 24B',
    maxTokens: 32768,
    category: 'text',
    developer: { name: 'Mistral AI' },
    releaseStatus: 'main',
    tokensPerMinute: 6000,
    requestsPerMinute: 30,
  },
  [GroqModel.PLAYAI_TTS]: {
    id: GroqModel.PLAYAI_TTS,
    name: 'PlayAI TTS',
    description: 'Синтез речи от PlayAI',
    maxTokens: 8192,
    category: 'audio',
    developer: { name: 'PlayAI' },
    releaseStatus: 'main',
    tokensPerMinute: 600,
    requestsPerMinute: 2,
  },
  [GroqModel.QWEN_QWQ_32B]: {
    id: GroqModel.QWEN_QWQ_32B,
    name: 'Qwen QWQ 32B',
    description: 'Модель Qwen QWQ 32B от Alibaba Cloud',
    maxTokens: 131072,
    category: 'text',
    developer: { name: 'Alibaba Cloud' },
    releaseStatus: 'main',
    tokensPerMinute: 6000,
    requestsPerMinute: 30,
  },
  [GroqModel.LLAMA_3_2_3B_PREVIEW]: {
    id: GroqModel.LLAMA_3_2_3B_PREVIEW,
    name: 'Llama 3.2 3B Preview',
    description: 'Предварительная версия Llama 3.2 3B',
    maxTokens: 8192,
    category: 'text',
    developer: { name: 'Meta' },
    releaseStatus: 'preview',
    tokensPerMinute: 7000,
    requestsPerMinute: 30,
  },
  [GroqModel.LLAMA_3_2_1B_PREVIEW]: {
    id: GroqModel.LLAMA_3_2_1B_PREVIEW,
    name: 'Llama 3.2 1B Preview',
    description: 'Предварительная версия Llama 3.2 1B',
    maxTokens: 8192,
    category: 'text',
    developer: { name: 'Meta' },
    releaseStatus: 'preview',
    tokensPerMinute: 7000,
    requestsPerMinute: 30,
  },
  [GroqModel.DEEPSEEK_R1_DISTILL_QWEN_32B]: {
    id: GroqModel.DEEPSEEK_R1_DISTILL_QWEN_32B,
    name: 'DeepSeek R1 Distill Qwen 32B',
    description: 'Дистиллированная модель DeepSeek/Alibaba Cloud',
    maxTokens: 131072,
    category: 'text',
    developer: { name: 'DeepSeek / Alibaba Cloud' },
    releaseStatus: 'main',
    tokensPerMinute: 6000,
    requestsPerMinute: 30,
  },
  [GroqModel.DISTIL_WHISPER_LARGE_V3_EN]: {
    id: GroqModel.DISTIL_WHISPER_LARGE_V3_EN,
    name: 'Distil Whisper Large v3 EN',
    description: 'Дистиллированная английская модель Whisper от Hugging Face',
    maxTokens: 448,
    category: 'audio',
    developer: { name: 'Hugging Face' },
    releaseStatus: 'main',
    tokensPerMinute: 7200,
    requestsPerMinute: 20,
  },
};

export const DEFAULT_MODEL = GroqModel.LLAMA3_70B;

export const getModelInfo = (modelId: GroqModel): ModelInfo => {
  const info = MODEL_INFO[modelId];
  if (!info) throw new Error(`Model ${modelId} not found`);
  return info;
};

export const isAudioModel = (modelId: GroqModel): boolean =>
  getModelInfo(modelId).category === 'audio';

export const isVisionModel = (modelId: GroqModel): boolean =>
  getModelInfo(modelId).category === 'vision';
