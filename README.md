# Groq Chat Plugin for Obsidian

[![Версия](https://img.shields.io/badge/Версия-v1.2.0-blue "Текущая версия плагина")](https://github.com/semernyakov/groq-chat-plugin/releases)
[![Лицензия](https://img.shields.io/badge/Лицензия-MIT-green "Лицензия MIT")](https://github.com/semernyakov/groq-chat-plugin/blob/master/LICENSE)
[![CI/CD](https://img.shields.io/github/actions/workflow/status/semernyakov/groq-chat-plugin/ci.yml?branch=master&label=CI%2FCD "Статус сборки")](https://github.com/semernyakov/groq-chat-plugin/actions)
[![Покрытие тестами](https://img.shields.io/codecov/c/github/semernyakov/groq-chat-plugin "Покрытие кода тестами")](https://codecov.io/gh/semernyakov/groq-chat-plugin)
[![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&color=7963E6&label=downloads&query=downloads&url=https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-plugins.json "Количество загрузок в Obsidian")](https://obsidian.md/plugins?id=groq-chat-plugin)

![Groq Chat Plugin](./docs/images/plugin-banner.png)

## 📝 Description

Groq Chat Plugin is a powerful plugin for Obsidian that integrates Groq AI capabilities directly into your workspace. Use advanced language models to enhance your workflow in Obsidian.

## ✨ Key Features

* 🤖 Support for a wide range of models:
  * **Production Models** (recommended for main use):
    - Llama 3 70B Versatile (128K context)
    - Llama 3 8B Instant (128K context)
    - Mixtral 8x7B (32K context)
    - Gemma 2 9B (8K context)
    - Llama Guard 3 8B (for security)
    - Whisper Large V3 (for audio)
  * **Preview Models** (for testing):
    - Llama 3 90B Vision (image support)
    - Qwen 2.5 Coder 32B (for code)
    - Mistral Saba 24B
    - DeepSeek models
* 🔐 Secure API key storage
* 💬 Interactive chat interface
* 📚 Chat history saving
* 🎨 Customizable interface
* 🌓 Light and dark theme support
* ⚡ Quick access via sidebar

## 🚀 Installation

1. Open Obsidian
2. Go to Settings → Community Plugins
3. Click "Browse" and search for "Groq Chat"
4. Install the plugin
5. Enable the plugin in installed plugins list

## ⚙️ Configuration

### API Key Setup

1. Get your API key from [console.groq.com](https://console.groq.com)
2. Enter the key in plugin settings
3. Save settings

### Model Configuration

#### Production Models
* **Llama 3 70B Versatile**
  - Context: 128K tokens
  - Max response tokens: 32,768
  - Recommended for: general tasks

* **Llama 3 8B Instant**
  - Context: 128K tokens
  - Max response tokens: 8,192
  - Recommended for: quick responses

* **Mixtral 8x7B**
  - Context: 32K tokens
  - Recommended for: complex computations

* **Gemma 2 9B**
  - Context: 8K tokens
  - Recommended for: efficient processing

* **Whisper Large V3**
  - Max file size: 25 MB
  - Recommended for: audio transcription

#### Preview Models
* **Llama 3 90B Vision**
  - Image support
  - Context: 128K tokens
  - Max response tokens: 8,192

* **Qwen 2.5 Coder 32B**
  - Specialization: code processing
  - Context: 128K tokens

## 💡 Использование

1. **Открытие чата:**
   - Нажмите на иконку чата в боковой панели
   - Используйте горячую клавишу (по умолчанию: Ctrl/Cmd + Shift + G)

2. **Отправка сообщений:**
   - Введите текст в поле ввода
   - Нажмите Enter или кнопку "Отправить"
   - Используйте Shift + Enter для переноса строки

3. **Работа с историей:**
   - История сохраняется автоматически
   - Используйте кнопку "Очистить историю" для сброса
   - Выберите способ хранения в настройках (память/файл)

4. **Специальные возможности:**
   - Загрузка аудио для транскрибации (Whisper)
   - Обработка изображений (Vision модели)
   - Анализ кода и генерация (Coder модели)

## ⌨️ Горячие клавиши

| Действие | Windows/Linux | macOS |
|----------|---------------|-------|
| Открыть чат | Ctrl + Shift + G | Cmd + Shift + G |
| Отправить сообщение | Enter | Enter |
| Новая строка | Shift + Enter | Shift + Enter |
| Очистить ввод | Esc | Esc |

## 🎨 Настройка интерфейса

- Размер шрифта
- Отображение временных меток
- Выбор темы (светлая/темная/системная)
- Настройка максимальной длины истории

## 🔒 Безопасность

- Все токены хранятся локально в зашифрованном виде
- Поддержка безопасной авторизации через OAuth 2.0
- Шифрование данных при хранении

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

3. **Проблемы с моделью:**
   - Убедитесь в правильном выборе модели
   - Проверьте ограничения контекста
   - Превью модели могут иметь прерывания

## 🤝 Вклад в развитие

Мы приветствуем вклад в развитие проекта! Для участия:

1. Форкните репозиторий
2. Создайте ветку для вашей функции
3. Внесите изменения
4. Отправьте Pull Request

## 📄 Лицензия

MIT License. См. файл [LICENSE](./LICENSE) для подробностей.

## 🙏 Благодарности

- Команде Obsidian за отличную платформу
- Groq за предоставление API
- Всем контрибьюторам за помощь в развитии

## 📞 Поддержка

- Создайте Issue в репозитории
- Присоединяйтесь к нашему [Discord](ссылка)
- Следите за обновлениями в [Twitter](ссылка)

## 📸 Скриншоты

![Chat Interface](docs/images/chat-interface.png)
![Settings Panel](docs/images/settings-panel.png)
![Google Auth](docs/images/google-auth.png)

## 🎮 Демо

Посмотреть демо можно [здесь](https://semernyakov.github.io/grok-chat-plugin/demo)

## Documentation

- [Setup and Publishing Guide](docs/PUBLISHING.md)
- [Инструкция по настройке и публикации](docs/PUBLISHING.ru.md)

## Development

```bash
# Install dependencies
npm install

# Run development build
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

## Contributing

Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a Pull Request.

## Author

Ivan Semernyakov
- GitHub: [@semernyakov](https://github.com/semernyakov)
- Website: [semernyakov.com](https://semernyakov.com)

---

Создано с ❤️ для сообщества Obsidian