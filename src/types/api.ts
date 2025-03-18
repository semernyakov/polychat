export interface GroqMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface GroqApiRequest {
    messages: GroqMessage[];
    model: string;
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
}

export interface GroqApiResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: {
        index: number;
        message: GroqMessage;
        finish_reason: string;
    }[];
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
        param?: string;
        code?: string;
    };
}

export interface GroqModel {
    id: string;
    object: string;
    created: number;
    owned_by: string;
    permission: any[];
    root: string;
    parent: string | null;
}

export interface ApiResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        message: {
            role: string;
            content: string;
            function_call?: unknown;
        };
        finish_reason: string;
    }>;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
} 