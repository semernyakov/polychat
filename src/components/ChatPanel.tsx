import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GroqPluginInterface } from '../types/plugin';
import { Message } from '../types/message';
import { GroqModel } from '../types/models';
import { MessageList } from './MessageList';
import { ModelSelector } from './ModelSelector';
import { MessageInput } from './MessageInput';
import { SupportDialog } from './SupportDialog';
import { FiTrash2, FiChevronUp, FiChevronDown, FiHeart } from 'react-icons/fi';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await plugin.historyService.getHistory();
        setMessages(history);
        scrollToBottom();
      } catch (error) {
        console.error('Ошибка загрузки истории:', error);
      }
    };
    loadHistory();
  }, [plugin]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    messagesContainerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

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
      scrollToBottom();
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
            onClick={() => setIsSupportOpen(true)}
            className="groq-support-header-button"
            title="Поддержать разработчика"
          >
            &nbsp;&nbsp;<FiHeart size={16} />&nbsp;&nbsp;Поддержать!&nbsp;&nbsp;
          </button>
          <button
            onClick={scrollToTop}
            className="groq-scroll-button"
            title="К началу диалога"
            disabled={messages.length === 0}
          >
            <FiChevronUp size={16} />
          </button>
          <button
            onClick={scrollToBottom}
            className="groq-scroll-button"
            title="К концу диалога"
            disabled={messages.length === 0}
          >
            <FiChevronDown size={16} />
          </button>
          <button
            onClick={handleClearHistory}
            className="groq-clear-button"
            title="Очистить историю"
            disabled={messages.length === 0 || isLoading}
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>

      <div className="groq-chat__messages" ref={messagesContainerRef}>
        <MessageList messages={messages} isLoading={isLoading} />
        <div ref={messagesEndRef} />
      </div>

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
