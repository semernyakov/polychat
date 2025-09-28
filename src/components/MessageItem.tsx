import React, { useState, useCallback, useMemo } from 'react';
import { GroqMarkdown } from './GroqMarkdown';
import { FiCopy, FiCheck, FiCode } from 'react-icons/fi';
import '../styles.css';
import { toast } from 'react-toastify';
import { t, Locale } from '../localization';
import { Message } from '../types/types';
import '@/types/window';

interface MessageItemProps {
  message: Message;
  className?: string;
  isCurrentUser?: boolean;
  isLastMessage?: boolean;
  onRenderComplete?: () => void;
}

export const MessageItem: React.FC<MessageItemProps> = React.memo(
  ({
    message,
    className = '',
    isCurrentUser = false,
    isLastMessage = false,
    onRenderComplete,
  }) => {
    const [copyError, setCopyError] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [showRaw, setShowRaw] = useState(false);
    const content = useMemo(() => message.content || '', [message.content]);

    const handleCopy = useCallback(async () => {
      setCopyError(false);
      try {
        await navigator.clipboard.writeText(content);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('Error copying:', err);
        setCopyError(true);
        toast.error(t('copyError'));
        setTimeout(() => setCopyError(false), 2000);
      }
    }, [content]);

    const toggleRawView = useCallback(() => {
      setShowRaw(prev => !prev);
    }, []);

    const handleMarkdownRender = useCallback(() => {
      // Уведомляем только для последнего сообщения
      if (isLastMessage && onRenderComplete) {
        onRenderComplete();
      }
    }, [isLastMessage, onRenderComplete]);

    return (
      <div className={`groq-message groq-message--${message.role} ${className}`}>
        <div className="groq-message__header">
          <div className="groq-message__meta">
            <span className="groq-message__role">
              {message.role === 'user' ? t('you') : t('assistant')}
            </span>
            <span className="groq-message__timestamp">
              {new Date(message.timestamp || Date.now()).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          {message.role === 'assistant' && (
            <div className="groq-message__actions">
              <button
                onClick={toggleRawView}
                className="groq-icon-button"
                aria-label={showRaw ? t('showFormatted') : t('showRaw')}
              >
                <FiCode size={14} />
              </button>
              <button
                onClick={handleCopy}
                className="groq-icon-button"
                aria-label={t('copyMessage')}
              >
                {copyError ? (
                  <span className="groq-message__copy-error">!</span>
                ) : isCopied ? (
                  <FiCheck size={14} color="var(--text-success)" />
                ) : (
                  <FiCopy size={14} />
                )}
              </button>
            </div>
          )}
        </div>

        <div className={`groq-message__content ${showRaw ? 'groq-message__content--raw' : ''}`}>
            {showRaw ? (
            <pre aria-label={t('rawContent')}>
              <code>{content}</code>
            </pre>
            ) : (
            <GroqMarkdown
              content={content}
              onRenderComplete={handleMarkdownRender}
              app={(window as any).app}
            />
            )}
        </div>
      </div>
    );
  },
);

MessageItem.displayName = 'MessageItem';