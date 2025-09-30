import React, { useState, useEffect } from 'react';
import '../styles.css';
import { GroqPluginInterface } from '../types/plugin';
import { toast } from 'react-toastify';
import { t, Locale } from '../localization';
import { groupModelsByOwner, isPreviewModel } from '../utils/modelUtils';

interface DynamicModelInfo {
  id: string;
  name: string;
  description?: string;
  owned_by?: string;
  isPreview?: boolean;
}

interface GroupedModelSelectorProps {
  plugin: GroqPluginInterface;
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  getAvailableModels: () => Promise<
    { id: string; name: string; description?: string; owned_by?: string; isPreview?: boolean }[]
  >;
  availableModels?: any[];
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
  const [availableModels, setAvailableModels] = useState<DynamicModelInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [groupedModels, setGroupedModels] = useState<Record<string, DynamicModelInfo[]>>({});

  useEffect(() => {
    if (availableModelsProp) {
      setIsLoading(false);
      setAvailableModels(availableModelsProp);
      setGroupedModels(groupModelsByOwner(availableModelsProp));
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
        setAvailableModels(activeModels.map((m: any) => ({ ...m })));
        setGroupedModels(groupModelsByOwner(activeModels));
      } catch (error) {
        console.error('Failed to fetch available models:', error);
        setAvailableModels([]);
        setGroupedModels({});
        toast.error(t('modelsUpdateError', locale));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableModels();
  }, [getAvailableModels, _plugin.settings.groqAvailableModels, availableModelsProp]);

  if (isLoading) {
    return <div className="groq-model-selector">{t('loadingModels', locale)}</div>;
  }

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value as string;
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
        {Object.entries(groupedModels).map(([owner, models]) => (
          <optgroup key={owner} label={owner}>
            {models.map(modelInfo => {
              const displayName =
                modelInfo.name + (modelInfo.isPreview ? ` (${t('preview', locale)})` : '');
              return (
                <option key={modelInfo.id} value={modelInfo.id}>
                  {displayName}
                </option>
              );
            })}
          </optgroup>
        ))}
      </select>
    </div>
  );
};
