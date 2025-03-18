import { App, PluginSettingTab, Setting, Notice } from 'obsidian';
import GroqChatPlugin from '../main';
import { AuthService } from '../services/authService';
import { GROQ_MODELS } from '../constants/models';

export class GroqChatSettingsTab extends PluginSettingTab {
  plugin: GroqChatPlugin;
  private authService: AuthService;

  constructor(app: App, plugin: GroqChatPlugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.authService = new AuthService(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Настройки Groq Chat' });

    // API ключ
    new Setting(containerEl)
      .setName('API ключ')
      .setDesc('Введите API ключ для доступа к Groq API')
      .addText(text =>
        text
          .setPlaceholder('gsk_...')
          .setValue(this.plugin.settings.apiKey)
          .onChange(async value => {
            this.plugin.settings.apiKey = value;
            await this.plugin.saveSettings();
          }),
      )
      .addButton(button =>
        button.setButtonText('Проверить').onClick(async () => {
          const isValid = await this.authService.validateApiKey(this.plugin.settings.apiKey);
          if (isValid) {
            new Notice('API ключ действителен');
          } else {
            new Notice('API ключ недействителен');
          }
        }),
      );

    // Модель
    new Setting(containerEl)
      .setName('Модель')
      .setDesc('Выберите модель Groq для использования')
      .addDropdown(dropdown =>
        dropdown
          .addOptions(
            GROQ_MODELS.reduce(
              (obj, model) => {
                obj[model] = model;
                return obj;
              },
              {} as Record<string, string>,
            ),
          )
          .setValue(this.plugin.settings.model)
          .onChange(async value => {
            this.plugin.settings.model = value;
            await this.plugin.saveSettings();
          }),
      );

    // Температура
    new Setting(containerEl)
      .setName('Температура')
      .setDesc('Уровень случайности от 0.1 (детерминированный) до 1.0 (креативный)')
      .addSlider(slider =>
        slider
          .setLimits(0.1, 1.0, 0.1)
          .setValue(this.plugin.settings.temperature)
          .setDynamicTooltip()
          .onChange(async value => {
            this.plugin.settings.temperature = value;
            await this.plugin.saveSettings();
          }),
      );

    // Максимальное количество токенов
    new Setting(containerEl)
      .setName('Максимальное количество токенов')
      .setDesc('Максимальная длина ответа в токенах')
      .addText(text =>
        text
          .setPlaceholder('4096')
          .setValue(String(this.plugin.settings.maxTokens))
          .onChange(async value => {
            const parsedValue = parseInt(value);
            if (!isNaN(parsedValue) && parsedValue > 0) {
              this.plugin.settings.maxTokens = parsedValue;
              await this.plugin.saveSettings();
            }
          }),
      );

    // Способ хранения истории
    new Setting(containerEl)
      .setName('Метод хранения истории')
      .setDesc('Выберите, как хранить историю чата')
      .addDropdown(dropdown =>
        dropdown
          .addOptions({
            memory: 'В памяти',
            file: 'В файле',
          })
          .setValue(this.plugin.settings.historyStorageMethod)
          .onChange(async (value: 'memory' | 'file') => {
            this.plugin.settings.historyStorageMethod = value;
            await this.plugin.saveSettings();
          }),
      );

    // Максимальная длина истории
    new Setting(containerEl)
      .setName('Максимальная длина истории')
      .setDesc('Максимальное количество сообщений в истории')
      .addText(text =>
        text
          .setPlaceholder('20')
          .setValue(String(this.plugin.settings.maxHistoryLength))
          .onChange(async value => {
            const parsedValue = parseInt(value);
            if (!isNaN(parsedValue) && parsedValue > 0) {
              this.plugin.settings.maxHistoryLength = parsedValue;
              await this.plugin.saveSettings();
            }
          }),
      );

    // Путь к файлу истории
    if (this.plugin.settings.historyStorageMethod === 'file') {
      new Setting(containerEl)
        .setName('Путь к файлу истории')
        .setDesc('Путь к файлу для хранения истории чата')
        .addText(text =>
          text
            .setPlaceholder('groq-chat-history.md')
            .setValue(this.plugin.settings.notePath)
            .onChange(async value => {
              this.plugin.settings.notePath = value;
              await this.plugin.saveSettings();
            }),
        );
    }
  }
}
