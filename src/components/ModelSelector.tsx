import React from 'react';
import '../styles.css'; // Используем единый style.css
import { GroqModel, getModelInfo } from '../types/models'; // Убедитесь, что типы существуют

interface ModelSelectorProps {
  selectedModel: GroqModel;
  onSelectModel: (model: GroqModel) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onSelectModel }) => {
  return (
    <div className="groq-model-selector">
      {/* Скрываем label визуально, но оставляем для доступности */}
      <label htmlFor="model-select" className="groq-visually-hidden">
        Выберите модель Groq:
      </label>
      <select
        id="model-select"
        value={selectedModel}
        onChange={e => onSelectModel(e.target.value as GroqModel)}
        className="groq-select"
        aria-label="Выберите модель Groq" // Добавляем aria-label
      >
        {Object.values(GroqModel).map(model => {
          // Получаем информацию о модели, обрабатываем возможную ошибку
          const modelInfo = getModelInfo(model);
          return (
            <option key={model} value={model}>
              {modelInfo?.name || model} {/* Показываем имя или ID модели */}
            </option>
          );
        })}
      </select>
    </div>
  );
};
