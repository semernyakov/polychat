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
  // Добавим стили для визуальных отступов между параметрами
  React.useEffect(() => {
    const styleId = 'groq-model-info-spacing-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        .groq-model-info__detail {
          margin-bottom: 10px;
          display: flex;
          gap: 8px;
        }
        .groq-model-info__label {
          min-width: 140px;
          font-weight: 500;
        }
        .groq-model-info__value {
          flex: 1;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);
  React.useEffect(() => {
    // Логируем для отладки, чтобы убедиться, что данные приходят актуальные
    // console.log('[ModelInfoDialog] modelInfo:', modelInfo);
  }, [modelInfo]);
  if (!isOpen) return null;

  return (
    <div className="groq-support-dialog-overlay">
      <div className="groq-support-dialog">
        <div className="groq-dialog-header">
          <h3>{t('modelInfo')}</h3>
          <button onClick={onClose} className="groq-dialog-close groq-icon-button" title={t('close')}>
            <FiX size={16} />
          </button>
        </div>

        <div className="groq-dialog-content">
          <div className="groq-model-info">
            <div className="groq-model-info__header">
              <h3>{modelInfo.name || modelInfo.id}</h3>
            </div>

            <div className="groq-model-info__details">
              {modelInfo.description && modelInfo.description.trim() !== '' && (
                <div className="groq-model-info__detail">
                  <span className="groq-model-info__label">{t('description')}:</span>
                  <span className="groq-model-info__value">{modelInfo.description}</span>
                </div>
              )}
              <div className="groq-model-info__detail">
                <span className="groq-model-info__label">{t('developer')}:</span>
                <span className="groq-model-info__value">{modelInfo.developer?.name || '—'}</span>
              </div>
              {typeof modelInfo.created === 'number' && (
                <div className="groq-model-info__detail">
                  <span className="groq-model-info__label">{t('releaseDate')}:</span>
                  <span className="groq-model-info__value">{new Date(modelInfo.created * 1000).toISOString().slice(0, 10)}</span>
                </div>
              )}
              {typeof modelInfo.updated === 'number' && (
                <div className="groq-model-info__detail">
                  <span className="groq-model-info__label">{t('actualDate')}:</span>
                  <span className="groq-model-info__value">{new Date(modelInfo.updated * 1000).toISOString().slice(0, 10)}</span>
                </div>
              )}
              <div className="groq-model-info__detail">
                <span className="groq-model-info__label">{t('maxTokens')}:</span>
                <span className="groq-model-info__value">{typeof modelInfo.maxTokens === 'number' ? modelInfo.maxTokens : '—'}</span>
              </div>
              {modelInfo.releaseStatus && (
                <div className="groq-model-info__detail">
                  <span className="groq-model-info__label">{t('releaseStatus')}:</span>
                  <span className="groq-model-info__value">{modelInfo.releaseStatus === 'main' ? 'Основная' : modelInfo.releaseStatus === 'preview' ? 'Предварительная' : modelInfo.releaseStatus}</span>
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
