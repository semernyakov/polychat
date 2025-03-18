import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ChatPanel from '../../components/ChatPanel';
import { GroqPlugin } from '../../types/plugin';
import '@testing-library/jest-dom';

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
        expect(screen.getByPlaceholderText('Введите сообщение...')).toBeInTheDocument();
        expect(screen.getByText('Отправить')).toBeInTheDocument();
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