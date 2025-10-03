import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Получаем путь к текущему файлу в формате ESM
const __filename = fileURLToPath(import.meta.url);
// NOTE: __dirname не используется; оставляем только __filename

// Тип для опций запуска
interface CheckOptions {
  configDir: string;
  pluginDataPath: string;
  listAll?: boolean;
  lang?: 'ru' | 'en';
}

// Простейшая i18n-обвязка для сообщений CLI
type Lang = 'ru' | 'en';
const MESSAGES: Record<Lang, Record<string, string>> = {
  ru: {
    NO_PLUGIN_PATH: 'Ошибка: Не указан путь к настройкам плагина',
    SETTINGS_LOAD_ERROR: 'Ошибка при загрузке настроек:',
    SETTINGS_PATH: 'Путь к файлу настроек:',
    ISSUES_FOUND: 'Обнаружены проблемы с настройками моделей.',
    OK_SETTINGS: 'Настройки моделей в порядке.',
    AUTO_PATH_FAIL: 'Ошибка: Не удалось автоматически определить путь к настройкам.',
    SPECIFY_PARAMS: 'Пожалуйста, укажите один из параметров:',
    SETTINGS_NOT_FOUND: 'Ошибка: Файл настроек не найден по пути:',
    CHECK_PATHS: 'Проверьте правильность указанных путей и попробуйте снова.',
    PATH_RESOLVE_FAIL: 'Ошибка: Не удалось определить путь к настройкам',
    RUN_ERROR: 'Ошибка при выполнении проверки:',
  },
  en: {
    NO_PLUGIN_PATH: 'Error: Plugin settings path is not specified',
    SETTINGS_LOAD_ERROR: 'Error while loading settings:',
    SETTINGS_PATH: 'Settings file path:',
    ISSUES_FOUND: 'Issues detected with model settings.',
    OK_SETTINGS: 'Model settings look good.',
    AUTO_PATH_FAIL: 'Error: Failed to auto-detect settings path.',
    SPECIFY_PARAMS: 'Please specify one of the parameters:',
    SETTINGS_NOT_FOUND: 'Error: Settings file not found at path:',
    CHECK_PATHS: 'Verify the provided paths and try again.',
    PATH_RESOLVE_FAIL: 'Error: Failed to resolve settings path',
    RUN_ERROR: 'Error while running the check:',
  },
};

function t(key: keyof (typeof MESSAGES)['ru'], lang: Lang = 'ru'): string {
  return MESSAGES[lang][key] || MESSAGES.ru[key] || key;
}

// Simplified model info type
interface ModelInfo {
  id: string;
  name: string;
  description?: string;
  developer?: string;
  maxTokens?: number;
  releaseDate?: string;
  deprecated?: boolean;
  deprecationDate?: string;
  replacementModel?: string;
  capabilities?: string[];
  type?: string;
  owned_by?: string;
}

