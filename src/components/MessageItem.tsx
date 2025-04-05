import React, { useState, useCallback } from 'react';
import { Message } from '../types/types';
import { GroqMarkdown } from './GroqMarkdown';
import { FiCopy, FiCheck } from 'react-icons/fi';
import '../styles.css';

export const MessageItem: React.FC<{ message: Message }> = React.memo(({ message }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!message.content) return;

    setCopyError(false);
    try {
      await navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Ошибка копирования:', err);
      setCopyError(true);
      setTimeout(() => setCopyError(false), 2000);
    }
  }, [message.content]);

  return (
    <div className={`groq-message groq-message--${message.role}`}>
      <div className="groq-message__header">
        <div className="groq-message__meta">
          <span className="groq-message__role">
            {message.role === 'user' ? 'Вы' : 'Ассистент'}
          </span>
          <span className="groq-message__timestamp">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
        {message.role === 'assistant' && (
          <button
            onClick={handleCopy}
            className="groq-icon-button"
            title="Копировать сообщение"
          >
            {copyError ? (
              <span style={{ color: 'red' }}>!</span>
            ) : isCopied ? (
              <FiCheck size={14} color="#4CAF50" />
            ) : (
              <FiCopy size={14} />
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
