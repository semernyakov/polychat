import React from 'react';
import { FiX } from 'react-icons/fi';
import { ModelInfo } from '../types/types';
import { t } from '../localization';
import '../styles.css';

interface ModelInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  modelInfo: ModelInfo;
  isAvailable: boolean;
}

export const ModelInfoDialog: React.FC<ModelInfoDialogProps> = ({
  isOpen,
  onClose,
  modelInfo,
  isAvailable,
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
          <h3>{t('modelInfo')}</h3>
          <button
            onClick={onClose}
            className="groq-dialog-close groq-icon-button"
            title={t('close')}
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
                  <span className="groq-model-info__label">{t('description')}:</span>
                  <span className="groq-model-info__value">{currentModelInfo.description}</span>
                </div>
              )}
              <div className="groq-model-info__detail">
                <span className="groq-model-info__label">{t('developer')}:</span>
                <span className="groq-model-info__value">{currentModelInfo.developer?.name || '—'}</span>
              </div>
              {typeof currentModelInfo.created === 'number' && (
                <div className="groq-model-info__detail">
                  <span className="groq-model-info__label">{t('releaseDate')}:</span>
                  <span className="groq-model-info__value">
                    {new Date(currentModelInfo.created * 1000).toISOString().slice(0, 10)}
                  </span>
                </div>
              )}
              {typeof currentModelInfo.updated === 'number' && (
                <div className="groq-model-info__detail">
                  <span className="groq-model-info__label">{t('actualDate')}:</span>
                  <span className="groq-model-info__value">
                    {new Date(currentModelInfo.updated * 1000).toISOString().slice(0, 10)}
                  </span>
                </div>
              )}
              <div className="groq-model-info__detail">
                <span className="groq-model-info__label">{t('maxTokens')}:</span>
                <span className="groq-model-info__value">
                  {typeof currentModelInfo.maxTokens === 'number' ? currentModelInfo.maxTokens : '—'}
                </span>
              </div>
              {currentModelInfo.releaseStatus && (
                <div className="groq-model-info__detail">
                  <span className="groq-model-info__label">{t('releaseStatus')}:</span>
                  <span className="groq-model-info__value">
                    {currentModelInfo.releaseStatus === 'main'
                      ? 'Основная'
                      : currentModelInfo.releaseStatus === 'preview'
                        ? 'Предварительная'
                        : currentModelInfo.releaseStatus}
                  </span>
                </div>
              )}
            </div>

            {!isAvailable && (
              <div className="groq-model-info__warning">⚠️ {t('modelUnavailable')}</div>
            )}
          </div>
        </div>

        <div className="groq-dialog-actions">
          <button onClick={onClose} className="groq-button groq-dialog-secondary-button">
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};
