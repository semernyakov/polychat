import { App } from 'obsidian';
import { GroqPlugin } from '../types/plugin';

export class AuthService {
    private app: App;
    private plugin: GroqPlugin;

    constructor(app: App, plugin: GroqPlugin) {
        this.app = app;
        this.plugin = plugin;
    }

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
        try {
            const response = await fetch('https://api.groq.com/v1/models', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            });
            
            return response.ok;
        } catch (error) {
            console.error('Ошибка проверки API ключа:', error);
            return false;
        }
    }

    /**
     * Сохраняет API ключ в настройках
     */
    async saveApiKey(apiKey: string): Promise<void> {
        this.plugin.settings.apiKey = apiKey;
        await this.plugin.saveSettings();
    }

    /**
     * Удаляет API ключ из настроек
     */
    async clearApiKey(): Promise<void> {
        this.plugin.settings.apiKey = '';
        await this.plugin.saveSettings();
    }
} 