import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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

  const handleCopy = () => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 1500);
      })
      .catch(err => {
        console.error('Ошибка копирования кода:', err);
      });
  };

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
          {isCopied ? <FiCheck size={14} /> : <FiCopy size={14} />}
        </button>
      </div>
      <Highlight code={code} language={language || 'plaintext'} theme={prismTheme}>
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

const CodeRenderer: React.FC<CodeProps> = ({ inline, className = '', children }) => {
  const match = /language-(\w+)/.exec(className || '');
  const code = String(children).replace(/\n$/, '');

  if (!inline && match) {
    const lang = match[1];
    return <CodeBlock language={lang} code={code} />;
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
        p({ children }) {
          return <p>{children}</p>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};
