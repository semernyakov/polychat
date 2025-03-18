import React from 'react';
import { GroqModel, GROQ_MODELS } from '../constants';

interface ModelSelectorProps {
    selectedModel: GroqModel;
    onModelChange: (model: GroqModel) => void;
    models?: GroqModel[];
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
    selectedModel,
    onModelChange,
    models = [GROQ_MODELS.LLAMA_3_8B]
}) => {
    return (
        <div className="model-selector">
            <select 
                value={selectedModel} 
                onChange={(e) => onModelChange(e.target.value as GroqModel)}
                className="model-select"
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