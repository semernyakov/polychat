import { Message } from '../types/chat';

export function createUserMessage(content: string): Message {
    return {
        role: 'user',
        content,
        timestamp: Date.now()
    };
}

export function createAssistantMessage(content: string): Message {
    return {
        role: 'assistant',
        content,
        timestamp: Date.now()
    };
}

export const messageUtils = {
    formatTimestamp(timestamp: number): string {
        return new Date(timestamp).toLocaleTimeString();
    },

    truncateHistory(messages: Message[], maxLength: number): Message[] {
        return messages.slice(-maxLength);
    }
}; 