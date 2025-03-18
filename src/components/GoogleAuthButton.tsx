import React, { useState } from 'react';
import { GroqPlugin } from '../types/plugin';

interface GoogleAuthButtonProps {
    plugin: GroqPlugin;
    onAuthError: (error: string) => void;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ plugin, onAuthError }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [apiKey, setApiKey] = useState(plugin.settings.apiKey);

    const handleApiKeySubmit = async () => {
        setIsLoading(true);
        try {
            plugin.settings.apiKey = apiKey;
            await plugin.saveSettings();
        } catch (error) {
            onAuthError('Ошибка при сохранении API ключа');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="groq-auth-container">
            <div className="groq-auth-form">
                <h2>Настройка Groq API</h2>
                <div className="groq-input-group">
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Введите ваш API ключ Groq"
                        className="groq-input"
                    />
                </div>
                <button
                    onClick={handleApiKeySubmit}
                    disabled={isLoading}
                    className="groq-button"
                >
                    {isLoading ? 'Сохранение...' : 'Сохранить API ключ'}
                </button>
                <p className="groq-help-text">
                    Получите API ключ на сайте{' '}
                    <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer">
                        Groq Console
                    </a>
                </p>
            </div>
        </div>
    );
};