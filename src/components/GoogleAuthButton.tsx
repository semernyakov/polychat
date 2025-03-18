import React from 'react';
import { authService } from '../services/authService';
import { Notice } from 'obsidian';

interface GoogleAuthButtonProps {
    onAuthSuccess: (token: string) => void;
    onAuthError: (error: string) => void;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
    onAuthSuccess,
    onAuthError
}) => {
    const handleAuth = async () => {
        try {
            await authService.initiateGoogleAuth();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
            onAuthError(errorMessage);
            new Notice(`Ошибка авторизации: ${errorMessage}`);
        }
    };

    return (
        <button
            className="google-auth-button"
            onClick={handleAuth}
        >
            <div className="google-auth-button-content">
                <img 
                    src="data:image/svg+xml;base64,..." // Здесь будет base64 иконка Google
                    alt="Google"
                    className="google-icon"
                />
                <span>Войти через Google</span>
            </div>
        </button>
    );
}; 