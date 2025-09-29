import React, { useEffect } from 'react';
import { FiExternalLink } from 'react-icons/fi';
import '../styles.css'; // Используем единый style.css
import { t, tHtml } from '../localization';

interface SupportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  supportLink?: string;
  locale?: import('../localization').Locale;
}

// Красивый блок благодарности с темизацией
const SupportThanksBlock: React.FC<{ locale: import('../localization').Locale }> = ({ locale }) => {
  return (
    <div className="groq-support-thanks">
      <div className="groq-support-thanks__text">
        {t('supportDialogThanksTitle', locale)}
      </div>
      <div className="groq-support-thanks__links">
        <a
          href="https://yoomoney.ru/fundraise/194GT5A5R07.250321"
          target="_blank"
          rel="noopener noreferrer"
          className="groq-support-thanks__link"
        >
          {t('supportDialogThanksSupport', locale)}
        </a>
        <br />
        <a
          href="https://github.com/semernyakov"
          target="_blank"
          rel="noopener noreferrer"
          className="groq-support-thanks__link"
        >
          {t('supportDialogThanksReview', locale)}
        </a>{' '}
        {t('supportDialogThanksContact', locale)}{' '}
        <a
          href="https://t.me/semernyakov"
          target="_blank"
          rel="noopener noreferrer"
          className="groq-support-thanks__link"
        >
          Telegram
        </a>{' '}
        ❤️
      </div>
    </div>
  );
};

export const SupportDialog: React.FC<SupportDialogProps> = ({
  isOpen,
  onClose,
  supportLink = 'https://yoomoney.ru/fundraise/194GT5A5R07.250321', // Используйте вашу ссылку
  locale = 'en',
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
          <h3>{t('supportDialogTitle', locale)}</h3>
          <button
            onClick={onClose}
            className="groq-dialog-close groq-icon-button" // Общий стиль для иконок-кнопок
            aria-label={t('supportDialogClose', locale)}
          >
            × {/* Можно заменить иконкой FiX */}
          </button>
        </div>

        <div className="groq-dialog-content">
          <p
            className="groq-dialog-content__text"
            dangerouslySetInnerHTML={tHtml('supportDialogContent', locale)}
          />
          {/* Красивый блок благодарности, как в настройках */}
          <SupportThanksBlock locale={locale} />
        </div>

        <div className="groq-dialog-actions">
          {/* Используем общий стиль .groq-button */}
          <a
            href={supportLink}
            target="_blank"
            rel="noopener noreferrer"
            className="groq-button groq-button--primary groq-support-button"
          >
            <FiExternalLink /> {t('supportDialogGoToSupport', locale)}
          </a>
          <button onClick={onClose} className="groq-button groq-dialog-secondary-button">
            {t('supportDialogClose', locale)}
          </button>
        </div>
      </div>
    </div>
  );
};
