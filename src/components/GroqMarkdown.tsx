import React, { useCallback, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Highlight, themes, PrismTheme } from 'prism-react-renderer';
import { FiCopy, FiCheck } from 'react-icons/fi';
import '../styles.css'; // Убедись, что у тебя есть нужные стили

const prismTheme: PrismTheme = themes.vsDark;

type CodeProps = {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
};

const CodeBlock = React.memo(({ language, code }: { language: string; code: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
    }).catch(err => {
      console.error("Ошибка копирования кода:", err);
    });
  }, [code]);

  return (
    <div className="groq-code-container">
      <div className="groq-code-header">
        <span className="groq-code-language">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="groq-icon-button groq-code-copy"
          aria-label="Копировать код"
          title="Копировать код"
        >
          {isCopied ? <FiCheck size={14} /> : <FiCopy size={14} />}
        </button>
      </div>
      <Highlight code={code} language={language || 'plaintext'} theme={prismTheme}>
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

const CodeRenderer: React.FC<CodeProps> = ({ inline, className = '', children }) => {
  const match = /language-(\w+)/.exec(className || '');
  const code = String(children).replace(/\n$/, '');

  if (!inline && match) {
    return <CodeBlock language={match[1]} code={code} />;
  } else if (!inline) {
    return (
      <div className="groq-code-container groq-code-container--no-highlight">
        <pre className="groq-code-block groq-code-block--no-highlight">
          <code className={className}>{children}</code>
        </pre>
      </div>
    );
  } else {
    return <code className={`groq-inline-code ${className}`}>{children}</code>;
  }
};

export const GroqMarkdown: React.FC<{ content: string }> = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code: CodeRenderer,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default GroqMarkdown;
