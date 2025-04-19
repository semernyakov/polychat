import { useContext } from 'react';
import { PluginSettingsContext } from '../context/PluginSettingsContext';

export function usePluginSettings() {
  return useContext(PluginSettingsContext);
}