// Информация о моделях (актуальный список)
const MODEL_INFO: Record<string, ModelInfo> = {
  'allam-2-7b': {
    id: 'allam-2-7b',
    name: 'Allam 2 7B',
    maxTokens: 4096,
    type: 'chat',
    owned_by: 'SDAIA',
  },
  'deepseek-r1-distill-llama-70b': {
    id: 'deepseek-r1-distill-llama-70b',
    name: 'DeepSeek R1 Distill Llama 70B',
    maxTokens: 131072,
    type: 'chat',
    owned_by: 'DeepSeek / Meta',
  },
  'deepseek-r1-distill-qwen-32b': {
    id: 'deepseek-r1-distill-qwen-32b',
    name: 'DeepSeek R1 Distill Qwen 32B',
    maxTokens: 131072,
    type: 'chat',
    owned_by: 'DeepSeek / Alibaba Cloud',
  },
  'gemma2-9b-it': {
    id: 'gemma2-9b-it',
    name: 'Gemma 2 9B IT',
    maxTokens: 8192,
    type: 'chat',
    owned_by: 'Google',
  },
  'llama-3.1-8b-instant': {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B Instant',
    maxTokens: 131072,
    type: 'chat',
    owned_by: 'Meta',
  },
  'llama-3.2-1b-preview': {
    id: 'llama-3.2-1b-preview',
    name: 'Llama 3.2 1B Preview',
    maxTokens: 8192,
    type: 'chat',
    owned_by: 'Meta',
  },
  'llama-3.2-3b-preview': {
    id: 'llama-3.2-3b-preview',
    name: 'Llama 3.2 3B Preview',
    maxTokens: 8192,
    type: 'chat',
    owned_by: 'Meta',
  },
  'llama-3.3-70b-specdec': {
    id: 'llama-3.3-70b-specdec',
    name: 'Llama 3.3 70B SpecDec',
    maxTokens: 8192,
    type: 'chat',
    owned_by: 'Meta',
  },
  'llama-3.3-70b-versatile': {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B Versatile',
    maxTokens: 32768,
    type: 'chat',
    owned_by: 'Meta',
  },
  'llama-guard-3-8b': {
    id: 'llama-guard-3-8b',
    name: 'Llama Guard 3 8B',
    maxTokens: 8192,
    type: 'chat',
    owned_by: 'Meta',
  },
  'llama3-70b-8192': {
    id: 'llama3-70b-8192',
    name: 'Llama 3 70B',
    maxTokens: 8192,
    type: 'chat',
    owned_by: 'Meta',
  },
  'llama3-8b-8192': {
    id: 'llama3-8b-8192',
    name: 'Llama 3 8B',
    maxTokens: 8192,
    type: 'chat',
    owned_by: 'Meta',
  },
  'meta-llama/llama-4-maverick-17b-128e-instruct': {
    id: 'meta-llama/llama-4-maverick-17b-128e-instruct',
    name: 'Meta Llama 4 Maverick 17B 128E Instruct',
    maxTokens: 8192,
    type: 'chat',
    owned_by: 'Meta',
  },
  'mistral-saba-24b': {
    id: 'mistral-saba-24b',
    name: 'Mistral Saba 24B',
    maxTokens: 32768,
    type: 'chat',
    owned_by: 'Mistral AI',
  },
  'qwen-2.5-32b': {
    id: 'qwen-2.5-32b',
    name: 'Qwen 2.5 32B',
    maxTokens: 131072,
    type: 'chat',
    owned_by: 'Alibaba Cloud',
  },
  'qwen-2.5-coder-32b': {
    id: 'qwen-2.5-coder-32b',
    name: 'Qwen 2.5 Coder 32B',
    maxTokens: 131072,
    type: 'chat',
    owned_by: 'Alibaba Cloud',
  },
  'qwen-qwq-32b': {
    id: 'qwen-qwq-32b',
    name: 'Qwen QwQ 32B',
    maxTokens: 131072,
    type: 'chat',
    owned_by: 'Alibaba Cloud',
  },
  // Устаревшие модели (для примера)
  'mixtral-8x7b-32768': {
    id: 'mixtral-8x7b-32768',
    name: 'Mixtral 8x7B',
    maxTokens: 32768,
    type: 'chat',
    owned_by: 'Mistral AI',
    deprecated: true,
    deprecationDate: '2025-08-01',
    replacementModel: 'mistral-saba-24b',
  },
  'gemma-7b-it': {
    id: 'gemma-7b-it',
    name: 'Gemma 7B',
    maxTokens: 8192,
    type: 'chat',
    owned_by: 'Google',
    deprecated: true,
    deprecationDate: '2025-07-15',
    replacementModel: 'gemma2-9b-it',
  },
};

// Types for plugin settings
interface GroqModelInfo {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  created?: number;
  owned_by?: string;
  object?: string;
  category?: string;
  developer?: { name: string; url?: string };
  maxTokens?: number;
  tokensPerMinute?: number;
  releaseStatus?: string;
}

