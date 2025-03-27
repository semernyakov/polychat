import React from 'react';
import '../styles.css'; // Добавьте эту строку для импорта стилей

interface NoticeProps {
  message: string;
  type?: 'info' | 'warning' | 'error';
}

export const Notice: React.FC<NoticeProps> = ({ message, type = 'info' }) => {
  return <div className={`notice notice-${type}`}>{message}</div>;
};
