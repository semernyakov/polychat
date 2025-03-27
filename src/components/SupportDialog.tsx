import React from 'react';
import '../styles.css'; // Добавьте эту строку для импорта стилей

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
  if (!isOpen) return null;

  return (
    <div className="groq-support-dialog-overlay" onClick={onClose}>
      <div className="groq-support-dialog" onClick={e => e.stopPropagation()}>
        <h3>Поддержать разработку</h3>
        <div className="groq-dialog-body">
          <p>
            Если вам нравится этот плагин, рассмотрите возможность поддержать разработчика. Это
            поможет в дальнейшем развитии проекта.
          </p>
          <div className="groq-dialog-actions">
            <a
              href={supportLink}
              target="_blank"
              rel="noopener noreferrer"
              className="groq-support-button"
            >
              Поддержать
            </a>
            <button onClick={onClose} className="groq-close-button">
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