interface PluginSettings {
  apiKey?: string;
  model?: string; // Made optional to handle cases where it might be missing
  temperature?: number;
  maxTokens?: number;
  historyStorageMethod?: string;
  maxHistoryLength?: number;
  notePath?: string;
  displayMode?: 'tab' | 'sidepanel';
  language?: string;
  groqAvailableModels?: GroqModelInfo[];
  groqRateLimits?: any;
  [key: string]: any;
}

// Функция для вывода справки
function showHelp() {
  console.log(`
  Проверка устаревших моделей для плагина PolyChat

  Использование:
    1. С указанием каталога конфигурации:
       npm run check-models -- --config-dir=ваш_каталог_конфигурации
    2. С указанием полного пути к данным плагина:
       npm run check-models -- --plugin-data-dir=путь/к/плагину/data
    3. Вывести все доступные модели:
       npm run check-models -- --list-all
    4. Указать язык вывода:
       npm run check-models -- --lang=en

  Переменные окружения:
    OBSIDIAN_VAULT_PATH - путь к корню хранилища Obsidian
    OBSIDIAN_CONFIG_DIR - имя каталога конфигурации (по умолчанию: .obsidian)
    NODE_ENV=development - использовать пути по умолчанию для разработки
  `);
  process.exit(1);
}

// Функция для проверки существования файла настроек
function checkSettingsFile(filePath: string): boolean {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch (e) {
    return false;
  }
}

// Функция для поиска файла настроек в типичных местах
function findSettingsFile(options: CheckOptions): string | null {
  // Список возможных мест для поиска
  const possiblePaths = [
    // 1. Текущая директория
    path.join(process.cwd(), 'settings.json'),
    // 2. Родительская директория
    path.join(process.cwd(), '..', 'settings.json'),
    // 3. Стандартный путь в хранилище Obsidian
    path.join(
      process.env.HOME || process.env.USERPROFILE || '',
      options.configDir || '.obsidian',
      'plugins',
      'polychat',
      'data',
      'settings.json',
    ),
    // 4. Стандартный путь в хранилище для macOS
    path.join(
      process.env.HOME || '',
      'Library',
      'Mobile Documents',
      'iCloud~md~obsidian',
      'Documents',
      options.configDir || '.obsidian',
      'plugins',
      'polychat',
      'data',
      'settings.json',
    ),
  ];

  // Проверяем каждый путь
  for (const filePath of possiblePaths) {
    if (checkSettingsFile(filePath)) {
      console.log(`Автоматически обнаружен файл настроек: ${filePath}`);
      return filePath;
    }
  }

  return null;
}

