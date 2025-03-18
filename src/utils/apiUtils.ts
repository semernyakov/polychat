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
        return error instanceof Error ? error.message : 'Неизвестная ошибка';
    },

    createApiHeaders(apiKey: string): Headers {
        return new Headers({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        });
    }
}; 