import React from 'react';
import '../styles.css';

// Лёгкая заглушка Markdown: выводим обычный текст с сохранением переносов строк.
// Не используем react-markdown/remark/rehype/prism для стабильности и скорости.
export const GroqMarkdown: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className="groq-message__content-wrapper">
      <div className="groq-markdown-stub" style={{ whiteSpace: 'pre-wrap' }}>
        {content}
      </div>
    </div>
  );
};
