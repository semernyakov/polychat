import { GroqModel } from './models';

/**
 * Способы хранения истории:
 * - memory: Только в оперативной памяти
 * - localStorage: Браузерное хранилище
 * - indexedDB: База данных в браузере
 * - file: Файл в хранилище Obsidian
 */
export type HistoryStorageMethod = 'memory' | 'localStorage' | 'indexedDB' | 'file';

// Реэкспортируем основной интерфейс и настройки по умолчанию
// Используем export type для интерфейса
export type { GroqChatSettings } from '../settings/GroqChatSettings';
// Оставляем export для объекта настроек
export { DEFAULT_SETTINGS } from '../settings/GroqChatSettings';
