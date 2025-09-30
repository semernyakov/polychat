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

const SCROLL_LOCK_CLASS = 'groq-chat__messages--scroll-locked';

export const MessageList = React.memo(
  forwardRef<MessageListHandles, MessageListProps>(
    ({ messages, isLoading, isStreaming = false, language = 'en', tailLimit, tailStep }, ref) => {
      const containerRef = useRef<HTMLDivElement>(null);
      const bottomSentinelRef = useRef<HTMLDivElement>(null);
      const isAtBottomRef = useRef<boolean>(true);
      const prevMessagesLengthRef = useRef<number>(messages.length);
      const isInitialRenderRef = useRef<boolean>(true);
      const resizeObserverRef = useRef<ResizeObserver | null>(null);
      const initialScrollDoneRef = useRef<boolean>(false);
      const scrollLockRef = useRef<boolean>(false);
      const scrollTimeoutRef = useRef<number | null>(null);
      const hasPendingNewMessagesRef = useRef<boolean>(false);

      const DEFAULT_TAIL_LIMIT = Math.max(1, tailLimit ?? 10);
      const [limit, setLimit] = useState<number>(DEFAULT_TAIL_LIMIT);
      const STEP = Math.max(1, tailStep ?? 20);

      const [separatorIndex, setSeparatorIndex] = useState<number | null>(null);
      const [showNewMessageNotice, setShowNewMessageNotice] = useState<boolean>(false);
      const [isNoticeExiting, setIsNoticeExiting] = useState<boolean>(false);
      const [isLastMessageVisible, setIsLastMessageVisible] = useState<boolean>(true);
      const [hasPendingNewMessages, setHasPendingNewMessages] = useState<boolean>(false);

      const updatePendingNewMessages = useCallback((value: boolean) => {
        hasPendingNewMessagesRef.current = value;
        setHasPendingNewMessages(value);
      }, []);

      const ensureStrictBottom = useCallback((el: HTMLDivElement, onSettled?: () => void) => {
        const clampToBottom = () => {
          const target = Math.max(0, el.scrollHeight - el.clientHeight);
          el.scrollTop = target;
        };

        clampToBottom();
        requestAnimationFrame(() => {
          clampToBottom();
          requestAnimationFrame(() => {
            clampToBottom();
            onSettled?.();
          });
        });
      }, []);

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
      const scrollToBottom = useCallback(
        (opts?: { smooth?: boolean; force?: boolean }) => {
          const el = containerRef.current;
          if (!el) return;

          const smooth = opts?.smooth ?? true;
          const force = opts?.force ?? false;

          if (!(force || isAtBottomRef.current)) {
            return;
          }

          scrollLockRef.current = true;

          if (scrollTimeoutRef.current !== null) {
            window.clearTimeout(scrollTimeoutRef.current);
            scrollTimeoutRef.current = null;
          }

          if (!smooth) {
            el.classList.add(SCROLL_LOCK_CLASS);

            ensureStrictBottom(el, () => {
              el.classList.remove(SCROLL_LOCK_CLASS);
              scrollLockRef.current = false;
            });
          } else {
            const target = Math.max(0, el.scrollHeight - el.clientHeight);
            el.scrollTo({ top: target, behavior: 'smooth' });

            scrollTimeoutRef.current = window.setTimeout(() => {
              ensureStrictBottom(el, () => {
                scrollLockRef.current = false;
              });
              scrollTimeoutRef.current = null;
            }, 320);
          }

          isAtBottomRef.current = true;
          updatePendingNewMessages(false);
          setShowNewMessageNotice(false);
          setIsNoticeExiting(false);
        },
        [ensureStrictBottom, updatePendingNewMessages],
      );

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
            updatePendingNewMessages(false);
          } else if (!isLastMessageVisible) {
            updatePendingNewMessages(true);
          }
        }

        prevMessagesLengthRef.current = currentLength;
      }, [
        isLastMessageVisible,
        messages.length,
        scrollToBottom,
        updatePendingNewMessages,
        visibleMessages.length,
      ]);

      useEffect(() => {
        return () => {
          if (scrollTimeoutRef.current !== null) {
            window.clearTimeout(scrollTimeoutRef.current);
            scrollTimeoutRef.current = null;
          }
        };
      }, []);

      // Отслеживание положения скролла
      useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const handleScroll = () => {
          // Не обновляем состояние если скролл заблокирован
          if (scrollLockRef.current) return;

          isAtBottomRef.current = checkIsNearBottom();
          if (isAtBottomRef.current) {
            updatePendingNewMessages(false);
          }
        };

        handleScroll(); // Initial check
        el.addEventListener('scroll', handleScroll, { passive: true });
        return () => el.removeEventListener('scroll', handleScroll);
      }, [checkIsNearBottom, messages.length, updatePendingNewMessages, visibleMessages.length]);

      // Resize observer для пересчета макета
      useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        resizeObserverRef.current = new ResizeObserver(() => {
          // Не скроллим вниз, если есть непрочитанные сообщения или пользователь не внизу
          if (hasPendingNewMessagesRef.current || !isAtBottomRef.current) {
            return;
          }
          scrollToBottom({ smooth: false, force: true });
        });

        resizeObserverRef.current.observe(el);
        return () => {
          resizeObserverRef.current?.disconnect();
        };
      }, [scrollToBottom]);

      useEffect(() => {
        const container = containerRef.current;
        const sentinel = bottomSentinelRef.current;
        if (!container || !sentinel) return;

        const observer = new IntersectionObserver(
          entries => {
            const entry = entries[0];
            const visible = Boolean(entry?.isIntersecting || entry?.intersectionRatio);
            setIsLastMessageVisible(visible);

            if (visible) {
              isAtBottomRef.current = true;
              updatePendingNewMessages(false);
            }
          },
          {
            root: container,
            threshold: 0.01,
          },
        );

        observer.observe(sentinel);

        return () => {
          observer.disconnect();
        };
      }, [visibleMessages.length, updatePendingNewMessages]);

      useEffect(() => {
        setShowNewMessageNotice(hasPendingNewMessages && !isLastMessageVisible);
      }, [hasPendingNewMessages, isLastMessageVisible]);

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
        if (!el) return;

        // Сохраняем текущую позицию прокрутки
        const prevScrollTop = el.scrollTop;

        // Блокируем автоматическую прокрутку
        scrollLockRef.current = true;

        setLimit(prev => {
          const newLimit = Math.min(prev + STEP, messages.length);
          if (newLimit > prev) {
            setSeparatorIndex(prev); // Показываем разделитель после старых сообщений
          }
          return newLimit;
        });

        // Ждем два кадра анимации для полного обновления DOM
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (el) {
              // Фиксируем позицию прокрутки
              el.scrollTop = prevScrollTop;

              // Разблокируем автоматическую прокрутку через более длинную задержку
              setTimeout(() => {
                scrollLockRef.current = false;
              }, 300); // Увеличиваем задержку до 300ms
            }
          });
        });
      }, [STEP, messages.length]);

      const handleNewMessageNoticeClick = useCallback(() => {
        // Запускаем анимацию исчезновения
        setIsNoticeExiting(true);
        setTimeout(() => {
          scrollToBottom({ smooth: true, force: true });
          updatePendingNewMessages(false);
          setShowNewMessageNotice(false);
          setIsNoticeExiting(false);
        }, 150); // Длительность анимации
      }, [scrollToBottom, updatePendingNewMessages]);

      const handleLastMessageRender = useCallback(() => {
        // После рендеринга markdown всегда докручиваем до низа (без задержек)
        // Но только если пользователь находится у нижней границы
        if (!isInitialRenderRef.current && !scrollLockRef.current && isAtBottomRef.current) {
          scrollToBottom({ smooth: false, force: true });
        }
      }, [scrollToBottom]);

      return (
        <div className="groq-chat__messages" aria-live="polite" ref={containerRef}>
          {messages.length > 0 ? (
            <>
              {messages.length > visibleMessages.length && (
                <div className="groq-load-more-container">
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
              <div
                ref={bottomSentinelRef}
                className="groq-chat__bottom-sentinel"
                aria-hidden="true"
              />
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
