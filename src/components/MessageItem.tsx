import React, { useState, useCallback } from 'react';
import { Message } from '../types/message';
import { MessageUtils } from '../utils/messageUtils';
import GroqMarkdown from './GroqMarkdown';
import { FiCopy, FiCheck } from 'react-icons/fi';
import '../styles.css';

const CurrentMessageUtils = MessageUtils;

export const MessageItem: React.FC<{ message: Message }> = React.memo(({ message }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (!message.content) return;
    try {
      await navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Ошибка копирования сообщения:', err);
    }
  };

  const props = {
    className: `groq-message groq-message--${message.role}`,
  };

  return (
    <div key={message.id} {...props}>
      <div className="groq-message__header">
        <div className="groq-message__meta">
          <span className="groq-message__role">
            {message.role === 'user' ? 'Вы' : 'Ассистент'}
          </span>
          <time
            className="groq-message__timestamp"
            dateTime={new Date(message.timestamp).toISOString()}
            title={new Date(message.timestamp).toLocaleString()}
          >
            {CurrentMessageUtils.formatTime(message.timestamp)}
          </time>
        </div>
        {message.role === 'assistant' && message.content && (
            <button
              onClick={handleCopy}
              className="groq-icon-button groq-copy-button"
              aria-label="Копировать сообщение"
              title="Копировать сообщение"
            >
              {isCopied ? (
                <FiCheck className="groq-icon-check" size={14}/>
              ) : (
                <FiCopy size={14}/>
              )}
            </button>
        )}
      </div>
      <div className="groq-message__content">
        <GroqMarkdown content={message.content || ''} />
      </div>
    </div>
  );
});
MessageItem.displayName = 'MessageItem';
