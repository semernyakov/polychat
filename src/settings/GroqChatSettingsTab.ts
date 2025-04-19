import { App, PluginSettingTab, Setting } from 'obsidian';
import { GroqPluginInterface } from '../types/plugin';
import { AuthService } from '../services/authService';
import { MODEL_INFO, GroqModel, getModelInfo } from '../types/models';
import { HistoryStorageMethod } from '../types/settings';
import { Notice } from 'obsidian';
import { isValidFileName } from '../utils/validation';
import { t, Locale } from '../localization';

export class GroqChatSettingsTab extends PluginSettingTab {
  constructor(
    app: App,
    private readonly plugin: GroqPluginInterface,
    private readonly authService: AuthService,
  ) {
    super(app, plugin);
  }

  display(): void {
    const locale = (this.plugin.settings.language || 'ru') as Locale;
    this.containerEl.empty();
    this.renderHeader(locale);
    this.renderSettingsControls(locale);
    this.renderActionButtons(locale);
  }

  private renderHeader(locale: Locale): void {
    this.containerEl.createEl('h2', { text: t('chatTitle', locale) });
    this.containerEl.createEl('p', {
      text: locale === 'ru' ? 'Настройте параметры для работы с Groq API' : 'Configure Groq API parameters',
    }).style.marginBottom = '1.5rem';
  }

  private renderSettingsControls(locale: Locale): void {
    this.addLanguageSetting(locale);
    this.addApiKeySetting(locale);
    this.addModelSetting(locale);
    this.addTemperatureSetting(locale);
    this.addMaxTokensSetting(locale);
    this.addHistorySettings(locale);
    this.addDisplayModeSetting(locale);
  }

  private renderActionButtons(locale: Locale): void {
    const container = this.containerEl.createDiv({
      cls: 'groq-settings-actions',
    });

    container.createEl('button', {
      text: t('save', locale),
      cls: 'mod-cta',
    }).onclick = async () => {
      await this.plugin.saveSettings();
      new Notice(locale === 'ru' ? 'Настройки успешно сохранены' : 'Settings saved successfully');
    };

    container.createEl('button', {
      text: t('cancel', locale),
    }).onclick = async () => {
      await this.plugin.resetSettings();
      this.display();
      new Notice(locale === 'ru' ? 'Настройки сброшены' : 'Settings reset');
    };
  }

  private addDisplayModeSetting(locale: Locale): void {
    new Setting(this.containerEl)
      .setName(t('displayMode', locale))
      .setDesc(locale === 'ru' ? 'Как открывать чат по умолчанию' : 'How to open chat by default')
      .addDropdown(dropdown => {
        dropdown
          .addOption('tab', locale === 'ru' ? 'Во вкладке' : 'In tab')
          .addOption('sidepanel', locale === 'ru' ? 'В боковой панели' : 'In side panel')
          .setValue(this.plugin.settings.displayMode)
          .onChange(async value => {
            this.plugin.settings.displayMode = value as 'tab' | 'sidepanel';
            await this.plugin.saveSettings();
          });
      });
  }

  private addApiKeySetting(locale: Locale): void {
    new Setting(this.containerEl)
      .setName(t('apiKey', locale))
      .setDesc(locale === 'ru' ? 'Ваш ключ для доступа к Groq API' : 'Your key for accessing Groq API')
      .addText(text =>
        text
          .setPlaceholder(t('apiKeyPlaceholder', locale))
          .setValue(this.plugin.settings.apiKey)
          .onChange(async value => {
            this.plugin.settings.apiKey = value.trim();
            await this.plugin.saveSettings();
          }),
      )
      .addButton(btn =>
        btn
          .setButtonText(t('checkApiKey', locale))
          .setCta()
          .onClick(async () => {
            const isValid = await this.authService.validateApiKey(this.plugin.settings.apiKey);
            new Notice(isValid ? t('validApiKey', locale) : t('invalidApiKey', locale));
          }),
      );
  }

