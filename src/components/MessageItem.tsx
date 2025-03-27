import React, { useState } from 'react';
import { Message } from '../types/message';
import { MessageUtils } from '../utils/messageUtils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Highlight, themes } from 'prism-react-renderer';
import { FiCopy, FiCheck } from 'react-icons/fi';
import '../styles.css';

// Тема для подсветки синтаксиса
const prismTheme = themes.vsDark;

export const MessageItem: React.FC<{ message: Message }> = React.memo(({ message }) => {
  const [isCopied, setIsCopied] = useState(false);

  // Обработчик копирования всего сообщения
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Ошибка копирования:', err);
    }
  };

  // Компонент для обработки блоков кода с правильной типизацией
const CodeComponent = ({
  inline,
  className,
  children,
  ...props
}: {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}) => {
  const match = /language-(\w+)/.exec(className || '');
  const codeContent = String(children).replace(/\n$/, '');

  return !inline && match ? (
    <CodeBlock language={match[1]} code={codeContent} />
  ) : (
    <code className={className} {...props}>
      {children}
    </code>
  );
};
  return (
    <div className={`groq-message groq-message--${message.role}`}>
      <div className="groq-message__header">
        <div className="groq-message__meta">
          <span className="groq-message__role">
            {message.role === 'user' ? 'Вы' : 'Ассистент'}
          </span>
          <time
            className="groq-message__timestamp"
            dateTime={new Date(message.timestamp).toISOString()}
          >
            {MessageUtils.formatTime(message.timestamp)}
          </time>
        </div>
        <button
          onClick={handleCopy}
          className="groq-copy-button"
          aria-label="Копировать сообщение"
        >
          {isCopied ? (
            <FiCheck className="groq-icon-check" />
          ) : (
            <FiCopy />
          )}
        </button>
      </div>
      <div className="groq-message__content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{ code: CodeComponent }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  );
});

// Компонент для блоков кода с подсветкой
const CodeBlock = ({ language, code }: { language: string; code: string }) => {
  const [isCodeCopied, setIsCodeCopied] = useState(false);

  // Обработчик копирования кода
  const handleCodeCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setIsCodeCopied(true);
      setTimeout(() => setIsCodeCopied(false), 1500);
    });
  };

  return (
    <div className="groq-code-container">
      <div className="groq-code-header">
        <span className="groq-code-language">{language}</span>
        <button
          onClick={handleCodeCopy}
          className="groq-code-copy"
          aria-label="Копировать код"
        >
          {isCodeCopied ? <FiCheck /> : <FiCopy />}
        </button>
      </div>
      <Highlight
        code={code}
        language={language}
        theme={prismTheme}
      >
        {({ tokens, getLineProps, getTokenProps }) => (
          <pre className="groq-code-block">
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
};
