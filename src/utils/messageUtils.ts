import { Message } from '../types/chat';

export const messageUtils = {
    createUserMessage(text: string): Message {
        return {
            text,
            sender: 'user',
            timestamp: Date.now(),
            status: 'sending'
        };
    },

    createGroqMessage(text: string, status: 'sent' | 'error' = 'sent'): Message {
        return {
            text,
            sender: 'groq',
            timestamp: Date.now(),
            status
        };
    },

    formatTimestamp(timestamp: number): string {
        return new Date(timestamp).toLocaleTimeString();
    },

    truncateHistory(messages: Message[], maxLength: number): Message[] {
        return messages.slice(-maxLength);
    }
}; 