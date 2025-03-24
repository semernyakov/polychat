export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
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

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  maxTokens: number;
  category: 'text' | 'audio' | 'vision';
  developer?: string;
  contextWindow?: number;
  maxCompletionTokens?: number;
  isPreview?: boolean;
  maxFileSize?: number;
}

export interface GroqChatSettings {
  storeHistory: boolean;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  maxHistoryLength: number;
  historyStorageMethod: 'memory' | 'localStorage' | 'indexedDB' | 'file';
  history: Message[];
  notePath: string;
}

export interface ModelSettings {
  temperature: number;
  maxTokens: number;
}
