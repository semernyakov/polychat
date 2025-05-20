import React, { useState, useCallback, useMemo } from 'react';
import { Message } from '../types/types';
import { GroqMarkdown } from './GroqMarkdown';
import { FiCopy, FiCheck, FiCode } from 'react-icons/fi';
import '../styles.css';
import { toast } from 'react-toastify';
import { t } from '../localization';
import { usePluginSettings } from '../utils/usePluginSettings';

export const MessageItem: React.FC<{ message: Message }> = React.memo(({ message }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const content = useMemo(() => message.content || '', [message.content]);
  const { language = 'en' } = usePluginSettings() || {};

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
      toast.error(t('copyError', language));
      setTimeout(() => setCopyError(false), 2000);
    }
  }, [content, language]);

  const toggleRawView = useCallback(() => {
    setShowRaw(prev => !prev);
  }, []);

  return (
    <div className={`groq-message groq-message--${message.role}`}>
      <div className="groq-message__header">
        <div className="groq-message__meta">
          <span className="groq-message__role">
            {message.role === 'user' ? t('you', language) : t('assistant', language)}
          </span>
          <span className="groq-message__timestamp">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
        {message.role === 'assistant' && (
          <div className="groq-message__actions">
            <button
              onClick={toggleRawView}
              className="groq-icon-button"
              title={showRaw ? t('showFormatted', language) : t('showRaw', language)}
              aria-label={showRaw ? t('showFormatted', language) : t('showRaw', language)}
            >
              <FiCode size={14} />
            </button>
            <button
              onClick={handleCopy}
              className="groq-icon-button"
              title={t('copyMessage', language)}
              aria-label={t('copyMessage', language)}
            >
              {copyError ? (
                <span style={{ color: 'var(--text-error)' }} title={t('copyError', language)}>
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
          <pre aria-label={t('rawContent', language)}>
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
