import { GroqApiError } from '../types/api';
import { t } from '../localization';

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
      return `${t('apiError')}: ${error.error.message}`;
    }
    return `${t('apiError')}: ${error instanceof Error ? error.message : t('unknownError')}`;
  },

  createApiHeaders(apiKey: string): Headers {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', `Bearer ${apiKey}`);
    return headers;
  },
};
