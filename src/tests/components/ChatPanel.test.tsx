import React from 'react';
// import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChatPanel } from '../../components/ChatPanel';
import { GroqPlugin } from '../../types/plugin';
import { GroqModel } from '../../constants/models';
import { DEFAULT_MODEL_OPTIONS } from '../../constants/models';

jest.mock('../../services/groqService');
jest.mock('../../services/historyService');

jest.mock('../../services/authService', () => ({
    authService: {
        validateApiKey: jest.fn().mockResolvedValue(true)
    }
}));


/*
 * Тесты временно отключены до обновления зависимостей
 * 
/// <reference types="@testing-library/jest-dom" />

import { render, screen, fireEvent } from '@testing-library/react';
import { ChatPanel } from '../../components/ChatPanel';
import { GroqPlugin } from '../../types/plugin';
import { GroqModel } from '../../constants/models';

// Настройка моков
jest.mock('../../services/groqService', () => {
    return {
        GroqService: jest.fn().mockImplementation(() => {
            return {
                sendMessage: jest.fn().mockResolvedValue({
                    role: 'assistant',
                    content: 'Mock response',
                    timestamp: Date.now()
                })
            };
        })
    };
}));

describe('ChatPanel', () => {
    const mockPlugin = {
        app: {},
        settings: {
            apiKey: 'test-api-key',
            model: GroqModel.LLAMA_3_8B,
            temperature: 0.7,
            maxTokens: 2048,
            historyStorageMethod: 'memory',
            maxHistoryLength: 100,
            notePath: 'test-path.md',
            saveSettings: jest.fn()
        },
        saveSettings: jest.fn()
    } as unknown as GroqPlugin;

    it('renders input field correctly', () => {
        render(<ChatPanel plugin={mockPlugin} />);
        const inputField = screen.getByPlaceholderText('Введите сообщение...');
        expect(inputField).toBeInTheDocument();
    });

    it('handles input change', () => {
        const { getByPlaceholderText } = render(<ChatPanel plugin={mockPlugin} />);
        const input = getByPlaceholderText('Введите сообщение...') as HTMLInputElement;
        fireEvent.change(input, { target: { value: 'Тестовое сообщение' } });
        expect(input.value).toBe('Тестовое сообщение');
    });

    it('sends message on button click', async () => {
        const { getByPlaceholderText, getByText } = render(<ChatPanel plugin={mockPlugin} />);
        const input = getByPlaceholderText('Введите сообщение...') as HTMLInputElement;
        const sendButton = getByText('Отправить');
        
        fireEvent.change(input, { target: { value: 'Тестовое сообщение' } });
        fireEvent.click(sendButton);
        
        // Подождем, пока сообщение отправится и получит ответ
        await new Promise(resolve => setTimeout(resolve, 100));
        expect(screen.getByText('Тестовое сообщение')).toBeInTheDocument();
    });
});
*/ 