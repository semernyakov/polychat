import { GroqPluginInterface } from '../types/plugin';
import { Message, ChatHistory } from '../types/message';
import { TFile, Notice } from 'obsidian';
import { HistoryStorageMethod } from '../types/settings';

export class HistoryService {
  private memoryHistory: Message[] = [];

  constructor(private readonly plugin: GroqPluginInterface) {}

  async getHistory(): Promise<Message[]> {
    try {
      const method = this.plugin.settings.historyStorageMethod;
      const history = await this.getHistoryByMethod(method);
      return this.truncateHistory(history, this.plugin.settings.maxHistoryLength);
    } catch (error) {
      this.handleError('Error loading history', error);
      return [];
    }
  }

  async addMessage(message: Message): Promise<void> {
    try {
      const history = await this.getHistory();
      const newHistory = [...history, message];
      await this.saveHistory(newHistory);
    } catch (error) {
      this.handleError('Error saving message', error);
    }
  }

  async clearHistory(): Promise<void> {
    try {
      await this.clearByMethod(this.plugin.settings.historyStorageMethod);
      new Notice('History cleared');
    } catch (error) {
      this.handleError('Error clearing history', error);
    }
  }

  private async getHistoryByMethod(method: HistoryStorageMethod): Promise<Message[]> {
    switch (method) {
      case 'memory':
        return this.memoryHistory;
      case 'localStorage':
        return this.getFromLocalStorage();
      case 'indexedDB':
        return this.getFromIndexedDB();
      case 'file':
        return this.getFromFile();
      default:
        return [];
    }
  }

  private async saveHistory(history: Message[]): Promise<void> {
    const method = this.plugin.settings.historyStorageMethod;
    const truncated = this.truncateHistory(history, this.plugin.settings.maxHistoryLength);

    switch (method) {
      case 'memory':
        this.memoryHistory = truncated;
        break;
      case 'localStorage':
        this.saveToLocalStorage(truncated);
        break;
      case 'indexedDB':
        await this.saveToIndexedDB(truncated);
        break;
      case 'file':
        await this.saveToFile(truncated);
        break;
    }
  }

  private truncateHistory(history: Message[], maxLength: number): Message[] {
    return history.slice(-maxLength);
  }

  // Реализации методов хранения...
  private getFromLocalStorage(): Message[] {
    const data = localStorage.getItem('groq-chat-history');
    return data ? JSON.parse(data) : [];
  }

  private saveToLocalStorage(history: Message[]): void {
    localStorage.setItem('groq-chat-history', JSON.stringify(history));
  }

  private async getFromIndexedDB(): Promise<Message[]> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('groq-chat-history', 1);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction('history', 'readwrite');
        const store = transaction.objectStore('history');
        const result: Message[] = [];
        const cursor = store.openCursor();
        cursor.onsuccess = (ev: any) => {
          const cursor = ev.target.result;
          if (cursor) {
            result.push(cursor.value);
            cursor.continue();
          } else {
            resolve(result);
          }
        };
        cursor.onerror = () => reject(cursor.error);
      };
      request.onerror = () => reject(request.error);
    });
  }

  private async saveToIndexedDB(history: Message[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('groq-chat-history', 1);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction('history', 'readwrite');
        const store = transaction.objectStore('history');
        history.forEach(message => {
          const request = store.add(message);
          request.onsuccess = () => {
            // Success handler
          };
          request.onerror = () => reject(request.error);
        });
        transaction.oncomplete = () => {
          resolve();
        };
      };
      request.onerror = () => reject(request.error);
    });
  }

  private async getFromFile(): Promise<Message[]> {
    const file = this.plugin.app.vault.getAbstractFileByPath(this.plugin.settings.notePath);
    if (file instanceof TFile) {
      const content = await this.plugin.app.vault.read(file);
      return JSON.parse(content);
    }
    return [];
  }

  private async saveToFile(history: Message[]): Promise<void> {
    const path = this.plugin.settings.notePath;
    const content = JSON.stringify(history, null, 2);

    const file = this.plugin.app.vault.getAbstractFileByPath(path);
    if (file instanceof TFile) {
      await this.plugin.app.vault.modify(file, content);
    } else {
      await this.plugin.app.vault.create(path, content);
    }
  }

  private async clearIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('groq-chat-history', 1);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction('history', 'readwrite');
        const store = transaction.objectStore('history');
        store.clear();
        transaction.oncomplete = () => {
          resolve();
        };
        transaction.onerror = () => reject(transaction.error);
      };
      request.onerror = () => reject(request.error);
    });
  }

  private async clearFile(): Promise<void> {
    const file = this.plugin.app.vault.getAbstractFileByPath(this.plugin.settings.notePath);
    if (file) {
      await this.plugin.app.vault.delete(file);
    }
  }

  private async clearByMethod(method: HistoryStorageMethod): Promise<void> {
    switch (method) {
      case 'memory':
        this.memoryHistory = [];
        break;
      case 'localStorage':
        localStorage.removeItem('groq-chat-history');
        break;
      case 'indexedDB':
        await this.clearIndexedDB();
        break;
      case 'file':
        await this.clearFile();
        break;
    }
  }

  private handleError(context: string, error: unknown): void {
    console.error(context, error);
    new Notice(`${context}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
