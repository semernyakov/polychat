import React from 'react';
import '../styles.css'; // Добавьте эту строку для импорта стилей
import { t } from '../localization';
import type { Locale } from '../localization';

interface SupportButtonProps {
  onClick?: () => void;
  supportLink?: string;
}

export const SupportButton: React.FC<SupportButtonProps> = ({
  onClick,
  supportLink = 'https://yoomoney.ru/fundraise/194GT5A5R07.250321',
}) => {
  const appLang = (window as any)?.app?.getLanguage?.();
  const language = (appLang && appLang.toLowerCase().startsWith('ru') ? 'ru' : 'en') as Locale;
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
