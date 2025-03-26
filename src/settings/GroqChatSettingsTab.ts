import { App, PluginSettingTab, Setting } from 'obsidian';
import GroqChatPlugin from '../main';
import { AuthService } from '../services/authService';
import { GroqModel, getModelInfo } from '../types/models';
import { HistoryStorageMethod } from '../types/settings';
import { Notice } from 'obsidian';
import { isValidFileName } from '../utils/validation';
import { GroqPluginInterface } from '../types/plugin';
import { GroqService } from '../services/groqService';

export class GroqChatSettingsTab extends PluginSettingTab {
  private readonly authService: AuthService;

  constructor(
    app: App,
    private readonly plugin: GroqPluginInterface, // Ensure correct typing
  ) {
    super(app, plugin);
    this.authService = new AuthService(plugin, plugin.groqService as GroqService); // Cast to GroqService
  }

  display(): void {
    this.containerEl.empty();
    this.renderHeader();
    this.renderSettingsControls();
    this.renderActionButtons();
  }

  private renderHeader(): void {
    this.containerEl.createEl('h2', { text: 'Groq Chat Settings' });
    this.containerEl.createEl('p', {
      text: 'Настройте параметры для работы с Groq API',
    }).style.marginBottom = '1.5rem';
  }

  private renderSettingsControls(): void {
    this.addApiKeySetting();
    this.addModelSetting();
    this.addTemperatureSetting();
    this.addMaxTokensSetting();
    this.addHistoryStorageSettings();
    this.addNotePathSetting();
  }

  private renderActionButtons(): void {
    const container = this.containerEl.createDiv({
      cls: 'groq-settings-actions',
    });

    container.createEl('button', {
      text: 'Сохранить настройки',
      cls: 'mod-cta',
    }).onclick = async () => {
      await this.plugin.saveSettings();
      new Notice('Настройки успешно сохранены');
    };

    container.createEl('button', {
      text: 'Сбросить настройки',
    }).onclick = async () => {
      await this.plugin.resetSettings(); // Исправлено: добавлен await
      this.display();
      new Notice('Настройки сброшены');
    };
  }

  private addApiKeySetting(): void {
    new Setting(this.containerEl)
      .setName('API Key')
      .setDesc('Ваш ключ для доступа к Groq API')
      .addText(text =>
        text
          .setPlaceholder('Введите API ключ')
          .setValue(this.plugin.settings.apiKey)
          .onChange(async value => {
            this.plugin.settings.apiKey = value.trim();
            await this.plugin.saveSettings();
          }),
      )
      .addButton(btn =>
        btn
          .setButtonText('Проверить')
          .setCta()
          .onClick(async () => {
            const isValid = await this.authService.validateApiKey(this.plugin.settings.apiKey);
            new Notice(isValid ? '✅ Ключ действителен' : '❌ Неверный ключ');
          }),
      );
  }

  private addModelSetting(): void {
    new Setting(this.containerEl)
      .setName('Модель')
      .setDesc('Выберите модель для генерации ответов')
      .addDropdown(dropdown => {
        Object.values(GroqModel).forEach(model =>
          dropdown.addOption(model, getModelInfo(model).name),
        );

        dropdown.setValue(this.plugin.settings.model).onChange(async value => {
          this.plugin.settings.model = value as GroqModel;
          await this.plugin.saveSettings();
        });
      });
  }

  private addTemperatureSetting(): void {
    new Setting(this.containerEl)
      .setName('Температура')
      .setDesc('Контролирует случайность ответов (0-2)')
      .addSlider(slider =>
        slider
          .setLimits(0, 2, 0.1)
          .setValue(this.plugin.settings.temperature)
          .setDynamicTooltip()
          .onChange(async value => {
            this.plugin.settings.temperature = value;
            await this.plugin.saveSettings();
          }),
      );
  }

  private addMaxTokensSetting(): void {
    new Setting(this.containerEl)
      .setName('Макс. токенов')
      .setDesc('Максимальное количество токенов в ответе')
      .addText(text =>
        text
          .setPlaceholder('Введите число')
          .setValue(this.plugin.settings.maxTokens.toString())
          .onChange(async value => {
            const num = Math.max(1, Math.min(32768, parseInt(value) || 4096));
            this.plugin.settings.maxTokens = num;
            await this.plugin.saveSettings();
          }),
      );
  }

  private addHistoryStorageSettings(): void {
    const setting = new Setting(this.containerEl)
      .setName('Хранение истории')
      .setDesc('Выберите способ хранения истории чата')
      .addDropdown(dropdown => {
        dropdown
          .addOption('memory', 'В памяти')
          .addOption('localStorage', 'Local Storage')
          .addOption('indexedDB', 'IndexedDB')
          .addOption('file', 'В файле')
          .setValue(this.plugin.settings.historyStorageMethod)
          .onChange(async value => {
            this.plugin.settings.historyStorageMethod = value as HistoryStorageMethod;
            await this.plugin.saveSettings();
            this.display(); // Перерисовываем для обновления notePath
          });
      });
  }

  private addNotePathSetting(): void {
    if (this.plugin.settings.historyStorageMethod !== 'file') return;

    new Setting(this.containerEl)
      .setName('Файл истории')
      .setDesc('Путь к файлу для хранения истории')
      .addText(text =>
        text
          .setPlaceholder('groq-chat-history.md')
          .setValue(this.plugin.settings.notePath)
          .onChange(async value => {
            if (isValidFileName(value)) {
              this.plugin.settings.notePath = value;
              await this.plugin.saveSettings();
            } else {
              new Notice('Некорректное имя файла');
            }
          }),
      );
  }
}
