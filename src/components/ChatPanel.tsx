import React, { useState, useEffect, useCallback } from 'react';
import { GroqPluginInterface } from '../types/plugin';
import { Message } from '../types/message';
import { GroqModel } from '../types/models';
import { MessageList } from './MessageList';
import { ModelSelector } from './ModelSelector';
import { MessageInput } from './MessageInput';
import { SupportDialog } from './SupportDialog';
import { SupportButton } from './SupportButton';
import '../styles.css'; // Добавьте эту строку для импорта стилей

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
        console.error('Failed to load history:', error);
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
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, plugin, selectedModel]);

  const handleModelChange = (model: GroqModel) => {
    setSelectedModel(model);
    plugin.settings.model = model;
    plugin.saveSettings();
  };

  if (!plugin.settings.apiKey) {
    return (
      <div className="groq-api-key-warning">Пожалуйста, настройте API ключ в настройках плагина</div>
    );
  }

  return (
		<div className="groq-chat">
			<div className="groq-chat__header">
				<ModelSelector selectedModel={selectedModel} onSelectModel={handleModelChange} />
				<SupportButton onClick={() => setIsSupportOpen(true)} />
			</div>

			<MessageList messages={messages} isLoading={isLoading} />

			<div className="groq-chat__input-container">
				<MessageInput
					value={inputValue}
					onChange={setInputValue}
					onSend={handleSendMessage}
					disabled={isLoading}
				/>
			</div>

			<SupportDialog isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
		</div>
	);
};

