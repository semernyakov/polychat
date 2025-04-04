import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GroqPluginInterface } from '../types/plugin';
import { Message } from '../types/message';
import { GroqModel } from '../types/models';
import { MessageList, MessageListHandles } from './MessageList'; // Импортируем MessageListHandles
import { ModelSelector } from './ModelSelector';
import { MessageInput } from './MessageInput';
import { SupportDialog } from './SupportDialog';
import { FiTrash2, FiChevronUp, FiChevronDown, FiHeart, FiSidebar, FiSquare } from 'react-icons/fi';
import '../styles.css'; // Используем единый style.css

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
  const messageListRef = useRef<MessageListHandles>(null); // Ref для управления MessageList

  // Загрузка истории при монтировании или изменении initialMessages
  useEffect(() => {
    const loadData = async () => {
      if (initialMessages.length > 0) {
        setMessages(initialMessages);
        // Прокрутка вниз теперь обрабатывается внутри MessageList
      } else {
        try {
          setIsLoading(true); // Показываем загрузку во время получения истории
          const history = await plugin.historyService.getHistory();
          setMessages(history);
          // Прокрутка вниз теперь обрабатывается внутри MessageList
        } catch (error) {
          console.error('Ошибка загрузки истории:', error);
          // Можно добавить уведомление для пользователя
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadData();
  }, [plugin.historyService, initialMessages]); // Зависимость от historyService

  // Удален useEffect для window.resize, так как AutoSizer справится с этим

  // Функции прокрутки теперь вызывают методы MessageList через ref
  const handleScrollToTop = useCallback(() => {
    messageListRef.current?.scrollToTop();
  }, []);

  const handleScrollToBottom = useCallback(() => {
    messageListRef.current?.scrollToBottom();
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`, // Более уникальный ID
      role: 'user',
      content: inputValue,
      timestamp: Date.now(),
    };

    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      await plugin.historyService.addMessage(userMessage);
      const response = await plugin.groqService.sendMessage(userMessage.content, selectedModel); // Передаем только контент
      // Добавляем ответ ассистента после получения
      setMessages(prev => [...prev, response]);
      await plugin.historyService.addMessage(response);
      // Прокрутка вниз обрабатывается автоматически в MessageList useEffect
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      // Возможно, стоит добавить сообщение об ошибке в чат
      const errorMessage: Message = {
         id: `error-${Date.now()}`,
         role: 'assistant',
         content: `Произошла ошибка при отправке сообщения: ${error instanceof Error ? error.message : String(error)}`,
         timestamp: Date.now(),
      }
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, plugin.historyService, plugin.groqService, selectedModel, messages]); // Добавили messages в зависимости

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
        ⚠️ Пожалуйста, установите API ключ Groq в настройках плагина.
      </div>
    );
  }

  return (
    // Класс groq-container обеспечивает базовую структуру flex
    <div className={`groq-container groq-chat groq-chat--${displayMode}`}>
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
            className="groq-icon-button groq-display-mode-button" // Используем общий класс для иконок-кнопок
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
            onClick={handleScrollToTop} // Исправленный обработчик
            className="groq-icon-button groq-scroll-button"
            title="К началу диалога"
            disabled={messages.length === 0}
          >
            <FiChevronUp size={16} />
          </button>
          <button
            onClick={handleScrollToBottom} // Исправленный обработчик
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

      {/* groq-chat__content теперь основной гибкий контейнер */}
      <div className="groq-chat__content">
        {/* groq-chat__messages-container - контейнер для AutoSizer */}
        <div className="groq-chat__messages-container">
          <MessageList
            ref={messageListRef} // Передаем ref
            messages={messages}
            isLoading={isLoading && messages.length > 0} // Показываем спиннер только если есть сообщения
          />
           {/* Индикатор загрузки истории */}
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
            disabled={isLoading}
            maxLength={1200} // Уточните максимальную длину, если она есть у API
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
