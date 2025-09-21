import React, { createContext, useState } from 'react';
import { GroqChatSettings, DEFAULT_SETTINGS } from '../settings/GroqChatSettings';
import type { Locale } from '../localization';

interface PluginSettingsContextType extends GroqChatSettings {
  setSettings: (settings: Partial<GroqChatSettings>) => void;
  language: Locale;
}

export const PluginSettingsContext = createContext<PluginSettingsContextType | undefined>(
  undefined,
);

export function PluginSettingsProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings?: Partial<GroqChatSettings>;
}) {
  const [settings, setSettingsState] = useState<GroqChatSettings>({
    ...DEFAULT_SETTINGS,
    ...initialSettings,
  });

  const setSettings = (newSettings: Partial<GroqChatSettings>) => {
    setSettingsState(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <PluginSettingsContext.Provider
      value={{
        ...settings,
        setSettings,
        // Язык интерфейса берём из настроек Obsidian, а не из настроек плагина
        language: ((window as any)?.app?.getLanguage?.() || 'en').toLowerCase().startsWith('ru')
          ? ('ru' as Locale)
          : ('en' as Locale),
      }}
    >
      {children}
    </PluginSettingsContext.Provider>
  );
}
