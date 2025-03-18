export type GroqModel = 'llama3-8b-8192' | 'mixtral-8x7b-32768' | 'gemma-7b-it';

export const GROQ_MODELS = {
    LLAMA_3_8B: 'llama3-8b-8192' as GroqModel,
    MIXTRAL: 'mixtral-8x7b-32768' as GroqModel,
    GEMMA: 'gemma-7b-it' as GroqModel
};

export const MODEL_DISPLAY_NAMES: Record<GroqModel, string> = {
    [GROQ_MODELS.LLAMA_3_8B]: 'Llama 3 (8B)',
    [GROQ_MODELS.MIXTRAL]: 'Mixtral (8x7B)',
    [GROQ_MODELS.GEMMA]: 'Gemma (7B)',
};

export const DEFAULT_MODEL_OPTIONS = {
    temperature: 0.7,
    max_tokens: 1000,
};