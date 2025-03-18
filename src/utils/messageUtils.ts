import { Message } from '../types/chat';

export const messageUtils = {
    createUserMessage(text: string): Message {
        return {
            text,
            role: 'user',
            timestamp: Date.now()
        };
    },

    createGroqMessage(text: string, status?: 'error'): Message {
        return {
            text,
            role: 'assistant',
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