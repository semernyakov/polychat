/** @jsx React.createElement */
import React from 'react';
import { GroqPlugin } from '../types/plugin';
import { Message } from '../types/chat';
import { groqService } from '../services/groqService';
import { HistoryService } from '../services/historyService';
import { GroqModel } from '../constants/models';
import { GoogleAuthButton } from './GoogleAuthButton';

interface Props {
    plugin: GroqPlugin;
}

export function ChatPanel({ plugin }: Props) {
    const [messages, setMessages] = React.useState<Message[]>([]);
    const [input, setInput] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [selectedModel] = React.useState<GroqModel>(plugin.settings.defaultModel);
    const [historyService] = React.useState(() => new HistoryService(plugin));

    React.useEffect(() => {
        const loadHistory = async () => {
            const history = await historyService.loadMessages();
            setMessages(history);
        };
        loadHistory();
    }, [historyService]);

    const handleAuthError = (error: Error) => {
        const errorMessage: Message = {
            role: 'error',
            content: `Ошибка авторизации: ${error.message}`,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
    };

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: input,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await groqService.sendMessage(
                userMessage.content,
                selectedModel,
                plugin.settings.temperature,
                plugin.settings.maxTokens
            );

            const assistantMessage: Message = {
                role: 'assistant',
                content: response,
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, assistantMessage]);
            await historyService.saveMessages([...messages, userMessage, assistantMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: Message = {
                role: 'error',
                content: error instanceof Error ? error.message : 'Произошла ошибка при отправке сообщения',
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="groq-chat-container">
            {!plugin.settings.googleToken && (
                <GoogleAuthButton plugin={plugin} onAuthError={handleAuthError} />
            )}
            <div className="groq-chat-messages">
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.role}`}>
                        <div className="message-content">{message.content}</div>
                        <div className="message-timestamp">
                            {new Date(message.timestamp).toLocaleString()}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="message assistant">
                        <div className="message-content">Думаю...</div>
                    </div>
                )}
            </div>
            <div className="groq-chat-input">
                <textarea
                    value={input}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Введите сообщение..."
                    disabled={isLoading || !plugin.settings.googleToken}
                />
                <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !input.trim() || !plugin.settings.googleToken}
                >
                    Отправить
                </button>
            </div>
        </div>
    );
}