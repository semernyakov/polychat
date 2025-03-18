import React, { useState, useRef, useEffect } from 'react';
import { Notice } from 'obsidian';
import { ChatProps, ChatPanelState } from '../types/chat';
import { groqService } from '../services/groqService';
import { historyService } from '../services/historyService';
import { ModelSelector } from './ModelSelector';
import { MessageItem } from './MessageItem';
import { messageUtils } from '../utils/messageUtils';
import { apiUtils } from '../utils/apiUtils';

const ChatPanel: React.FC<ChatProps> = ({ plugin }) => {
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
    }, [plugin.settings.historyStorageMethod, plugin.settings.maxHistoryLength, plugin.settings.notePath]);

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
    }, [state.messages, plugin.settings.historyStorageMethod, plugin.settings.maxHistoryLength, plugin.settings.notePath]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const clearHistory = async () => {
        try {
            await historyService.clearHistory({
                method: plugin.settings.historyStorageMethod,
                notePath: plugin.settings.notePath,
                maxHistoryLength: plugin.settings.maxHistoryLength
            });
            setState(prev => ({ ...prev, messages: [] }));
            new Notice('История чата очищена');
        } catch (error) {
            console.error('Ошибка при очистке истории:', error);
            new Notice('Ошибка при очистке истории чата');
        }
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
                plugin.settings.apiKey,
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

    return (
        <div className="groq-chat-container">
            <div className="groq-chat-header">
                <ModelSelector
                    selectedModel={state.selectedModel}
                    onModelChange={(model) => setState(prev => ({ ...prev, selectedModel: model }))}
                    disabled={state.isLoading}
                />
                <button
                    className="groq-chat-clear-button"
                    onClick={clearHistory}
                    title="Очистить историю чата"
                    disabled={state.isLoading || state.messages.length === 0}
                >
                    Очистить историю
                </button>
            </div>
            <div className="messages-container">
                {state.messages.map((message, index) => (
                    <MessageItem
                        key={`${message.timestamp}-${index}`}
                        message={message}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="input-group">
                <div className="message-input">
                    <textarea
                        value={state.inputText}
                        onChange={(e) => setState(prev => ({ ...prev, inputText: e.target.value }))}
                        onKeyPress={handleKeyPress}
                        placeholder="Введите сообщение..."
                        className="input-field"
                        rows={3}
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

export default ChatPanel;