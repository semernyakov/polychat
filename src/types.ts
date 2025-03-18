export interface GroqChatSettings {
    apiKey: string;
    defaultModel: string;
    maxTokens: number;
    temperature: number;
    historySize: number;
    theme: 'light' | 'dark' | 'system';
    fontSize: number;
    showTimestamps: boolean;
}

export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: number;
}

export interface ChatHistory {
    messages: Message[];
    model: string;
}