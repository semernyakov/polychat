import React from 'react';
import { Message } from '../types/message';
import { MessageUtils } from '../utils/messageUtils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '../styles.css';

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
      <div className="groq-message__header">
        <span className="groq-message__role">{getRoleLabel(message.role)}</span>
        <time className="groq-message__timestamp" dateTime={new Date(message.timestamp).toISOString()}>
          {MessageUtils.formatTime(message.timestamp)}
        </time>
      </div>
      <div className="groq-message__content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  );
};
