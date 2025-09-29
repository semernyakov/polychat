import React from 'react';
import { Locale, t } from '../localization';
import '../styles.css';

interface StreamingIndicatorProps {
  language?: Locale;
  className?: string;
}

export const StreamingIndicator: React.FC<StreamingIndicatorProps> = React.memo(
  ({ language = 'en', className = '' }) => {
    return (
      <div className={`groq-streaming-indicator ${className}`}>
        <div className="groq-streaming-indicator__message">
          <div className="groq-streaming-indicator__avatar">
            <div className="groq-streaming-indicator__avatar-icon">AI</div>
          </div>
          <div className="groq-streaming-indicator__content">
            <div className="groq-streaming-indicator__header">
              <span className="groq-streaming-indicator__role">{t('assistant', language)}</span>
            </div>
            <div className="groq-streaming-indicator__body">
              <div className="groq-streaming-indicator__text">
                <span className="groq-streaming-indicator__typing">
                  {t('modelIsThinking', language)}
                </span>
                <div className="groq-streaming-indicator__dots">
                  <span className="groq-streaming-indicator__dot"></span>
                  <span className="groq-streaming-indicator__dot"></span>
                  <span className="groq-streaming-indicator__dot"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

StreamingIndicator.displayName = 'StreamingIndicator';
