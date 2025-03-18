import { GroqModel } from '../constants/models';
import { GroqApiResponse, GroqApiError, GroqApiOptions } from '../types/api';
import { DEFAULT_MODEL_OPTIONS } from '../constants/models';

export class GroqService {
    private static instance: GroqService;
    
    private constructor() {}
    
    static getInstance(): GroqService {
        if (!GroqService.instance) {
            GroqService.instance = new GroqService();
        }
        return GroqService.instance;
    }

    async sendMessage(
        message: string, 
        model: GroqModel, 
        apiKey: string,
        options: GroqApiOptions = {}
    ): Promise<string> {
        if (!apiKey) {
            throw new Error('API ключ не указан');
        }

        const requestOptions = {
            temperature: options.temperature ?? DEFAULT_MODEL_OPTIONS.temperature,
            max_tokens: options.max_tokens ?? DEFAULT_MODEL_OPTIONS.max_tokens,
            stream: options.stream ?? false
        };

        try {
            const response = await fetch('https://api.groq.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model,
                    messages: [{ role: 'user', content: message }],
                    ...requestOptions
                })
            });

            if (!response.ok) {
                const errorData = await response.json() as GroqApiError;
                throw new Error(`Ошибка API (${response.status}): ${errorData.error?.message || 'Неизвестная ошибка'}`);
            }

            const data = await response.json() as GroqApiResponse;
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Ошибка при вызове Groq API:', error);
            throw new Error(`Ошибка чата: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
        }
    }

    async validateApiKey(apiKey: string): Promise<boolean> {
        try {
            await this.sendMessage('test', GROQ_MODELS.LLAMA_3_8B, apiKey);
            return true;
        } catch {
            return false;
        }
    }
}

export const groqService = GroqService.getInstance();