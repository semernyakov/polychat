import { GroqModel } from '../constants/models';

export interface ModelSettings {
  temperature: number;
  maxTokens: number;
}

export type ModelConfigMap = Record<GroqModel, ModelSettings>;

export interface StorageSettings {
  method: 'local' | 'note';
  maxHistoryLength: number;
  notePath?: string;
}

export interface UISettings {
  theme: string;
  fontSize: number;
  showTimestamps: boolean;
}

export interface GroqChatSettingsData {
  models: ModelConfigMap;
  storage: StorageSettings;
  ui: UISettings;
}
