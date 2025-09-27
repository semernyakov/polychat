// src/localization.ts
export type Locale = 'ru' | 'en';

export const defaultLocale: Locale = 'en';

/**
 * Gets the current locale from Obsidian App API (requires minAppVersion >= 1.8.0)
 * Falls back to default locale if API is unavailable
 */
function getCurrentLocale(): Locale {
  if (typeof window === 'undefined') {
    return defaultLocale;
  }
  const appLang = (window as any)?.app?.getLanguage?.();
  if (typeof appLang === 'string') {
    const normalized = appLang.toLowerCase();
    return (normalized.startsWith('ru') ? 'ru' : 'en') as Locale;
  }
  return defaultLocale;
}

export const translations: Record<Locale, Record<string, string>> = {
  ru: {
    supportDialogTitle: 'Поддержать разработку',
    supportDialogClose: 'Закрыть',
    supportDialogContent:
      'Этот плагин разрабатывается энтузиастом в свободное время. Ваша поддержка поможет ускорить разработку, добавить новые функции и поддерживать проект в актуальном состоянии. Спасибо за использование!',
    supportDialogThanks:
      'Спасибо за использование PolyChat Plugin! <br> Вы можете <a href="https://yoomoney.ru/fundraise/194GT5A5R07.250321" target="_blank" rel="noopener noreferrer">поддержать разработку на YooMoney</a> <br> <a href="https://github.com/semernyakov" target="_blank" rel="noopener noreferrer">Оставить отзыв на Github</a> или <a href="https://t.me/semernyakov" target="_blank" rel="noopener noreferrer"> или связаться со мной в Telegram</a> ❤️',
    supportDialogGoToSupport: 'Перейти к поддержке',
    language: 'Язык',
    save: 'Сохранить',
    cancel: 'Сбросить',
    chatTitle: 'PolyChat',
    authToken: 'Токен авторизации',
    apiKey: 'API ключ',
    apiKeyPlaceholder: 'Введите API ключ',
    checkApiKey: 'Проверить',
    validApiKey: '✅ Ключ действителен',
    invalidApiKey: '❌ Неверный ключ',
    model: 'Модель',
    active: 'Активна',
    requestsLeft: 'Осталось запросов',
    tokensLeft: 'Осталось токенов',
    reset: 'Сброс',
    status: 'Статус',
    temperature: 'Температура',
    maxTokens: 'Макс. токенов',
    maxTokensPlaceholder: 'Введите число',
    history: 'Хранение истории',
    historyLengthPlaceholder: '20',
    historyFile: 'Файл истории',
    historyFilePlaceholder: 'groq-chat-history.md',
    displayMode: 'Режим отображения',
    tab: 'Во вкладке',
    sidepanel: 'В боковой панели',
    // Tooltips & Dialogs
    supportDev: 'Поддержать разработку',
    supportDevShort: 'Поддержать',
    supportDevHeader: 'Поддержать разработчика',
    modelInfo: 'Информация о модели',
    description: 'Описание',
    developer: 'Разработчик',
    releaseDate: 'Дата выпуска',
    actualDate: 'Дата актуальности',
    releaseStatus: 'Статус релиза',
    you: 'Вы',
    assistant: 'Ассистент',
    copyError: 'Ошибка при копировании',
    close: 'Закрыть',
    modelUnavailable: 'Эта модель временно недоступна',
    showInSidepanel: 'Показать в боковой панели',
    showInTab: 'Показать во вкладке',
    scrollToTop: 'К началу диалога',
    scrollToBottom: 'К концу диалога',
    clearHistory: 'Очистить историю',
    showFormatting: 'Показать форматирование',
    showFormatted: 'Показать форматированный текст',
    showRaw: 'Показать исходный код',
    copyMessage: 'Копировать сообщение',
    rawContent: 'Исходное содержимое сообщения',
    chooseModel: 'Выберите модель Groq',
    copyCode: 'Копировать код',
    refreshModels: 'Обновить модели',
    modelsUpdated: 'Список моделей обновлён',
    modelsUpdateError: 'Ошибка при обновлении списка моделей',
    noModelsFound: 'Нет доступных моделей',
    imageNotice:
      '⚠️ Чат не поддерживает отображение изображений. Если модель возвращает абсолютную ссылку на изображение, будет показана только ссылка.',
    // Input (MessageInput)
    inputPlaceholder: 'Введите сообщение...',
    inputAriaLabel: 'Поле ввода сообщения',
    sendMessage: 'Отправить сообщение',
    sendTitle: 'Отправить (Ctrl+Enter)',
    inputHint:
      '<kbd>Ctrl</kbd>+<kbd>Enter</kbd> — отправить, <kbd>Shift</kbd>+<kbd>Enter</kbd> — новая строка',
    inputCounterTitle:
      'Текущее кол-во символов / Макс. кол-во токенов для модели (приблизительное сравнение)',
    symbolsTokens: 'символы/токены',
  },
  en: {
    supportDialogTitle: 'Support development',
    supportDialogClose: 'Close',
    supportDialogContent:
      'This plugin is developed by an enthusiast in their free time. Your support will help accelerate development, add new features, and maintain the project in an up-to-date state. Thank you for using it!',
    supportDialogThanks:
      'Thank you for using PolyChat Plugin! <br> You can <a href="https://yoomoney.ru/fundraise/194GT5A5R07.250321" target="_blank" rel="noopener noreferrer">support the author on YooMoney</a> <br> <a href="https://github.com/semernyakov" target="_blank" rel="noopener noreferrer">Leave a review on Github</a> or <a href="https://t.me/semernyakov" target="_blank" rel="noopener noreferrer">contact with author in Telegram</a> ❤️',
    supportDialogGoToSupport: 'Go to support',
    language: 'Language',
    save: 'Save',
    cancel: 'Reset',
    chatTitle: 'PolyChat',
    authToken: 'Auth Token',
    apiKey: 'API Key',
    apiKeyPlaceholder: 'Enter API key',
    checkApiKey: 'Check',
    validApiKey: '✅ Key is valid',
    invalidApiKey: '❌ Invalid key',
    model: 'Model',
    active: 'Active',
    requestsLeft: 'Requests left',
    tokensLeft: 'Tokens left',
    reset: 'Reset',
    status: 'Status',
    temperature: 'Temperature',
    maxTokens: 'Max tokens',
    maxTokensPlaceholder: 'Enter a number',
    history: 'History storage',
    historyLengthPlaceholder: '20',
    historyFile: 'History file',
    historyFilePlaceholder: 'groq-chat-history.md',
    displayMode: 'Display mode',
    tab: 'In tab',
    sidepanel: 'In side panel',
    // Tooltips & Dialogs
    supportDev: 'Support development',
    supportDevShort: 'Support',
    supportDevHeader: 'Support developer',
    modelInfo: 'Model info',
    description: 'Description',
    developer: 'Developer',
    releaseDate: 'Release Date',
    actualDate: 'As of Date',
    releaseStatus: 'Release Status',
    you: 'You',
    assistant: 'Assistant',
    copyError: 'Error copying to clipboard',
    close: 'Close',
    modelUnavailable: 'This model is temporarily unavailable',
    showInSidepanel: 'Show in side panel',
    showInTab: 'Show in tab',
    scrollToTop: 'Scroll to top',
    scrollToBottom: 'Scroll to bottom',
    clearHistory: 'Clear history',
    showFormatting: 'Show formatting',
    showFormatted: 'Show formatted text',
    showRaw: 'Show raw',
    copyMessage: 'Copy message',
    rawContent: 'Raw message content',
    chooseModel: 'Choose Groq model',
    copyCode: 'Copy code',
    refreshModels: 'Refresh models',
    modelsUpdated: 'Model list updated',
    modelsUpdateError: 'Error updating model list',
    noModelsFound: 'No available models',
    imageNotice:
      '⚠️ Chat does not support image rendering. If the model returns an absolute image link, only the link will be shown.',
    // Input (MessageInput)
    inputPlaceholder: 'Type a message...',
    inputAriaLabel: 'Message input field',
    sendMessage: 'Send message',
    sendTitle: 'Send (Ctrl+Enter)',
    inputHint:
      '<kbd>Ctrl</kbd>+<kbd>Enter</kbd> — send, <kbd>Shift</kbd>+<kbd>Enter</kbd> — new line',
    inputCounterTitle: 'Current character count / Max model tokens (approximate)',
    symbolsTokens: 'chars/tokens',
  },
};

/**
 * Translates a key to the current or specified locale
 * @param key - The translation key
 * @param locale - Optional locale to use (defaults to current locale)
 * @returns The translated string or the key if translation not found
 */
export function t(key: string, locale: Locale = getCurrentLocale()): string {
  return translations[locale]?.[key] || translations[defaultLocale]?.[key] || key;
}

/**
 * Translates a key containing HTML to the current or specified locale
 * @param key - The translation key
 * @param locale - Optional locale to use (defaults to current locale)
 * @returns An object with __html property containing the translated HTML string
 */
export function tHtml(key: string, locale?: Locale): { __html: string } {
  const loc = locale ?? getCurrentLocale();
  const translation = translations[loc]?.[key] || translations[defaultLocale]?.[key] || key;
  return { __html: translation };
}
