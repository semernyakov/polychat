import React, { KeyboardEvent } from 'react';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = 'Введите сообщение...',
}) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="groq-message-input">
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={3}
      />
      <div className="groq-message-input__hint">
        Максимальное количество символов: 1000 <br />
        Нажмите <kbd>Enter</kbd> для отправки сообщения, <kbd>Shift + Enter</kbd> для переноса
        строки
      </div>
      <div className="groq-message-input__counter">
        <small>{value.length} / 1000</small>
      </div>
      <button
        onClick={onSend}
        disabled={disabled || !value.trim()}
        aria-label="Отправить сообщение"
      >
        Отправить
      </button>
    </div>
  );
};