// Функция для проверки устаревших моделей
export async function checkObsoleteModels(options: CheckOptions) {
  const { pluginDataPath, listAll = false, lang = 'ru' } = options;
  console.log(`Проверка моделей в каталоге: ${options.configDir}`);

  // Загружаем настройки
  let settings: PluginSettings = {};

  if (!pluginDataPath) {
    console.error(t('NO_PLUGIN_PATH', lang));
    return false;
  }

  console.log(`Загрузка настроек из: ${pluginDataPath}`);

  try {
    const settingsContent = fs.readFileSync(pluginDataPath, 'utf-8');
    settings = JSON.parse(settingsContent) as PluginSettings;
  } catch (error) {
    console.error(
      t('SETTINGS_LOAD_ERROR', lang),
      error instanceof Error ? error.message : String(error),
    );
    console.error(t('SETTINGS_PATH', lang), pluginDataPath);
    return false;
  }

  // Получаем список моделей из настроек
  const availableModels: string[] = settings.groqAvailableModels?.map(m => m.id) || [];
  const currentModel: string = settings.model || '';

  // Получаем список всех известных моделей (исключая устаревшие)
  const allModelIds = Object.entries(MODEL_INFO)
    .filter(([_, info]) => !info.deprecated)
    .map(([id]) => id);

  // Ищем устаревшие модели в настройках
  const deprecatedModels = Object.entries(MODEL_INFO)
    .filter(([modelId, info]) => info.deprecated && availableModels.includes(modelId))
    .map(([modelId, info]) => ({
      id: modelId,
      name: info.name,
      deprecationDate: info.deprecationDate,
      replacementModel: info.replacementModel,
    }));

  // Проверяем модели в настройках, которых нет в MODEL_INFO
  const unknownModels = availableModels.filter(id => !Object.keys(MODEL_INFO).includes(id));

  // Выводим информацию об устаревших моделях
  if (deprecatedModels.length > 0) {
    console.log('\n⚠️  Обнаружены устаревшие модели в настройках:');
    deprecatedModels.forEach(model => {
      console.log(`\n❌ ${model.id} (${model.name})`);
      if (model.deprecationDate) console.log(`  Устареет: ${model.deprecationDate}`);
      if (model.replacementModel) console.log(`  Замена: ${model.replacementModel}`);
    });
  }

  // Проверяем, не использует ли пользователь устаревшую модель
  if (
    currentModel &&
    Object.keys(MODEL_INFO).includes(currentModel) &&
    MODEL_INFO[currentModel as keyof typeof MODEL_INFO]?.deprecated
  ) {
    const currentModelInfo = MODEL_INFO[currentModel as keyof typeof MODEL_INFO];
    console.log('\n❌ Внимание: В настройках выбрана устаревшая модель!');
    console.log(`   Текущая модель: ${currentModel} (${currentModelInfo?.name || 'неизвестно'})`);
    if (currentModelInfo?.replacementModel) {
      console.log(`   Рекомендуется заменить на: ${currentModelInfo.replacementModel}`);
    }
    if (currentModelInfo?.deprecationDate) {
      console.log(`   Дата устаревания: ${currentModelInfo.deprecationDate}`);
    }
  } else if (currentModel) {
    console.log('\n✅ Выбранная модель актуальна.');
  }

  // Выводим список всех доступных моделей, если запрошено
  if (options.listAll) {
    console.log('\n=== Все доступные модели ===');
    Object.entries(MODEL_INFO).forEach(([modelId, model]) => {
      const deprecatedInfo = model?.deprecated ? ' (УСТАРЕВШАЯ)' : '';
      console.log(`- ${modelId}${deprecatedInfo}: ${model?.name || 'неизвестно'}`);
      if (model?.description) console.log(`  ${model.description}`);
      if (model?.maxTokens) console.log(`  Макс. токенов: ${model.maxTokens}`);
      if (model?.owned_by) console.log(`  Разработчик: ${model.owned_by}`);
      if (model?.deprecationDate) console.log(`  Устареет: ${model.deprecationDate}`);
      if (model?.replacementModel) console.log(`  Замена: ${model.replacementModel}`);
    });
  }

  // Выводим информацию о неизвестных моделях
  if (unknownModels.length > 0) {
    console.log('\n⚠️  Следующие модели в настройках не найдены в списке известных моделей:');
    unknownModels.forEach(id => {
      console.log(`  - ${id}`);
    });
  }

  // Завершаем выполнение с соответствующим кодом выхода
  const hasIssues = deprecatedModels.length > 0 || unknownModels.length > 0;
  if (hasIssues) {
    console.log(`\n❌ ${t('ISSUES_FOUND', lang)}`);
    return false;
  } else {
    console.log(`\n✅ ${t('OK_SETTINGS', lang)}`);
    return true;
  }
}

