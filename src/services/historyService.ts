import { TFile } from 'obsidian';
import { GroqPlugin } from '../types/plugin';
import { Message } from '../types/message';

export class HistoryService {
    private plugin: GroqPlugin;

    constructor(plugin: GroqPlugin) {
        this.plugin = plugin;
    }

    /**
     * Получение истории сообщений
     */
    async getHistory(): Promise<Message[]> {
        if (this.plugin.settings.historyStorageMethod === 'file') {
            return this.loadMessagesFromFile();
        } else {
            return this.loadMessagesFromMemory();
        }
    }

    /**
     * Добавление сообщения в историю
     */
    async addMessage(message: Message): Promise<void> {
        const history = await this.getHistory();
        const updatedHistory = [...history, message];
        
        // Обрезаем историю до максимального размера
        const limitedHistory = updatedHistory.slice(-this.plugin.settings.maxHistoryLength);
        
        if (this.plugin.settings.historyStorageMethod === 'file') {
            await this.saveMessagesToFile(limitedHistory);
        } else {
            await this.saveMessagesToMemory(limitedHistory);
        }
    }

    /**
     * Очистка истории сообщений
     */
    async clearHistory(): Promise<void> {
        if (this.plugin.settings.historyStorageMethod === 'file') {
            await this.saveMessagesToFile([]);
        } else {
            await this.saveMessagesToMemory([]);
        }
    }

    /**
     * Загрузка сообщений из файла
     */
    private async loadMessagesFromFile(): Promise<Message[]> {
        const { vault } = this.plugin.app;
        const notePath = this.plugin.settings.notePath;
        
        if (!notePath) {
            return [];
        }

        try {
            let file = vault.getAbstractFileByPath(notePath);
            
            if (!file) {
                // Если файл не существует, создаем его
                await vault.create(notePath, '');
                file = vault.getAbstractFileByPath(notePath);
            }

            if (file instanceof TFile) {
                const content = await vault.read(file);
                try {
                    const historyData = JSON.parse(content);
                    return Array.isArray(historyData) ? historyData : [];
                } catch (error) {
                    console.error('Ошибка при парсинге истории сообщений:', error);
                    return [];
                }
            }
        } catch (error) {
            console.error('Ошибка при загрузке истории сообщений:', error);
        }

        return [];
    }

    /**
     * Сохранение сообщений в файл
     */
    private async saveMessagesToFile(messages: Message[]): Promise<void> {
        const { vault } = this.plugin.app;
        const notePath = this.plugin.settings.notePath;
        
        if (!notePath) {
            return;
        }

        try {
            let file = vault.getAbstractFileByPath(notePath);
            
            if (!file) {
                // Если файл не существует, создаем его
                await vault.create(notePath, '');
                file = vault.getAbstractFileByPath(notePath);
            }

            if (file instanceof TFile) {
                const content = JSON.stringify(messages, null, 2);
                await vault.modify(file, content);
            }
        } catch (error) {
            console.error('Ошибка при сохранении истории сообщений:', error);
        }
    }

    /**
     * Загрузка сообщений из памяти (локального хранилища)
     */
    private async loadMessagesFromMemory(): Promise<Message[]> {
        const savedData = await this.plugin.loadData();
        return savedData?.chatHistory || [];
    }

    /**
     * Сохранение сообщений в память (локальное хранилище)
     */
    private async saveMessagesToMemory(messages: Message[]): Promise<void> {
        const data = await this.plugin.loadData();
        const updatedData = {
            ...data,
            chatHistory: messages
        };
        await this.plugin.saveData(updatedData);
    }
}