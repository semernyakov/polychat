import { Message } from '../types/chat';
import { StorageSettings } from '../types/settings';

export class ChatHistoryService {
    private static instance: ChatHistoryService;
    
    private constructor() {}
    
    static getInstance(): ChatHistoryService {
        if (!ChatHistoryService.instance) {
            ChatHistoryService.instance = new ChatHistoryService();
        }
        return ChatHistoryService.instance;
    }

    async saveMessages(messages: Message[], settings: StorageSettings): Promise<void> {
        if (settings.method === 'local') {
            const toSave = messages.slice(-settings.maxHistoryLength);
            localStorage.setItem('groq-chat-history', JSON.stringify(toSave));
        } else if (settings.method === 'note' && settings.notePath) {
            // Здесь можно добавить логику сохранения в заметку Obsidian
            // Требуется интеграция с API Obsidian
        }
    }

    async loadMessages(settings: StorageSettings): Promise<Message[]> {
        if (settings.method === 'local') {
            const saved = localStorage.getItem('groq-chat-history');
            return saved ? JSON.parse(saved) : [];
        } else if (settings.method === 'note' && settings.notePath) {
            // Здесь можно добавить логику загрузки из заметки Obsidian
            return [];
        }
        return [];
    }

    async clearHistory(settings: StorageSettings): Promise<void> {
        if (settings.method === 'local') {
            localStorage.removeItem('groq-chat-history');
        } else if (settings.method === 'note' && settings.notePath) {
            // Здесь можно добавить логику очистки заметки Obsidian
        }
    }
}

export const historyService = ChatHistoryService.getInstance(); 