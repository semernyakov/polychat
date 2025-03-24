import React from 'react';

interface NoticeProps {
  message: string;
  type?: 'info' | 'warning' | 'error';
}

export const Notice: React.FC<NoticeProps> = ({ message, type = 'info' }) => {
  return <div className={`groq-notice groq-notice-${type}`}>{message}</div>;
};
