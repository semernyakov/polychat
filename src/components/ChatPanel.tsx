import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GroqPluginInterface } from '../types/plugin';
import { Message } from '../types/message';
import { GroqModel } from '../types/models';
import { MessageList, MessageListHandles } from './MessageList';
import { ModelSelector } from './ModelSelector';
import { MessageInput } from './MessageInput';
import { SupportDialog } from './SupportDialog';
import { FiTrash2, FiChevronUp, FiChevronDown, FiHeart, FiSidebar, FiSquare } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
  const messageListRef = useRef<MessageListHandles>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      messageListRef.current?.forceUpdate();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (initialMessages.length > 0) {
        setMessages(initialMessages);
      } else {
        try {
          setIsLoading(true);
          const history = await plugin.historyService.getHistory();
          setMessages(history);
        } catch (error) {
          console.error('Ошибка загрузки истории:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadData();
  }, [plugin.historyService, initialMessages]);

  const handleScrollToTop = useCallback(() => {
    messageListRef.current?.scrollToTop();
  }, []);

  const handleScrollToBottom = useCallback(() => {
    messageListRef.current?.scrollToBottom();
  }, []);

  const handleSendMessage = useCallback(async () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmedValue,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      plugin.historyService.addMessage(userMessage).catch(err => console.error("Ошибка сохранения user message:", err));

      const assistantMessage = await plugin.groqService.sendMessage(trimmedValue, selectedModel);

      setMessages(prev => [...prev, assistantMessage]);

      plugin.historyService.addMessage(assistantMessage).catch(err => console.error("Ошибка сохранения assistant message:", err));

    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      toast.error(`Произошла ошибка при отправке сообщения: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, plugin.historyService, plugin.groqService, selectedModel]);

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === 'Enter' && e.shiftKey) {
      return;
    }
  };

  if (!plugin.settings.apiKey) {
    return (
      <div className="groq-api-key-warning">
        ⚠️ Пожалуйста, установите API ключ Groq в настройках плагина.
      </div>
    );
  }

  return (
    <div className={`groq-container groq-chat groq-chat--${displayMode}`} ref={containerRef}>
      <div className="groq-chat__header">
        <div className="groq-chat__header-left">
          <ModelSelector
            selectedModel={selectedModel}
            onSelectModel={handleModelChange}
          />
        </div>
        <div className="groq-chat__header-right">
          <button onClick={toggleDisplayMode} className="groq-icon-button groq-display-mode-button" title={displayMode === 'tab' ? 'Показать в боковой панели' : 'Показать во вкладке'}>
            {displayMode === 'tab' ? <FiSidebar size={16} /> : <FiSquare size={16} />}
          </button>
          <button onClick={() => setIsSupportOpen(true)} className="groq-icon-button groq-support-header-button" title="Поддержать разработчика">
            <FiHeart size={16} />
          </button>
          <button onClick={handleScrollToTop} className="groq-icon-button groq-scroll-button" title="К началу диалога" disabled={messages.length === 0}>
            <FiChevronUp size={16} />
          </button>
          <button onClick={handleScrollToBottom} className="groq-icon-button groq-scroll-button" title="К концу диалога" disabled={messages.length === 0}>
            <FiChevronDown size={16} />
          </button>
          <button onClick={handleClearHistory} className="groq-icon-button groq-clear-button" title="Очистить историю" disabled={messages.length === 0 || isLoading}>
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>

      <div className="groq-chat__content">
        <div className="groq-chat__messages-container">
          <MessageList
            ref={messageListRef}
            messages={messages}
            isLoading={isLoading && messages.length > 0}
          />
          {isLoading && messages.length === 0 && (
            <div className="groq-chat__loading-history">
              <div className="groq-spinner"></div>
              <span>Загрузка истории...</span>
            </div>
          )}
        </div>

        <div className="groq-chat__input-container">
          <MessageInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSendMessage}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            maxLength={8000}
          />
        </div>
      </div>

      <SupportDialog
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />

      <ToastContainer />
    </div>
  );
};
