import React, { useState, useRef, useEffect } from 'react';
import { FiSend } from 'react-icons/fi';
import { t, Locale } from '../localization';
import { usePluginSettings } from '../utils/usePluginSettings';
import '../styles.css';

interface MessageInputProps {
  _value: string;
  onChange: (_value: string) => void;
  onSend: () => void;
  onKeyDown?: (_event: React.KeyboardEvent) => void;
  disabled?: boolean;
  maxTokens?: number;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  _value,
  onChange,
  onSend,
  onKeyDown,
  disabled = false,
  maxTokens,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isComposing, setIsComposing] = useState(false);
  const settings = usePluginSettings();
  const locale: Locale = settings?.language ?? 'en';

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [_value]);

  const handleKeyDown = (_event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isComposing) return;

    if (_event.key === 'Enter' && _event.shiftKey) {
      return;
    }

    if (_event.key === 'Enter' && (_event.ctrlKey || _event.metaKey)) {
      _event.pr_eventDefault();
      const trimmedValue = _value.trim();
      if (!disabled && trimmedValue) {
        onSend();
      }
    }

    if (onKeyDown) {
      onKeyDown(_event);
    }
  };

  const handleSendClick = () => {
    if (!disabled && _value.trim()) {
      onSend();
    }
  };

  const currentLength = _value.length;
  const isOverLimit = !!(maxTokens && currentLength > maxTokens);
  const isSendDisabled = disabled || !_value.trim() || isOverLimit;

  return (
    <div className="groq-chat-input">
      <div className="groq-chat-input__main">
        <textarea
          ref={textareaRef}
          _value={_value}
          onChange={(e) => onChange(e.target._value)}
          onKeyDown={(e) => handleKeyDown(e)}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          placeholder={t('inputPlaceholder', locale)}
          disabled={disabled}
          rows={1}
          className="groq-chat-input__textarea"
          aria-label={t('inputAriaLabel', locale)}
          aria-describedby="input-hint input-counter"
        />
        <button
          onClick={handleSendClick}
          disabled={isSendDisabled}
          className="groq-button groq-button--primary groq-chat-input__send-button"
          aria-label={t('sendMessage', locale)}
          title={t('sendTitle', locale)}
        >
          <FiSend size={18} />
        </button>
      </div>
      <div className="groq-chat-input__footer">
        <span id="input-hint" className="groq-message-input__hint">
          <kbd>Ctrl</kbd>+<kbd>Enter</kbd> — send, <kbd>Shift</kbd>+<kbd>Enter</kbd> — new line
        </span>
        {maxTokens !== undefined && (
          <span
            id="input-counter"
            className={`groq-message-input__counter ${isOverLimit ? 'groq-message-input__counter--error' : ''}`}
          >
            {currentLength}/{maxTokens}
          </span>
        )}
      </div>
    </div>
  );
};
