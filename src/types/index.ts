export interface AuthState {
  isAuthenticated: boolean;
  error?: string;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: number;
  status?: 'error';
}
