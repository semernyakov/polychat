# Публикация плагина в Obsidian

## Подготовка к публикации

### 1. Проверка структуры проекта

Убедитесь, что в корне проекта присутствуют все необходимые файлы:

```
groq-chat-plugin/
├── manifest.json         # Метаданные плагина
├── package.json         # Конфигурация npm
├── versions.json        # История версий
├── main.js             # Скомпилированный плагин
├── styles.css          # Стили плагина
├── README.md           # Документация
└── LICENSE             # Лицензия MIT
```

### 2. Проверка manifest.json

Убедитесь, что файл `manifest.json` содержит корректные данные:

```json
{
    "id": "groq-chat",
    "name": "Groq Chat",
    "version": "1.0.0",
    "minAppVersion": "0.15.0",
    "description": "Интеграция с Groq API для чата с использованием различных моделей",
    "author": "Semernyakov",
    "authorUrl": "https://github.com/semernyakov",
    "fundingUrl": "https://github.com/sponsors/semernyakov",
    "isDesktopOnly": false,
    "repo": "semernyakov/groq-chat-plugin",
    "mobile": {
        "icon": "message-square"
    }
}
```

### 3. Проверка package.json

Убедитесь, что в `package.json` настроены все необходимые скрипты:

```json
{
    "scripts": {
        "dev": "rollup -c -w",
        "build": "rollup -c",
        "test": "jest",
        "lint": "eslint . --ext .ts,.tsx",
        "version": "node version-bump.mjs && git add manifest.json versions.json",
        "publish": "npm run build && npm run test && npm run release"
    }
}
```

## Процесс публикации

### 1. Подготовка релиза

1. Убедитесь, что все изменения закоммичены:
   ```bash
   git status
   ```

2. Проверьте, что все тесты проходят:
   ```bash
   npm run test
   ```

3. Проверьте сборку проекта:
   ```bash
   npm run build
   ```

4. Проверьте линтинг:
   ```bash
   npm run lint
   ```

### 2. Создание релиза

1. Обновите версию плагина:
   ```bash
   npm version patch # для патча (1.0.0 -> 1.0.1)
   # или
   npm version minor # для минорной версии (1.0.0 -> 1.1.0)
   # или
   npm version major # для мажорной версии (1.0.0 -> 2.0.0)
   ```

2. Создайте релиз:
   ```bash
   npm run release
   ```

3. Отправьте изменения в репозиторий:
   ```bash
   git push --follow-tags origin master
   ```

### 3. Публикация в Community Plugins

1. Форкните репозиторий [obsidian-releases](https://github.com/obsidianmd/obsidian-releases)

2. Добавьте информацию о плагине в `community-plugins.json`:
   ```json
   {
       "id": "groq-chat",
       "name": "Groq Chat",
       "author": "Semernyakov",
       "description": "Интеграция с Groq API для чата с использованием различных моделей",
       "repo": "semernyakov/groq-chat-plugin",
       "branch": "master"
   }
   ```

3. Создайте Pull Request в репозиторий obsidian-releases

### 4. Проверка перед отправкой PR

1. Проверьте работу плагина в Obsidian:
   - Установите плагин из локального файла
   - Проверьте основной функционал
   - Проверьте работу на мобильных устройствах

2. Убедитесь, что документация актуальна:
   - README.md содержит актуальную информацию
   - Описаны все функции и настройки
   - Есть инструкции по установке и использованию

3. Проверьте файлы релиза:
   - manifest.json содержит правильную версию
   - versions.json обновлен
   - main.js успешно собран
   - styles.css содержит все стили

## После публикации

### 1. Мониторинг

1. Следите за issues в репозитории
2. Отвечайте на вопросы пользователей
3. Исправляйте найденные баги

### 2. Обновления

1. Для выпуска обновления повторите процесс релиза
2. Обновите versions.json для новой версии
3. Создайте новый релиз на GitHub

### 3. Поддержка

1. Регулярно обновляйте зависимости
2. Следите за обновлениями Obsidian API
3. Поддерживайте совместимость с новыми версиями Obsidian

## Полезные ссылки

- [Obsidian Plugin Guidelines](https://docs.obsidian.md/Plugins/Getting+started/Plugin+guidelines)
- [Obsidian Releases Repository](https://github.com/obsidianmd/obsidian-releases)
- [Sample Plugin Repository](https://github.com/obsidianmd/obsidian-sample-plugin)

## Контрольный список

- [ ] Все необходимые файлы присутствуют
- [ ] manifest.json содержит корректные данные
- [ ] versions.json обновлен
- [ ] Тесты проходят успешно
- [ ] Сборка работает без ошибок
- [ ] Документация актуальна
- [ ] Плагин работает на мобильных устройствах
- [ ] Создан релиз на GitHub
- [ ] Отправлен PR в obsidian-releases 