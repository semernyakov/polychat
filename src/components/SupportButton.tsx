import React from 'react';
import '../styles.css'; // Добавьте эту строку для импорта стилей
import { t } from '../localization';
import { usePluginSettings } from '../utils/usePluginSettings';

interface SupportButtonProps {
  onClick?: () => void;
  supportLink?: string;
}

export const SupportButton: React.FC<SupportButtonProps> = ({
  onClick,
  supportLink = 'https://yoomoney.ru/fundraise/194GT5A5R07.250321',
}) => {
  const settings = usePluginSettings();
  const language = settings?.language || 'en';
  const handleClick = () => {
    onClick?.();
    window.open(supportLink, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="groq-support-button"
      aria-label={t('supportDev', language)}
      title={t('supportDev', language)}
    >
      <span className="groq-heart-icon">❤️</span>
      <span className="groq-support-text">{t('supportDevShort', language)}</span>
    </button>
  );
};
