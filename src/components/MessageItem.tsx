import React, { useCallback, useState } from 'react';
import { Message } from '../types/message';
import { MessageUtils } from '../utils/messageUtils'; // Убедитесь, что этот файл существует и экспортирует formatTime
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Highlight, themes } from 'prism-react-renderer';
import { FiCopy, FiCheck } from 'react-icons/fi';
import '../styles.css'; // Используем единый style.css

// Тема для подсветки синтаксиса
const prismTheme = themes.vsDark; // или themes.github, themes.vsLight и т.д.

// Placeholder для MessageUtils, если он не предоставлен
const MockMessageUtils = {
  formatTime: (timestamp: number): string => {
    try {
      return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'invalid time';
    }
  }
};
// Используйте реальный MessageUtils, если он есть, иначе MockMessageUtils
const CurrentMessageUtils = typeof MessageUtils !== 'undefined' ? MessageUtils : MockMessageUtils;


export const MessageItem: React.FC<{ message: Message }> = React.memo(({ message }) => {
  const [isCopied, setIsCopied] = useState(false);

  // Обработчик копирования всего сообщения
  const handleCopy = async () => {
    if (!message.content) return; // Не копировать пустое сообщение
    try {
      await navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Ошибка копирования:', err);
      // Можно добавить уведомление пользователю
    }
  };

  // Компонент для обработки блоков кода с правильной типизацией
  const CodeComponent = React.useCallback(({
    inline,
    className,
    children,
    ...props
  }: {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any; // Добавляем индексную сигнатуру
  }) => {
    const match = /language-(\w+)/.exec(className || '');
    const codeContent = String(children).replace(/\n$/, '');

    return !inline && match ? (
      <CodeBlock language={match[1]} code={codeContent} />
    ) : (
      // Для inline-кода или без языка - стандартный тег code
      <code className={`groq-inline-code ${className || ''}`} {...props}>
        {children}
      </code>
    );
  }, []); // useCallback для стабильности

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
            title={new Date(message.timestamp).toLocaleString()} // Показываем полную дату при наведении
          >
            {CurrentMessageUtils.formatTime(message.timestamp)}
          </time>
        </div>
        {/* Кнопка копирования только для сообщений ассистента с контентом */}
        {message.role === 'assistant' && message.content && (
            <button
              onClick={handleCopy}
              className="groq-icon-button groq-copy-button" // Используем общий класс
              aria-label="Копировать сообщение"
              title="Копировать сообщение"
            >
              {isCopied ? (
                <FiCheck className="groq-icon-check" size={14}/>
              ) : (
                <FiCopy size={14}/>
              )}
            </button>
        )}
      </div>
      <div className="groq-message__content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{ code: CodeComponent }}
          // Разрешаем HTML, если нужно (осторожно!)
          // rehypePlugins={[rehypeRaw]}
          // linkTarget="_blank" // Открывать ссылки в новой вкладке
        >
          {message.content || ''}
        </ReactMarkdown>
      </div>
    </div>
  );
});

MessageItem.displayName = 'MessageItem';


// Компонент для блоков кода с подсветкой
const CodeBlock = React.memo(({ language, code }: { language: string; code: string }) => {
  const [isCodeCopied, setIsCodeCopied] = useState(false);

  // Обработчик копирования кода
  const handleCodeCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setIsCodeCopied(true);
      setTimeout(() => setIsCodeCopied(false), 1500);
    }).catch(err => {
      console.error("Ошибка копирования кода:", err);
    });
  }, [code]);

  return (
    <div className="groq-code-container">
      <div className="groq-code-header">
        <span className="groq-code-language">{language || 'code'}</span>
        <button
          onClick={handleCodeCopy}
          className="groq-icon-button groq-code-copy" // Используем общий класс
          aria-label="Копировать код"
          title="Копировать код"
        >
          {isCodeCopied ? <FiCheck size={14} /> : <FiCopy size={14}/>}
        </button>
      </div>
      <Highlight
        code={code || ''}
        language={language || 'plaintext'} // Предоставляем язык по умолчанию
        theme={prismTheme}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={`groq-code-block ${className}`} style={style}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line, key: i })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token, key })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
});

CodeBlock.displayName = 'CodeBlock';
