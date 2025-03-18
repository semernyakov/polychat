import { Message } from '../types/chat';

export const messageUtils = {
    createUserMessage(content: string): Message {
        return {
            role: 'user',
            content,
            timestamp: Date.now()
        };
    },

    createAssistantMessage(content: string): Message {
        return {
            role: 'assistant',
            content,
            timestamp: Date.now()
        };
    },

    formatTimestamp(timestamp: number): string {
        return new Date(timestamp).toLocaleTimeString();
    },

    truncateHistory(messages: Message[], maxLength: number): Message[] {
        return messages.slice(-maxLength);
    }
}; 