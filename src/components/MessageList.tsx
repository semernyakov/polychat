import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useLayoutEffect,
  useCallback,
  useState,
} from 'react';
import { Message } from '../types/types';
import { MessageItem } from './MessageItem';
import { StreamingIndicator } from './StreamingIndicator';
import '../styles.css';
import { Locale, t } from '../localization';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  isStreaming?: boolean;
  language?: Locale;
  tailLimit?: number;
  tailStep?: number;
}

export interface MessageListHandles {
  scrollToTop: () => void;
  scrollToBottom: (opts?: { smooth?: boolean }) => void;
  forceUpdate: () => void;
}

export const MessageList = React.memo(
  forwardRef<MessageListHandles, MessageListProps>(
    ({ messages, isLoading, isStreaming = false, language = 'en', tailLimit, tailStep }, ref) => {
      const containerRef = useRef<HTMLDivElement>(null);
      const isAtBottomRef = useRef<boolean>(true);
      const prevMessagesLengthRef = useRef<number>(messages.length);
      const isInitialRenderRef = useRef<boolean>(true);
      const initialScrollDoneRef = useRef<boolean>(false);

      const DEFAULT_TAIL_LIMIT = Math.max(1, tailLimit ?? 10);
      const [limit, setLimit] = useState<number>(DEFAULT_TAIL_LIMIT);
      const STEP = Math.max(1, tailStep ?? 20);

      const [separatorIndex, setSeparatorIndex] = useState<number | null>(null);
      const [showNewMessageNotice, setShowNewMessageNotice] = useState<boolean>(false);
      const [isNoticeExiting, setIsNoticeExiting] = useState<boolean>(false);

      // Вычисляем видимую "хвостовую" часть
      const visibleMessages = React.useMemo(() => {
        if (!messages || messages.length === 0) return [];
        const currentLimit = Math.max(1, Math.min(limit, messages.length));
        return messages.slice(messages.length - currentLimit);
      }, [messages, limit]);

      // Проверка находится ли пользователь near bottom с адаптивным порогом
      const checkIsNearBottom = useCallback((): boolean => {
        const el = containerRef.current;
        if (!el) return true;
        const threshold = Math.max(50, Math.min(150, el.clientHeight * 0.1)); // 10% от высоты контейнера
        return el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
      }, []);

      // Прокрутка вниз
      const scrollToBottom = useCallback((smooth: boolean = true) => {
        const el = containerRef.current;
        if (!el) return;

        if (!smooth) {
          el.scrollTop = el.scrollHeight;
        } else {
          el.scrollTo({
            top: el.scrollHeight,
            behavior: 'smooth',
          });
        }
        isAtBottomRef.current = true;
        setShowNewMessageNotice(false);
      }, []);

      // Обработка новых сообщений
      useEffect(() => {
        const prevLength = prevMessagesLengthRef.current;
        const currentLength = messages.length;
        const hasNewMessages = currentLength > prevLength;

        if (hasNewMessages && !isInitialRenderRef.current) {
          // Если пользователь не внизу - показываем уведомление
          if (!isAtBottomRef.current) {
            setShowNewMessageNotice(true);
          }
          // Скролл будет выполнен через onRenderComplete после рендеринга markdown
        }

        prevMessagesLengthRef.current = currentLength;
      }, [messages.length]);

      // Отслеживание положения скролла
      useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const handleScroll = () => {
          const wasAtBottom = isAtBottomRef.current;
          isAtBottomRef.current = checkIsNearBottom();

          // Если пользователь прокрутил до самого низа, скрываем уведомление
          if (isAtBottomRef.current) {
            setShowNewMessageNotice(false);
          }
          // Если пользователь был внизу и прокрутил вверх - показываем уведомление
          else if (wasAtBottom && messages.length > visibleMessages.length) {
            setShowNewMessageNotice(true);
          }
        };

        handleScroll(); // Initial check
        el.addEventListener('scroll', handleScroll, { passive: true });
        return () => el.removeEventListener('scroll', handleScroll);
      }, [checkIsNearBottom, messages.length, visibleMessages.length]);

      useImperativeHandle(ref, () => ({
        scrollToTop: () => {
          const el = containerRef.current;
          if (el) {
            el.scrollTop = 0;
          }
          isAtBottomRef.current = false;
        },
        scrollToBottom: (opts?: { smooth?: boolean }) => {
          scrollToBottom(opts?.smooth ?? true);
        },
        forceUpdate: () => {
          // trigger re-render if needed
        },
      }));

      const handleLoadMore = useCallback(() => {
        const el = containerRef.current;
        const prevScrollHeight = el?.scrollHeight || 0;

        setLimit(prev => {
          const newLimit = Math.min(prev + STEP, messages.length);
          if (newLimit > prev) {
            setSeparatorIndex(prev); // Показываем разделитель после старых сообщений
          }
          return newLimit;
        });

        // Сохраняем позицию прокрутки после загрузки
        requestAnimationFrame(() => {
          if (el && prevScrollHeight > 0) {
            const newScrollHeight = el.scrollHeight;
            el.scrollTop = el.scrollTop + (newScrollHeight - prevScrollHeight);
          }
        });
      }, [STEP, messages.length]);

      const handleNewMessageNoticeClick = useCallback(() => {
        // Запускаем анимацию исчезновения
        setIsNoticeExiting(true);
        setTimeout(() => {
          scrollToBottom(true); // Smooth scroll
          setShowNewMessageNotice(false);
          setIsNoticeExiting(false);
        }, 150); // Длительность анимации
      }, [scrollToBottom]);

      const handleLastMessageRender = useCallback(() => {
        // Для initial render всегда скроллим вниз
        if (isInitialRenderRef.current && !initialScrollDoneRef.current) {
          initialScrollDoneRef.current = true;
          scrollToBottom(false); // Мгновенный скролл для initial
          isInitialRenderRef.current = false;
          return;
        }

        // Для последующих рендеров скроллим только если пользователь был внизу
        if (isAtBottomRef.current) {
          scrollToBottom(false); // Мгновенный скролл после рендеринга markdown
        }
      }, [scrollToBottom]);

      return (
        <div
          className="groq-chat__messages"
          aria-live="polite"
          ref={containerRef}
          style={{ overflowAnchor: 'none' }} // Предотвращаем браузерный auto-scroll
        >
          {messages.length > 0 ? (
            <>
              {messages.length > visibleMessages.length && (
                <div style={{ marginBottom: '12px', textAlign: 'center' }}>
                  <button
                    className="groq-button groq-dialog-secondary-button"
                    onClick={handleLoadMore}
                  >
                    {t('showPreviousN', language).replace('{{n}}', String(STEP))}
                  </button>
                </div>
              )}

              {visibleMessages.map((message, idx) => (
                <React.Fragment key={`${message.id ?? 'msg'}-${message.timestamp ?? '0'}-${idx}`}>
                  {separatorIndex !== null && idx === separatorIndex && (
                    <div className="groq-history-separator" aria-hidden="true" />
                  )}
                  <div className="groq-message-row">
                    <MessageItem
                      message={message}
                      isCurrentUser={message.role === 'user'}
                      isLastMessage={idx === visibleMessages.length - 1}
                      onRenderComplete={
                        idx === visibleMessages.length - 1 ? handleLastMessageRender : undefined
                      }
                      locale={language}
                    />
                  </div>
                </React.Fragment>
              ))}

              {/* Показываем индикатор стриминга */}
              {isStreaming && (
                <div className="groq-message-row">
                  <StreamingIndicator language={language} />
                </div>
              )}
            </>
          ) : (
            !isLoading && <div className="groq-chat__empty">{t('noMessages', language)}</div>
          )}

          {showNewMessageNotice && (
            <div className={`groq-new-message-notice ${isNoticeExiting ? 'is-exiting' : ''}`}>
              <button
                onClick={handleNewMessageNoticeClick}
                className="groq-button groq-button--primary groq-new-message-button"
              >
                {t('newMessages', language)}
              </button>
            </div>
          )}
        </div>
      );
    },
  ),
);

MessageList.displayName = 'MessageList';

export default MessageList;
