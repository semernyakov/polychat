import React from 'react';
import { FiX } from 'react-icons/fi';
import { ModelInfo } from '../types/models';
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
  if (!isOpen) return null;

  return (
    <div className="groq-support-dialog-overlay">
      <div className="groq-support-dialog">
        <div className="groq-dialog-header">
          <h3>Информация о модели</h3>
          <button onClick={onClose} className="groq-dialog-close groq-icon-button" title="Закрыть">
            <FiX size={16} />
          </button>
        </div>

        <div className="groq-dialog-content">
          <div className="groq-model-info">
            <div className="groq-model-info__header">
              <h3>{modelInfo.name}</h3>
              <span className={`groq-model-info__status ${modelInfo.releaseStatus}`}>
                {modelInfo.releaseStatus === 'main' ? 'Основная' : 'Предварительная'}
              </span>
            </div>

            <p className="groq-model-info__description">{modelInfo.description}</p>

            <div className="groq-model-info__details">
              <div className="groq-model-info__detail">
                <span className="groq-model-info__label">Разработчик:</span>
                <span className="groq-model-info__value">{modelInfo.developer.name}</span>
              </div>

              <div className="groq-model-info__detail">
                <span className="groq-model-info__label">Категория:</span>
                <span className="groq-model-info__value">
                  {modelInfo.category === 'text'
                    ? 'Текст'
                    : modelInfo.category === 'audio'
                      ? 'Аудио'
                      : 'Видео'}
                </span>
              </div>

              <div className="groq-model-info__detail">
                <span className="groq-model-info__label">Макс. токенов:</span>
                <span className="groq-model-info__value">
                  {modelInfo.maxTokens.toLocaleString()}
                </span>
              </div>

              {modelInfo.tokensPerMinute && (
                <div className="groq-model-info__detail">
                  <span className="groq-model-info__label">Токенов в минуту:</span>
                  <span className="groq-model-info__value">
                    {modelInfo.tokensPerMinute.toLocaleString()}
                  </span>
                </div>
              )}

              {modelInfo.requestsPerMinute && (
                <div className="groq-model-info__detail">
                  <span className="groq-model-info__label">Запросов в минуту:</span>
                  <span className="groq-model-info__value">
                    {modelInfo.requestsPerMinute.toLocaleString()}
                  </span>
                </div>
              )}

              {modelInfo.maxDuration && (
                <div className="groq-model-info__detail">
                  <span className="groq-model-info__label">Макс. длительность:</span>
                  <span className="groq-model-info__value">{modelInfo.maxDuration} сек</span>
                </div>
              )}

              {modelInfo.maxFileSize && (
                <div className="groq-model-info__detail">
                  <span className="groq-model-info__label">Макс. размер файла:</span>
                  <span className="groq-model-info__value">{modelInfo.maxFileSize} МБ</span>
                </div>
              )}
            </div>

            {!isAvailable && (
              <div className="groq-model-info__warning">⚠️ Эта модель временно недоступна</div>
            )}
          </div>
        </div>

        <div className="groq-dialog-actions">
          <button onClick={onClose} className="groq-button groq-dialog-secondary-button">
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
