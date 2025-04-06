import React, { useState, useCallback } from 'react';
import { Message } from '../types/types';
import { GroqMarkdown } from './GroqMarkdown';
import { FiCopy, FiCheck, FiCode } from 'react-icons/fi';
import '../styles.css';
import { toast } from 'react-toastify';

export const MessageItem: React.FC<{ message: Message }> = React.memo(({ message }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

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
      toast.error('Не удалось скопировать сообщение.');
      setTimeout(() => setCopyError(false), 2000);
    }
  }, [message.content]);

  const toggleRawView = useCallback(() => {
    setShowRaw(prev => !prev);
  }, []);

  return (
    <div className={`groq-message groq-message--${message.role}`}>
      <div className="groq-message__header">
        <div className="groq-message__meta">
          <span className="groq-message__role">{message.role === 'user' ? 'Вы' : 'Ассистент'}</span>
          <span className="groq-message__timestamp">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
        {message.role === 'assistant' && (
          <div className="groq-message__actions">
            <button
              onClick={toggleRawView}
              className="groq-icon-button"
              title={showRaw ? 'Показать форматирование' : 'Показать исходный код'}
            >
              <FiCode size={14} />
            </button>
            <button onClick={handleCopy} className="groq-icon-button" title="Копировать сообщение">
              {copyError ? (
                <span style={{ color: 'red' }} title="Ошибка копирования">
                  !
                </span>
              ) : isCopied ? (
                <FiCheck size={14} color="#4CAF50" />
              ) : (
                <FiCopy size={14} />
              )}
            </button>
          </div>
        )}
      </div>
      <div className={`groq-message__content ${showRaw ? 'groq-message__content--raw' : ''}`}>
        {showRaw ? (
          <pre>
            <code>{message.content || ''}</code>
          </pre>
        ) : (
          <GroqMarkdown content={message.content || ''} />
        )}
      </div>
    </div>
  );
});

MessageItem.displayName = 'MessageItem';
