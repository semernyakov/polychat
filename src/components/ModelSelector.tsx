import React from 'react';
import { GroqModel, MODEL_DISPLAY_NAMES } from '../constants/models';

interface ModelSelectorProps {
    selectedModel: GroqModel;
    onModelChange: (model: GroqModel) => void;
    disabled?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
    selectedModel,
    onModelChange,
    disabled = false
}) => {
    return (
        <select
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value as GroqModel)}
            disabled={disabled}
            className="groq-model-selector"
        >
            {Object.values(GroqModel).map((model) => (
                <option key={model} value={model}>
                    {MODEL_DISPLAY_NAMES[model]}
                </option>
            ))}
        </select>
    );
};