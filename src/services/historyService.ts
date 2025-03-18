import { TFile } from 'obsidian';
import { GroqPlugin } from '../types/plugin';
import { Message } from '../types/message';

export class HistoryService {
    private plugin: GroqPlugin;
    private memoryHistory: Message[] = [];

    constructor(plugin: GroqPlugin) {
        this.plugin = plugin;
    }

    /**
     * Получение истории сообщений
     */
    async getHistory(): Promise<Message[]> {
        if (this.plugin.settings.historyStorageMethod === 'file') {
            return this.plugin.settings.history || [];
        } else {
            return this.memoryHistory;
        }
    }

    /**
     * Добавление сообщения в историю
     */
    async addMessage(message: Message): Promise<void> {
        const currentHistory = await this.getHistory();
        const limitedHistory = [...currentHistory, message].slice(-this.plugin.settings.maxHistoryLength);

        if (this.plugin.settings.historyStorageMethod === 'file') {
            this.plugin.settings.history = limitedHistory;
            await this.plugin.saveSettings();
        } else {
            this.memoryHistory = limitedHistory;
        }
    }

    /**
     * Очистка истории сообщений
     */
    async clearHistory(): Promise<void> {
        if (this.plugin.settings.historyStorageMethod === 'file') {
            this.plugin.settings.history = [];
            await this.plugin.saveSettings();
        } else {
            this.memoryHistory = [];
        }
    }
}