import { GroqApiError } from '../types/api';

export const apiUtils = {
  isApiError(error: unknown): error is GroqApiError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'error' in error &&
      typeof (error as GroqApiError).error?.message === 'string'
    );
  },

  formatApiError(error: unknown): string {
    if (this.isApiError(error)) {
      return `API ошибка: ${error.error.message}`;
    }
    return `API ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`;
  },

  createApiHeaders(apiKey: string): Headers {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', `Bearer ${apiKey}`);
    return headers;
  },
};
