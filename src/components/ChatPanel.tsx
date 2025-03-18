import React, { useState, useEffect, useCallback } from 'react';
import { GroqPlugin } from '../types/plugin';
import { groqService } from '../services/groqService';
import { historyService } from '../services/historyService';
import { Message } from '../types/chat';
import { GroqModel } from '../constants/models';

interface ChatPanelProps {
    plugin: GroqPlugin;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ plugin }) => {
    const [state, setState] = useState({
        messages: [] as Message[],
        input: '',
        isLoading: false,
        selectedModel: plugin.settings.defaultModel
    });

    useEffect(() => {
        const loadHistory = async () => {
            const history = await historyService.loadHistory({
                method: plugin.settings.historyStorageMethod,
                maxHistoryLength: plugin.settings.maxHistoryLength,
                notePath: plugin.settings.notePath
            });
            setState(prev => ({ ...prev, messages: history }));
        };
        loadHistory();
    }, [plugin.settings.historyStorageMethod, plugin.settings.maxHistoryLength, plugin.settings.notePath]);

    useEffect(() => {
        const saveHistory = async () => {
            await historyService.saveHistory(state.messages, {
                method: plugin.settings.historyStorageMethod,
                maxHistoryLength: plugin.settings.maxHistoryLength,
                notePath: plugin.settings.notePath
            });
        };
        saveHistory();
    }, [state.messages, plugin.settings.historyStorageMethod, plugin.settings.maxHistoryLength, plugin.settings.notePath]);

    const handleSend = useCallback(async () => {
        if (!state.input.trim() || state.isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: state.input,
            timestamp: Date.now()
        };

        setState(prev => ({
            ...prev,
            messages: [...prev.messages, userMessage],
            input: '',
            isLoading: true
        }));

        try {
            const response = await groqService.sendMessage(
                state.input,
                state.selectedModel,
                plugin.settings.apiKey,
                {
                    temperature: plugin.settings.temperature,
                    max_tokens: plugin.settings.maxTokens
                }
            );

            const assistantMessage: Message = {
                role: 'assistant',
                content: response,
                timestamp: Date.now()
            };

            setState(prev => ({
                ...prev,
                messages: [...prev.messages, assistantMessage],
                isLoading: false
            }));
        } catch (error) {
            console.error('Error sending message:', error);
            setState(prev => ({ ...prev, isLoading: false }));
        }
    }, [state.input, state.isLoading, plugin.settings]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }, [handleSend]);

    return (
        <div className="groq-chat-container">
            <div className="groq-chat-messages">
                {state.messages.map((message, index) => (
                    <div key={index} className={`message ${message.role}`}>
                        <div className="message-content">{message.content}</div>
                    </div>
                ))}
                {state.isLoading && (
                    <div className="message assistant">
                        <div className="message-content">Думаю...</div>
                    </div>
                )}
            </div>
            <div className="groq-chat-input">
                <textarea
                    value={state.input}
                    onChange={e => setState(prev => ({ ...prev, input: e.target.value }))}
                    onKeyPress={handleKeyPress}
                    placeholder="Введите сообщение..."
                    rows={3}
                />
                <button
                    onClick={handleSend}
                    disabled={state.isLoading || !state.input.trim()}
                >
                    Отправить
                </button>
            </div>
        </div>
    );
};