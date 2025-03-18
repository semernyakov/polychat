import { API_ENDPOINT, GroqModel } from '../constants';
import { GroqApiResponse, GroqApiError, GroqApiOptions } from '../types/api';
import { DEFAULT_MODEL_OPTIONS } from '../constants/models';

interface GroqRequestOptions {
    temperature?: number;
    max_tokens?: number;
}

class GroqService {
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
        options: GroqRequestOptions = {}
    ): Promise<string> {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [{ role: 'user', content: message }],
                model,
                temperature: options.temperature ?? 0.7,
                max_tokens: options.max_tokens ?? 2048
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    async validateApiKey(apiKey: string): Promise<boolean> {
        try {
            await this.sendMessage('test', GroqModel.LLAMA_3_8B, apiKey);
            return true;
        } catch (error) {
            return false;
        }
    }
}

export const groqService = GroqService.getInstance();