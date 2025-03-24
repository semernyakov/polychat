import { Message } from '../types/types';

export function createUserMessage(content: string): Message {
  return {
    id: Date.now().toString(),
    role: 'user',
    content,
    timestamp: Date.now(),
  };
}

export function createAssistantMessage(content: string): Message {
  return {
    id: Date.now().toString(),
    role: 'assistant',
    content,
    timestamp: Date.now(),
  };
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString();
}

export function truncateHistory(messages: Message[], maxLength: number): Message[] {
  return messages.slice(-maxLength);
}

export function validateMessage(message: unknown): message is Message {
  return (
    typeof message === 'object' &&
    message !== null &&
    'id' in message &&
    'role' in message &&
    ['user', 'assistant'].includes((message as Message).role) &&
    'content' in message &&
    typeof (message as Message).content === 'string' &&
    'timestamp' in message &&
    typeof (message as Message).timestamp === 'number'
  );
}
