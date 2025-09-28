import React, { useState, useCallback, useMemo } from 'react';
import { GroqMarkdown } from './GroqMarkdown';
import { FiCopy, FiCheck, FiCode, FiEye, FiEyeOff } from 'react-icons/fi';
import '../styles.css';
import { toast } from 'react-toastify';
import { t, Locale } from '../localization';
import { Message } from '../types/types';

interface MessageItemProps {
  message: Message;
  className?: string;
  isCurrentUser?: boolean;
  isLastMessage?: boolean;
  onRenderComplete?: () => void;
}

// Функция для извлечения think-контента
const extractThinkContent = (content: string): { thinkContent: string; mainContent: string } => {
  const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/i);
  if (thinkMatch) {
    const thinkContent = thinkMatch[1].trim();
    const mainContent = content.replace(/<think>[\s\S]*?<\/think>/i, '').trim();
    return { thinkContent, mainContent };
  }
  return { thinkContent: '', mainContent: content };
};

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
    const [showThink, setShowThink] = useState(false); // Новое состояние для отображения think
    
    const content = useMemo(() => message.content || '', [message.content]);
    
    // Извлекаем think-контент
    const { thinkContent, mainContent } = useMemo(() => 
      extractThinkContent(content), 
      [content]
    );

    const hasThinkContent = thinkContent.length > 0;

    const handleCopy = useCallback(async () => {
      setCopyError(false);
      try {
        // Копируем основной контент без think-тегов
        await navigator.clipboard.writeText(mainContent);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('Error copying:', err);
        setCopyError(true);
        toast.error(t('copyError'));
        setTimeout(() => setCopyError(false), 2000);
      }
    }, [mainContent]);

    const toggleRawView = useCallback(() => {
      setShowRaw(prev => !prev);
    }, []);

    const toggleThinkView = useCallback(() => {
      setShowThink(prev => !prev);
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
            {hasThinkContent && (
              <span className="groq-message__think-badge">
                {t('hasThinking')}
              </span>
            )}
          </div>
          {message.role === 'assistant' && (
            <div className="groq-message__actions">
              {/* Кнопка показа think-контента */}
              {hasThinkContent && (
                <button
                  onClick={toggleThinkView}
                  className="groq-icon-button"
                  aria-label={showThink ? t('hideThinking') : t('showThinking')}
                  title={showThink ? t('hideThinking') : t('showThinking')}
                >
                  {showThink ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                </button>
              )}
              {/* Кнопка raw view */}
              <button
                onClick={toggleRawView}
                className="groq-icon-button"
                aria-label={showRaw ? t('showFormatted') : t('showRaw')}
                title={showRaw ? t('showFormatted') : t('showRaw')}
              >
                <FiCode size={14} />
              </button>
              {/* Кнопка копирования */}
              <button
                onClick={handleCopy}
                className="groq-icon-button"
                aria-label={t('copyMessage')}
                title={t('copyMessage')}
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

        {/* Think-контент (раскрываемая секция) */}
        {hasThinkContent && showThink && (
          <div className="groq-think-content">
            <div className="groq-think-content__header">
              <span className="groq-think-content__title">
                {t('thinkingProcess')}
              </span>
            </div>
            <div className="groq-think-content__body">
              {showRaw ? (
                <pre className="groq-think-raw">
                  <code>{thinkContent}</code>
                </pre>
              ) : (
                <GroqMarkdown
                  content={thinkContent}
                  onRenderComplete={isLastMessage ? handleMarkdownRender : undefined}
                  app={window.app || undefined}
                />
              )}
            </div>
          </div>
        )}

        {/* Основной контент сообщения */}
        <div className={`groq-message__content ${showRaw ? 'groq-message__content--raw' : ''}`}>
          {showRaw ? (
            <pre aria-label={t('rawContent')}>
              <code>{mainContent}</code>
            </pre>
          ) : (
            <GroqMarkdown
              content={mainContent}
              onRenderComplete={isLastMessage ? handleMarkdownRender : undefined}
              app={window.app || undefined}
            />
          )}
        </div>
      </div>
    );
  },
);

MessageItem.displayName = 'MessageItem';