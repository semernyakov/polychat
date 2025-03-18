export enum GroqModel {
    MIXTRAL_8X7B = "mixtral-8x7b-32768",
    LLAMA_3_8B = "llama3-8b-8192",
    GEMMA_7B = "gemma-7b-it"
}

export const MODEL_DISPLAY_NAMES: Record<GroqModel, string> = {
    [GroqModel.MIXTRAL_8X7B]: 'Mixtral 8x7B',
    [GroqModel.LLAMA_3_8B]: 'LLaMA 3 8B',
    [GroqModel.GEMMA_7B]: 'Gemma 7B'
};

export const DEFAULT_MODEL_OPTIONS = {
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