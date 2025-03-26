import { Message } from './message';

export interface GroqApiError {
  error: {
    message: string;
    type: string;
    code?: string;
    param?: string | null;
  };
  status?: number;
}

export interface GroqApiRequest {
  messages: Message[];
  model: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface GroqApiResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  choices: Array<{
    index: number;
    message: Message;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
