import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import type { App } from 'obsidian';

// Получаем путь к текущему файлу в формате ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Тип для опций запуска
interface CheckOptions {
  configDir: string;
  pluginDataPath: string;
  listAll?: boolean;
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
}

// Simplified model info (only what's needed for this script)
const MODEL_INFO: Record<string, ModelInfo> = {
  'llama3-70b-8192': {
    id: 'llama3-70b-8192',
    name: 'Llama 3 70B',
    maxTokens: 8192,
    type: 'chat',
  },
  'llama3-8b-8192': {
    id: 'llama3-8b-8192',
    name: 'Llama 3 8B',
    maxTokens: 8192,
    type: 'chat',
  },
  'mixtral-8x7b-32768': {
    id: 'mixtral-8x7b-32768',
    name: 'Mixtral 8x7B',
    maxTokens: 32768,
    type: 'chat',
  },
  'gemma-7b-it': {
    id: 'gemma-7b-it',
    name: 'Gemma 7B',
    maxTokens: 8192,
    type: 'chat',
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
  // console.log(`
// Проверка устаревших моделей для плагина Groq Chat

// Использование:
//   1. С указанием каталога конфигурации:
//      npm run check-models -- --config-dir=ваш_каталог_конфигурации
//   2. С указанием полного пути к данным плагина:
//      npm run check-models -- --plugin-data-dir=путь/к/плагину/data

// Переменные окружения:
//   OBSIDIAN_VAULT_PATH - путь к корню хранилища Obsidian
//   OBSIDIAN_CONFIG_DIR - имя каталога конфигурации (по умолчанию: .obsidian)
//   NODE_ENV=development - использовать пути по умолчанию для разработки
// `);
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
      'groq-chat-plugin',
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
      'groq-chat-plugin',
      'data',
      'settings.json',
    ),
  ];

  // Проверяем каждый путь
  for (const filePath of possiblePaths) {
    if (checkSettingsFile(filePath)) {
      // console.log(`Автоматически обнаружен файл настроек: ${filePath}`);
      return filePath;
    }
  }

  return null;
}

