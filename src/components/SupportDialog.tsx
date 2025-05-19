import React, { useEffect } from 'react';
import { FiExternalLink } from 'react-icons/fi';
import '../styles.css'; // Используем единый style.css

interface SupportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  supportLink?: string;
}

// Красивый блок благодарности с темизацией
const SupportThanksBlock: React.FC = () => {
  const locale = (window.localStorage.getItem('groq-chat-locale') || 'ru') as 'ru' | 'en';
  // Определяем тему Obsidian
  const isDark = document.body.classList.contains('theme-dark');
  const style: React.CSSProperties = {
    margin: '2em 0 1em 0',
    padding: '1em',
    borderRadius: '8px',
    textAlign: 'center',
    transition: 'background 0.3s, color 0.3s',
    background: isDark
      ? 'linear-gradient(90deg, var(--background-secondary, #23272e) 0%, #3a3f4b 100%)'
      : 'linear-gradient(90deg, var(--background-modifier-box-hover, #f2f3f5) 0%, var(--background-secondary, #fcb69f) 100%)',
    color: isDark ? 'var(--text-normal, #eee)' : 'var(--text-normal, #222)',
    border: isDark
      ? '1px solid var(--background-modifier-border, #333)'
      : '1px solid var(--background-modifier-border, #ddd)'
  };
  return (
    <div style={style}>
      {locale === 'ru'
        ? (<span>Спасибо за использование PolyChat Plugin! <br/>Вы можете <a href="https://yoomoney.ru/fundraise/194GT5A5R07.250321" target="_blank" rel="noopener noreferrer">поддержать разработку на YooMoney</a> <br/>или <a href="https://github.com/semernyakov" target="_blank" rel="noopener noreferrer">оставить отзыв</a> или <a href="https://t.me/semernyakov" target="_blank" rel="noopener noreferrer">связаться со мной в Telegram</a> 💖</span>)
        : (<span>Thank you for using PolyChat Plugin! <br/>You can <a href="https://yoomoney.ru/fundraise/194GT5A5R07.250321" target="_blank" rel="noopener noreferrer">support the author on YooMoney</a> and also <a href="https://github.com/semernyakov" target="_blank" rel="noopener noreferrer">leave a review</a> or <a href="https://t.me/semernyakov" target="_blank" rel="noopener noreferrer">contact me in Telegram</a> 💖</span>)}
    </div>
  );
};

export const SupportDialog: React.FC<SupportDialogProps> = ({
  isOpen,
  onClose,
  supportLink = 'https://yoomoney.ru/fundraise/194GT5A5R07.250321', // Используйте вашу ссылку
}) => {
  // Блокировка скролла фона при открытом диалоге
  useEffect(() => {
    const body = document.body;
    const originalOverflow = body.style.overflow;
    if (isOpen) {
      body.style.overflow = 'hidden';
    } else {
      body.style.overflow = originalOverflow; // Восстанавливаем исходное значение
    }

    // Очистка при размонтировании
    return () => {
      body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Закрытие по ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    // Очистка слушателя
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Закрытие по клику на оверлей
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Убедимся, что клик был именно по оверлею, а не по содержимому
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="groq-support-dialog-overlay" onClick={handleOverlayClick}>
      {/* Предотвращаем закрытие при клике на сам диалог */}
      <div className="groq-support-dialog" onClick={e => e.stopPropagation()}>
        <div className="groq-dialog-header">
          <h3>Поддержать разработку</h3>
          <button
            onClick={onClose}
            className="groq-dialog-close groq-icon-button" // Общий стиль для иконок-кнопок
            aria-label="Закрыть"
          >
            × {/* Можно заменить иконкой FiX */}
          </button>
        </div>

        <div className="groq-dialog-content">
          <p>
            Этот плагин разрабатывается энтузиастом в свободное время. Ваша поддержка поможет
            ускорить разработку, добавить новые функции и поддерживать проект в актуальном
            состоянии. Спасибо за использование!
          </p>
          {/* Красивый блок благодарности, как в настройках */}
          <SupportThanksBlock />
        </div>

        <div className="groq-dialog-actions">
          {/* Используем общий стиль .groq-button */}
          <a
            href={supportLink}
            target="_blank"
            rel="noopener noreferrer"
            className="groq-button groq-button--primary groq-support-button"
          >
            <FiExternalLink /> Перейти к поддержке
          </a>
          <button onClick={onClose} className="groq-button groq-dialog-secondary-button">
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
