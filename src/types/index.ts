// src/types/index.ts

// Явно реэкспортируем только необходимые типы
export {
  GroqModel,
  ModelInfo,
  MODELS,
  DEFAULT_MODEL,
  getModelInfo,
  isAudioModel,
  isVisionModel
} from './models';

// Реэкспортируем остальные модули
export * from './api';
export * from './plugin';
export * from './chat';
export * from './views';

export interface AuthState {
  isAuthenticated: boolean;
  error?: string;
}
