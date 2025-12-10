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

  // Get current locale from Obsidian app
  const getLanguage = (): Locale => {
    const app = (window as any)?.app;
    const appLang = app?.getLanguage?.();
    return (appLang && appLang.toLowerCase().startsWith('ru') ? 'ru' : 'en') as Locale;
  };

  return (
    <PluginSettingsContext.Provider
      value={{
        ...settings,
        setSettings,
        // Язык интерфейса берём из настроек Obsidian, а не из настроек плагина
        language: getLanguage(),
      }}
    >
      {children}
    </PluginSettingsContext.Provider>
  );
}
