import React from 'react';
import { FiX } from 'react-icons/fi';
import { ModelInfo } from '../types/types';
import { t, Locale } from '../localization';
import '../styles.css';

interface ModelInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  modelInfo: ModelInfo;
  isAvailable: boolean;
  locale?: Locale;
}

export const ModelInfoDialog: React.FC<ModelInfoDialogProps> = ({
  isOpen,
  onClose,
  modelInfo,
  isAvailable,
  locale = 'en',
}) => {
  const prevModelIdRef = React.useRef<string>(modelInfo.id);
  const [currentModelInfo, setCurrentModelInfo] = React.useState(modelInfo);
  const [isDialogOpen, setIsDialogOpen] = React.useState(isOpen);

  // Update current model info when modelInfo prop changes and dialog is open
  React.useEffect(() => {
    if (isOpen && modelInfo.id !== prevModelIdRef.current) {
      setCurrentModelInfo(modelInfo);
      prevModelIdRef.current = modelInfo.id;
    }
  }, [isOpen, modelInfo]);

  // Handle dialog open/close state
  React.useEffect(() => {
    if (isOpen !== isDialogOpen) {
      setIsDialogOpen(isOpen);
      // When opening, ensure we have the latest model info
      if (isOpen) {
        setCurrentModelInfo(modelInfo);
      }
    }
  }, [isOpen, isDialogOpen, modelInfo]);

  if (!isDialogOpen) return null;

  return (
    <div className="groq-support-dialog-overlay">
      <div className="groq-support-dialog">
        <div className="groq-dialog-header">
          <h3>{t('modelInfo', locale)}</h3>
          <button
            onClick={onClose}
            className="groq-dialog-close groq-icon-button"
          >
            <FiX size={16} />
          </button>
        </div>

        <div className="groq-dialog-content">
          <div className="groq-model-info">
            <div className="groq-model-info__header">
              <h3>{currentModelInfo.name || currentModelInfo.id}</h3>
            </div>

            <div className="groq-model-info__details">
              {currentModelInfo.description && currentModelInfo.description.trim() !== '' && (
                <div className="groq-model-info__detail">
                  <span className="groq-model-info__label">{t('description', locale)}:</span>
                  <span className="groq-model-info__value">{currentModelInfo.description}</span>
                </div>
              )}
              <div className="groq-model-info__detail">
                <span className="groq-model-info__label">{t('developer', locale)}:</span>
                <span className="groq-model-info__value">
                  {currentModelInfo.developer?.name || '—'}
                </span>
              </div>
              {typeof currentModelInfo.created === 'number' && (
                <div className="groq-model-info__detail">
                  <span className="groq-model-info__label">{t('releaseDate', locale)}:</span>
                  <span className="groq-model-info__value">
                    {new Date(currentModelInfo.created * 1000).toISOString().slice(0, 10)}
                  </span>
                </div>
              )}
              {typeof currentModelInfo.updated === 'number' && (
                <div className="groq-model-info__detail">
                  <span className="groq-model-info__label">{t('actualDate', locale)}:</span>
                  <span className="groq-model-info__value">
                    {new Date(currentModelInfo.updated * 1000).toISOString().slice(0, 10)}
                  </span>
                </div>
              )}
              <div className="groq-model-info__detail">
                <span className="groq-model-info__label">{t('maxTokens', locale)}:</span>
                <span className="groq-model-info__value">
                  {typeof currentModelInfo.maxTokens === 'number'
                    ? currentModelInfo.maxTokens
                    : '—'}
                </span>
              </div>
              {currentModelInfo.releaseStatus && (
                <div className="groq-model-info__detail">
                  <span className="groq-model-info__label">{t('releaseStatus', locale)}:</span>
                  <span className="groq-model-info__value">
                    {currentModelInfo.releaseStatus === 'main'
                      ? locale === 'ru'
                        ? 'Основная'
                        : 'Main'
                      : currentModelInfo.releaseStatus === 'preview'
                        ? locale === 'ru'
                          ? 'Предварительная'
                          : 'Preview'
                        : currentModelInfo.releaseStatus}
                  </span>
                </div>
              )}
            </div>

            {!isAvailable && (
              <div className="groq-model-info__warning" role="alert" aria-live="polite">
                ⚠️ {t('modelUnavailable', locale)}
              </div>
            )}
          </div>
        </div>

        <div className="groq-dialog-actions">
          <button onClick={onClose} className="groq-button groq-dialog-secondary-button">
            {t('close', locale)}
          </button>
        </div>
      </div>
    </div>
  );
};
