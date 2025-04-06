// GroqMarkdown.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Highlight, themes, PrismTheme } from 'prism-react-renderer';
import { FiCopy, FiCheck } from 'react-icons/fi';
import '../styles.css';

const prismTheme: PrismTheme = themes.vsDark;

type CodeProps = {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
};

const CodeBlock = React.memo(({ language, code }: { language: string; code: string }) => {
  const [isCopied, setIsCopied] = React.useState(false);
  const [copyError, setCopyError] = React.useState(false);
  const timeoutId = React.useRef<NodeJS.Timeout | null>(null);

  const handleCopy = () => {
    setCopyError(false);
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setIsCopied(true);
        timeoutId.current = setTimeout(() => setIsCopied(false), 1500);
      })
      .catch(err => {
        console.error('Ошибка копирования кода:', err);
        setCopyError(true);
        timeoutId.current = setTimeout(() => setCopyError(false), 1500);
      });
  };

  React.useEffect(() => {
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, []);

  return (
    <div className="groq-code-container">
      <div className="groq-code-header">
        <span className="groq-code-language">{language || 'код'}</span>
        <button
          onClick={handleCopy}
          className="groq-icon-button groq-code-copy"
          aria-label="Копировать код"
          title="Копировать код"
        >
          {copyError ? (
            <span style={{ color: 'red' }}>!</span>
          ) : isCopied ? (
            <FiCheck size={14} color="#4CAF50" />
          ) : (
            <FiCopy size={14} />
          )}
        </button>
      </div>
      <Highlight
        code={code}
        language={language || 'plaintext'}
        theme={prismTheme}
        // customProps={{
        //   // Add custom props if needed
        // }}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={`groq-code-block ${className}`} style={style}>
            {tokens.map((line, i) => (
              <div key={`line-${i}`} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={`token-${key}`} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
});

// Добавляем displayName для компонента CodeBlock, чтобы его можно было идентифицировать
CodeBlock.displayName = 'CodeBlock';

const CodeRenderer: React.FC<CodeProps> = ({ inline /* Проп inline может быть ненадежным */, className = '', children }) => {
  // Проверяем, есть ли класс языка (признак блочного кода)
  const match = /language-(\w+)/.exec(className);
  const code = String(children).replace(/\n$/, '');

  if (match) {
    // Если есть класс языка - это БЛОЧНЫЙ код с подсветкой
    const lang = match[1];
    return <CodeBlock language={lang} code={code} />;
  } else if (!inline && children && children.toString().includes('\n')) {
    // Если НЕТ класса языка, НО это НЕ inline (явно ```) И есть переносы строк - это БЛОЧНЫЙ код БЕЗ подсветки
    return (
      <pre className={`groq-code-block groq-code-block--no-highlight ${className || ''}`}>
        <code>{children}</code>
      </pre>
    );
  } else {
    // Во всех остальных случаях (нет класса языка ИЛИ inline=true) - считаем это СТРОЧНЫМ кодом
    return <code className={`groq-inline-code ${className}`}>{code}</code>;
  }
};

// Объект с компонентами без явной типизации
const customComponents = {
  code: CodeRenderer,
  p({ node, children, ...props }: { node?: any; children?: any; [key: string]: any }) {
    const childArray = React.Children.toArray(children);

    // Фильтруем пустые текстовые узлы (пробелы)
    const meaningfulChildren = childArray.filter(child => {
      if (typeof child === 'string' && child.trim() === '') {
        return false; // Игнорируем пробельные строки
      }
      return true;
    });

    const firstMeaningfulChild: any = meaningfulChildren[0];

    const containsSingleBlock =
      meaningfulChildren.length === 1 && // Проверяем длину отфильтрованных детей
      firstMeaningfulChild &&
      typeof firstMeaningfulChild === 'object' &&
      firstMeaningfulChild.props &&
      firstMeaningfulChild.type &&
      (
        (typeof firstMeaningfulChild.type === 'object' &&
          (firstMeaningfulChild.type.displayName === 'CodeBlock' ||
            (firstMeaningfulChild.type as any)?.type?.displayName === 'CodeBlock')) ||
        (firstMeaningfulChild.type === 'div' &&
          firstMeaningfulChild.props.className?.includes('groq-code-container')) ||
        firstMeaningfulChild.type === 'figure' || // Проверка на figure
        (typeof firstMeaningfulChild.type === 'string' &&
          ['pre', 'ul', 'ol', 'table', 'blockquote', 'hr'].includes(
            firstMeaningfulChild.type,
          ))
      );

    if (containsSingleBlock) {
      // Если содержит один блок (figure, pre, и т.д.), рендерим только его
      return React.cloneElement(firstMeaningfulChild as React.ReactElement, props);
    } else {
       // Иначе рендерим обычный параграф <p>
      const processedChildren = React.Children.map(children, child => {
        if (React.isValidElement(child) && child.type === 'code') {
          const codeChild = child as React.ReactElement<{
            className?: string;
            children?: React.ReactNode;
          }>;
          // Используем существующий CodeRenderer для inline кода
          return (
            <CodeRenderer inline className={codeChild.props.className}>
              {codeChild.props.children}
            </CodeRenderer>
          );
        }
        return child;
      });
      return <p {...props}>{processedChildren}</p>;
    }
  },
  a({
    node,
    children,
    href,
    ...props
  }: {
    node?: any;
    children?: any;
    href?: string;
    [key: string]: any;
  }) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  },
  img({
    node,
    src,
    alt,
    ...props
  }: {
    node?: any;
    src?: string;
    alt?: string;
    [key: string]: any;
  }) {
    return (
      <figure {...props}>
        <img src={src} alt={alt || ''} />
        {alt && <figcaption>{alt}</figcaption>}
      </figure>
    );
  },
};

export const GroqMarkdown: React.FC<{ content: string }> = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={customComponents}
    >
      {content}
    </ReactMarkdown>
  );
};
