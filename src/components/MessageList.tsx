import React, { useEffect, useRef, useImperativeHandle, forwardRef, useMemo, useCallback, JSX } from 'react';
import { VariableSizeList as List, ListOnItemsRenderedProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Message } from '../types/types';
import { MessageItem } from './MessageItem';
import '../styles.css';
import { Locale, t } from '../localization';
// import ReactMarkdown from 'react-markdown';
// import remarkGfm from 'remark-gfm';
// import rehypeRaw from 'rehype-raw';

// Реальная реализация рендеринга Markdown вместо stub
// const renderMarkdown = (content: string): JSX.Element => {
//   return (
//     <ReactMarkdown
//       remarkPlugins={[remarkGfm]}
//       rehypePlugins={[rehypeRaw]}
//     >
//       {content}
//     </ReactMarkdown>
//   );
// };
const renderMarkdown = (content: string): string => {
  // Simple stub that returns the content as-is
  // In a real implementation, this would parse and render markdown
  return content;
};
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
      const listRef = useRef<List>(null);
      const rowHeights = useRef<Record<string, number>>({});
      const outerRef = useRef<HTMLDivElement>(null);
      const prevMessageCountRef = useRef<number>(0);
      const shouldScrollToBottomRef = useRef<boolean>(true);
      const isAtBottomRef = useRef<boolean>(true);

      // Используем useMemo для копии сообщений, но без реверса (предполагаем порядок от старого к новому)
      const messageList = useMemo(() => [...messages], [messages]);

      // Функция для измерения высоты ряда
      const measureRow = useCallback((element: HTMLDivElement | null, index: number, id: string) => {
        if (!element) return;
        const newHeight = Math.ceil(element.getBoundingClientRect().height) + 8; // Увеличенный буфер для стабильности
        const prevHeight = rowHeights.current[id] ?? 0;
        if (Math.abs(newHeight - prevHeight) > 2) { // Порог для избежания частых обновлений
          rowHeights.current[id] = newHeight;
          listRef.current?.resetAfterIndex(index, false); // Без smooth для производительности
        }
      }, []);

      // Оптимизированная оценка размера элемента
      const getItemSize = useCallback((index: number): number => {
        const message = messageList[index];
        const id = message.id || `msg-${index}`;
        const cachedHeight = rowHeights.current[id];
        if (cachedHeight) {
          return cachedHeight;
        }
        // Улучшенная оценка: учитываем длину контента, наличие кода, переносы
        const content = message.content || '';
        const baseHeight = 64; // Базовая высота (мета + паддинги)
        const lineHeight = 20; // Примерная высота строки
        const avgCharsPerLine = 72; // Увеличено для лучшей точности (зависит от стилей, протестировать)
        const estimatedLines = Math.max(1, Math.ceil(content.length / avgCharsPerLine) + content.split('\n').length - 1);
        const codeBonus = content.includes('```') ? 96 : 0; // Бонус для код-блоков
        const estimatedHeight = baseHeight + (estimatedLines * lineHeight) + codeBonus;
        return Math.max(96, estimatedHeight); // Мин. высота для избежания обрезки
      }, [messageList]);

      // Хэндлер для onItemsRendered: проверяем, нужно ли скроллить
      const handleItemsRendered = useCallback((props: ListOnItemsRenderedProps) => {
        const { visibleStopIndex } = props;
        if (shouldScrollToBottomRef.current && visibleStopIndex === messageList.length - 1) {
          listRef.current?.scrollToItem(messageList.length - 1, 'end');
          shouldScrollToBottomRef.current = false;
        }
      }, [messageList.length]);

      useEffect(() => {
        const prevCount = prevMessageCountRef.current;
        prevMessageCountRef.current = messageList.length;

        const added = messageList.length > prevCount;
        if (added) {
          // Автоскролл только если пользователь был у низа
          shouldScrollToBottomRef.current = isAtBottomRef.current;
          // Не сбрасываем все высоты; новые элементы получат оценку через getItemSize
          // и будут измерены через ResizeObserver
          // Минимальный сброс: пересчитать с последнего известного индекса
          listRef.current?.resetAfterIndex(Math.max(0, messageList.length - 1), false);
        } else if (messageList.length < prevCount) {
          // Удаление: пересчёт, но без глобального сброса скролла
          listRef.current?.resetAfterIndex(0, false);
          shouldScrollToBottomRef.current = isAtBottomRef.current;
        } else {
          // Обновление существующих
          shouldScrollToBottomRef.current = false;
        }
      }, [messageList]);

      useImperativeHandle(ref, () => ({
        scrollToTop: () => {
          listRef.current?.scrollToItem(0, 'start');
          shouldScrollToBottomRef.current = false;
        },
        scrollToBottom: () => {
          if (messageList.length > 0) {
            listRef.current?.scrollToItem(messageList.length - 1, 'end');
            shouldScrollToBottomRef.current = false;
          }
        },
        forceUpdate: () => {
          rowHeights.current = {};
          listRef.current?.resetAfterIndex(0, false);
        },
      }));

      // Компонент ряда с улучшенным ResizeObserver (debounce 100ms, disconnect cleanup)
      const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const message = messageList[index];
        const id = message.id || `msg-${index}`;
        const containerRef = useRef<HTMLDivElement>(null);
        const resizeObserverRef = useRef<ResizeObserver | null>(null);
        const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

        useEffect(() => {
          const el = containerRef.current;
          if (!el) return;

          // Инициальное измерение
          measureRow(el, index, id);

          // ResizeObserver с debounce
          resizeObserverRef.current = new ResizeObserver(() => {
            if (debounceTimeoutRef.current) {
              clearTimeout(debounceTimeoutRef.current);
            }
            debounceTimeoutRef.current = setTimeout(() => {
              measureRow(el, index, id);
            }, 100); // Увеличенный debounce для производительности
          });

          resizeObserverRef.current.observe(el);

          return () => {
            if (resizeObserverRef.current) {
              resizeObserverRef.current.disconnect();
            }
            if (debounceTimeoutRef.current) {
              clearTimeout(debounceTimeoutRef.current);
            }
          };
        }, [index, id, measureRow, message.content]); // Добавили dep на content для реакций на изменения

        return (
          <div className="groq-message-row" style={style}>
            <div ref={containerRef}>
              <MessageItem message={message} />
            </div>
          </div>
        );
      };

      // Inner элемент с динамическим padding (на основе стилей)
      const InnerElement = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
        ({ style, children, ...rest }, ref) => (
          <div
            ref={ref}
            style={{ ...style, paddingBottom: '24px', boxSizing: 'border-box' }} // Увеличен для лучшей видимости
            {...rest}
          >
            {children}
          </div>
        ),
      );

      // Отслеживаем положение прокрутки, чтобы понять, находится ли пользователь у низа
      useEffect(() => {
        const el = outerRef.current;
        if (!el) return;
        const handleScroll = () => {
          const threshold = 40; // пикселей до низа
          const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
          isAtBottomRef.current = atBottom;
        };
        handleScroll();
        el.addEventListener('scroll', handleScroll, { passive: true });
        return () => el.removeEventListener('scroll', handleScroll);
      }, []);

      // При изменении размеров контейнера (окна Obsidian) пересчитываем высоты элементов
      const handleContainerResize = useCallback(({ height, width }: { height: number; width: number }) => {
        const wasAtBottom = isAtBottomRef.current;
        // Сбрасываем кэш высот, так как переносы строк меняются при изменении ширины
        rowHeights.current = {};
        // Полный пересчёт размеров без анимации
        listRef.current?.resetAfterIndex(0, false);
        // Сохраняем прилипание к низу, только если пользователь уже был внизу
        shouldScrollToBottomRef.current = wasAtBottom;
      }, []);

      return (
        <div className="groq-chat__messages" aria-live="polite">
          {messageList.length > 0 ? (
            <AutoSizer onResize={handleContainerResize}>
              {({ height, width }) => (
                <List
                  ref={listRef}
                  height={height || 0}
                  width={width || 0}
                  itemCount={messageList.length}
                  itemSize={getItemSize}
                  estimatedItemSize={128}
                  overscanCount={5}
                  innerElementType={InnerElement}
                  outerRef={outerRef}
                  onItemsRendered={handleItemsRendered}
                  itemKey={index => messageList[index].id || `msg-${index}-${messageList[index].timestamp ?? '0'}`}
                  className="groq-react-window-list"
                >
                  {Row}
                </List>
              )}
            </AutoSizer>
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
