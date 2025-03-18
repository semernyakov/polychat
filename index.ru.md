---
layout: default
title: Groq Chat Plugin для Obsidian
description: Интегрируйте возможности ИИ от Groq прямо в ваши заметки Obsidian
---

# Groq Chat Plugin для Obsidian

[![Релиз](https://img.shields.io/github/v/release/semernyakov/groq-chat-plugin?style=flat-square)](https://github.com/semernyakov/groq-chat-plugin/releases/latest)
[![Загрузки](https://img.shields.io/github/downloads/semernyakov/groq-chat-plugin/total?style=flat-square)](https://github.com/semernyakov/groq-chat-plugin/releases)
[![Лицензия](https://img.shields.io/github/license/semernyakov/groq-chat-plugin?style=flat-square)](https://github.com/semernyakov/groq-chat-plugin/blob/master/LICENSE)
[![CodeQL](https://img.shields.io/github/actions/workflow/status/semernyakov/groq-chat-plugin/ci.yml?branch=master&label=тесты&style=flat-square)](https://github.com/semernyakov/groq-chat-plugin/actions)
[![Codecov](https://img.shields.io/codecov/c/github/semernyakov/groq-chat-plugin?style=flat-square)](https://codecov.io/gh/semernyakov/groq-chat-plugin)
[![npm](https://img.shields.io/npm/v/groq-chat-plugin?style=flat-square)](https://www.npmjs.com/package/groq-chat-plugin)

Мощный плагин для [Obsidian](https://obsidian.md), который интегрирует возможности искусственного интеллекта Groq прямо в ваши заметки.

[Инструкция по установке](SETUP_AND_PUBLISH.ru.md){: .button} [Документация](PUBLISHING.ru.md){: .button} [Демо](demo/){: .button}

## Доступные модели

### Производственные модели

#### Большие языковые модели (LLMs)
- **Llama 3 70B Versatile**
  - Контекст: 128K токенов
  - Макс. ответ: 32,768 токенов
  - Лучше всего для: Общих задач, сложных рассуждений, творческого письма
  - Цена: $0.0007/1K токенов

- **Llama 3 8B Instant**
  - Контекст: 128K токенов
  - Макс. ответ: 8,192 токенов
  - Лучше всего для: Быстрых ответов, простых задач
  - Цена: $0.0001/1K токенов

- **Mixtral 8x7B**
  - Контекст: 32K токенов
  - Макс. ответ: 4,096 токенов
  - Лучше всего для: Многоязычных задач, генерации кода
  - Цена: $0.0002/1K токенов

- **Gemma 2 9B**
  - Контекст: 8K токенов
  - Макс. ответ: 2,048 токенов
  - Лучше всего для: Эффективной обработки, легких приложений
  - Цена: $0.0001/1K токенов

#### Специализированные модели
- **Llama Guard 3 8B**
  - Назначение: Безопасность контента и модерация
  - Контекст: 128K токенов
  - Цена: $0.0001/1K токенов

- **Whisper Large V3**
  - Назначение: Транскрипция аудио
  - Макс. размер файла: 25 МБ
  - Поддерживаемые форматы: mp3, wav, m4a
  - Цена: $0.0001/секунда

### Предварительные модели (Бета)

- **Llama 3 90B Vision**
  - Возможности: Понимание и анализ изображений
  - Контекст: 128K токенов
  - Макс. ответ: 8,192 токенов
  - Поддержка изображений: Да
  - Статус: Бета

- **Qwen 2.5 Coder 32B**
  - Назначение: Генерация и анализ кода
  - Контекст: 128K токенов
  - Языки: Все основные языки программирования
  - Статус: Бета

- **Mistral Saba 24B**
  - Назначение: Общие задачи с улучшенной эффективностью
  - Контекст: 32K токенов
  - Статус: Бета

- **DeepSeek Models**
  - Назначение: Специализированные задачи
  - Доступные варианты: MoE, Coder
  - Статус: Бета

## Основные возможности

- Интерфейс чата в реальном времени
- Форматирование Markdown
- Подсветка кода
- Поддержка мобильных устройств
- Выбор модели
- История чата
- Контекстно-зависимые ответы

## Быстрый старт

1. Установите плагин из раздела Community Plugins в Obsidian
2. Получите API ключ в [Groq Console](https://console.groq.com)
3. Настройте плагин в настройках Obsidian
4. Начните общение с ИИ!

## Документация

- [Руководство по установке](SETUP_AND_PUBLISH.ru.md)
- [Руководство пользователя](PUBLISHING.ru.md)
- [Политика безопасности](https://github.com/semernyakov/groq-chat-plugin/blob/master/SECURITY.md)
- [Руководство по участию в разработке](https://github.com/semernyakov/groq-chat-plugin/blob/master/CONTRIBUTING.md)

## Поддержка

- [GitHub Issues](https://github.com/semernyakov/groq-chat-plugin/issues)
- [GitHub Discussions](https://github.com/semernyakov/groq-chat-plugin/discussions)
- [Поддержать проект](https://github.com/sponsors/semernyakov)

## Живое демо

Попробуйте возможности плагина в нашем [живом демо](demo/)!

---

[Просмотреть на GitHub](https://github.com/semernyakov/groq-chat-plugin){: .button}

[English version](index.md){: .button} 