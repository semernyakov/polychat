import React from 'react';
import { GroqModel } from '../constants/models';

interface ModelSelectorProps {
  models: GroqModel[];
  selectedModel: string;
  onSelectModel: (model: string) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModel,
  onSelectModel,
}) => {
  return (
    <div className="groq-model-selector">
      <label htmlFor="model-select">Модель:</label>
      <select
        id="model-select"
        value={selectedModel}
        onChange={e => onSelectModel(e.target.value)}
        className="groq-select"
      >
        {models.map(model => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>
    </div>
  );
};
