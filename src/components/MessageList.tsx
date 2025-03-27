import React from 'react';
import { FixedSizeList as List } from 'react-window';
import { Message } from '../types/message';
import { MessageItem } from './MessageItem';
import '../styles.css';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export const MessageList: React.FC<MessageListProps> = React.memo(({ messages, isLoading }) => {
  const rowRenderer = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <MessageItem message={messages[index]} />
    </div>
  );

  return (
    <div className="groq-chat__messages">
      <List
        height={600}
        itemCount={messages.length}
        itemSize={120}
        width="100%"
      >
        {rowRenderer}
      </List>
      {isLoading && (
        <div className="groq-loading-indicator">
          <div className="groq-spinner"></div>
          <span>Генерация ответа...</span>
        </div>
      )}
    </div>
  );
});
