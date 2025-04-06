import React, { useState, useEffect } from 'react';
import '../styles.css'; // Используем единый style.css
import { GroqModel, MODEL_INFO } from '../types/models'; // Удаляем getModelInfo
import { GroqPluginInterface } from '../types/plugin';
import { toast } from 'react-toastify'; // Импортируем toast

interface ModelSelectorProps {
  plugin: GroqPluginInterface;
  selectedModel: GroqModel; // Этот параметр может быть не нужен, если мы читаем из plugin.settings
  onSelectModel: (model: GroqModel) => void;
  getAvailableModels: () => Promise<GroqModel[]>; // Добавляем prop для получения доступных моделей
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  plugin: _plugin,
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
        console.error('Failed to fetch available models:', error);
        setAvailableModels([]);
        toast.error('Не удалось загрузить список доступных моделей.'); // Добавляем toast
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableModels();
  }, [getAvailableModels]); // Зависимость от getAvailableModels

  if (isLoading) {
    return <div className="groq-model-selector">Загрузка моделей...</div>;
  }

  // Получаем все модели из MODEL_INFO для итерации
  const allModelInfos = Object.values(MODEL_INFO);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value as GroqModel;
    onSelectModel(selectedValue);
  };

  return (
    <div className="groq-model-selector">
      {/* Скрываем label визуально, но оставляем для доступности */}
      <label htmlFor="model-select" className="groq-visually-hidden">
        Выберите модель Groq:
      </label>
      <select
        id="model-select"
        value={selectedModel}
        onChange={handleChange}
        className="groq-select"
        aria-label="Выберите модель Groq"
      >
        {allModelInfos.map(modelInfo => {
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
        })}
      </select>
    </div>
  );
};
