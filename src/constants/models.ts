export const GROQ_MODELS = {
    LLAMA_3_8B: 'llama3-8b-8192',
    MIXTRAL_8X7B: 'mixtral-8x7b-32768',
    GEMMA_7B: 'gemma-7b-it',
    // Add more models as they become available
} as const;

export type GroqModel = typeof GROQ_MODELS[keyof typeof GROQ_MODELS];

export const MODEL_DISPLAY_NAMES: Record<GroqModel, string> = {
    [GROQ_MODELS.LLAMA_3_8B]: 'Llama 3 (8B)',
    [GROQ_MODELS.MIXTRAL_8X7B]: 'Mixtral (8x7B)',
    [GROQ_MODELS.GEMMA_7B]: 'Gemma (7B)',
};

export const DEFAULT_MODEL_OPTIONS = {
    temperature: 0.7,
    max_tokens: 1000,
};