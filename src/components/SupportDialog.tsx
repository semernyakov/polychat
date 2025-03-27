import React, { useEffect } from 'react';
import { FiExternalLink } from 'react-icons/fi';
import '../styles.css';

interface SupportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  supportLink?: string;
}

export const SupportDialog: React.FC<SupportDialogProps> = ({
  isOpen,
  onClose,
  supportLink = 'https://yoomoney.ru/fundraise/194GT5A5R07.250321',
}) => {
  // Блокировка скролла при открытом диалоге
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
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

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="groq-support-dialog-overlay" onClick={onClose}>
      <div className="groq-support-dialog" onClick={e => e.stopPropagation()}>
        <div className="groq-dialog-header">
          <h3>Поддержать разработку</h3>
          <button
            onClick={onClose}
            className="groq-dialog-close"
            aria-label="Закрыть"
          >
            &times;
          </button>
        </div>

        <div className="groq-dialog-content">
          <p>
            Мы используем сервис Юмани для сбора средств на развитие проекта.
            Ваша поддержка поможет улучшить плагин и добавить новые функции.
          </p>

          {/*<div className="groq-dialog-qr">*/}
          {/*  <img*/}
          {/*    src="https://yoomoney.ru/transfer/money-form/qr?receiver=410011000000000&quickpay-form=small&sum=100&targets=Поддержка плагина Obsidian"*/}
          {/*    alt="QR-код для перевода"*/}
          {/*    width={150}*/}
          {/*    onError={(e) => {*/}
          {/*      (e.target as HTMLImageElement).style.display = 'none';*/}
          {/*    }}*/}
          {/*  />*/}
          {/*</div>*/}
        </div>

        <div className="groq-dialog-actions">
          <a
            href={supportLink}
            target="_blank"
            rel="noopener noreferrer"
            className="groq-support-button"
          >
            <FiExternalLink /> Перейти к оплате
          </a>
          <button
            onClick={onClose}
            className="groq-dialog-secondary-button"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
