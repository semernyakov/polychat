import React, { useState, useRef, useEffect } from 'react';
import { ChatProps, ChatPanelState } from '../types/chat';
import { groqService } from '../services/groqService';
import { historyService } from '../services/historyService';
import { ModelSelector } from './ModelSelector';
import { MessageItem } from './MessageItem';
import { messageUtils } from '../utils/messageUtils';
import { apiUtils } from '../utils/apiUtils';

export const GroqChatPanel: React.FC<ChatProps> = ({ plugin }) => {
    const [state, setState] = useState<ChatPanelState>({
        messages: [],
        inputText: '',
        isLoading: false,
        selectedModel: plugin.settings.defaultModel
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadMessages = async () => {
            const loadedMessages = await historyService.loadMessages({
                method: plugin.settings.historyStorageMethod,
                maxHistoryLength: plugin.settings.maxHistoryLength,
                notePath: plugin.settings.notePath
            });
            setState(prev => ({ ...prev, messages: loadedMessages }));
        };

        loadMessages();
    }, [plugin.settings, plugin.settings.historyStorageMethod, plugin.settings.maxHistoryLength, plugin.settings.notePath]);

    useEffect(() => {
        const saveHistory = async () => {
            await historyService.saveMessages(state.messages, {
                method: plugin.settings.historyStorageMethod,
                maxHistoryLength: plugin.settings.maxHistoryLength,
                notePath: plugin.settings.notePath
            });
        };

        saveHistory();
        scrollToBottom();
    }, [state.messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const sendMessage = async () => {
        if (state.inputText.trim() === '' || state.isLoading) return;

        const userMessage = messageUtils.createUserMessage(state.inputText);

        setState(prev => ({
            ...prev,
            messages: [...prev.messages, userMessage],
            inputText: '',
            isLoading: true
        }));

        try {
            const response = await groqService.sendMessage(
                state.inputText,
                state.selectedModel,
                plugin.settings.groqApiKey,
                {
                    temperature: plugin.settings.temperature,
                    max_tokens: plugin.settings.maxTokens
                }
            );

            const groqMessage = messageUtils.createGroqMessage(response);

            setState(prev => ({
                ...prev,
                messages: messageUtils.truncateHistory(
                    [...prev.messages, groqMessage],
                    plugin.settings.maxHistoryLength
                ),
                isLoading: false
            }));
        } catch (error) {
            const errorMessage = messageUtils.createGroqMessage(
                apiUtils.formatApiError(error),
                'error'
            );

            setState(prev => ({
                ...prev,
                messages: [...prev.messages, errorMessage],
                isLoading: false
            }));
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearHistory = async () => {
        await historyService.clearHistory({
            method: plugin.settings.historyStorageMethod,
            maxHistoryLength: plugin.settings.maxHistoryLength,
            notePath: plugin.settings.notePath
        });
        setState(prev => ({ ...prev, messages: [] }));
    };

    return (
        <div className="groq-chat-panel">
            <div className="chat-header">
                <h2>Groq Chat</h2>
                <button 
                    onClick={clearHistory} 
                    className="clear-history-button"
                    disabled={state.isLoading}
                >
                    Очистить историю
                </button>
            </div>
            <div className="messages-container">
                {state.messages.map((message, index) => (
                    <MessageItem
                        key={`${message.timestamp}-${index}`}
                        message={message}
                        sender={message.sender} // Добавлено для передачи отправителя
                        timestamp={message.timestamp} // Добавлено для передачи времени
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="input-group">
                <ModelSelector
                    selectedModel={state.selectedModel}
                    onModelChange={(model) => setState(prev => ({ ...prev, selectedModel: model }))}
                    models={plugin.settings.models}
                    disabled={state.isLoading}
                />
                <div className="message-input">
                    <textarea
                        value={state.inputText}
                        onChange={(e) => setState(prev => ({ ...prev, inputText: e.target.value }))}
                        onKeyPress={handleKeyPress}
                        placeholder="Введите сообщение..."
                        className="input-field"
                        rows={3}
                        style={{ fontSize: `${plugin.settings.ui?.fontSize ?? 14}px` }}
                        disabled={state.isLoading}
                    />
                    <button 
                        onClick={sendMessage}
                        className="send-button"
                        disabled={!state.inputText.trim() || state.isLoading}
                    >
                        {state.isLoading ? 'Отправка...' : 'Отправить'}
                    </button>
                </div>
            </div>
        </div>
    );
};