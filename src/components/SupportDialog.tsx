import React from 'react';

interface SupportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportDialog: React.FC<SupportDialogProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="groq-support-dialog-overlay">
      <div className="groq-support-dialog">
        <h3>Поддержать разработку плагина Groq Chat Plugin</h3>
        <p>
          Разработка плагина ведется на добровольной основе. Если вы считаете этот плагин полезным, пожалуйста, рассмотрите возможность финансовой поддержки его разработки.
        </p>
        <p>
          100% взноса пойдет разработчику плагина. Платформа для сбора средств, выбранная разработчиком, может взимать дополнительную плату.
        </p>
        <a
          href="https://yoomoney.ru/fundraise/194GT5A5R07.250321"
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
  );
}; 