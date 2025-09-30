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
      const resizeObserverRef = useRef<ResizeObserver | null>(null);
      const initialScrollDoneRef = useRef<boolean>(false);
      const scrollLockRef = useRef<boolean>(false);

      const NEAR_BOTTOM_THRESHOLD = 100; // px
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

      // Проверка находится ли пользователь у нижней границы (точная)
      const checkIsNearBottom = useCallback((): boolean => {
        const el = containerRef.current;
        if (!el) return true;
        const threshold = 2; // пикселей
        return el.scrollTop + el.clientHeight >= el.scrollHeight - threshold;
      }, []);

      // Прокрутка вниз с гарантированным позиционированием (без «скачков»)
      const scrollToBottom = useCallback((opts?: { smooth?: boolean; force?: boolean }) => {
        const el = containerRef.current;
        if (!el) return;

        const smooth = opts?.smooth ?? true;
        const force = opts?.force ?? false;

        if (force || isAtBottomRef.current) {
          scrollLockRef.current = true;

          const target = Math.max(0, el.scrollHeight - el.clientHeight);

          if (!smooth) {
            // Двойная установка для гарантии (DOM может дорисоваться асинхронно)
            el.scrollTop = target;
            requestAnimationFrame(() => {
              el.scrollTop = target;
              scrollLockRef.current = false;
            });
          } else {
            el.scrollTo({ top: target, behavior: 'smooth' });
            setTimeout(() => {
              scrollLockRef.current = false;
            }, 300);
          }

          isAtBottomRef.current = true;
          setShowNewMessageNotice(false);
        }
      }, []);

      // Initial scroll - только при первом рендере с сообщениями
      useLayoutEffect(() => {
        if (isInitialRenderRef.current && messages.length > 0 && !initialScrollDoneRef.current) {
          initialScrollDoneRef.current = true;
          // Небольшая задержка для гарантии что DOM готов
          requestAnimationFrame(() => {
            scrollToBottom({ smooth: false, force: true });
            isInitialRenderRef.current = false;
          });
        }
      }, [messages.length, scrollToBottom]);

      // Обработка новых сообщений - выполняем до первого кадра, чтобы исключить визуальный скачок вверх
      useLayoutEffect(() => {
        const prevLength = prevMessagesLengthRef.current;
        const currentLength = messages.length;
        const hasNewMessages = currentLength > prevLength;

        if (hasNewMessages && !isInitialRenderRef.current) {
          if (isAtBottomRef.current) {
            // Пользователь находился у нижней границы — жестко прокручиваем вниз синхронно
            scrollToBottom({ smooth: false, force: true });
            setShowNewMessageNotice(false);
          } else if (messages.length > visibleMessages.length) {
            // Пользователь пролистал выше — показываем уведомление о новых сообщениях
            setShowNewMessageNotice(true);
          }
        }

        prevMessagesLengthRef.current = currentLength;
      }, [messages.length, scrollToBottom, visibleMessages.length]);

      // Отслеживание положения скролла
      useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const handleScroll = () => {
          // Не обновляем состояние если скролл заблокирован
          if (scrollLockRef.current) return;

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

      // Resize observer для пересчета макета
      useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        resizeObserverRef.current = new ResizeObserver(() => {
          // По требованию: при изменении размеров окна всегда скроллим в самый низ
          scrollToBottom({ smooth: false, force: true });
        });

        resizeObserverRef.current.observe(el);
        return () => {
          resizeObserverRef.current?.disconnect();
        };
      }, [scrollToBottom]);

      useImperativeHandle(ref, () => ({
        scrollToTop: () => {
          const el = containerRef.current;
          if (el) {
            el.scrollTop = 0;
          }
          isAtBottomRef.current = false;
        },
        scrollToBottom: (opts?: { smooth?: boolean }) => {
          scrollToBottom({ ...opts, force: true });
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
          scrollToBottom({ smooth: true, force: true });
          setShowNewMessageNotice(false);
          setIsNoticeExiting(false);
        }, 150); // Длительность анимации
      }, [scrollToBottom]);

      const handleLastMessageRender = useCallback(() => {
        // После рендеринга markdown всегда докручиваем до низа (без задержек)
        if (!isInitialRenderRef.current && !scrollLockRef.current) {
          scrollToBottom({ smooth: false, force: true });
        }
      }, [scrollToBottom]);

      return (
        <div
          className="groq-chat__messages"
          aria-live="polite"
          ref={containerRef}
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
                <React.Fragment
                  key={`${message.id ?? 'msg'}-${message.timestamp ?? '0'}-${idx}`}
                >
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
