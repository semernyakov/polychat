export interface GroqApiResponse {
    choices: {
        message: {
            content: string;
            role: string;
        };
        finish_reason: string;
    }[];
    created: number;
    id: string;
    model: string;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

export interface GroqApiError {
    error: {
        message: string;
        type: string;
        code: string;
    };
}

export interface GroqApiOptions {
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
} 