import { Message } from './types';

export interface GroqApiRequest {
  messages: Message[];
  model: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface GroqApiResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: Message & { function_call?: unknown };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface GroqApiError {
  error: {
    message: string;
    type: string;
    param?: string;
    code?: string;
  };
}

export interface GroqModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  permission: Array<{
    id: string;
    object: string;
    created: number;
    allow_create_engine: boolean;
    allow_sampling: boolean;
    allow_logprobs: boolean;
    allow_search_indices: boolean;
    allow_view: boolean;
    allow_fine_tuning: boolean;
    organization: string;
    group: string | null;
    is_blocking: boolean;
  }>;
  root: string;
  parent: string | null;
}
