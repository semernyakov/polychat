import React, { createContext, useState } from 'react';
import { GroqChatSettings, DEFAULT_SETTINGS } from '../settings/GroqChatSettings';

interface PluginSettingsContextType extends GroqChatSettings {
  setSettings: (settings: Partial<GroqChatSettings>) => void;
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
    <PluginSettingsContext.Provider value={{ ...settings, setSettings }}>
      {children}
    </PluginSettingsContext.Provider>
  );
}
