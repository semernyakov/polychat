import React, { useEffect, useRef } from 'react';
import { MarkdownRenderer, Component } from 'obsidian';
import type { App } from 'obsidian';
import '../styles.css';

interface GroqMarkdownProps {
  content: string;
  app?: App;
  onRenderComplete?: () => void; // Добавляем коллбэк завершения рендера
}

// Основной компонент: полноценный рендер Markdown силами Obsidian
export const GroqMarkdown: React.FC<GroqMarkdownProps> = ({ content, app, onRenderComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mdComponentRef = useRef<Component | null>(null);
  const lastRenderedRef = useRef<string>('');
  const debounceTimerRef = useRef<number | null>(null);
  const mountedRef = useRef<boolean>(false);
  const effectiveApp: App | undefined = app ?? ((window as any)?.app as App | undefined);

  // Делегирование кликов по ссылкам
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!effectiveApp) return;

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest('a') as HTMLAnchorElement | null;
      if (!anchor) return;

      const isInternal = anchor.classList.contains('internal-link');
      const href = anchor.getAttribute('href') || '';

      if (isInternal && href) {
        e.preventDefault();
        effectiveApp.workspace.openLinkText(href, '/', false);
        return;
      }

      if (!isInternal) {
        anchor.setAttribute('target', '_blank');
        anchor.setAttribute('rel', 'noopener noreferrer');
      }
    };

    container.addEventListener('click', onClick);
    return () => {
      container.removeEventListener('click', onClick);
    };
  }, [effectiveApp]);

  // Инициализируем Obsidian Component один раз
  useEffect(() => {
    mdComponentRef.current = new Component();
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      if (mdComponentRef.current) {
        mdComponentRef.current.unload();
        mdComponentRef.current = null;
      }
      if (containerRef.current) {
        (containerRef.current as any).empty?.();
      }
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, []);

  // Рендер Markdown с дебаунсом и защитой от лишних перерисовок
  useEffect(() => {
    if (!effectiveApp) {
      // Если нет app (например, вне окружения Obsidian) — показываем фолбэк
      const container = containerRef.current;
      if (container) {
        (container as any).empty?.();
        (container as any).setText?.(content);
      }
      lastRenderedRef.current = content;
      return;
    }
    if (lastRenderedRef.current === content) return;

    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    debounceTimerRef.current = window.setTimeout(async () => {
      if (!mountedRef.current) return;
      const container = containerRef.current;
      const mdComponent = mdComponentRef.current;
      if (!container || !mdComponent) {
        return;
      }

      (container as any).empty?.();

      try {
        const sourcePath =
          effectiveApp.workspace.getActiveFile()?.path ?? effectiveApp.vault.getName() ?? '';

        await MarkdownRenderer.render(effectiveApp, content, container, sourcePath, mdComponent);

        // Гарантируем безопасность внешних ссылок
        container.querySelectorAll('a:not(.internal-link)').forEach(link => {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        });

        // Обогащаем блоки кода: заголовок с языком + кнопки Copy / Wrap
        enhanceCodeBlocks(container);

        lastRenderedRef.current = content;

        // Вызываем коллбэк после завершения рендеринга
        if (onRenderComplete) {
          onRenderComplete();
        }
      } catch (err) {
        console.error('Error rendering markdown:', err);
        (container as any).setText?.(content);
      }
    }, 50);
  }, [content, effectiveApp]);

  // Обогащение блоков кода после рендера
  const enhanceCodeBlocks = (root: HTMLElement) => {
    const codeBlocks = Array.from(root.querySelectorAll('pre > code')) as HTMLElement[];
    codeBlocks.forEach(codeEl => {
      const preEl = codeEl.parentElement as HTMLPreElement | null;
      if (!preEl) return;

      // Удаляем стандартную кнопку копирования внутри pre, чтобы не было дублирования
      const defaultCopyBtn = preEl.querySelector('button.copy-code-button');
      if (defaultCopyBtn && defaultCopyBtn.parentElement) {
        defaultCopyBtn.parentElement.removeChild(defaultCopyBtn);
      }
      const alreadyWrapped = preEl.parentElement?.classList.contains('groq-code-container');
      if (alreadyWrapped) return;

      // Определяем язык из класса code, например language-tsx
      const langClass = Array.from(codeEl.classList).find((c: string) => c.startsWith('language-'));
      const lang = langClass ? langClass.replace('language-', '') : 'text';

      // Создаем контейнер
      const wrapper = document.createElement('div');
      wrapper.className = 'groq-code-container';

      // Создаем заголовок
      const header = document.createElement('div');
      header.className = 'groq-code-header';

      const langLabel = document.createElement('span');
      langLabel.className = 'groq-code-language';
      langLabel.textContent = lang.toUpperCase();

      const actions = document.createElement('div');

      // Кнопка копирования
      const copyBtn = document.createElement('button');
      copyBtn.className = 'groq-icon-button groq-code-copy';
      copyBtn.type = 'button';
      copyBtn.setAttribute('aria-label', 'Скопировать');
      copyBtn.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v12h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>';

      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(codeEl.innerText);
          copyBtn.classList.add('is-copied');
          setTimeout(() => copyBtn.classList.remove('is-copied'), 1200);
        } catch (e) {
          console.error('Copy failed', e);
        }
      });

      // Кнопка переключения переноса строк
      const wrapBtn = document.createElement('button');
      wrapBtn.className = 'groq-icon-button groq-code-copy'; // используем те же стили кнопок
      wrapBtn.type = 'button';
      wrapBtn.setAttribute('aria-label', 'Переключить перенос строк');
      wrapBtn.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 7h10a4 4 0 010 8H9v3l-5-4 5-4v3h5a2 2 0 100-4H4V7z"/></svg>'.replace(
          'л',
          'l',
        );

      let wrapped = false;
      wrapBtn.addEventListener('click', () => {
        wrapped = !wrapped;
        preEl.style.whiteSpace = wrapped ? 'pre-wrap' : 'pre';
        wrapBtn.classList.toggle('is-active', wrapped);
        rawArea.style.height = wrapped ? preEl.clientHeight + 'px' : '180px';
      });

      // Кнопка просмотра raw (текстового) представления
      const rawBtn = document.createElement('button');
      rawBtn.className = 'groq-icon-button groq-code-copy';
      rawBtn.type = 'button';
      rawBtn.setAttribute('aria-label', 'Показать сырой текст');
      rawBtn.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 5h18v2H3V5zm0 6h18v2H3v-2zm0 6h18v2H3v-2z"/></svg>';

      // Создаём textarea для «сырого» вида (readonly), изначально скрытую
      const rawArea = document.createElement('textarea');
      rawArea.readOnly = true;
      rawArea.value = codeEl.innerText;
      rawArea.style.display = 'none';
      rawArea.style.width = '100%';
      rawArea.style.height = preEl.clientHeight ? preEl.clientHeight + 'px' : '180px';
      rawArea.style.resize = 'vertical';
      rawArea.style.background = 'var(--background-secondary)';
      rawArea.style.color = 'var(--text-normal)';
      rawArea.style.border =
        'var(--border-width, 1px) solid var(--background-modifier-border, #444444)';
      rawArea.style.borderTop = 'none';
      rawArea.style.fontFamily = 'var(--font-monospace)';
      rawArea.style.fontSize = '0.9em';
      rawArea.style.padding = '8px';
      rawArea.style.boxSizing = 'border-box';

      let rawVisible = false;
      rawBtn.addEventListener('click', () => {
        rawVisible = !rawVisible;
        if (rawVisible) {
          // Синхронизируем высоту при первом показе и при каждом переключении
          const h = preEl.getBoundingClientRect().height || preEl.clientHeight || 180;
          rawArea.style.height = Math.max(120, Math.round(h)).toString() + 'px';
        }
        preEl.style.display = rawVisible ? 'none' : '';
        rawArea.style.display = rawVisible ? 'block' : 'none';
      });

      actions.appendChild(rawBtn);
      actions.appendChild(wrapBtn);
      actions.appendChild(copyBtn);

      header.appendChild(langLabel);
      header.appendChild(actions);

      // Вставляем структуру: wrapper -> header + pre
      const parent = preEl.parentElement;
      if (!parent) return;
      parent.insertBefore(wrapper, preEl);
      wrapper.appendChild(header);
      wrapper.appendChild(preEl);
      wrapper.appendChild(rawArea);
    });
  };

  return (
    <div className="groq-message__content-wrapper">
      <div
        ref={containerRef}
        className="groq-markdown-content markdown-rendered"
        style={{
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          maxWidth: '100%',
        }}
      />
    </div>
  );
};

// Компонент-обертка для обратной совместимости (если app не передается)
interface GroqMarkdownLegacyProps {
  content: string;
}

export const GroqMarkdownLegacy: React.FC<GroqMarkdownLegacyProps> = ({ content }) => {
  return (
    <div className="groq-message__content-wrapper">
      <div
        className="groq-markdown-content markdown-preview"
        style={{
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          maxWidth: '100%',
        }}
        dangerouslySetInnerHTML={{ __html: simpleMarkdownRender(content) }}
      />
    </div>
  );
};

// Простой fallback-рендерер на случай недоступности Obsidian API
const simpleMarkdownRender = (text: string): string => {
  return text
    .replace(/\\\[/g, '[')
    .replace(/\\\]/g, ']')
    .replace(/\\\*/g, '*')
    .replace(/\\_/g, '_')
    .replace(/\\`/g, '`')
    .replace(/\\>/g, '>')
    .replace(/\\|/g, '|')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/~~(.*?)~~/g, '<del>$1</del>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\n/g, '<br>');
};

export default GroqMarkdown;
