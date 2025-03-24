import { GroqPlugin } from './plugin';
import { Message } from './types';

export type MessageRole = 'user' | 'assistant' | 'system' | 'error';

export interface ChatProps {
  plugin: GroqPlugin;
}

export interface ChatPanelState {
  messages: Message[];
  inputText: string;
  isLoading: boolean;
  selectedModel: string;
}

export interface ChatHistoryManager {
  saveMessages(messages: Message[]): void;
  loadMessages(): Message[];
  clearHistory(): void;
}

export interface ChatPanelInternalProps {
  messages: Message[];
  inputText: string;
  isLoading: boolean;
  selectedModel: string;
  onInputChange: (text: string) => void;
  onSendMessage: () => Promise<void>;
  onModelChange: (model: string) => void;
  onClearHistory: () => void;
}

export interface ChatHistory {
  messages: Message[];
}

export interface ChatState {
  isLoading: boolean;
  error: string | null;
  history: ChatHistory;
}

export interface HistoryOptions {
  method: 'memory' | 'file';
  maxHistoryLength: number;
  notePath: string;
}
