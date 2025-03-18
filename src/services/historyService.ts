import { Message, ChatHistory, HistoryOptions } from '../types/chat';
import { GroqPlugin } from '../types/plugin';

export class HistoryService {
    private plugin: GroqPlugin;
    private history: ChatHistory = {
        messages: [],
        lastUpdated: new Date().toISOString()
    };

    constructor(plugin: GroqPlugin) {
        this.plugin = plugin;
    }

    async loadMessages(): Promise<Message[]> {
        if (this.plugin.settings.historyStorageMethod === 'file') {
            return this.loadFromFile();
        }
        return this.history.messages;
    }

    async saveMessages(messages: Message[]): Promise<void> {
        this.history.messages = messages.slice(-this.plugin.settings.maxHistoryLength);
        this.history.lastUpdated = new Date().toISOString();

        if (this.plugin.settings.historyStorageMethod === 'file') {
            await this.saveToFile();
        }
    }

    private async loadFromFile(): Promise<Message[]> {
        try {
            const data = await this.plugin.app.vault.adapter.read(this.plugin.settings.notePath);
            const history: ChatHistory = JSON.parse(data);
            return history.messages;
        } catch {
            return [];
        }
    }

    private async saveToFile(): Promise<void> {
        try {
            await this.plugin.app.vault.adapter.write(
                this.plugin.settings.notePath,
                JSON.stringify(this.history, null, 2)
            );
        } catch (error) {
            console.error('Error saving history to file:', error);
        }
    }
}