import React from 'react';

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
    <div className="groq-dialog-overlay" onClick={onClose}>
      <div className="groq-dialog-content" onClick={e => e.stopPropagation()}>
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
              className="groq-button primary"
            >
              Поддержать
            </a>
            <button onClick={onClose} className="groq-button secondary">
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
