import React, { useEffect, useRef } from 'react';
import { VariableSizeList as List } from 'react-window';
import { Message } from '../types/message';
import { MessageItem } from './MessageItem';
import '../styles.css';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export const MessageList: React.FC<MessageListProps> = React.memo(({ messages, isLoading }) => {
  const listRef = useRef<List>(null);
  const sizeMap = useRef<Record<number, number>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        if (listRef.current) {
          listRef.current.scrollToItem(messages.length - 1, 'end');
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const rowRenderer = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <MessageItem message={messages[index]} />
    </div>
  );

  const getItemSize = (index: number) => {
    const message = messages[index];
    if (sizeMap.current[index]) return sizeMap.current[index];

    const baseSize = 80;
    const contentLength = message.content.length;
    const extraLines = Math.floor(contentLength / 50);
    return baseSize + (extraLines * 20);
  };

  useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  }, [messages]);

  return (
    <div className="groq-chat__messages" ref={containerRef}>
      {messages.length > 0 ? (
        <List
          ref={listRef}
          height={containerRef.current?.clientHeight || 600}
          itemCount={messages.length}
          itemSize={getItemSize}
          width="100%"
          estimatedItemSize={120}
        >
          {rowRenderer}
        </List>
      ) : (
        <div className="groq-chat__empty">
          Нет сообщений для отображения
        </div>
      )}

      {isLoading && (
        <div className="groq-loading-indicator">
          <div className="groq-spinner"></div>
          <span>Генерация ответа...</span>
        </div>
      )}
    </div>
  );
});

MessageList.displayName = 'MessageList';
