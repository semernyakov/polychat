import React, { useState, useEffect } from 'react';
import '../styles.css'; // Используем единый style.css
import { GroqModel, MODEL_INFO, getModelInfo } from '../types/models'; // Убедитесь, что типы существуют

interface ModelSelectorProps {
  selectedModel: GroqModel;
  onSelectModel: (model: GroqModel) => void;
  getAvailableModels: () => Promise<GroqModel[]>; // Добавляем prop для получения доступных моделей
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onSelectModel,
  getAvailableModels, // Получаем функцию как prop
}) => {
  const [availableModels, setAvailableModels] = useState<GroqModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAvailableModels = async () => {
      setIsLoading(true);
      try {
        const models = await getAvailableModels();
        setAvailableModels(models);
      } catch (error) {
        console.error("Failed to fetch available models:", error);
        // Оставляем список доступных моделей пустым в случае ошибки
        setAvailableModels([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableModels();
  }, [getAvailableModels]); // Зависимость от getAvailableModels

  // Получаем все модели из MODEL_INFO для итерации
  const allModelInfos = Object.values(MODEL_INFO);
  const selectedModelInfo = getModelInfo(selectedModel);
  const isAvailable = availableModels.includes(selectedModel);

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
        disabled={isLoading} // Блокируем селектор во время загрузки
      >
        {isLoading ? (
          <option value="">Загрузка моделей...</option>
        ) : (
          allModelInfos.map(modelInfo => {
            const isAvailable = availableModels.includes(modelInfo.id);
            const displayName = `${modelInfo.name}${!isAvailable ? ' (недоступна)' : ''}`;

            return (
              <option
                key={modelInfo.id}
                value={modelInfo.id}
                disabled={!isAvailable} // Блокируем выбор недоступной модели
              >
                {displayName}
              </option>
            );
          })
        )}
      </select>
    </div>
  );
};
