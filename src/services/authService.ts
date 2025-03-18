import { App } from 'obsidian';
import GroqChatPlugin from '../main';

export class AuthService {
    constructor(
        private app: App,
        private plugin: GroqChatPlugin
    ) {}

    /**
     * Проверяет, авторизован ли пользователь
     */
    isAuthenticated(): boolean {
        return !!this.plugin.settings.apiKey;
    }

    /**
     * Проверяет, является ли API ключ валидным
     */
    async validateApiKey(apiKey: string): Promise<boolean> {
        if (!apiKey) return false;
        
        try {
            const response = await fetch('https://api.groq.com/v1/models', {
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            });
            return response.ok;
        } catch (error) {
            console.error('Error validating API key:', error);
            return false;
        }
    }

    /**
     * Сохраняет API ключ в настройках
     */
    async saveApiKey(apiKey: string): Promise<boolean> {
        if (!apiKey) return false;
        
        try {
            const isValid = await this.validateApiKey(apiKey);
            if (isValid) {
                this.plugin.settings.apiKey = apiKey;
                await this.plugin.saveSettings();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error saving API key:', error);
            return false;
        }
    }

    /**
     * Удаляет API ключ из настроек
     */
    async clearApiKey(): Promise<void> {
        this.plugin.settings.apiKey = '';
        await this.plugin.saveSettings();
    }
} 