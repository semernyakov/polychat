/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

describe('ChatPanel', () => {
    const mockPlugin = {
        settings: {
            apiKey: 'test-api-key',
            googleToken: '',
            defaultModel: GroqModel.LLAMA_3_8B,
            temperature: 0.7,
            maxTokens: 8192,
            historyStorageMethod: 'memory',
            maxHistoryLength: 100,
            notePath: 'test-path.md',
            modelConfig: DEFAULT_MODEL_OPTIONS
        },
        app: {},
        manifest: {},
        addRibbonIcon: jest.fn(),
        addStatusBarItem: jest.fn(),
        addCommand: jest.fn(),
        addSettingTab: jest.fn(),
        registerView: jest.fn(),
        loadData: jest.fn(),
        saveData: jest.fn()
    } as unknown as GroqPlugin;

    beforeEach(() => {
        render(<ChatPanel plugin={mockPlugin} />);
    });

    it('renders input fields', () => {
        const { getByPlaceholderText } = render(<ChatPanel plugin={mockPlugin} />);
        expect(getByPlaceholderText('Введите сообщение...')).toBeInTheDocument();
    });

    it('handles user input', () => {
        const { getByPlaceholderText } = render(<ChatPanel plugin={mockPlugin} />);
        const input = getByPlaceholderText('Введите сообщение...') as HTMLTextAreaElement;
        fireEvent.change(input, { target: { value: 'test message' } });
        expect(input.value).toBe('test message');
    });

    it('clears input after sending message', () => {
        const { getByPlaceholderText, getByText } = render(<ChatPanel plugin={mockPlugin} />);
        const input = getByPlaceholderText('Введите сообщение...') as HTMLTextAreaElement;
        const sendButton = getByText('Отправить');

        fireEvent.change(input, { target: { value: 'test message' } });
        fireEvent.click(sendButton);

        expect(input.value).toBe('');
    });
}); 