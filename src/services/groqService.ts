import { App } from 'obsidian';
import { GroqPlugin } from '../types/plugin';
import { Message } from '../types/message';

export class GroqService {
    private app: App;
    private plugin: GroqPlugin;

    constructor(app: App, plugin: GroqPlugin) {
        this.app = app;
        this.plugin = plugin;
    }

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

    async sendMessage(
        content: string,
        model: string = this.plugin.settings.model,
        temperature: number = this.plugin.settings.temperature,
        maxTokens: number = this.plugin.settings.maxTokens
    ): Promise<Message> {
        if (!this.plugin.settings.apiKey) {
            throw new Error('API ключ не задан. Пожалуйста, введите API ключ в настройках.');
        }

        try {
            const response = await fetch('https://api.groq.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.plugin.settings.apiKey}`
                },
                body: JSON.stringify({
                    model,
                    messages: [{ role: 'user', content }],
                    temperature: temperature,
                    max_tokens: maxTokens
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API ошибка: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
            }

            const data = await response.json();
            
            return {
                id: Date.now().toString(),
                role: 'assistant',
                content: data.choices[0].message.content,
                timestamp: Date.now()
            };
        } catch (error) {
            console.error('Ошибка отправки сообщения:', error);
            throw error;
        }
    }

    getAvailableModels() {
        return [
            'llama3-70b-8192',
            'llama3-8b-8192',
            'mixtral-8x7b-32768',
            'gemma-7b-it',
            'claude-3-opus-20240229',
            'claude-3-sonnet-20240229',
            'claude-3-haiku-20240307'
        ];
    }
}