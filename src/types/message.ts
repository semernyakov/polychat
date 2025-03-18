export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system' | 'error';
    content: string;
    timestamp: number;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
        queue_time?: number;
        prompt_time?: number;
        completion_time?: number;
        total_time?: number;
    };
}

export interface ChatHistory {
    messages: Message[];
} 