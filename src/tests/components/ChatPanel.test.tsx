import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { ChatPanel } from '../../components/ChatPanel';

describe('ChatPanel', () => {
    const mockPlugin = {
        settings: {
            groqApiKey: 'test-key',
            defaultModel: 'llama3-8b-8192',
            ui: {
                showTimestamps: true,
                fontSize: 14
            }
        }
    };

    it('renders correctly', () => {
        render(<ChatPanel plugin={mockPlugin} />);
        expect(screen.getByPlaceholder('Введите сообщение...')).toBeInTheDocument();
    });

    it('handles message sending', async () => {
        render(<ChatPanel plugin={mockPlugin} />);
        const input = screen.getByPlaceholder('Введите сообщение...');
        const sendButton = screen.getByText('Отправить');

        fireEvent.change(input, { target: { value: 'Test message' } });
        fireEvent.click(sendButton);

        expect(input).toHaveValue('');
    });
}); 