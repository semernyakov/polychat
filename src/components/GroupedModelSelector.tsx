import React, { useState, useEffect } from 'react';
import '../styles.css';
import { GroqPluginInterface } from '../types/plugin';
import { GroqModelInfo } from '../settings/GroqChatSettings';
import { toast } from 'react-toastify';
import { t, Locale } from '../localization';

interface GroupedModelSelectorProps {
  plugin: GroqPluginInterface;
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  getAvailableModels: () => Promise<GroqModelInfo[]>;
  availableModels?: GroqModelInfo[];
  locale?: Locale;
}

export const GroupedModelSelector: React.FC<GroupedModelSelectorProps> = ({
  plugin: _plugin,
  selectedModel,
  onSelectModel,
  getAvailableModels,
  availableModels: availableModelsProp,
  locale = 'en',
}) => {
  const [availableModels, setAvailableModels] = useState<GroqModelInfo[]>([]);
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
        setAvailableModels(activeModels.map((m: GroqModelInfo) => ({ ...m })));
      } catch (error) {
        console.error('Failed to fetch available models:', error);
        setAvailableModels([]);
        toast.error(t('modelsUpdateError', locale));
      } finally {
        setIsLoading(false);
      }
    };

    void fetchAvailableModels();
  }, [getAvailableModels, _plugin.settings.groqAvailableModels, availableModelsProp]);

  if (isLoading) {
    return <div className="groq-model-selector">{t('loadingModels', locale)}</div>;
  }

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    onSelectModel(selectedValue);
  };

  return (
    <div className="groq-model-selector">
      <select
        id="model-select"
        value={selectedModel}
        onChange={handleChange}
        className="groq-select"
        aria-label={t('chooseModel', locale)}
      >
        {availableModels.map(modelInfo => (
          <option key={modelInfo.id} value={modelInfo.id}>
            {modelInfo.name}
          </option>
        ))}
      </select>
    </div>
  );
};
