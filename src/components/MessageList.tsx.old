import React, { useEffect, useRef, useImperativeHandle, forwardRef, useMemo } from 'react';
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Message } from '../types/types';
import { MessageItem } from './MessageItem';
import '../styles.css';
import { Locale, translations, t } from '../localization';

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
      const sizeMap = useRef<Record<string, number>>({});
      const rowHeights = useRef<Record<string, number>>({});
      const reversedMessages = useMemo(() => [...messages], [messages]);

      const measureRow = (element: HTMLDivElement | null, index: number, id: string) => {
        if (!element) return;
        const rect = element.getBoundingClientRect();
        const newHeight = Math.ceil(rect.height) + 4; // небольшой буфер
        const prev = rowHeights.current[id] ?? 0;
        // обновлять только при существенной разнице
        if (newHeight > 0 && Math.abs(newHeight - prev) > 1) {
          rowHeights.current[id] = newHeight;
          sizeMap.current[id] = newHeight;
          // откладываем пересчёт до следующего кадра, чтобы избежать каскадных ре-рендеров
          requestAnimationFrame(() => {
            listRef.current?.resetAfterIndex(index, true);
          });
        }
      };

      useEffect(() => {
        if (reversedMessages.length > 0 && listRef.current) {
          const timer = setTimeout(() => {
            // Scroll to bottom when new messages arrive
            listRef.current?.scrollToItem(reversedMessages.length - 1, 'end');
          }, 50);
          return () => clearTimeout(timer);
        }
      }, [reversedMessages]);

      useImperativeHandle(ref, () => ({
        scrollToTop: () => {
          listRef.current?.scrollToItem(0, 'start');
        },
        scrollToBottom: () => {
          if (reversedMessages.length > 0) {
            listRef.current?.scrollToItem(reversedMessages.length - 1, 'end');
          }
        },
        forceUpdate: () => {
          rowHeights.current = {};
          sizeMap.current = {};
          listRef.current?.resetAfterIndex(0, true);
        },
      }));


      const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const message = reversedMessages[index];
        const id = message.id || `msg-${index}`;
        const compositeKey = `message-${id}-${message.timestamp ?? 't0'}-${index}`;

        const containerRef = React.useRef<HTMLDivElement | null>(null);
        const contentRef = React.useRef<HTMLDivElement | null>(null);
        const resizeTimeoutRef = React.useRef<number | null>(null);

        React.useEffect(() => {
          const el = containerRef.current;
          if (!el) return;
          // Первичное измерение
          measureRow(el, index, id);
          // Наблюдаем за изменением размеров содержимого с дебаунсом
          const ro = new ResizeObserver(() => {
            if (resizeTimeoutRef.current) {
              window.clearTimeout(resizeTimeoutRef.current);
            }
            resizeTimeoutRef.current = window.setTimeout(() => {
              measureRow(el, index, id);
            }, 50);
          });
          ro.observe(el);
          // Дополнительно слушаем изменения содержимого, если есть
          if (contentRef.current) ro.observe(contentRef.current);
          return () => ro.disconnect();
        }, [index, id]);

        return (
          <div key={compositeKey} className="groq-message-row" style={style}>
            <div ref={containerRef}>
              <div ref={contentRef}>
                <MessageItem message={message} />
              </div>
            </div>
          </div>
        );
      };

      useEffect(() => {
        rowHeights.current = {};
        sizeMap.current = {};
        listRef.current?.resetAfterIndex(0, false);
      }, [messages]);

      const getItemSize = (index: number): number => {
        const message = reversedMessages[index];
        const id = message.id || `msg-${index}`;
        if (rowHeights.current[id]) {
          return rowHeights.current[id] + 12;
        }
        const estimate = () => {
          const content = message.content || '';
          const baseSize = 80; // базовая высота с запасом
          const minHeight = 96; // минимальная высота побольше, чтобы не обрезало
          if (!content) return minHeight;
          const charsPerLine = 58;
          const lineHeight = 22;
          const numLines = Math.ceil(content.length / charsPerLine);
          const codeBlockBonus = content.includes('```') ? 120 : 0;
          return Math.max(minHeight, baseSize + numLines * lineHeight + codeBlockBonus);
        };
        const estimatedSize = Math.ceil(estimate()) + 4; // округление и буфер
        sizeMap.current[id] = estimatedSize;
        return estimatedSize + 12;
      };

      // Внутренний контейнер списка с дополнительным нижним отступом,
      // чтобы последний элемент не обрезался визуально
      const InnerElement = React.useMemo(
        () =>
          React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
            ({ style, children, ...rest }, ref) => (
              <div
                ref={ref}
                style={{ ...style, paddingBottom: 16, boxSizing: 'border-box' }}
                {...rest}
              >
                {children}
              </div>
            ),
          ),
        [],
      );

      return (
        <div className="groq-chat__messages" key="message-list-container" aria-live="polite">
          {reversedMessages.length > 0 ? (
            <AutoSizer key="auto-sizer">
              {({ height, width }) => {
                if (height === 0 || width === 0) {
                  return null;
                }
                return (
                  <List
                    ref={listRef}
                    height={height}
                    width={width}
                    itemCount={reversedMessages.length}
                    itemData={reversedMessages}
                    itemSize={getItemSize}
                    estimatedItemSize={140}
                    overscanCount={8}
                    innerElementType={InnerElement}
                    itemKey={index => {
                      const m = reversedMessages[index];
                      const id = m.id || `msg-${index}`;
                      return `item-${id}-${m.timestamp ?? 't0'}-${index}`;
                    }}
                    className="groq-react-window-list"
                  >
                    {Row}
                  </List>
                );
              }}
            </AutoSizer>
          ) : (
            !isLoading && <div className="groq-chat__empty">{t('noMessages', language)}</div>
          )}

          {isLoading && (
            <div className="groq-loading-indicator">
              <div className="groq-spinner"></div>
              <span>{translations[language]?.generatingResponse || 'Generating response...'}</span>
            </div>
          )}
        </div>
      );
    },
  ),
);

MessageList.displayName = 'MessageList';
