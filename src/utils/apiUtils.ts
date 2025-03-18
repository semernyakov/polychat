import { GroqApiError } from '../types/api';

interface ApiError {
    error: {
        message: string;
    };
}

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
        if (error && typeof error === 'object' && 'error' in error && typeof error.error === 'object' && error.error && 'message' in error.error) {
            const apiError = error as ApiError;
            return `API ошибка: ${apiError.error.message}`;
        }
        return `API ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`;
    },

    createApiHeaders(apiKey: string): Headers {
        return new Headers({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        });
    }
}; 