import { GroqModel } from './models';
import { GroqChatSettings } from './settings';

export type MessageRole = 'user' | 'assistant' | 'system';

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

export interface ModelSettings {
  temperature: number;
  maxTokens: number;
}
