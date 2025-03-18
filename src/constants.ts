export enum GroqModel {
    LLAMA_3_8B = 'llama2-70b-4096',
    MIXTRAL_8X7B = 'mixtral-8x7b-32768',
    GEMMA_7B = 'gemma-7b-it'
}

export const DEFAULT_MODEL = GroqModel.LLAMA_3_8B;

export const API_ENDPOINT = 'https://api.groq.com/v1/chat/completions'; 