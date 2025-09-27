import React, { useState, useCallback, useMemo } from 'react';
import { Message } from '../types/types';
import { GroqMarkdown } from './GroqMarkdown';
import { FiCopy, FiCheck, FiCode } from 'react-icons/fi';
import '../styles.css';
import { toast } from 'react-toastify';
import { t, Locale } from '../localization';
import { MessageUtils } from '../utils/messageUtils';

export const MessageItem: React.FC<{ message: Message }> = React.memo(({ message }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const content = useMemo(() => message.content || '', [message.content]);
  // Language is handled by the t() function internally

  const handleCopy = useCallback(async () => {
    if (!content) return;

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

  return (
    <div className={`groq-message groq-message--${message.role}`}>
      <div className="groq-message__header">
        <div className="groq-message__meta">
          <span className="groq-message__role">
            {message.role === 'user' ? t('you') : t('assistant')}
          </span>
          <span className="groq-message__timestamp">
            {MessageUtils.formatTime(message.timestamp || Date.now())}
          </span>
        </div>
        {message.role === 'assistant' && (
          <div className="groq-message__actions">
            <button
              onClick={toggleRawView}
              className="groq-icon-button"
              title={showRaw ? t('showFormatted') : t('showRaw')}
              aria-label={showRaw ? t('showFormatted') : t('showRaw')}
            >
              <FiCode size={14} />
            </button>
            <button
              onClick={handleCopy}
              className="groq-icon-button"
              title={t('copyMessage')}
              aria-label={t('copyMessage')}
            >
              {copyError ? (
                <span className="groq-message__copy-error" title={t('copyError')}>
                  !
                </span>
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
          <GroqMarkdown content={content} />
        )}
      </div>
    </div>
  );
});

MessageItem.displayName = 'MessageItem';
