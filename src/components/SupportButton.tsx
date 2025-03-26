import React from 'react';

interface SupportButtonProps {
  onClick?: () => void;
  supportLink?: string;
}

export const SupportButton: React.FC<SupportButtonProps> = ({
  onClick,
  supportLink = 'https://yoomoney.ru/fundraise/194GT5A5R07.250321',
}) => {
  const handleClick = () => {
    onClick?.();
    window.open(supportLink, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="groq-support-button"
      aria-label="Поддержать разработку"
      title="Поддержать разработку"
    >
      <span className="groq-heart-icon">❤️</span>
      <span className="groq-support-text">Поддержать</span>
    </button>
  );
};
