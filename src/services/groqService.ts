import { API_ENDPOINT } from '../constants';
import { GroqModel } from '../constants/models';
import { GroqApiResponse, GroqApiError, GroqApiOptions } from '../types/api';
import { DEFAULT_MODEL_OPTIONS } from '../constants/models';

interface GroqRequestOptions {
    temperature?: number;
    max_tokens?: number;
}

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
        content: string,
        model: GroqModel,
        temperature: number,
        maxTokens: number
    ): Promise<string> {
        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [{ role: 'user', content }],
                    model,
                    temperature: temperature.toString(),
                    max_tokens: maxTokens
                })
            });

            if (!response.ok) {
                const error: GroqApiError = await response.json();
                throw new Error(error.error.message);
            }

            const data: GroqApiResponse = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }

    async validateApiKey(apiKey: string): Promise<boolean> {
        try {
            await this.sendMessage('test', GroqModel.LLAMA_3_8B, 0.7, 2048);
            return true;
        } catch (error) {
            return false;
        }
    }
}

export const groqService = GroqService.getInstance();