// Функция для проверки устаревших моделей
export async function checkObsoleteModels(options: CheckOptions) {
  const { pluginDataPath, listAll = false } = options;
  // console.log(`Проверка моделей в каталоге: ${options.configDir}`);

  // Загружаем настройки
  let settings: PluginSettings = {};

  if (!pluginDataPath) {
    console.error('Ошибка: Не указан путь к настройкам плагина');
    return false;
  }

  // console.log(`Загрузка настроек из: ${pluginDataPath}`);

  try {
    const settingsContent = fs.readFileSync(pluginDataPath, 'utf-8');
    settings = JSON.parse(settingsContent) as PluginSettings;
  } catch (error) {
    console.error(
      'Ошибка при загрузке настроек:',
      error instanceof Error ? error.message : String(error),
    );
    console.error('Путь к файлу настроек:', pluginDataPath);
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

  // Проверяем наличие устаревших моделей в настройках
  const staticModelIds = Object.keys(MODEL_INFO);
  const obsoleteModels = staticModelIds.filter(id => !availableModels.includes(id));

  // Выводим информацию об устаревших моделях
  if (deprecatedModels.length > 0) {
    // console.log('\n⚠️  Обнаружены устаревшие модели в настройках:');
    deprecatedModels.forEach(model => {
      // console.log(`\n❌ ${model.id} (${model.name})`);
      // if (model.deprecationDate) console.log(`  Устареет: ${model.deprecationDate}`);
      // if (model.replacementModel) console.log(`  Замена: ${model.replacementModel}`);
    });
  }

  // Проверяем, не использует ли пользователь устаревшую модель
  if (
    currentModel &&
    allModelIds.includes(currentModel) &&
    MODEL_INFO[currentModel as keyof typeof MODEL_INFO]?.deprecated
  ) {
    const currentModelInfo = MODEL_INFO[currentModel as keyof typeof MODEL_INFO];
    // console.log('\n❌ Внимание: В настройках выбрана устаревшая модель!');
    // console.log(`   Текущая модель: ${currentModel} (${currentModelInfo?.name || 'неизвестно'})`);
    if (currentModelInfo?.replacementModel) {
      // console.log(`   Рекомендуется заменить на: ${currentModelInfo.replacementModel}`);
    }
    if (currentModelInfo?.deprecationDate) {
      // console.log(`   Дата устаревания: ${currentModelInfo.deprecationDate}`);
    }
  } else if (currentModel) {
    // console.log('\n✅ Выбранная модель актуальна.');
  }

  // Выводим список всех доступных моделей, если запрошено
  if (options.listAll) {
    // console.log('\n=== Все доступные модели ===');
    allModelIds.forEach(modelId => {
      const model = MODEL_INFO[modelId as keyof typeof MODEL_INFO];
      const deprecatedInfo = model?.deprecated ? ' (DEPRECATED)' : '';
      // console.log(`- ${modelId}${deprecatedInfo}: ${model?.name || 'неизвестно'}`);
      // if (model?.description) console.log(`  ${model.description}`);
      // if (model?.maxTokens) console.log(`  Макс. токенов: ${model.maxTokens}`);
      // if (model?.deprecationDate) console.log(`  Устареет: ${model.deprecationDate}`);
      // if (model?.replacementModel) console.log(`  Замена: ${model.replacementModel}`);
    });
  }

  // Выводим информацию об отсутствующих моделях
  if (obsoleteModels.length > 0) {
    // console.log('\n⚠️  Следующие модели отсутствуют в настройках, но есть в списке доступных:');
    obsoleteModels.forEach(id => {
      const info = MODEL_INFO[id as keyof typeof MODEL_INFO];
      // console.log(`  - ${id} (${info?.name || 'неизвестно'})`);
    });
  }

  // Завершаем выполнение с соответствующим кодом выхода
  const hasIssues = deprecatedModels.length > 0 || obsoleteModels.length > 0;
  if (hasIssues) {
    // console.log('\n❌ Обнаружены проблемы с настройками моделей.');
    return false;
  } else {
    // console.log('\n✅ Настройки моделей в порядке.');
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

  let settingsPath: string | null = null;
  const configDir = process.env.OBSIDIAN_CONFIG_DIR || '.obsidian';

  // Определяем путь к настройкам
  if (pluginDataDirArg) {
    // Если передан явный путь к данным плагина
    settingsPath = path.isAbsolute(pluginDataDirArg)
      ? path.join(pluginDataDirArg, 'settings.json')
      : path.join(process.cwd(), pluginDataDirArg, 'settings.json');
    // console.log(`Используется переданный путь к данным плагина: ${settingsPath}`);
  } else if (configDirArg) {
    // Если передан configDir, используем стандартную структуру
    const vaultRoot = process.env.OBSIDIAN_VAULT_PATH || path.join(process.cwd(), '..', '..');
    const configPath = configDirArg.startsWith('.')
      ? configDirArg // Если путь относительный, оставляем как есть
      : path.join('.', configDirArg); // Иначе делаем относительным

    settingsPath = path.join(vaultRoot, configPath, 'plugins/groq-chat-plugin/data/settings.json');
    // console.log(`Используется configDir: ${path.join(vaultRoot, configPath)}`);
  } else if (process.env.NODE_ENV === 'development') {
    // Только для разработки - используем значения по умолчанию
    const vaultRoot = process.env.OBSIDIAN_VAULT_PATH || path.join(process.cwd(), '..', '..');
    settingsPath = path.join(vaultRoot, configDir, 'plugins/groq-chat-plugin/data/settings.json');
    // console.log('Режим разработки. Используются пути по умолчанию:');
    // console.log('  Хранилище:', vaultRoot);
    // console.log('  Каталог конфигурации:', configDir);
    // console.log('  Путь к настройкам:', settingsPath);
  } else {
    // Пытаемся автоматически найти файл настроек
    settingsPath = findSettingsFile({
      configDir: configDirArg || configDir,
      pluginDataPath: '', // Это значение не используется в findSettingsFile, но требуется по типу
      listAll: false
    });

    if (!settingsPath) {
      console.error('Ошибка: Не удалось автоматически определить путь к настройкам.');
      console.error('Пожалуйста, укажите один из параметров:');
      showHelp();
    }
  }

  // Проверяем существование файла настроек
  if (settingsPath && !checkSettingsFile(settingsPath)) {
    console.error(`\n❌ Ошибка: Файл настроек не найден по пути: ${settingsPath}`);
    console.error('Проверьте правильность указанных путей и попробуйте снова.');
    showHelp();
  }

  // Запускаем проверку
  if (!settingsPath) {
    console.error('Ошибка: Не удалось определить путь к настройкам');
    process.exit(1);
  }

  checkObsoleteModels({
    configDir: configDirArg || configDir,
    pluginDataPath: settingsPath,
    listAll,
  })
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Ошибка при выполнении проверки:', error);
      process.exit(1);
    });
}
