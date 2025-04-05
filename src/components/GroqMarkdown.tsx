import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Highlight, themes, PrismTheme } from 'prism-react-renderer';
import { FiCopy, FiCheck } from 'react-icons/fi';
import mermaid from 'mermaid';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import '../styles.css';

const prismTheme: PrismTheme = themes.vsDark;

type CodeProps = {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
};

const CodeBlock = React.memo(({ language, code }: { language: string; code: string }) => {
  const [isCopied, setIsCopied] = React.useState(false);

  const handleCopy = React.useCallback(() => {
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
    const lang = match[1];
    if (lang === 'mermaid') {
      return <MermaidRenderer code={code} />;
    }
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

// Рендеринг Mermaid диаграмм
const MermaidRenderer: React.FC<{ code: string }> = ({ code }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      try {
        mermaid.initialize({ startOnLoad: false });
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

        mermaid.render(id, code).then(({ svg }) => {
          if (ref.current) {
            ref.current.innerHTML = svg;
          }
        });
      } catch (err) {
        if (ref.current) {
          ref.current.innerHTML = `<pre>Ошибка рендера диаграммы Mermaid</pre>`;
        }
      }
    }
  }, [code]);

  return <div className="groq-mermaid" ref={ref} />;
};

// Встроенный и блочный LaTeX
const LatexRenderer: React.FC<{ value: string; displayMode?: boolean }> = ({ value, displayMode = false }) => {
  try {
    const html = katex.renderToString(value, {
      throwOnError: false,
      displayMode,
    });
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  } catch (err) {
    return <code>{value}</code>;
  }
};

export const GroqMarkdown: React.FC<{ content: string }> = ({ content }) => {
  const latexReplaced = content
    .replace(/\$\$([^$]+)\$\$/g, (_, expr) => `\n\n<LATEXBLOCK>${expr}</LATEXBLOCK>\n\n`)
    .replace(/\$([^$\n]+)\$/g, (_, expr) => `<LATEXINLINE>${expr}</LATEXINLINE>`);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code: CodeRenderer,
        p({ children }) {
          return <p>{children}</p>;
        },
        span({ children }) {
          if (children && Array.isArray(children) && typeof children[0] === 'string') {
            const text = children[0];
            if (text.startsWith('<LATEXINLINE>')) {
              const value = text.replace(/<\/?LATEXINLINE>/g, '');
              return <LatexRenderer value={value} />;
            }
          }
          return <span>{children}</span>;
        },
        div({ children }) {
          if (children && Array.isArray(children) && typeof children[0] === 'string') {
            const text = children[0];
            if (text.startsWith('<LATEXBLOCK>')) {
              const value = text.replace(/<\/?LATEXBLOCK>/g, '');
              return <div style={{ textAlign: 'center', margin: '1em 0' }}>
                <LatexRenderer value={value} displayMode />
              </div>;
            }
          }
          return <div>{children}</div>;
        },
      }}
    >
      {latexReplaced}
    </ReactMarkdown>
  );
};

export default GroqMarkdown;
