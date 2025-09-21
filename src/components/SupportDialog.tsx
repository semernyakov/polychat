import React, { useEffect } from 'react';
import { FiExternalLink } from 'react-icons/fi';
import '../styles.css'; // Используем единый style.css
import { t, tHtml } from '../localization';

interface SupportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  supportLink?: string;
}

// Красивый блок благодарности с темизацией
const SupportThanksBlock: React.FC = () => {
  return (
    <div className="groq-support-thanks">
      <span className="groq-support-thanks__text">{t('supportDialogThanks')}</span>
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

    if (isOpen) {
      body.classList.add('groq-dialog-open');
    } else {
      body.classList.remove('groq-dialog-open');
    }

    // Очистка при размонтировании
    return () => {
      body.classList.remove('groq-dialog-open');
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
          <h3>{t('supportDialogTitle')}</h3>
          <button
            onClick={onClose}
            className="groq-dialog-close groq-icon-button" // Общий стиль для иконок-кнопок
            aria-label={t('supportDialogClose')}
          >
            × {/* Можно заменить иконкой FiX */}
          </button>
        </div>

        <div className="groq-dialog-content">
          <p
            className="groq-dialog-content__text"
            dangerouslySetInnerHTML={tHtml('supportDialogContent')}
          />
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
            <FiExternalLink /> {t('supportDialogGoToSupport')}
          </a>
          <button onClick={onClose} className="groq-button groq-dialog-secondary-button">
            {t('supportDialogClose')}
          </button>
        </div>
      </div>
    </div>
  );
};
