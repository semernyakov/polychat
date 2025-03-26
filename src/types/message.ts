/**
 * Роли участников чата
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * Сообщение в чате
 */
export interface Message {
  id: string;
  role: MessageRole;
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

/**
 * История чата с метаданными
 */
export interface ChatHistory {
  version: 1;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}
