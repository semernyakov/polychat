import { GroqPlugin } from '../types/plugin';
import { Message } from '../types/types';

export class HistoryService {
  private plugin: GroqPlugin;
  private memoryHistory: Message[] = [];

  constructor(plugin: GroqPlugin) {
    this.plugin = plugin;
  }

  async getHistory(): Promise<Message[]> {
    try {
      if (this.plugin.settings.historyStorageMethod === 'memory') {
        return this.plugin.settings.history || [];
      }
      return this.memoryHistory;
    } catch (error) {
      console.error('Ошибка загрузки истории', error);
      return [];
    }
  }

  async addMessage(message: Message): Promise<void> {
    try {
      const history = await this.getHistory();
      const newHistory = [...history, message].slice(-this.plugin.settings.maxHistoryLength);

      if (this.plugin.settings.historyStorageMethod === 'memory') {
        this.plugin.settings.history = newHistory;
        await this.plugin.saveSettings();
      } else {
        this.memoryHistory = newHistory;
      }
    } catch (error) {
      console.error('Ошибка сохранения сообщения', error);
    }
  }

  async clearHistory(): Promise<void> {
    try {
      if (this.plugin.settings.historyStorageMethod === 'memory') {
        this.plugin.settings.history = [];
        await this.plugin.saveSettings();
      } else {
        this.memoryHistory = [];
      }
    } catch (error) {
      console.error('Ошибка очистки истории', error);
    }
  }
}
