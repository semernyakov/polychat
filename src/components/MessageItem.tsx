import React from 'react';
import { Message } from '../types/types';
import { formatTimestamp } from '../utils/messageUtils';

interface MessageItemProps {
  message: Message;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const { role, content, timestamp } = message;

  const roleLabel = role === 'user' ? 'Вы' : role === 'assistant' ? 'Ассистент' : 'Система';

  return (
    <div className={`groq-message groq-message-${role}`}>
      <div className="groq-message-header">
        <span className="groq-message-role">{roleLabel}</span>
        <span className="groq-message-time">{formatTimestamp(timestamp)}</span>
      </div>
      <div className="groq-message-content">{content}</div>
      {/* <div className="groq-message-content">
        {content.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            {index < content.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))} */}
    </div>
  );
};
