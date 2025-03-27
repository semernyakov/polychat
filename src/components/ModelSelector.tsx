import React from 'react';
import '../styles.css'; // Добавьте эту строку для импорта стилей
import { GroqModel, getModelInfo } from '../types/models';

interface ModelSelectorProps {
  selectedModel: GroqModel;
  onSelectModel: (model: GroqModel) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onSelectModel }) => {
  return (
    <div className="groq-model-selector">
      <label htmlFor="model-select" className="groq-label">
        Модель:&nbsp;
      </label>
      <select
        id="model-select"
        value={selectedModel}
        onChange={e => onSelectModel(e.target.value as GroqModel)}
        className="groq-select"
        aria-label="Выберите модель"
      >
        {Object.values(GroqModel).map(model => (
          <option key={model} value={model}>
            {getModelInfo(model).name}
          </option>
        ))}
      </select>
    </div>
  );
};
