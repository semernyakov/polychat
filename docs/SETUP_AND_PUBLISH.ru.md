# Настройка и публикация Groq Chat Plugin

## Настройка окружения

### 1. Требования

- Node.js 16+
- npm или yarn
- Git
- Obsidian 0.15.0+
- Groq API ключ

### 2. Поддерживаемые модели

#### Production Models
* **Llama 3 70B Versatile**
  - Контекст: 128K токенов
  - Макс. ответ: 32,768 токенов
  - Рекомендуется для: общих задач

* **Llama 3 8B Instant**
  - Контекст: 128K токенов
  - Макс. ответ: 8,192 токенов
  - Рекомендуется для: быстрых ответов

* **Mixtral 8x7B**
  - Контекст: 32K токенов
  - Рекомендуется для: сложных вычислений

* **Gemma 2 9B**
  - Контекст: 8K токенов
  - Рекомендуется для: эффективной обработки

* **Whisper Large V3**
  - Макс. размер файла: 25 МБ
  - Рекомендуется для: транскрибации аудио

#### Preview Models
* **Llama 3 90B Vision**
  - Поддержка изображений
  - Контекст: 128K токенов
  - Макс. ответ: 8,192 токенов

* **Qwen 2.5 Coder 32B**
  - Специализация: обработка кода
  - Контекст: 128K токенов

## 1. Настройка секретных ключей

### 1.1. Получение GROQ_API_KEY
1. Перейдите на сайт [Groq Console](https://console.groq.com)
2. Зарегистрируйтесь или войдите в аккаунт
3. Перейдите в раздел "API Keys"
4. Нажмите "Create New Key"
5. Скопируйте созданный ключ

### 1.2. Добавление секретов в GitHub
1. Перейдите в настройки вашего репозитория на GitHub
2. Выберите "Settings > Secrets and variables > Actions"
3. Нажмите "New repository secret"
4. Добавьте следующие секреты:
   ```
   GROQ_API_KEY=ваш_ключ_groq
   NPM_TOKEN=ваш_npm_токен
   ```

## 2. Публикация в официальный репозиторий Obsidian

### 2.1. Подготовка плагина
1. Убедитесь, что ваш плагин соответствует [требованиям Obsidian](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines)
2. Обновите `manifest.json`:
   ```json
   {
     "id": "groq-chat",
     "name": "Groq Chat",
     "version": "1.0.0",
     "minAppVersion": "1.0.0",
     "description": "Интеграция Groq Chat в Obsidian",
     "author": "Семерняков Иван Сергеевич",
     "authorUrl": "https://github.com/semernyakov",
     "isDesktopOnly": false
   }
   ```

### 2.2. Создание релиза
1. Создайте новый тег:
   ```bash
   git tag -a v1.0.0 -m "Initial release"
   git push origin v1.0.0
   ```
2. GitHub Actions автоматически создаст релиз и опубликует пакет в NPM

### 2.3. Подача заявки в Community Plugins
1. Форкните репозиторий [obsidian-releases](https://github.com/obsidianmd/obsidian-releases)
2. Добавьте информацию о вашем плагине в `community-plugins.json`:
   ```json
   {
     "id": "groq-chat",
     "name": "Groq Chat",
     "author": "Семерняков Иван Сергеевич",
     "description": "Интеграция Groq Chat в Obsidian",
     "repo": "semernyakov/grok-chat-plugin",
     "branch": "master"
   }
   ```
3. Создайте Pull Request в репозиторий obsidian-releases

### 2.4. Проверка и публикация
1. Дождитесь проверки вашего PR командой Obsidian
2. После одобрения плагин появится в каталоге Community Plugins
3. Пользователи смогут установить плагин через:
   - Настройки > Community plugins > Browse
   - Поиск "Groq Chat"
   - Нажатие "Install" и "Enable"

## 3. Обновление плагина

### 3.1. Создание нового релиза
1. Обновите версию в `package.json` и `manifest.json`
2. Создайте коммит с изменениями:
   ```bash
   git add .
   git commit -m "feat: добавлены новые функции"
   ```
3. Создайте новый тег:
   ```bash
   npm run release
   ```
4. GitHub Actions автоматически:
   - Создаст релиз
   - Опубликует новую версию в NPM
   - Обновит документацию

### 3.2. Обновление в Community Plugins
- Обновление произойдет автоматически после создания нового релиза
- Пользователи получат уведомление о доступном обновлении в Obsidian

## 4. Полезные команды для разработки

```bash
# Сборка проекта
npm run build

# Запуск тестов
npm run test

# Проверка линтером
npm run lint

# Создание релиза
npm run release

# Публикация в NPM
npm publish --access public
```

## 5. Важные замечания

1. Всегда тестируйте плагин перед релизом
2. Следуйте [Semantic Versioning](https://semver.org/)
3. Обновляйте CHANGELOG.md
4. Поддерживайте актуальную документацию
5. Отвечайте на issues в GitHub
6. Регулярно обновляйте зависимости 