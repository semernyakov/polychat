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
import '../styles.css';
import { Locale, t } from '../localization';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
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
    ({ messages, isLoading, language = 'en', tailLimit, tailStep }, ref) => {
      const containerRef = useRef<HTMLDivElement>(null);
      const isAtBottomRef = useRef<boolean>(true);
      const prevMessagesLengthRef = useRef<number>(messages.length);
      const isInitialRenderRef = useRef<boolean>(true);
      const resizeObserverRef = useRef<ResizeObserver | null>(null);
      // Новый ref для отслеживания, было ли уже применено initial scroll
      const initialScrollDoneRef = useRef<boolean>(false);
      // Ref для блокировки скролла во время добавления новых сообщений
      const scrollLockRef = useRef<boolean>(false);

      const NEAR_BOTTOM_THRESHOLD = 100; // px
      const DEFAULT_TAIL_LIMIT = Math.max(1, tailLimit ?? 10);
      const [limit, setLimit] = useState<number>(DEFAULT_TAIL_LIMIT);
      const STEP = Math.max(1, tailStep ?? 20);

      const [separatorIndex, setSeparatorIndex] = useState<number | null>(null);
      const [showNewMessageNotice, setShowNewMessageNotice] = useState<boolean>(false);

      // Вычисляем видимую "хвостовую" часть
      const visibleMessages = React.useMemo(() => {
        if (!messages || messages.length === 0) return [];
        const currentLimit = Math.max(1, Math.min(limit, messages.length));
        return messages.slice(messages.length - currentLimit);
      }, [messages, limit]);

      // Проверка находится ли пользователь near bottom
      const checkIsNearBottom = useCallback((): boolean => {
        const el = containerRef.current;
        if (!el) return true;
        return el.scrollHeight - el.scrollTop - el.clientHeight <= NEAR_BOTTOM_THRESHOLD;
      }, []);

      // Прокрутка вниз с опциями - ОСНОВНОЙ МЕХАНИЗМ СКРОЛЛА
      const scrollToBottom = useCallback((opts?: { smooth?: boolean; force?: boolean }) => {
        const el = containerRef.current;
        if (!el) return;

        const smooth = opts?.smooth ?? true;
        const force = opts?.force ?? false;

        // Если принудительно или пользователь near bottom
        if (force || isAtBottomRef.current) {
          // Блокируем другие скролл-механизмы на время этой операции
          scrollLockRef.current = true;
          
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

          // Снимаем блокировку после завершения анимации
          setTimeout(() => {
            scrollLockRef.current = false;
          }, smooth ? 300 : 0);
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

      // Обработка новых сообщений - КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ
      useEffect(() => {
        const prevLength = prevMessagesLengthRef.current;
        const currentLength = messages.length;
        const hasNewMessages = currentLength > prevLength;

        if (hasNewMessages && !isInitialRenderRef.current && !scrollLockRef.current) {
          // ТОЛЬКО если пользователь near bottom, скроллим вниз
          if (isAtBottomRef.current) {
            scrollToBottom({ smooth: true });
          } else {
            // Показываем уведомление о новых сообщениях
            setShowNewMessageNotice(true);
          }
        }

        prevMessagesLengthRef.current = currentLength;
      }, [messages.length, scrollToBottom]);

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
          // При изменении размера контейнера, если были near bottom - остаемся там
          if (isAtBottomRef.current && !scrollLockRef.current) {
            scrollToBottom({ smooth: false });
          }
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
        scrollToBottom({ smooth: true, force: true });
      }, [scrollToBottom]);

      const handleLastMessageRender = useCallback(() => {
        // Только для streaming сообщений - плавно скроллим вниз
        // НЕ вызываем при initial render или если скролл заблокирован
        if (!isInitialRenderRef.current && isAtBottomRef.current && !scrollLockRef.current) {
          scrollToBottom({ smooth: true });
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
                    />
                  </div>
                </React.Fragment>
              ))}
            </>
          ) : (
            !isLoading && <div className="groq-chat__empty">{t('noMessages', language)}</div>
          )}

          {showNewMessageNotice && (
            <div className="groq-new-message-notice">
              <button
                onClick={handleNewMessageNoticeClick}
                className="groq-button groq-button--primary"
              >
                {t('newMessages')}
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