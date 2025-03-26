import React from 'react';
import { Message } from '../types/message';
import { MessageUtils } from '../utils/messageUtils';

const getRoleLabel = (role: Message['role']): string => {
  switch (role) {
    case 'user':
      return 'Вы';
    case 'assistant':
      return 'Ассистент';
    case 'system':
      return 'Система';
    default:
      return role;
  }
};

export const MessageItem: React.FC<{ message: Message }> = ({ message }) => {
  return (
    <div className={`groq-message groq-message--${message.role}`}>
      <div className="groq-message-header">
        <span className="groq-message-role">{getRoleLabel(message.role)}</span>
        <time className="groq-message-time" dateTime={new Date(message.timestamp).toISOString()}>
          {MessageUtils.formatTime(message.timestamp)}
        </time>
      </div>
      <div className="groq-message-content">
        {message.content.split('\n').map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
};
