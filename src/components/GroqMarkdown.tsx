import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

import { Highlight, themes, PrismTheme } from 'prism-react-renderer';
import { FiCopy, FiCheck } from 'react-icons/fi';
import { usePluginSettings } from '../utils/usePluginSettings';
import { t, Locale } from '../localization';
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
  const { language: Locale = (usePluginSettings()?.language ?? 'en') as Locale } = usePluginSettings() || {};

  const handleCopy = () => {
    setCopyError(false);
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setIsCopied(true);
        timeoutId.current = setTimeout(() => setIsCopied(false), 1500);
      })
      .catch(err => {
        console.error('Error copying code:', err);
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
        <span className="groq-code-language">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="groq-icon-button groq-code-copy"
          aria-label={t('copyCode', locale)}
          title={t('copyCode', locale)}
        >
          {copyError ? (
            <span style={{ color: 'var(--text-error)' }}>!</span>
          ) : isCopied ? (
            <FiCheck size={14} color="var(--text-success)" />
          ) : (
            <FiCopy size={14} />
          )}
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

CodeBlock.displayName = 'CodeBlock';

const CodeRenderer: React.FC<CodeProps> = ({ inline, className = '', children }) => {
  const match = /language-(\w+)/.exec(className);
  const code = String(children).replace(/\n$/, '');

  if (match) {
    const lang = match[1];
    return <CodeBlock language={lang} code={code} />;
  } else if (!inline && children && children.toString().includes('\n')) {
    return (
      <pre className={`groq-code-block groq-code-block--no-highlight ${className || ''}`}>
        <code>{children}</code>
      </pre>
    );
  } else {
    return <code className={`groq-inline-code ${className}`}>{code}</code>;
  }
};

const customComponents = {
  code: CodeRenderer,
  p({ node, children, ...props }: { node?: any; children?: any; [key: string]: any }) {
    const childArray = React.Children.toArray(children);
    const hasDiv = childArray.some(
      child => React.isValidElement(child) && child.type === 'div'
    );
    if (hasDiv) {
      return <>{children}</>;
    }

    const meaningfulChildren = childArray.filter(
      child => typeof child !== 'string' || child.trim() !== '',
    );
    const firstMeaningfulChild: any = meaningfulChildren[0];

    const containsSingleBlock =
      meaningfulChildren.length === 1 &&
      firstMeaningfulChild &&
      typeof firstMeaningfulChild === 'object' &&
      firstMeaningfulChild.props &&
      firstMeaningfulChild.type &&
      ((typeof firstMeaningfulChild.type === 'object' &&
        'mdxType' in firstMeaningfulChild.type) ||
        typeof firstMeaningfulChild.type === 'function');

    if (containsSingleBlock) {
      return React.cloneElement(firstMeaningfulChild as React.ReactElement, props);
    } else {
      const processedChildren = React.Children.map(children, child => {
        if (React.isValidElement(child) && child.type === 'code') {
          const codeChild = child as React.ReactElement<{
            className?: string;
            children?: React.ReactNode;
          }>;
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
};

export const GroqMarkdown: React.FC<{ content: string }> = ({ content }) => {
  const language = (usePluginSettings()?.language ?? 'en') as Locale;
  const components = useMemo(
    () => ({
      ...customComponents,
      img({ src, alt, ...props }: React.ComponentProps<'img'> & { node?: any }) {
        const isAbsolute = typeof src === 'string' && /^(https?:\/\/|\/)/.test(src);
        if (isAbsolute) {
          return (
            <span className="groq-image-notice">
              {t('imageNotice', language)}{' '}
              <a href={src} target="_blank" rel="noopener noreferrer">
                [Link]
              </a>
            </span>
          );
        }
        return (
          <figure>
            <img src={src} alt={alt || ''} {...props} />
            {alt && <figcaption>{alt}</figcaption>}
          </figure>
        );
      },
    }),
    [language],
  );

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={components}>
      {content}
    </ReactMarkdown>
  );
};