// Точка входа при запуске как отдельного скрипта
const isMain = process.argv[1] === __filename;
if (isMain) {
  // Получаем аргументы командной строки
  const args = process.argv.slice(2);

  // Обработка флага --help
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
  }

  const configDirArg = args.find(arg => arg.startsWith('--config-dir='))?.split('=')[1];
  const pluginDataDirArg = args.find(arg => arg.startsWith('--plugin-data-dir='))?.split('=')[1];
  const listAll = args.includes('--list-all');
  const langArg = (args.find(arg => arg.startsWith('--lang='))?.split('=')[1] || '').toLowerCase();
  const lang: Lang = langArg === 'en' ? 'en' : 'ru';

  let settingsPath: string | null = null;
  const configDir = process.env.OBSIDIAN_CONFIG_DIR || '.obsidian';

  // Определяем путь к настройкам
  if (pluginDataDirArg) {
    // Если передан явный путь к данным плагина
    settingsPath = path.isAbsolute(pluginDataDirArg)
      ? path.join(pluginDataDirArg, 'settings.json')
      : path.join(process.cwd(), pluginDataDirArg, 'settings.json');
    console.log(`Используется переданный путь к данным плагина: ${settingsPath}`);
  } else if (configDirArg) {
    // Если передан configDir, используем стандартную структуру
    let vaultRoot: string;
    let configPath: string;

    if (path.isAbsolute(configDirArg)) {
      // Если передан абсолютный путь, используем его как полный путь к .obsidian
      vaultRoot = path.dirname(configDirArg); // Получаем родительскую директорию .obsidian
      configPath = path.basename(configDirArg); // Получаем имя директории .obsidian
    } else {
      // Относительный путь - используем стандартную логику
      vaultRoot = process.env.OBSIDIAN_VAULT_PATH || path.join(process.cwd(), '..', '..');
      configPath = configDirArg.startsWith('.')
        ? configDirArg // Если путь относительный, оставляем как есть
        : path.join('.', configDirArg); // Иначе делаем относительным
    }

    settingsPath = path.join(vaultRoot, configPath, 'plugins/polychat/data/settings.json');
    console.log(`Используется configDir: ${path.join(vaultRoot, configPath)}`);
  } else if (process.env.NODE_ENV === 'development') {
    // Только для разработки - используем значения по умолчанию
    const vaultRoot = process.env.OBSIDIAN_VAULT_PATH || path.join(process.cwd(), '..', '..');
    settingsPath = path.join(vaultRoot, configDir, 'plugins/polychat/data/settings.json');
    console.log('Режим разработки. Используются пути по умолчанию:');
    console.log('  Хранилище:', vaultRoot);
    console.log('  Каталог конфигурации:', configDir);
    console.log('  Путь к настройкам:', settingsPath);
  } else {
    // Пытаемся автоматически найти файл настроек
    settingsPath = findSettingsFile({
      configDir: configDirArg || configDir,
      pluginDataPath: '', // Это значение не используется в findSettingsFile, но требуется по типу
      listAll: false,
    });

    if (!settingsPath) {
      console.error(t('AUTO_PATH_FAIL', lang));
      console.error(t('SPECIFY_PARAMS', lang));
      showHelp();
    }
  }

  // Проверяем существование файла настроек
  if (settingsPath && !checkSettingsFile(settingsPath)) {
    console.error(`\n❌ ${t('SETTINGS_NOT_FOUND', lang)} ${settingsPath}`);
    console.error(t('CHECK_PATHS', lang));
    showHelp();
  }

  // Запускаем проверку
  if (!settingsPath) {
    console.error(t('PATH_RESOLVE_FAIL', lang));
    process.exit(1);
  }

  console.log(`
=== PolyChat Model Checker ===
Проверка моделей Groq на актуальность
Версия: 1.0.0
  `);

  checkObsoleteModels({
    configDir: configDirArg || configDir,
    pluginDataPath: settingsPath,
    listAll,
    lang,
  })
    .then(success => {
      console.log(`
Проверка завершена. ${success ? 'Все модели актуальны.' : 'Обнаружены проблемы с моделями.'}
Для получения справки используйте: npm run check-models -- --help
      `);
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error(t('RUN_ERROR', lang), error);
      process.exit(1);
    });
}
