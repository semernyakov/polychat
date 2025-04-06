import React, { useState, useRef, useEffect } from 'react';
import { FiSend } from 'react-icons/fi';
import '../styles.css'; // Используем единый стиль

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
  maxTokens?: number;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChange,
  onSend,
  onKeyDown,
  disabled = false,
  maxTokens,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isComposing, setIsComposing] = useState(false); // Для поддержки IME

  // Автоматическое изменение высоты textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Сброс высоты
      textarea.style.height = `${textarea.scrollHeight}px`; // Установка новой
    }
  }, [value]);

  // Обработчик клавиш
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isComposing) return;

    // Shift+Enter = перенос строки (по умолчанию)
    if (event.key === 'Enter' && event.shiftKey) {
      return;
    }

    // Ctrl+Enter или Cmd+Enter = отправка
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();

      const trimmedValue = value.trim();
      if (!disabled && trimmedValue) {
        onSend();
      }
    }

    // Дополнительно вызываем внешний обработчик
    if (onKeyDown) {
      onKeyDown(event);
    }
  };

  const handleSendClick = () => {
    if (!disabled && value.trim()) {
      onSend();
    }
  };

  const currentLength = value.length;
  const isOverLimit = !!(maxTokens && currentLength > maxTokens);
  const isSendDisabled = Boolean(disabled || !value.trim() || isOverLimit);

  return (
    <div className="groq-chat-input">
      <div className="groq-chat-input__main">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(_e) => onChange(_e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          placeholder="Введите сообщение..."
          disabled={disabled}
          rows={1}
          className="groq-chat-input__textarea"
          aria-label="Поле ввода сообщения"
        />
        <button
          onClick={handleSendClick}
          disabled={isSendDisabled}
          className="groq-button groq-button--primary groq-chat-input__send-button"
          aria-label="Отправить сообщение"
          title="Отправить (Ctrl+Enter)"
        >
          <FiSend size={18} />
        </button>
      </div>
      <div className="groq-chat-input__footer">
        <span className="groq-message-input__hint">
          <kbd>Ctrl</kbd>+<kbd>Enter</kbd> — отправить, <kbd>Shift</kbd>+<kbd>Enter</kbd> — новая
          строка
        </span>
        {maxTokens !== undefined && (
          <span
            className="groq-message-input__counter"
            style={{ color: isOverLimit ? 'var(--text-error)' : 'inherit' }}
            title="Текущее кол-во символов / Макс. кол-во токенов для модели (приблизительное сравнение)"
          >
            {currentLength.toLocaleString()}/{maxTokens.toLocaleString()} (символы/токены)
          </span>
        )}
      </div>
    </div>
  );
};
