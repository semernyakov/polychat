# PolyChat Plugin для Obsidian

[![Релиз](https://img.shields.io/github/v/release/semernyakov/polychat?style=flat-square&label=релиз)](https://github.com/semernyakov/polychat/releases/latest)
[![Загрузки](https://img.shields.io/github/downloads/semernyakov/polychat/total?style=flat-square&label=загрузки)](https://github.com/semernyakov/polychat/releases)
[![Лицензия](https://img.shields.io/github/license/semernyakov/polychat?style=flat-square&label=лицензия)](LICENSE)
[![Тесты](https://img.shields.io/github/actions/workflow/status/semernyakov/polychat/ci.yml?branch=master&style=flat-square&label=тесты)](https://github.com/semernyakov/polychat/actions/workflows/ci.yml)
[![NPM](https://img.shields.io/npm/v/groq-poly-chat?style=flat-square&label=npm)](https://www.npmjs.com/package/groq-poly-chat)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa?style=flat-square)](../CODE_OF_CONDUCT.md)

<!-- [![Покрытие](https://img.shields.io/codecov/c/github/semernyakov/groq-chat-plugin?style=flat-square&label=покрытие)](https://codecov.io/gh/semernyakov/groq-chat-plugin) -->

[English version](../README.md)

Плагин для [Obsidian](https://obsidian.md), который интегрирует возможности чата с AI от Groq прямо в ваши заметки.

**PolyChat** — это мощное расширение чата с поддержкой моделей ИИ через Groq API. Разработанное для гибкости и простоты использования, оно обеспечивает бесперебойную коммуникацию с множеством моделей прямо из вашего хранилища.

## Скриншоты

**Основной интерфейс**

![polychat-main.png](polychat-main.png)

**Интерфейс настроек**

![polychat-settings.png](polychat-settings.png)

## Возможности

- Прямая интеграция с моделями Groq AI
- Локализация интерфейса (русский/английский)
- Диалоговое окно модели показывает только актуальные поля: название, описание (если есть), разработчик, макс. токенов, статус релиза, дата выпуска и дата актуальности (если есть)
- Интерфейс чата в реальном времени
- Поддержка последних моделей Groq
- Поддержка форматирования Markdown
- Подсветка кода
- Поддержка мобильных устройств
- Выбор пользовательских моделей
- История чата
- Контекстно-зависимые ответы
- Переключатель просмотра Raw/Markdown для сообщений ассистента.
- Настраиваемый режим отображения по умолчанию (вкладка или боковая панель).

## Установка

1. Откройте настройки Obsidian
2. Перейдите в раздел Community Plugins и отключите безопасный режим
3. Нажмите "Обзор" и найдите "PolyChat"
4. Установите плагин
5. Включите плагин в разделе Community Plugins

## Настройка

1. Получите API ключ на [Groq Console](https://console.groq.com)
2. Откройте настройки плагина в Obsidian
3. Введите ваш API ключ
4. Настройте дополнительные параметры по необходимости (Примечание: Настройки были обновлены, включая опции для режима отображения по умолчанию и хранения истории. Подробности см. в настройках плагина.)

## Использование

1. Откройте любую заметку
2. Нажмите на иконку PolyChat в боковой панели
3. Начните общение с AI
4. Используйте команды с `/` для дополнительных функций **(не реализовано!)**

## Разработка

````bash
# Клонировать репозиторий
git clone https://github.com/semernyakov/polychat.git

# Установить зависимости
npm install

# Собрать плагин
npm run build

# Проверить стиль кода
npm run lint

# Проверка устаревших моделей

Скрипт `check_obsolete_models.ts` проверяет, не использует ли плагин устаревшие модели Groq.

## Как использовать

### Быстрый старт (рекомендуемый способ)

```bash
# Показать справку
npm run check-models -- --help

# Проверить модели в стандартном расположении
npm run check-models

# Проверить с указанием пути к настройкам плагина (Linux/macOS)
npm run check-models -- --plugin-data-dir=~/.config/obsidian/plugins/groq-chat-plugin/data

# Проверить с указанием пути к настройкам плагина (Windows)
npm run check-models -- --plugin-data-dir=%APPDATA%\\obsidian\\plugins\\groq-chat-plugin\\data
````

### Дополнительные опции

1. **Указать каталог настроек Obsidian** (если известен путь к `.obsidian`):

   ```bash
   npm run check-models -- --config-dir=~/.config/obsidian
   ```

2. **Использовать переменные окружения** (полезно для скриптов):

   ```bash
   OBSIDIAN_VAULT_PATH=~/.config/obsidian \
   npm run check-models
   ```

3. **Режим разработки** (использует пути по умолчанию):
   ```bash
   NODE_ENV=development npm run check-models
   ```

### Где найти настройки плагина?

Настройки плагина обычно находятся в одном из этих мест:

- **Linux**: `~/.config/obsidian/plugins/groq-chat-plugin/data/settings.json`
- **Windows**: `%APPDATA%\\obsidian\\plugins\\groq-chat-plugin\\data\\settings.json`
- **macOS**: `~/Library/Application Support/obsidian/plugins/groq-chat-plugin/data/settings.json`

### Что делает скрипт?

1. Находит файл настроек плагина
2. Проверяет, какие модели указаны в настройках
3. Сравнивает их с актуальным списком моделей Groq
4. Показывает устаревшие или несуществующие модели

## Участие в разработке

Мы приветствуем ваше участие! Пожалуйста, прочтите наше [Руководство по участию](docs/CONTRIBUTING.ru.md) для получения информации о кодексе поведения и процессе отправки pull request'ов.

## Безопасность

По вопросам безопасности, пожалуйста, ознакомьтесь с нашей [Политикой безопасности](docs/SECURITY.ru.md) и сообщайте об уязвимостях ответственно.

## Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для подробностей.

## Поддержка

Если вы находите этот плагин полезным, рассмотрите возможность:

- [Поставить звезду репозиторию](https://github.com/semernyakov/polychat)
- [Поддержать разработку](https://github.com/sponsors/semernyakov)
- [Сообщить о проблеме](https://github.com/semernyakov/polychat/issues)

## История изменений

См. [CHANGELOG.ru.md](docs/CHANGELOG.ru.md) для всех изменений.

## 📝 Описание

PolyChat Plugin - это мощный плагин для Obsidian, который интегрирует возможности Groq AI непосредственно в ваше рабочее пространство. Используйте передовые языковые модели для улучшения вашего рабочего процесса в Obsidian.

## 🤖 Поддержка моделей

- "deepseek-r1-distill-llama-70b"
- "llama-guard-3-8b"
- "distil-whisper-large-v3-en"
- "deepseek-r1-distill-llama-70b"
- "meta-llama/llama-4-scout-17b-16e-instruct"
- "llama-3.1-8b-instant"
- "whisper-large-v3"
- "playai-tts"
- "meta-llama/llama-prompt-guard-2-22m"
- "qwen-qwq-32b"
- "meta-llama/llama-guard-4-12b"
- "meta-llama/llama-4-maverick-17b-128e-instruct"
- "mistral-saba-24b"
- "llama-3.3-70b-versatile"
- "compound-beta"
- "llama3-8b-8192"
- "meta-llama/llama-prompt-guard-2-86m"
- "playai-tts-arabic"
- "gemma2-9b-it"
- "compound-beta-mini"
- "llama3-70b-8192"
- "qwen/qwen3-32b"
- "allam-2-7b"
- "whisper-large-v3-turbo"

> Полный и актуальный список всегда отображается в настройках плагина. Описания будут добавлены по мере появления.

- 🔐 Безопасное хранение API ключей
- 💬 Интерактивный чат-интерфейс
- 📚 Сохранение истории диалогов
- 🌓 Поддержка светлой и темной темы
- ⚡ Быстрый доступ через боковую панель
- 🔄 Переключение вида сообщений: Просмотр отформатированного Markdown или исходного Raw текста ответа.

## 🚀 Установка

1. Откройте Obsidian
2. Перейдите в Настройки → Сторонние плагины
3. Нажмите "Просмотреть" и найдите "PolyChat"
4. Установите плагин
5. Включите плагин в списке установленных

## ⚙️ Настройка

### Настройка API ключа

1. Получите API ключ на [console.groq.com](https://console.groq.com)
2. Введите ключ в настройках плагина
3. Сохраните настройки

### Настройка моделей

- Выберите модель в зависимости от задачи
- Настройте параметры модели (температура, максимальное количество токенов)
- Сохраните настройки модели

### Дополнительные настройки

- Настройка хранения и максимальной длины истории (в памяти, localStorage, IndexedDB, файл).
- Настройка режима отображения по умолчанию (вкладка или боковая панель).

## 💡 Использование

1. **Открытие чата:**
   - Нажмите на иконку чата в боковой панели
   - Используйте горячую клавишу `Ctrl+P` (или `Cmd+P` на Mac) и введите "PolyChat"
   - Откройте чат через палитру команд

2. **Отправка запросов:**
   - Введите запрос в поле ввода
   - Нажмите Enter или кнопку отправки
   - Используйте `Shift+Enter` для переноса строки

3. **Работа с моделями:**
   - Выберите модель в зависимости от задачи
   - Учитывайте ограничения контекста

## ⌨️ Горячие клавиши

| Действие            | Windows/Linux | macOS         |
| ------------------- | ------------- | ------------- |
| Отправить сообщение | Ctrl + Enter  | Enter         |
| Новая строка        | Shift + Enter | Shift + Enter |

## 🔒 Безопасность

- Все токены хранятся локально в зашифрованном виде

## 🐛 Устранение неполадок

### Распространенные проблемы:

1. **Ошибка авторизации:**
   - Проверьте правильность Client ID
   - Убедитесь, что redirect URI настроен корректно
   - Проверьте подключение к интернету

2. **Ошибка API:**
   - Проверьте статус сервиса Groq
   - Убедитесь в действительности токена
   - Проверьте лимиты использования

3. **Проблемы с моделями:**
   - Убедитесь, что выбрана подходящая модель
   - Проверьте ограничения контекста
   - Для preview моделей возможны перебои

## 🤝 Вклад в развитие

Мы приветствуем вклад в развитие проекта! Для участия:

1. Форкните репозиторий
2. Создайте ветку для вашей функции
3. Внесите изменения
4. Отправьте Pull Request

Подробнее смотрите в [CONTRIBUTING.md](docs/CONTRIBUTING.md).

## 📄 Лицензия

MIT License. См. файл [LICENSE](LICENSE) для подробностей.

## 💸 Поддержать разработчика

Если проект вам полезен, поддержите развитие через YooMoney:

- [YooMoney](https://yoomoney.ru/fundraise/194GT5A5R07.250321)

## 🙏 Благодарности

- Команде Obsidian за отличную платформу
- Groq за предоставление API
- Спасибо Автору и контрибьюторам за помощь в развитии

## 📞 Поддержка

- [Создать Issue](https://github.com/semernyakov/polychat/issues)
- [Документация](docs/PUBLISHING.ru.md)
- [Код проекта](https://github.com/semernyakov/polychat)

---

Создано с ❤️ для сообщества Obsidian, [
поддержка автора](https://yoomoney.ru/fundraise/194GT5A5R07.250321)
