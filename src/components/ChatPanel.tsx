// ChatPanel.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GroqPluginInterface } from '../types/plugin';
import { Message } from '../types/types';
import { MessageUtils } from '../utils/messageUtils';
import { GroqModel, getModelInfo } from '../types/models';
import { MessageList, MessageListHandles } from './MessageList';
import { ModelSelector } from './ModelSelector';
import { MessageInput } from './MessageInput';
import { SupportDialog } from './SupportDialog';
import { FiTrash2, FiChevronUp, FiChevronDown, FiHeart, FiSidebar, FiSquare, FiInfo } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles.css';
import { ModelInfoDialog } from './ModelInfoDialog';

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
  onDisplayModeChange,
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const [selectedModel, setSelectedModel] = useState<GroqModel>(plugin.settings.model);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isModelInfoOpen, setIsModelInfoOpen] = useState(false);
  const messageListRef = useRef<MessageListHandles>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [availableModels, setAvailableModels] = useState<GroqModel[]>([]);

  const fetchAvailableModels = useCallback(async (): Promise<GroqModel[]> => {
    try {
      const models = await plugin.groqService.getAvailableModels();
      setAvailableModels(models);
      return models;
    } catch (error) {
      console.error('Failed to fetch available models:', error);
      setAvailableModels([]);
      return [];
    }
  }, [plugin.groqService]);

  useEffect(() => {
    fetchAvailableModels();
  }, [fetchAvailableModels]);

  // ResizeObserver
  useEffect(() => {
    const handleResize = () => {
      messageListRef.current?.forceUpdate();
    };
    const resizeObserver = new ResizeObserver(handleResize);
    const currentContainer = containerRef.current;
    if (currentContainer) {
      resizeObserver.observe(currentContainer);
    }
    return () => {
      if (currentContainer) {
        resizeObserver.unobserve(currentContainer);
      }
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (initialMessages.length > 0) {
      if (JSON.stringify(messages) !== JSON.stringify(initialMessages)) {
        setMessages(initialMessages);
      }
      setHasLoadedHistory(true);
      setIsHistoryLoading(false);
    } else if (!hasLoadedHistory) {
      const loadHistory = async () => {
        setIsHistoryLoading(true);
        try {
          const history = await plugin.historyService.getHistory();
          setMessages(history);
          setHasLoadedHistory(true);
        } catch (error) {
          console.error('Ошибка загрузки истории:', error);
          toast.error('Не удалось загрузить историю сообщений.');
          setHasLoadedHistory(true);
        } finally {
          setIsHistoryLoading(false);
        }
      };
      loadHistory();
    }
  }, [plugin.historyService, hasLoadedHistory, initialMessages]);

  const handleScrollToTop = useCallback(() => {
    messageListRef.current?.scrollToTop();
  }, []);

  const handleScrollToBottom = useCallback(() => {
    messageListRef.current?.scrollToBottom();
  }, []);

  const handleSendMessage = useCallback(async () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue || isLoading) return;

    const userMessage: Message = MessageUtils.create('user', trimmedValue);
    setInputValue('');
    setIsLoading(true);

    try {
      await plugin.historyService.addMessage(userMessage).catch((err) => {
        console.error('Ошибка сохранения user message:', err);
        toast.warn('Не удалось сохранить ваше сообщение в истории.');
      });

      const assistantMessage = await plugin.groqService.sendMessage(trimmedValue, selectedModel);

      setMessages((prev) => [...prev, userMessage, assistantMessage]);

      await plugin.historyService.addMessage(assistantMessage).catch((err) => {
        console.error('Ошибка сохранения assistant message:', err);
        toast.warn('Не удалось сохранить ответ ассистента в истории.');
      });
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      toast.error(`Ошибка: ${errorMsg}`);
      const errorMessage = MessageUtils.create('assistant', `Произошла ошибка: ${errorMsg}`);
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, plugin, selectedModel]);

  const handleClearHistory = async () => {
    try {
      await plugin.historyService.clearHistory();
      setMessages([]);
      setHasLoadedHistory(true);
      toast.success('История очищена');
    } catch (error) {
      console.error('Ошибка очистки истории:', error);
      toast.error('Не удалось очистить историю.');
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

  const selectedModelInfo = getModelInfo(selectedModel);

  if (!plugin.settings.apiKey) {
    return <div className="groq-api-key-warning">...</div>;
  }

  return (
    <div className={`groq-container groq-chat groq-chat--${displayMode}`} ref={containerRef}>
      <div className="groq-chat__header">
        <div className="groq-chat__header-left">
          <ModelSelector
            selectedModel={selectedModel}
            onSelectModel={handleModelChange}
            getAvailableModels={fetchAvailableModels}
          />
        </div>
        <div className="groq-chat__header-right">
          <button
            onClick={() => setIsModelInfoOpen(true)}
            className="groq-icon-button groq-model-info-button"
            title="Информация о модели"
          >
            <FiInfo size={16} />
          </button>
          <button
            onClick={toggleDisplayMode}
            className="groq-icon-button groq-display-mode-button"
            title={displayMode === 'tab' ? 'Показать в боковой панели' : 'Показать во вкладке'}
          >
            {displayMode === 'tab' ? <FiSidebar size={16} /> : <FiSquare size={16} />}
          </button>
          <button
            onClick={() => setIsSupportOpen(true)}
            className="groq-icon-button groq-support-header-button"
            title="Поддержать разработчика"
          >
            <FiHeart size={16} />
          </button>
          <button
            onClick={handleScrollToTop}
            className="groq-icon-button groq-scroll-button"
            title="К началу диалога"
            disabled={messages.length === 0}
          >
            <FiChevronUp size={16} />
          </button>
          <button
            onClick={handleScrollToBottom}
            className="groq-icon-button groq-scroll-button"
            title="К концу диалога"
            disabled={messages.length === 0}
          >
            <FiChevronDown size={16} />
          </button>
          <button
            onClick={handleClearHistory}
            className="groq-icon-button groq-clear-button"
            title="Очистить историю"
            disabled={messages.length === 0 || isLoading}
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>

      <div className="groq-chat__content">
        <div className="groq-chat__messages-container">
          <MessageList ref={messageListRef} messages={messages} isLoading={isLoading} />
          {isHistoryLoading && (
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
            disabled={isLoading || isHistoryLoading}
            maxTokens={selectedModelInfo.maxTokens}
          />
        </div>
      </div>

      <SupportDialog isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
      <ModelInfoDialog
        isOpen={isModelInfoOpen}
        onClose={() => setIsModelInfoOpen(false)}
        modelInfo={selectedModelInfo}
        isAvailable={availableModels.includes(selectedModel)}
      />

      <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
    </div>
  );
};
