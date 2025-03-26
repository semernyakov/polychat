import { GroqPluginInterface } from './plugin';
import { Message } from './message';

export interface ChatState {
  messages: Message[];
  inputText: string;
  isLoading: boolean;
  error: string | null;
}

export interface ChatHistoryManager {
  saveMessages(messages: Message[]): Promise<void>;
  loadMessages(): Promise<Message[]>;
  clearHistory(): Promise<void>;
}

export interface HistoryOptions {
  method: 'memory' | 'file';
  maxHistoryLength: number;
  notePath: string;
}
