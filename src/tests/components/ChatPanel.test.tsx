/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ChatPanel from '../../components/ChatPanel';
import { GroqPlugin } from '../../types/plugin';
import '@testing-library/jest-dom';

jest.mock('../../services/historyService', () => ({
    historyService: {
        loadMessages: jest.fn().mockResolvedValue([]),
        saveMessages: jest.fn().mockResolvedValue(undefined)
    }
}));

jest.mock('../../services/groqService', () => ({
    groqService: {
        sendMessage: jest.fn().mockResolvedValue('Mock response')
    }
}));

jest.mock('../../services/authService', () => ({
    authService: {
        validateApiKey: jest.fn().mockResolvedValue(true)
    }
}));

describe('ChatPanel', () => {
    const mockPlugin = {
        settings: {
            apiKey: 'test-api-key',
            defaultModel: 'mixtral-8x7b-32768',
            temperature: 0.7,
            maxTokens: 4096,
            maxHistoryLength: 100,
            historyStorageMethod: 'local' as const,
            notePath: ''
        },
        app: {},
        manifest: {},
        addRibbonIcon: jest.fn(),
        addStatusBarItem: jest.fn(),
        addCommand: jest.fn(),
        addSettingTab: jest.fn(),
        saveData: jest.fn(),
        loadData: jest.fn()
    } as unknown as GroqPlugin;

    beforeEach(() => {
        render(<ChatPanel plugin={mockPlugin} />);
    });

    it('renders input field and send button', () => {
        const input = screen.getByPlaceholderText('Введите сообщение...');
        const button = screen.getByText('Отправить');
        expect(input).toBeTruthy();
        expect(button).toBeTruthy();
    });

    it('handles user input', () => {
        const input = screen.getByPlaceholderText('Введите сообщение...') as HTMLTextAreaElement;
        fireEvent.change(input, { target: { value: 'Test message' } });
        expect(input.value).toBe('Test message');
    });

    it('clears input after sending message', () => {
        const input = screen.getByPlaceholderText('Введите сообщение...') as HTMLTextAreaElement;
        const sendButton = screen.getByText('Отправить');

        fireEvent.change(input, { target: { value: 'Test message' } });
        fireEvent.click(sendButton);

        expect(input.value).toBe('');
    });
}); 