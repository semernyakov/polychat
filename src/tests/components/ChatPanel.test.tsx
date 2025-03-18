import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChatPanel } from '../../components/ChatPanel';
import { GroqPlugin } from '../../types/plugin';
import { App } from 'obsidian';

// Мок для App
const mockApp = {} as App;

// Мок для плагина
const mockPlugin = {
    settings: {
        apiKey: 'test-key',
        model: 'llama3-8b-8192'
    },
    loadData: async () => ({ chatHistory: [] }),
    saveData: async () => {}
} as unknown as GroqPlugin;

// Мок для fetch
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ choices: [{ message: { content: 'Ответ от API' } }] })
    })
) as jest.Mock;

describe('ChatPanel', () => {
    beforeEach(() => {
        render(<ChatPanel plugin={mockPlugin} app={mockApp} />);
    });

    it('renders input field correctly', () => {
        const input = screen.getByPlaceholderText('Введите сообщение...');
        expect(input).toBeInTheDocument();
    });

    it('handles input change', () => {
        const input = screen.getByPlaceholderText('Введите сообщение...') as HTMLInputElement;
        fireEvent.change(input, { target: { value: 'Тестовое сообщение' } });
        expect(input.value).toBe('Тестовое сообщение');
    });

    it('sends message on button click', async () => {
        const input = screen.getByPlaceholderText('Введите сообщение...') as HTMLInputElement;
        const button = screen.getByRole('button');

        fireEvent.change(input, { target: { value: 'Тестовое сообщение' } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText('Тестовое сообщение')).toBeInTheDocument();
        }, { timeout: 2000 });
    });
});

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