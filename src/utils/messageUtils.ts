import { Message } from '../types/chat';

export const messageUtils = {
    createUserMessage(content: string): Message {
        return {
            role: 'user',
            content,
            timestamp: new Date().toISOString()
        };
    },

    createAssistantMessage(content: string): Message {
        return {
            role: 'assistant',
            content,
            timestamp: new Date().toISOString()
        };
    },

    formatTimestamp(timestamp: number): string {
        return new Date(timestamp).toLocaleTimeString();
    },

    truncateHistory(messages: Message[], maxLength: number): Message[] {
        return messages.slice(-maxLength);
    }
}; 