import React from 'react';
import { AuthService } from '../services/authService';
import { GroqPlugin } from '../types/plugin';

interface Props {
    plugin: GroqPlugin;
    onAuthError?: (error: Error) => void;
}

export function GoogleAuthButton({ plugin, onAuthError }: Props) {
    const handleAuth = async () => {
        try {
            const authService = new AuthService(plugin);
            await authService.startAuthFlow();
        } catch (error) {
            if (onAuthError) {
                onAuthError(error instanceof Error ? error : new Error(String(error)));
            }
        }
    };

    return (
        <button
            type="button"
            className="google-auth-button"
            onClick={handleAuth}
        >
            Войти через Google
        </button>
    );
}