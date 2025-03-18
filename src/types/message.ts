export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'error';
    content: string;
    timestamp: number;
}

export interface ChatHistory {
    messages: Message[];
} 