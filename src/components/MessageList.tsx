import React, { useEffect, useRef, useImperativeHandle, forwardRef, useLayoutEffect } from 'react';
import { Message } from '../types/types';
import { MessageItem } from './MessageItem';
import '../styles.css';
import { Locale, t } from '../localization';
interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  language?: Locale;
}

export interface MessageListHandles {
  scrollToTop: () => void;
  scrollToBottom: () => void;
  forceUpdate: () => void;
}

export const MessageList = React.memo(
  forwardRef<MessageListHandles, MessageListProps>(
    ({ messages, isLoading, language = 'en' }, ref) => {
      const containerRef = useRef<HTMLDivElement>(null);
      const isAtBottomRef = useRef<boolean>(true);

      // Инициализация: сразу прокручиваем к последнему сообщению
      useLayoutEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
      }, []);

      // Обновление: при добавлении новых сообщений прокручиваем вниз, если пользователь у низа
      useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        if (isAtBottomRef.current) {
          el.scrollTop = el.scrollHeight;
        }
      }, [messages]);

      // Трекинг положения скролла
      useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const handleScroll = () => {
          const threshold = 100;
          const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
          isAtBottomRef.current = atBottom;
        };
        handleScroll();
        el.addEventListener('scroll', handleScroll, { passive: true });
        return () => el.removeEventListener('scroll', handleScroll);
      }, []);

      useImperativeHandle(ref, () => ({
        scrollToTop: () => {
          const el = containerRef.current;
          if (el) el.scrollTop = 0;
          isAtBottomRef.current = false;
        },
        scrollToBottom: () => {
          const el = containerRef.current;
          if (el) el.scrollTop = el.scrollHeight;
          isAtBottomRef.current = true;
        },
        forceUpdate: () => {
          // no-op в упрощённой версии
        },
      }));

      return (
        <div className="groq-chat__messages" aria-live="polite" ref={containerRef}>
          {messages.length > 0 ? (
            messages.map((message, index) => (
              <div className="groq-message-row" key={`${message.id ?? 'msg'}-${message.timestamp ?? '0'}-${index}`}>
                <MessageItem message={message} />
              </div>
            ))
          ) : (
            !isLoading && <div className="groq-chat__empty">{t('noMessages', language)}</div>
          )}

          {isLoading && (
            <div className="groq-loading-indicator">
              <div className="groq-spinner"></div>
              <span>{t('generatingResponse', language)}</span>
            </div>
          )}
        </div>
      );
    },
  ),
);

MessageList.displayName = 'MessageList';
