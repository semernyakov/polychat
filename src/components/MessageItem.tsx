import React, { useState, useCallback } from 'react';
import { Message } from '../types/message';
import { MessageUtils } from '../utils/messageUtils'; // Убедитесь, что импорт корректен
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Highlight, themes, PrismTheme } from 'prism-react-renderer';
import { FiCopy, FiCheck } from 'react-icons/fi';
import '../styles.css';

// Тема для подсветки синтаксиса
const prismTheme: PrismTheme = themes.vsDark;
const CurrentMessageUtils = MessageUtils; // Используем импортированный напрямую

// Определяем тип пропсов для CodeComponent, чтобы явно указать нужные
// и отсечь остальные (включая 'node')
type CodeComponentProps = {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
    // Можно добавить другие ожидаемые пропсы от ReactMarkdown, если они используются
};


export const MessageItem: React.FC<{ message: Message }> = React.memo(({ message }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (!message.content) return;
    try {
      await navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Ошибка копирования сообщения:', err);
    }
  };

  // --- ИСПРАВЛЕННЫЙ CodeComponent ---
  const CodeComponent = useCallback((props: CodeComponentProps) => {
    const { inline, className, children } = props; // Берем только нужные пропсы

    const match = /language-(\w+)/.exec(className || '');
    const codeContent = String(children).replace(/\n$/, '');

    // 1. Блок кода С ЯЗЫКОМ -> Используем CodeBlock с подсветкой Prism
    if (!inline && match) {
      return <CodeBlock language={match[1]} code={codeContent} />;
    }
    // 2. Блок кода БЕЗ ЯЗЫКА -> Рендерим как <pre><code> без подсветки Prism
    else if (!inline) {
      return (
        <div className="groq-code-container groq-code-container--no-highlight">
            {/* Шапку можно опустить или сделать простой */}
            {/* <div className="groq-code-header"><span>code</span></div> */}
            <pre className="groq-code-block groq-code-block--no-highlight">
                {/* Используем нативный <code>, класс для базовых стилей */}
                <code className={className}>{children}</code>
            </pre>
        </div>
      );
    }
    // 3. Строчный код (inline) -> Рендерим как <code> с классом groq-inline-code
    else {
      return (
        <code className={`groq-inline-code ${className || ''}`}>{children}</code>
      );
    }
  }, []);
  // ---------------------------------

  return (
    <div className={`groq-message groq-message--${message.role}`}>
      <div className="groq-message__header">
         {/* ... (шапка сообщения как раньше) ... */}
         <div className="groq-message__meta">
          <span className="groq-message__role">
            {message.role === 'user' ? 'Вы' : 'Ассистент'}
          </span>
          <time
            className="groq-message__timestamp"
            dateTime={new Date(message.timestamp).toISOString()}
            title={new Date(message.timestamp).toLocaleString()}
          >
            {CurrentMessageUtils.formatTime(message.timestamp)}
          </time>
        </div>
        {message.role === 'assistant' && message.content && (
            <button
              onClick={handleCopy}
              className="groq-icon-button groq-copy-button"
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
          components={{ code: CodeComponent }} // Передаем исправленный обработчик
        >
          {message.content || ''}
        </ReactMarkdown>
      </div>
    </div>
  );
});
MessageItem.displayName = 'MessageItem';


const CodeBlock = React.memo(({ language, code }: { language: string; code: string }) => {
  const [isCodeCopied, setIsCodeCopied] = useState(false);

  const handleCodeCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setIsCodeCopied(true);
      setTimeout(() => setIsCodeCopied(false), 1500);
    }).catch(err => {
      console.error("Ошибка копирования кода:", err);
    });
  }, [code]);

  const highlightLanguage = language || 'plaintext';

  return (
    <div className="groq-code-container"> {/* Контейнер для блока с подсветкой */}
      <div className="groq-code-header">
        <span className="groq-code-language">{language || 'code'}</span>
        <button
          onClick={handleCodeCopy}
          className="groq-icon-button groq-code-copy"
          aria-label="Копировать код"
          title="Копировать код"
        >
          {isCodeCopied ? <FiCheck size={14} /> : <FiCopy size={14}/>}
        </button>
      </div>
      <Highlight
        code={code || ''}
        language={highlightLanguage}
        theme={prismTheme}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={`groq-code-block ${className}`} style={style}> {/* Блок <pre> с подсветкой */}
            {tokens.map((line, i) => (
              (line.length === 1 && line[0].empty && i === tokens.length - 1) ? null : (
                <div key={i} {...getLineProps({ line, key: i })}>
                  {line.length === 1 && line[0].empty ? '\u00A0' : line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token, key })} />
                  ))}
                </div>
              )
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
});
CodeBlock.displayName = 'CodeBlock';
