import React, { useState, useEffect } from 'react';
import '../styles.css'; // Используем единый style.css
import { GroqPluginInterface } from '../types/plugin';
import { toast } from 'react-toastify'; // Импортируем toast

// Используем DynamicModelInfo для моделей
interface DynamicModelInfo {
  id: string;
  name: string;
  description?: string;
}



export interface ModelSelectorProps {
  plugin: GroqPluginInterface;
  selectedModel: string;
  onSelectModel: (_modelId: string) => void;
  getAvailableModels: () => Promise<{ id: string; name: string; description?: string }[]>;
  availableModels?: any[];
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  plugin: _plugin,
  selectedModel,
  onSelectModel,
  getAvailableModels,
  availableModels: availableModelsProp,
}) => {
  // Если availableModels передан как проп, используем его, иначе локальный state
  const [availableModels, setAvailableModels] = useState<DynamicModelInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (availableModelsProp) {
      setIsLoading(false);
      setAvailableModels(availableModelsProp);
      return;
    }
    const fetchAvailableModels = async () => {
      setIsLoading(true);
      try {
        const models = await getAvailableModels();
        // Фильтруем только активные
        const activeModels = Array.isArray(_plugin.settings.groqAvailableModels)
          ? models.filter(m =>
              _plugin.settings.groqAvailableModels?.find(
                s => s.id === m.id && s.isActive !== false,
              ),
            )
          : models;
        setAvailableModels(
          activeModels.map((m: any) => ({ ...m })),
        );
      } catch (error) {
        console.error('Failed to fetch available models:', error);
        setAvailableModels([]);
        toast.error('Не удалось загрузить список доступных моделей.'); // Добавляем toast
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableModels();
  }, [getAvailableModels, _plugin.settings.groqAvailableModels, availableModelsProp]); // Добавляем зависимость

  if (isLoading) {
    return <div className="groq-model-selector">Загрузка моделей...</div>;
  }

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value as string;
    onSelectModel(selectedValue);
  };

  return (
    <div className="groq-model-selector">
      {/* Скрываем label визуально, но оставляем для доступности */}
      {/*<label htmlFor="model-select" className="groq-visually-hidden"></label>*/}
      <select
        id="model-select"
        value={selectedModel}
        onChange={handleChange}
        className="groq-select"
        aria-label="Выберите модель Groq"
      >
        {availableModels.map(modelInfo => {
          const displayName = `${modelInfo.name}`;

          return (
            <option key={modelInfo.id} value={modelInfo.id}>
              {displayName}
            </option>
          );
        })}
      </select>
    </div>
  );
};
