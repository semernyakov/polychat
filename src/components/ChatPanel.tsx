/** @jsx React.createElement */
import React, { useState, useEffect, useCallback } from 'react';
import { App } from 'obsidian';
import { GroqPlugin } from '../types/plugin';
import { Message } from '../types/message';
import { GoogleAuthButton } from './GoogleAuthButton';
import { HistoryService } from '../services/historyService';
import { MessageItem } from './MessageItem';
import { ModelSelector } from './ModelSelector';
import { GROQ_MODELS } from '../constants/models';

interface ChatPanelProps {
    plugin: GroqPlugin;
    app: App;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ plugin, app }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState(plugin.settings.model);
    
    useEffect(() => {
        // Загрузка истории сообщений при открытии панели
        const historyService = new HistoryService(plugin);
        const loadHistory = async () => {
            const history = await historyService.getHistory();
            setMessages(history);
        };
        loadHistory();
    }, [plugin.settings.apiKey]);

    const handleSendMessage = useCallback(async () => {
        if (!inputValue.trim() || isLoading) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, newMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            if (!plugin.settings.apiKey) {
                throw new Error('API ключ не задан. Пожалуйста, введите API ключ в настройках.');
            }

            const historyService = new HistoryService(plugin);
            await historyService.addMessage(newMessage);

            const response = await fetch(`https://api.groq.com/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${plugin.settings.apiKey}`
                },
                body: JSON.stringify({
                    model: selectedModel,
                    messages: [{ role: 'user', content: newMessage.content }],
                    temperature: plugin.settings.temperature,
                    max_tokens: plugin.settings.maxTokens
                })
            });

            if (!response.ok) {
                throw new Error(`Ошибка API: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const assistantMessage: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: data.choices[0].message.content,
                timestamp: Date.now()
            };

            setMessages(prev => [...prev, assistantMessage]);
            await historyService.addMessage(assistantMessage);
        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
            const errorMessage: Message = {
                id: Date.now().toString(),
                role: 'error',
                content: error instanceof Error ? error.message : 'Произошла неизвестная ошибка',
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [inputValue, plugin, isLoading, selectedModel]);

    const handleAuthError = (error: string) => {
        console.error('Ошибка аутентификации:', error);
        const errorMessage: Message = {
            id: Date.now().toString(),
            role: 'error',
            content: error,
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, errorMessage]);
    };

    if (!plugin.settings.apiKey) {
        return (
            <div className="groq-chat-container">
                <GoogleAuthButton 
                    plugin={plugin} 
                    onAuthError={handleAuthError} 
                />
            </div>
        );
    }

    return (
        <div className="groq-chat-container">
            <div className="groq-chat-header">
                <ModelSelector
                    models={GROQ_MODELS}
                    selectedModel={selectedModel}
                    onSelectModel={setSelectedModel}
                />
            </div>
            <div className="groq-messages-container">
                {messages.map(message => (
                    <MessageItem key={message.id} message={message} />
                ))}
                {isLoading && <div className="groq-loading-indicator">Генерация ответа...</div>}
            </div>
            <div className="groq-input-container">
                <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Введите сообщение..."
                    className="groq-input"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                />
                <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputValue.trim()}
                    className="groq-send-button"
                >
                    Отправить
                </button>
            </div>
        </div>
    );
};