  private addModelSetting(locale: Locale): void {
    new Setting(this.containerEl)
      .setName(t('model', locale))
      .setDesc(locale === 'ru' ? 'Выберите модель для генерации ответов' : 'Select model for generating responses')
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

  private addTemperatureSetting(locale: Locale): void {
    new Setting(this.containerEl)
      .setName(t('temperature', locale))
      .setDesc(locale === 'ru' ? 'Контролирует случайность ответов (0-2)' : 'Controls randomness of responses (0-2)')
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

  private addMaxTokensSetting(locale: Locale): void {
    new Setting(this.containerEl)
      .setName(t('maxTokens', locale))
      .setDesc(locale === 'ru' ? 'Максимальное количество токенов в ответе' : 'Maximum number of tokens in response')
      .addText(text =>
        text
          .setPlaceholder(t('maxTokensPlaceholder', locale))
          .setValue(this.plugin.settings.maxTokens.toString())
          .onChange(async value => {
            const num = Math.max(1, Math.min(32768, parseInt(value) || 4096));
            this.plugin.settings.maxTokens = num;
            await this.plugin.saveSettings();
          }),
      );
  }

  private addHistorySettings(locale: Locale): void {
    new Setting(this.containerEl)
      .setName(t('history', locale))
      .setDesc(locale === 'ru' ? 'Выберите способ хранения и максимальную длину истории' : 'Select storage method and maximum history length')
      .addDropdown(dropdown => {
        dropdown
          .addOption('memory', locale === 'ru' ? 'В памяти' : 'In memory')
          .addOption('localStorage', locale === 'ru' ? 'Local Storage' : 'Local Storage')
          .addOption('indexedDB', locale === 'ru' ? 'IndexedDB' : 'IndexedDB')
          .addOption('file', locale === 'ru' ? 'В файле' : 'In file')
          .setValue(this.plugin.settings.historyStorageMethod)
          .onChange(async value => {
            this.plugin.settings.historyStorageMethod = value as HistoryStorageMethod;
            await this.plugin.saveSettings();
            this.display();
          });
      })
      .addText(text => {
        text
          .setPlaceholder(t('historyLengthPlaceholder', locale))
          .setValue(this.plugin.settings.maxHistoryLength.toString())
          .onChange(async value => {
            const num = parseInt(value);
            this.plugin.settings.maxHistoryLength = !isNaN(num) && num >= 0 ? num : 0;
            await this.plugin.saveSettings();
          });
        text.inputEl.insertAdjacentHTML(
          'afterend',
          `<span style="font-size: var(--font-ui-smaller); margin-left: 5px;">(${locale === 'ru' ? '0 = не хранить' : '0 = do not store'})</span>`,
        );
        text.inputEl.type = 'number';
        text.inputEl.min = '0';
      });

    if (this.plugin.settings.historyStorageMethod === 'file') {
      new Setting(this.containerEl)
        .setName(t('historyFile', locale))
        .setDesc(locale === 'ru' ? 'Путь к файлу для хранения истории (если выбран метод "В файле")' : 'Path to file for storing history (if "In file" method is selected)')
        .addText(text =>
          text
            .setPlaceholder(t('historyFilePlaceholder', locale))
            .setValue(this.plugin.settings.notePath)
            .onChange(async value => {
              const trimmedValue = value.trim();
              if (isValidFileName(trimmedValue)) {
                this.plugin.settings.notePath = trimmedValue;
                await this.plugin.saveSettings();
              } else {
                new Notice(locale === 'ru' ? 'Некорректное имя/путь файла' : 'Invalid file name/path');
              }
            }),
        );
    }
  }

  private addLanguageSetting(locale: Locale): void {
    new Setting(this.containerEl)
      .setName(t('language', locale))
      .setDesc(locale === 'ru' ? 'Выберите язык интерфейса' : 'Select UI language')
      .addDropdown(dropdown => {
        dropdown
          .addOption('ru', 'Русский')
          .addOption('en', 'English')
          .setValue(this.plugin.settings.language)
          .onChange(async value => {
            this.plugin.settings.language = value as 'ru' | 'en';
            await this.plugin.saveSettings();
            this.display(); // перерисовать настройки
          });
      });
  }
}
