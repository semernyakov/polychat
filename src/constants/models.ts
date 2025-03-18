export enum GroqModel {
    MIXTRAL = 'mixtral-8x7b-32768',
    LLAMA = 'llama3-8b-8192',
    GEMMA = 'gemma-7b-it'
}

export const MODEL_DISPLAY_NAMES: Record<GroqModel, string> = {
    [GroqModel.MIXTRAL]: 'Mixtral 8x7B',
    [GroqModel.LLAMA]: 'LLaMA 3 8B',
    [GroqModel.GEMMA]: 'Gemma 7B'
};

export const DEFAULT_MODEL_OPTIONS = {
    temperature: 0.7,
    max_tokens: 1000,
};