/**
 * Проверяет корректность имени файла.
 * @param fileName - Проверяемое имя файла
 * @returns true если имя валидно
 */
export function isValidFileName(fileName: string): boolean {
  // Разрешаем кириллицу, латиницу, цифры, пробелы, дефисы и подчеркивания
  // Обязательное расширение .md
  return /^[\p{L}\d\s\-_]+\.md$/u.test(fileName);
}

/**
 * Проверяет валидность API ключа Groq
 * @param apiKey - Ключ для проверки
 * @returns true если ключ соответствует формату
 */
export function isValidApiKey(apiKey: string): boolean {
  return /^(gsk|gsk_test|sk)_[a-zA-Z0-9]{32,}$/.test(apiKey);
}
