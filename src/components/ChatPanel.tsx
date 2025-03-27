import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GroqPluginInterface } from '../types/plugin';
import { Message } from '../types/message';
import { GroqModel } from '../types/models';
import { MessageList } from './MessageList';
import { ModelSelector } from './ModelSelector';
import { MessageInput } from './MessageInput';
import { SupportDialog } from './SupportDialog';
import { FiTrash2, FiChevronUp, FiChevronDown, FiHeart, FiSidebar, FiSquare } from 'react-icons/fi';
import '../styles.css';

interface ChatPanelProps {
  plugin: GroqPluginInterface;
  displayMode: 'tab' | 'sidepanel';
  initialMessages?: Message[];
  onDisplayModeChange: (mode: 'tab' | 'sidepanel') => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  plugin,
  displayMode,
  initialMessages = [],
  onDisplayModeChange
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<GroqModel>(plugin.settings.model);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(initialMessages);
      scrollToBottom();
    } else {
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
    }
  }, [plugin, initialMessages]);

  useEffect(() => {
    const handleResize = () => {
      scrollToBottom();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  const scrollToTop = useCallback(() => {
    messagesContainerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

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
  }, [inputValue, isLoading, plugin, selectedModel, scrollToBottom]);

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

  const toggleDisplayMode = () => {
    const newMode = displayMode === 'tab' ? 'sidepanel' : 'tab';
    onDisplayModeChange(newMode);
  };

  if (!plugin.settings.apiKey) {
    return (
      <div className="groq-api-key-warning">
        ⚠️ Пожалуйста, установите API ключ в настройках плагина
      </div>
    );
  }

  return (
    <div className={`groq-chat groq-chat--${displayMode}`}>
      <div className="groq-chat__header">
        <div className="groq-chat__header-left">
          <ModelSelector
            selectedModel={selectedModel}
            onSelectModel={handleModelChange}
          />
        </div>
        <div className="groq-chat__header-right">
          <button
            onClick={toggleDisplayMode}
            className="groq-display-mode-button"
            title={displayMode === 'tab' ? 'Показать в боковой панели' : 'Показать во вкладке'}
          >
            {displayMode === 'tab' ? <FiSidebar size={16} /> : <FiSquare size={16} />}
          </button>
          <button
            onClick={() => setIsSupportOpen(true)}
            className="groq-support-header-button"
            title="Поддержать разработчика"
          >
            <FiHeart size={16} />
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

      <div className="groq-chat__content">
        <div className="groq-chat__messages-container" ref={messagesContainerRef}>
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
      </div>

      <SupportDialog
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />
    </div>
  );
};
