import React from 'react';
import { Message } from '../types/message';
import { MessageItem } from './MessageItem';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
  return (
    <div className="groq-message-list">
      {messages.map(message => (
        <MessageItem key={message.id} message={message} />
      ))}
      {isLoading && (
        <div className="groq-loading-indicator">
          <div className="groq-spinner"></div>
          <span>Генерация ответа...</span>
        </div>
      )}
    </div>
  );
};
