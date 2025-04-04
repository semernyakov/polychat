import React, { useState, useRef, useEffect } from 'react';
import { FiSend } from 'react-icons/fi';
import '../styles.css'; // Используем единый style.css

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  maxLength?: number;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChange,
  onSend,
  disabled = false,
  maxLength,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isComposing, setIsComposing] = useState(false); // Для поддержки IME

  // Автоматическое изменение высоты textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Сброс высоты для правильного расчета scrollHeight
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${scrollHeight}px`;
    }
  }, [value]);

  // Обработчик нажатия клавиш для Ctrl+Enter
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // console.log('KeyDown Event:', event.key, 'Ctrl:', event.ctrlKey, 'Meta:', event.metaKey, 'Composing:', isComposing); // DEBUG

    // Не отправляем, если идет ввод с помощью IME
    if (isComposing) {
        // console.log('KeyDown prevented: IME composition'); // DEBUG
        return;
    }

    // Проверяем Ctrl+Enter (или Cmd+Enter для Mac)
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      // console.log('KeyDown detected: Ctrl+Enter'); // DEBUG
      event.preventDefault(); // Предотвращаем вставку новой строки

      const trimmedValue = value.trim();
      if (!disabled && trimmedValue) { // Отправляем только если не отключено и есть текст
        // console.log('KeyDown calling onSend()'); // DEBUG
        onSend();
      } else {
        // console.log('KeyDown prevented: Disabled or empty value'); // DEBUG
      }
    }
  };

  const handleSendClick = () => {
    if (!disabled && value.trim()) {
      onSend();
    }
  };

  const currentLength = value.length;
  const isOverLimit = !!(maxLength && currentLength > maxLength);
  const isSendDisabled = Boolean(disabled || !value.trim() || isOverLimit);

  return (
    <div className="groq-chat-input">
      <div className="groq-chat-input__main">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown} // Привязываем обработчик
          onCompositionStart={() => {
            // console.log('Composition Start'); // DEBUG
            setIsComposing(true);
          }}
          onCompositionEnd={() => {
            // console.log('Composition End'); // DEBUG
            setIsComposing(false);
          }}
          placeholder="Введите сообщение..."
          disabled={disabled}
          rows={1}
          className="groq-chat-input__textarea"
          aria-label="Поле ввода сообщения"
          maxLength={maxLength}
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
          <kbd>Ctrl</kbd>+<kbd>Enter</kbd> для отправки
        </span>
        {maxLength && (
          <span
            className="groq-message-input__counter"
            style={{ color: isOverLimit ? 'var(--text-error)' : 'inherit' }}
          >
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
};
