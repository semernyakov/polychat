import React, { useState, useEffect, useCallback } from 'react';
import { GroqPluginInterface } from '../types/plugin';
import { Message } from '../types/message';
import { GroqModel } from '../types/models';
import { MessageList } from './MessageList';
import { ModelSelector } from './ModelSelector';
import { MessageInput } from './MessageInput';
import { SupportDialog } from './SupportDialog';
import { SupportButton } from './SupportButton';
import { FiTrash2 } from 'react-icons/fi';
import '../styles.css';

interface ChatPanelProps {
  plugin: GroqPluginInterface;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ plugin }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<GroqModel>(plugin.settings.model);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await plugin.historyService.getHistory();
        setMessages(history);
      } catch (error) {
        console.error('Ошибка загрузки истории:', error);
      }
    };
    loadHistory();
  }, [plugin]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      await plugin.historyService.addMessage(userMessage);
      const response = await plugin.groqService.sendMessage(inputValue, selectedModel);

      setMessages(prev => [...prev, response]);
      await plugin.historyService.addMessage(response);
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, plugin, selectedModel]);

  const handleClearHistory = async () => {
    try {
      await plugin.historyService.clearHistory();
      setMessages([]);
    } catch (error) {
      console.error('Ошибка очистки истории:', error);
    }
  };

  const handleModelChange = (model: GroqModel) => {
    setSelectedModel(model);
    plugin.settings.model = model;
    plugin.saveSettings();
  };

  if (!plugin.settings.apiKey) {
    return (
      <div className="groq-api-key-warning">
        ⚠️ Пожалуйста, установите API ключ в настройках плагина
      </div>
    );
  }

  return (
    <div className="groq-chat">
      <div className="groq-chat__header">
        <div className="groq-chat__header-left">
          <ModelSelector
            selectedModel={selectedModel}
            onSelectModel={handleModelChange}
          />
        </div>
        <div className="groq-chat__header-right">
          <button
            onClick={handleClearHistory}
            className="groq-clear-button"
            title="Очистить историю"
            disabled={messages.length === 0 || isLoading}
          >
            <FiTrash2 size={16} />
          </button>
          <SupportButton onClick={() => setIsSupportOpen(true)} />
        </div>
      </div>

      <MessageList messages={messages} isLoading={isLoading} />

      <div className="groq-chat__input-container">
        <MessageInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSendMessage}
          disabled={isLoading}
          maxLength={1200}
        />
      </div>

      <SupportDialog
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />
    </div>
  );
};
