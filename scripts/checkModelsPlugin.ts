import { App, Plugin, PluginManifest } from 'obsidian';
import { checkObsoleteModels } from './check_obsolete_models';

interface VaultWithConfigDir {
  configDir: string;
}

export default class CheckModelsPlugin extends Plugin {
  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest);
  }

  async onload() {
    console.log('Запуск проверки моделей...');

    try {
      // Получаем путь к каталогу конфигурации из Vault
      const vault = this.app.vault as unknown as VaultWithConfigDir;
      const configDir = vault.configDir || '.obsidian';
      const pluginDataPath = `${configDir}/plugins/groq-chat-plugin/data/settings.json`;

      console.log(`Используется каталог конфигурации: ${configDir}`);
      console.log(`Путь к настройкам плагина: ${pluginDataPath}`);

      // Запускаем проверку
      const success = await checkObsoleteModels({
        configDir,
        pluginDataPath,
        listAll: true,
      });

      console.log(`Проверка моделей завершена ${success ? 'успешно' : 'с ошибками'}`);
    } catch (error) {
      console.error(
        'Ошибка при проверке моделей:',
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      // Завершаем работу плагина
      this.app.workspace.detachLeavesOfType('check-models');
    }
  }
}

// Экспортируем функцию для использования в основном скрипте
export async function runCheckModels(app: App): Promise<CheckModelsPlugin> {
  const plugin = new CheckModelsPlugin(app, {
    name: 'Check Models',
    id: 'check-models',
    version: '1.0.0',
    author: 'Your Name',
    description: 'Плагин для проверки устаревших моделей Groq',
    minAppVersion: '0.15.0',
  });

  await plugin.load();
  return plugin;
}
