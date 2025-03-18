import { Message, HistoryOptions } from '../types/chat';

class HistoryService {
    private memoryHistory: Message[] = [];

    async loadHistory(options: HistoryOptions): Promise<Message[]> {
        if (options.method === 'memory') {
            return this.memoryHistory;
        } else {
            // Реализация загрузки из файла
            return [];
        }
    }

    async saveHistory(messages: Message[], options: HistoryOptions): Promise<void> {
        if (options.method === 'memory') {
            this.memoryHistory = messages.slice(-options.maxHistoryLength);
        } else {
            // Реализация сохранения в файл
        }
    }
}

export const historyService = new HistoryService();