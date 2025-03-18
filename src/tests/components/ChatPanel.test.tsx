import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { GroqChatPanel } from '../../components/ChatPanel';
import { GroqPlugin } from '../../types/plugin';
import '@testing-library/jest-dom';

// Mock plugin
const mockPlugin: GroqPlugin = {
    settings: {
        groqApiKey: 'test-key',
        defaultModel: 'llama3-8b-8192',
        historyStorageMethod: 'local',
        maxHistoryLength: 100,
        temperature: 0.7,
        maxTokens: 1000
    },
    loadSettings: jest.fn(),
    saveSettings: jest.fn(),
    clearHistory: jest.fn()
};

describe('ChatPanel', () => {
    it('renders correctly', () => {
        render(<GroqChatPanel plugin={mockPlugin} />);
        expect(screen.getByPlaceholder('Введите сообщение...')).toBeInTheDocument();
    });

    it('handles input changes', () => {
        render(<GroqChatPanel plugin={mockPlugin} />);
        const input = screen.getByPlaceholder('Введите сообщение...') as HTMLTextAreaElement;
        
        fireEvent.change(input, { target: { value: 'test message' } });
        expect(input).toHaveValue('test message');

        fireEvent.change(input, { target: { value: '' } });
        expect(input).toHaveValue('');
    });
}); 