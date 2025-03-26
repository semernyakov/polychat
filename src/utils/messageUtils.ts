import { Message } from '../types/message';

export const MessageUtils = {
  create: (role: Message['role'], content: string): Message => ({
    id: crypto.randomUUID(),
    role,
    content,
    timestamp: Date.now(),
  }),

  formatTime: (timestamp: number) =>
    new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),

  truncate: (messages: Message[], max: number) => messages.slice(-Math.max(1, max)),

  validate: (message: unknown): message is Message => {
    const m = message as Message;
    return (
      !!m?.id &&
      ['user', 'assistant', 'system'].includes(m?.role) &&
      typeof m?.content === 'string' &&
      !!m?.timestamp
    );
  },
};
