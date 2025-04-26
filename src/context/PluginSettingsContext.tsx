import React, { createContext, useState } from 'react';
import { GroqChatSettings, DEFAULT_SETTINGS } from '../_settings/GroqChatSettings';

interface PluginSettingsContextType extends GroqChatSettings {
  setSettings: (_settings: Partial<GroqChatSettings>) => void;
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
  const [_settings, setSettingsState] = useState<GroqChatSettings>({
    ...DEFAULT_SETTINGS,
    ...initialSettings,
  });

  const setSettings = (newSettings: Partial<GroqChatSettings>) => {
    setSettingsState(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <PluginSettingsContext.Provider value={{ ..._settings, setSettings }}>
      {children}
    </PluginSettingsContext.Provider>
  );
}
