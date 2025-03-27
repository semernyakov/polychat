import React, { KeyboardEvent, useRef, useEffect } from 'react';
import '../styles.css';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export const MessageInput: React.FC<MessageInputProps> = React.memo(({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = 'Введите сообщение...',
  maxLength = 1000,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  return (
    <div className="groq-chat-input">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
        maxLength={maxLength}
      />
      <div className="groq-message-input__hint">
        Нажмите <kbd>Enter</kbd> для отправки, <kbd>Shift+Enter</kbd> для переноса строки
      </div>
      <div className="groq-message-input__counter">
        {value.length} / {maxLength}
      </div>
      <button
        onClick={onSend}
        disabled={disabled || !value.trim()}
        className="groq-button groq-button--primary"
      >
        Отправить
      </button>
    </div>
  );
});
