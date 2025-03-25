import React, { useCallback, useEffect, useState } from 'react';
import { GroqPlugin } from '../types/plugin';
import { Message } from '../types/types';
import { GroqModel, getModelInfo } from '../types/models';
import { HistoryService } from '../services/historyService';
import { MessageItem } from './MessageItem';
import { Notice } from './Notice';
import { SupportDialog } from './SupportDialog';

interface ChatPanelProps {
  plugin: GroqPlugin;
}

const ApiKeyWarning = () => (
  <div className="groq-chat-container">
    <div className="groq-api-key-warning">Пожалуйста, введите API ключ в настройках плагина</div>
  </div>
);

/**
 * Компонент для отображения панели чата. * @param {Object} props - Свойства компонента.
 * @param {GroqPlugin} props.plugin - Экземпляр плагина.
 * @returns {JSX.Element} - React-компонент панели чата.
 */
export const ChatPanel: React.FC<ChatPanelProps> = ({ plugin }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<GroqModel>(plugin.settings.model as GroqModel);
  const [isSupportDialogOpen, setIsSupportDialogOpen] = useState(false);

  useEffect(() => {
    /**
     * Загружает историю сообщений из сервиса истории.
     * @returns {Promise<void>} - Промис, который разрешается после загрузки истории.
     */
    const historyService = new HistoryService(plugin);
    const loadHistory = async () => {
      const history = await historyService.getHistory();
      setMessages(history);
    };
    loadHistory();
  }, [plugin, plugin.settings.apiKey]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;
  
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: Date.now(),
    };
  
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setIsLoading(true);
  
    try {
      if (!plugin.settings.apiKey) {
        throw new Error('API ключ не задан');
      }
  
      const historyService = new HistoryService(plugin);
      await historyService.addMessage(newMessage);
  
      const response = await plugin.groqService.sendMessage(inputValue, selectedModel as any);
      setMessages(prev => [...prev, response]);
      await historyService.addMessage(response);
      Notice({ message: 'Сообщение отправлено' });
    } catch (error) {
      console.error('Ошибка:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      Notice({ message: `Ошибка: ${errorMessage}` });
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, plugin, isLoading, selectedModel]);

  const handleCheckModels = useCallback(async () => {
    try {
      if (!plugin.groqService || !plugin.groqService.getAvailableModels) {
        throw new Error('GroqService is not available');
      }
      const models = await plugin.groqService.getAvailableModels();
      console.log('Доступные модели:', models);
      Notice({ message: `Доступно ${models.length} моделей` });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      Notice({ message: `Ошибка проверки моделей: ${errorMessage}` });
    }
  }, [plugin]);

  const handleModelChange = (modelId: GroqModel) => {
    setSelectedModel(modelId);
    plugin.settings.model = modelId;
    plugin.saveSettings();
  };

  if (!plugin.settings.apiKey) {
    return <ApiKeyWarning />;
  }

  return (
    <div className="groq-chat-container">
      <div className="groq-chat-header">
        <select
          value={selectedModel}
          onChange={e => handleModelChange(e.target.value as GroqModel)}
          className="groq-model-select"
        >
          {Object.values(GroqModel).map(model => (
            <option key={model} value={model}>
              {getModelInfo(model).name}
            </option>
          ))}
        </select>
        <button onClick={handleCheckModels} className="groq-check-models-button">
          Проверить модели
        </button>
        <button
          onClick={() => setIsSupportDialogOpen(true)}
          className="groq-support-heart"
          title="Поддержать разработку"
        >
          ❤️
        </button>
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
          onChange={e => setInputValue(e.target.value)}
          placeholder="Введите сообщение..."
          className="groq-input"
          onKeyDown={e => {
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

      <SupportDialog
        isOpen={isSupportDialogOpen}
        onClose={() => setIsSupportDialogOpen(false)}
      />
    </div>
  );
};
