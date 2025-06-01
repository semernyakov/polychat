import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Message } from '../types/types';
import { MessageItem } from './MessageItem';
import '../styles.css';
import { t, Locale } from '../localization';

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

      const measureRow = (element: HTMLDivElement | null, index: number, id: string) => {
        if (element && !rowHeights.current[id]) {
          const newHeight = element.getBoundingClientRect().height;
          if (newHeight > 0 && rowHeights.current[id] !== newHeight) {
            rowHeights.current[id] = newHeight;
            sizeMap.current[id] = newHeight;
            listRef.current?.resetAfterIndex(index, true);
          }
        }
      };

      useEffect(() => {
        if (messages.length > 0 && listRef.current) {
          const timer = setTimeout(() => {
            listRef.current?.scrollToItem(messages.length - 1, 'end');
          }, 50);
          return () => clearTimeout(timer);
        }
      }, [messages]);

      useImperativeHandle(ref, () => ({
        scrollToTop: () => {
          listRef.current?.scrollToItem(0, 'start');
        },
        scrollToBottom: () => {
          if (messages.length > 0) {
            listRef.current?.scrollToItem(messages.length - 1, 'end');
          }
        },
        forceUpdate: () => {
          rowHeights.current = {};
          sizeMap.current = {};
          listRef.current?.resetAfterIndex(0, true);
        },
      }));

      const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const message = messages[index];
        const id = message.id || `msg-${index}`;

        return (
          <div key={`message-${id}`} className="groq-message-row" style={style}>
            <div ref={el => measureRow(el, index, id)}>
              <MessageItem message={message} key={`item-${id}`} />
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
        const message = messages[index];
        const id = message.id || `msg-${index}`;
        if (rowHeights.current[id]) {
          return rowHeights.current[id] + 12;
        }
        const estimate = () => {
          const content = message.content || '';
          const baseSize = 65;
          const minHeight = 80;
          if (!content) return minHeight;
          const charsPerLine = 60;
          const lineHeight = 20;
          const numLines = Math.ceil(content.length / charsPerLine);
          const codeBlockBonus = content.includes('```') ? 80 : 0;
          return Math.max(minHeight, baseSize + numLines * lineHeight + codeBlockBonus);
        };
        const estimatedSize = estimate();
        sizeMap.current[id] = estimatedSize;
        return estimatedSize + 12;
      };

      return (
        <div className="groq-chat__messages" key="message-list-container" aria-live="polite">
          {messages.length > 0 ? (
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
                    itemCount={messages.length}
                    itemSize={getItemSize}
                    estimatedItemSize={120}
                    itemKey={index => messages[index].id || `msg-${index}`}
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
              <span>{t('generatingResponse', language)}</span>
            </div>
          )}
        </div>
      );
    },
  ),
);

MessageList.displayName = 'MessageList';
