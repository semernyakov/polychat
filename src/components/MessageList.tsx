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
      const NEAR_BOTTOM_THRESHOLD_FALLBACK = 100; // px
      const DEFAULT_TAIL_LIMIT = 1; // показываем только последнее сообщение для UX без стартовой прокрутки
      const [limit, setLimit] = React.useState<number>(DEFAULT_TAIL_LIMIT);

      // Вычисляем хвост истории
      const visibleMessages = React.useMemo(() => {
        if (!messages || messages.length === 0) return [];
        const l = Math.max(1, Math.min(limit, messages.length));
        return messages.slice(messages.length - l);
      }, [messages, limit]);

      const getNearBottomThreshold = (): number => {
        const el = containerRef.current;
        if (!el) return NEAR_BOTTOM_THRESHOLD_FALLBACK;
        const value = getComputedStyle(el).getPropertyValue('--near-bottom-threshold').trim();
        if (!value) return NEAR_BOTTOM_THRESHOLD_FALLBACK;
        const match = value.match(/^(\d+(?:\.\d+)?)(px)?$/i);
        if (match) {
          const n = parseFloat(match[1]);
          return isNaN(n) ? NEAR_BOTTOM_THRESHOLD_FALLBACK : n;
        }
        return NEAR_BOTTOM_THRESHOLD_FALLBACK;
      };

      const withNoSmooth = (fn: () => void) => {
        const el = containerRef.current;
        if (!el) return fn();
        el.classList.add('groq-chat__messages--no-smooth');
        fn();
        // Вернём smooth на следующий кадр
        requestAnimationFrame(() => {
          el.classList.remove('groq-chat__messages--no-smooth');
        });
      };

      // Инициализация: скролл не требуется, т.к. показываем только хвост (последнее сообщение видно сразу)
      useLayoutEffect(() => {
        // no-op
      }, []);

      // Обновление: при добавлении новых сообщений прокручиваем вниз, если пользователь у низа
      useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        if (isAtBottomRef.current) {
          el.scrollTop = el.scrollHeight;
        }
      }, [visibleMessages]);

      // Трекинг положения скролла
      useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const handleScroll = () => {
          const threshold = getNearBottomThreshold();
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
          if (el) {
            withNoSmooth(() => {
              el.scrollTop = 0;
            });
          }
          isAtBottomRef.current = false;
        },
        scrollToBottom: () => {
          const el = containerRef.current;
          if (el) {
            withNoSmooth(() => {
              el.scrollTop = el.scrollHeight;
            });
          }
          isAtBottomRef.current = true;
        },
        forceUpdate: () => {
          // no-op в упрощённой версии
        },
      }));

      return (
        <div className="groq-chat__messages" aria-live="polite" ref={containerRef}>
          {messages.length > 0 ? (
            <>
              {messages.length > visibleMessages.length && (
                <div style={{ marginBottom: '8px' }}>
                  <button
                    className="groq-button groq-dialog-secondary-button"
                    onClick={() => {
                      const el = containerRef.current;
                      if (!el) {
                        setLimit(l => Math.min(l + 20, messages.length));
                        return;
                      }
                      const prevScrollHeight = el.scrollHeight;
                      setLimit(l => Math.min(l + 20, messages.length));
                      // Компенсируем смещение после расширения истории
                      requestAnimationFrame(() => {
                        const newScrollHeight = el.scrollHeight;
                        el.scrollTop = newScrollHeight - prevScrollHeight + el.scrollTop;
                      });
                    }}
                  >
                    {`Показать предыдущие 20`}
                  </button>
                </div>
              )}

              {visibleMessages.map((message, idx) => (
                <div
                  className="groq-message-row"
                  key={`${message.id ?? 'msg'}-${message.timestamp ?? '0'}-${messages.length - visibleMessages.length + idx}`}
                >
                  <MessageItem message={message} />
                </div>
              ))}
            </>
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
