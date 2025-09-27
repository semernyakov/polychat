import { App, PluginSettingTab, Setting, Notice, requestUrl } from 'obsidian';
import { GroqPluginInterface } from '../types/plugin';
import { HistoryStorageMethod } from '../types/settings';
import { isValidFileName } from '../utils/validation';
import { createLink, createTextNode, clearElement } from '../utils/domUtils';
import { t, Locale } from '../localization';
import type { RateLimitsType } from '../services/groqService';
import type { GroqChatSettings as GroqChatSettingsType } from '../settings/GroqChatSettings';

// NOTE: Use canonical settings type imported from '../settings/GroqChatSettings'

export class GroqChatSettingsTab extends PluginSettingTab {
  constructor(
    app: App,
    private readonly plugin: GroqPluginInterface,
  ) {
    super(app, plugin);
  }

  display(): void {
    const appLang = (this.app as any)?.getLanguage?.();
    const locale = (appLang && appLang.toLowerCase().startsWith('ru') ? 'ru' : 'en') as Locale;
    this.containerEl.empty();
    // --- Приветствие (без верхнего заголовка) ---
    const subtitle = this.containerEl.createEl('div', {
      text:
        locale === 'ru'
          ? 'Настройте плагин под себя, чтобы общение с ИИ было максимально удобным и приятным! 😊'
          : 'Make your AI chat experience as friendly and delightful as possible! 😊',
      cls: 'groq-settings-subtitle',
    });
    // --- API ---
    new Setting(this.containerEl)
      .setName(locale === 'ru' ? '🔑 Доступ к API' : '🔑 API Access')
      .setHeading();
    // --- Ссылка на получение токена ---
    const tokenLink = this.containerEl.createEl('div', {
      cls: 'groq-settings-token-link',
    });

    if (locale === 'ru') {
      createTextNode(tokenLink, 'Получить токен Groq можно на ');
      createLink(tokenLink, 'официальном сайте Groq API', 'https://console.groq.com/keys', {
        target: '_blank',
        rel: 'noopener noreferrer',
      });
      createTextNode(tokenLink, '.');
    } else {
      createTextNode(tokenLink, 'You can get your Groq token at the ');
      createLink(tokenLink, 'official Groq API website', 'https://console.groq.com/keys', {
        target: '_blank',
        rel: 'noopener noreferrer',
      });
      createTextNode(tokenLink, '.');
    }
    this.addApiKeySetting(locale);

    new Setting(this.containerEl)
      .setName(locale === 'ru' ? '🤖 Выбор модели' : '🤖 Model Selection')
      .setHeading();
    this.addModelSetting(locale);
    // --- Список моделей (отдельная строка) ---
    this.addModelListBlock(locale);
    // --- История ---
    new Setting(this.containerEl)
      .setName(locale === 'ru' ? '🕓 История чата' : '🕓 Chat History')
      .setHeading();
    this.addHistorySettings(locale);
    // --- Интерфейс ---
    new Setting(this.containerEl)
      .setName(locale === 'ru' ? '👀 Интерфейс' : '👀 Interface')
      .setHeading();
    // this.addDisplayModeSetting(locale); // Метод отсутствует
    this.addTailSettings(locale);
    // --- Температура и макс. токены в сетке ---
    const flexGrid = this.containerEl.createEl('div', { cls: 'groq-settings-flex-grid' });
    const tempDiv = this.containerEl.createEl('div', { cls: 'groq-settings-flex-item' });
    tempDiv.appendChild(this.createTemperatureSetting(locale));
    const tokensDiv = this.containerEl.createEl('div', { cls: 'groq-settings-flex-item' });
    tokensDiv.appendChild(this.createMaxTokensSetting(locale));
    flexGrid.appendChild(tempDiv);
    flexGrid.appendChild(tokensDiv);
    this.containerEl.appendChild(flexGrid);
    // Язык больше не настраивается в плагине; используется Obsidian app.getLanguage()

    // --- Кнопки "Сохранить все настройки" и "Сбросить настройки по умолчанию" ---
    const actionsBlock = this.containerEl.createEl('div', { cls: 'groq-settings-actions' });
    const btnSave = document.createElement('button');
    btnSave.textContent = locale === 'ru' ? '✅ Сохранить все настройки' : '✅ Save all settings';
    btnSave.className = 'mod-cta';
    btnSave.onclick = async () => {
      await this.plugin.saveSettings();
      new Notice(locale === 'ru' ? 'Настройки сохранены' : 'Settings saved');
    };
    const btnReset = document.createElement('button');
    btnReset.textContent =
      locale === 'ru' ? '♻️ Сбросить настройки по умолчанию' : '♻️ Reset to default';
    btnReset.onclick = async () => {
      if (typeof this.plugin.resetSettingsToDefault === 'function') {
        await this.plugin.resetSettingsToDefault();
        new Notice(locale === 'ru' ? 'Настройки сброшены' : 'Settings reset');
        this.display();
      } else {
        new Notice(locale === 'ru' ? 'Метод сброса не реализован' : 'Reset method not implemented');
      }
    };
    actionsBlock.appendChild(btnSave);
    actionsBlock.appendChild(btnReset);
    this.containerEl.appendChild(actionsBlock);

    // --- Блок благодарности автору ---
    // Add a spacer div to create space between buttons and thanks block
    const spacer = this.containerEl.createEl('div', { cls: 'groq-thanks-spacer' });

    const thanksBlock = this.containerEl.createEl('div', { cls: 'groq-thanks-block' });

    // Add heart emoji
    createTextNode(thanksBlock, '💙 ');

    // Add strong text
    const strong = thanksBlock.createEl('strong');
    strong.textContent =
      locale === 'ru' ? 'Спасибо за использование плагина!' : 'Thank you for using the plugin!';

    // Add space after strong
    createTextNode(thanksBlock, ' ');

    // Add link text before and after the link
    const linkText = locale === 'ru' ? 'оставьте отзыв на GitHub' : 'leave a review on GitHub';
    const textBeforeLink =
      locale === 'ru'
        ? 'Если вам нравится Groq Chat, пожалуйста, '
        : 'If you like Groq Chat, please ';
    const textAfterLink = locale === 'ru' ? '.' : '.';

    createTextNode(thanksBlock, textBeforeLink);
    createLink(thanksBlock, linkText, 'https://github.com/semernyakov/groq-chat-obsidian', {
      target: '_blank',
      rel: 'noopener noreferrer',
    });
    createTextNode(thanksBlock, textAfterLink);

    // Add link to Telegram
    const telegramLinkText =
      locale === 'ru' ? 'связаться со мной в Telegram' : 'contact with autor in Telegram';
    const telegramTextBeforeLink = locale === 'ru' ? ' или ' : ' or ';
    const telegramTextAfterLink = locale === 'ru' ? ' ❤️' : ' ❤️';

    createTextNode(thanksBlock, telegramTextBeforeLink);
    createLink(thanksBlock, telegramLinkText, 'https://t.me/semernyakov', {
      target: '_blank',
      rel: 'noopener noreferrer',
    });
    createTextNode(thanksBlock, telegramTextAfterLink);

    // Add link to YooMoney
    const yoomoneyLinkText =
      locale === 'ru' ? 'поддержать разработку на YooMoney' : 'support the author on YooMoney';
    const yoomoneyTextBeforeLink = locale === 'ru' ? ' Вы можете ' : ' You can ';
    const yoomoneyTextAfterLink = locale === 'ru' ? '.' : '.';

    createTextNode(thanksBlock, yoomoneyTextBeforeLink);
    createLink(thanksBlock, yoomoneyLinkText, 'https://yoomoney.ru/fundraise/194GT5A5R07.250321', {
      target: '_blank',
      rel: 'noopener noreferrer',
    });
    createTextNode(thanksBlock, yoomoneyTextAfterLink);
  }

  private createTemperatureSetting(locale: Locale): HTMLElement {
    const wrapper = document.createElement('div');
    new Setting(wrapper)
      .setName(t('temperature', locale))
      .setDesc(
        (locale === 'ru'
          ? 'Контролирует случайность ответов (0-2)'
          : 'Controls randomness of responses (0-2)') + ' ',
      )
      .addSlider(slider =>
        slider
          .setLimits(0, 2, 0.1)
          .setValue(this.plugin.settings.temperature)
          .setDynamicTooltip()
          .onChange(async value => {
            this.plugin.settings.temperature = value;
            await this.plugin.saveSettings();
            this.showSavedIcon(slider.sliderEl);
          }),
      )
      .settingEl.setAttribute(
        'title',
        locale === 'ru'
          ? 'Чем выше, тем более креативные ответы'
          : 'Higher = more creative responses',
      );
    return wrapper;
  }

  private createMaxTokensSetting(locale: Locale): HTMLElement {
    const wrapper = document.createElement('div');
    new Setting(wrapper)
      .setName(t('maxTokens', locale))
      .setDesc(
        (locale === 'ru'
          ? 'Максимальное количество токенов в ответе'
          : 'Maximum number of tokens in response') +
          (locale === 'ru' ? ' (например: 2048)' : ' (e.g. 2048)'),
      )
      .addText(text =>
        text
          .setPlaceholder(locale === 'ru' ? 'Например: 2048' : 'e.g. 2048')
          .setValue(this.plugin.settings.maxTokens.toString())
          .onChange(async value => {
            const num = Math.max(1, Math.min(32768, parseInt(value) || 4096));
            this.plugin.settings.maxTokens = num;
            await this.plugin.saveSettings();
            this.showSavedIcon(text.inputEl);
          }),
      );
    return wrapper;
  }

  private showSavedIcon(element: HTMLElement) {
    const icon = element.createEl('span', { text: '✓', cls: 'groq-saved-icon' });

    setTimeout(() => {
      icon.classList.add('groq-saved-icon--fade-out');
      setTimeout(() => icon.remove(), 500);
    }, 2000);
  }

  private addApiKeySetting(locale: Locale): void {
    new Setting(this.containerEl)
      .setName(t('apiKey', locale))
      .setDesc(
        locale === 'ru' ? 'Ваш ключ для доступа к Groq API' : 'Your key for accessing Groq API',
      )
      .addText(text =>
        text
          .setPlaceholder(t('apiKeyPlaceholder', locale))
          .setValue(this.plugin.settings.apiKey)
          .onChange(async value => {
            this.plugin.settings.apiKey = value.trim();
            await this.plugin.saveSettings();
            this.showSavedIcon(text.inputEl);
          }),
      )
      .addButton(btn =>
        btn
          .setButtonText(t('checkApiKey', locale))
          .setCta()
          .onClick(async () => {
            const isValid = await this.plugin.authService.validateApiKey(
              this.plugin.settings.apiKey,
            );
            new Notice(isValid ? t('validApiKey', locale) : t('invalidApiKey', locale));
          }),
      );
  }

  private async fetchGroqModels(apiKey: string): Promise<any[]> {
    try {
      const response = await requestUrl({
        url: 'https://api.groq.com/openai/v1/models',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status !== 200) {
        console.error('API error:', response.status);
        throw new Error(`API error: ${response.status}`);
      }

      return response.json.data || [];
    } catch (error) {
      console.error('Error fetching Groq models:', error);
      return [];
    }
  }

  private addModelSetting(locale: Locale): void {
    const modelSetting = new Setting(this.containerEl)
      .setName(t('model', locale))
      .setDesc(t('modelDesc', locale));

    // Create the dropdown
    let selectEl: HTMLSelectElement;
    const dropdown = modelSetting.addDropdown(dd => {
      selectEl = dd.selectEl;
      dd.addOption('', locale === 'ru' ? 'Выберите модель' : 'Select a model');

      // Add available models
      if (this.plugin.settings.groqAvailableModels) {
        for (const model of this.plugin.settings.groqAvailableModels) {
          if (model.isActive) {
            dd.addOption(model.id, model.name);
          }
        }
      }

      // Set the selected model
      dd.setValue(this.plugin.settings.model || '');

      // Handle model change
      dd.onChange(async (value: string) => {
        this.plugin.settings.model = value;
        await this.plugin.saveSettings();
      });
    });

    // Add refresh button with custom spinner
    modelSetting.addButton(btn => {
      const spinner = document.createElement('span');
      spinner.className = 'mod-spinner groq-spinner';
      btn.buttonEl.appendChild(spinner);

      btn
        .setIcon('refresh-cw')
        .setTooltip(t('refreshModels', locale))
        .onClick(async () => {
          try {
            btn.setDisabled(true);
            spinner.classList.add('groq-spinner--visible');

            const apiModels = await this.fetchGroqModels(this.plugin.settings.apiKey);
            if (apiModels?.length) {
              // Update available models
              const settings = this.plugin.settings as any;
              settings.groqAvailableModels = apiModels.map((m: any) => ({
                id: m.id,
                name: m.name || m.id,
                description: m.description || '',
                isActive: true,
              }));

              await this.plugin.saveSettings();
              new Notice(t('modelsUpdated', locale));

              // Update the dropdown
              if (selectEl) {
                selectEl.empty();
                selectEl.createEl('option', {
                  text: locale === 'ru' ? 'Выберите модель' : 'Select a model',
                  value: '',
                });

                if (this.plugin.settings.groqAvailableModels) {
                  for (const model of this.plugin.settings.groqAvailableModels) {
                    if (model.isActive) {
                      selectEl.createEl('option', {
                        text: model.name,
                        value: model.id,
                      });
                    }
                  }
                }

                // Restore selected value if any
                if (this.plugin.settings.model) {
                  selectEl.value = this.plugin.settings.model;
                }
              }
            } else {
              new Notice(t('modelsUpdateError', locale));
            }
          } catch (error) {
            console.error('Error refreshing models:', error);
            new Notice(t('modelsUpdateError', locale));
          } finally {
            btn.setDisabled(false);
            spinner.classList.remove('groq-spinner--visible');
          }
        });
    });
  }

  // --- Model List (table, separate row) ---
  private addModelListBlock(locale: Locale): void {
    // Create or find container for models table
    let modelsBlock = this.containerEl.querySelector('.groq-models-block') as HTMLDivElement | null;
    if (!modelsBlock) {
      modelsBlock = document.createElement('div');
      modelsBlock.className = 'groq-models-block';
      this.containerEl.appendChild(modelsBlock);
    }
    while (modelsBlock.firstChild) {
      modelsBlock.removeChild(modelsBlock.firstChild);
    }

    // Extended model type for the table
    interface DisplayModel {
      id: string;
      name: string;
      description?: string;
      created?: number;
      owned_by?: string;
      object?: string;
      isActive: boolean;
      category?: string;
      developer?: { name: string; url?: string };
      maxTokens?: number;
      tokensPerMinute?: number;
      releaseStatus?: string;
    }

    const settings = this.plugin.settings as GroqChatSettingsType;
    const models: DisplayModel[] = (settings.groqAvailableModels || []).map(model => ({
      ...model,
      isActive: model.isActive !== false, // Default to true if undefined
    }));

    // --- Select All / Deselect All buttons ---
    const selectAllBlock = document.createElement('div');
    selectAllBlock.className = 'groq-models-select-all';

    const btnSelectAll = document.createElement('button');
    btnSelectAll.textContent = locale === 'ru' ? 'Выбрать все' : 'Select all';
    btnSelectAll.className = 'mod-cta';

    const btnDeselectAll = document.createElement('button');
    btnDeselectAll.textContent = locale === 'ru' ? 'Отменить все' : 'Deselect all';

    // --- Table ---
    const modelsTable = document.createElement('table');
    modelsTable.className = 'groq-models-table';

    // Create table header
    const thead = modelsTable.createTHead();
    const headerRow = thead.insertRow();
    headerRow.className = 'groq-models-table-header';

    const headerModel = document.createElement('th');
    headerModel.textContent = t('model', locale);
    headerRow.appendChild(headerModel);

    const headerActive = document.createElement('th');
    headerActive.textContent = t('active', locale);
    headerRow.appendChild(headerActive);

    // Create table body
    const tbody = modelsTable.createTBody();
    const checkboxes: HTMLInputElement[] = [];

    // Create table rows
    models.forEach((model, idx) => {
      const tr = tbody.insertRow();
      tr.className = 'groq-models-table-row';

      // Model name cell
      const nameCell = tr.insertCell();
      nameCell.className = 'groq-models-table-cell';
      nameCell.textContent = model.name.replace(' (недоступна)', '');

      // Toggle cell
      const toggleCell = tr.insertCell();
      toggleCell.className = 'groq-models-table-cell';

      const toggle = document.createElement('input');
      toggle.type = 'checkbox';
      toggle.checked = model.isActive;
      toggle.classList.add('groq-model-toggle');
      toggle.title =
        locale === 'ru' ? 'Включить/выключить модель для чата' : 'Enable/disable model for chat';

      toggle.addEventListener('change', async () => {
        models[idx].isActive = toggle.checked;
        if (settings.groqAvailableModels) {
          settings.groqAvailableModels = [...models];
          await this.plugin.saveSettings();
          this.showSavedIcon(toggle);
        }
      });

      toggleCell.appendChild(toggle);
      checkboxes.push(toggle);
    });

    // Select all functionality
    btnSelectAll.onclick = async () => {
      checkboxes.forEach((cb, idx) => {
        cb.checked = true;
        models[idx].isActive = true;
      });
      if (settings.groqAvailableModels) {
        settings.groqAvailableModels = [...models];
        await this.plugin.saveSettings();
      }
    };

    // Deselect all functionality
    btnDeselectAll.onclick = async () => {
      checkboxes.forEach((cb, idx) => {
        cb.checked = false;
        models[idx].isActive = false;
      });
      if (settings.groqAvailableModels) {
        settings.groqAvailableModels = [...models];
        await this.plugin.saveSettings();
      }
    };

    // Append buttons to select all block
    selectAllBlock.appendChild(btnSelectAll);
    selectAllBlock.appendChild(btnDeselectAll);

    // Clear any existing content and append the new content
    while (modelsBlock.firstChild) {
      modelsBlock.removeChild(modelsBlock.firstChild);
    }
    modelsBlock.appendChild(selectAllBlock);
    modelsBlock.appendChild(modelsTable);
  }
  private addHistorySettings(locale: Locale): void {
    new Setting(this.containerEl)
      .setName(t('history', locale))
      .setDesc(
        locale === 'ru'
          ? 'Выберите способ хранения и максимальную длину истории'
          : 'Select storage method and maximum history length',
      )
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
        const hintSpan = document.createElement('span');
        hintSpan.className = 'groq-small-text groq-margin-left';
        hintSpan.textContent = `(${locale === 'ru' ? '0 = не хранить' : '0 = do not store'})`;
        text.inputEl.after(hintSpan);
        text.inputEl.type = 'number';
        text.inputEl.min = '0';
      })
      .settingEl.setAttribute('title', locale === 'ru' ? 'Настройки истории' : 'History settings');

    if (this.plugin.settings.historyStorageMethod === 'file') {
      const historyFileSetting = new Setting(this.containerEl)
        .setName(t('historyFile', locale))
        .setDesc(
          locale === 'ru'
            ? 'Путь к файлу для хранения истории (если выбран метод "В файле")'
            : 'Path to file for storing history (if "In file" method is selected)',
        )
        .addText(text =>
          text
            .setPlaceholder(t('historyFilePlaceholder', locale))
            .setValue(this.plugin.settings.notePath)
            .onChange(async value => {
              const trimmedValue = value.trim();
              if (isValidFileName(trimmedValue)) {
                this.plugin.settings.notePath = trimmedValue;
                await this.plugin.saveSettings();
                this.showSavedIcon(text.inputEl);
              } else {
                new Notice(
                  locale === 'ru' ? 'Некорректное имя/путь файла' : 'Invalid file name/path',
                );
              }
            }),
        );

      const exampleP = document.createElement('p');
      exampleP.className = 'groq-small-text groq-margin-top';
      exampleP.textContent =
        locale === 'ru' ? 'Пример: notes/history.md' : 'Example: notes/history.md';
      historyFileSetting.settingEl.appendChild(exampleP);
    }
  }

  // Удалён выбор языка из настроек. Локаль берётся из Obsidian.

  // --- Дополнительные настройки интерфейса (хвост истории) ---
  private addTailSettings(locale: Locale): void {
    const plugin = this.plugin as any;
    // Сколько последних сообщений показывать при открытии
    new Setting(this.containerEl)
      .setName(locale === 'ru' ? 'Последние сообщения при открытии' : 'Last messages at startup')
      .setDesc(
        locale === 'ru'
          ? 'Сколько последних сообщений показывать без прокрутки'
          : 'How many last messages to show without initial scrolling',
      )
      .addText(text =>
        text
          .setPlaceholder(locale === 'ru' ? 'Например: 10' : 'e.g. 10')
          .setValue(String(plugin.settings.messageTailLimit ?? 10))
          .onChange(async (value: string) => {
            const num = Math.max(1, Math.min(1000, parseInt(value) || 10));
            plugin.settings.messageTailLimit = num;
            await this.plugin.saveSettings();
            // Визуальная отметка сохранения
            const input = text.inputEl as HTMLElement;
            const icon = input.createEl('span', { text: '✓', cls: 'groq-saved-icon' });
            setTimeout(() => {
              icon.classList.add('groq-saved-icon--fade-out');
              setTimeout(() => icon.remove(), 500);
            }, 1200);
          }),
      )
      .settingEl.setAttribute('title', locale === 'ru' ? 'По умолчанию: 10' : 'Default: 10');

    // Шаг подгрузки истории
    new Setting(this.containerEl)
      .setName(locale === 'ru' ? 'Шаг подгрузки истории' : 'History load step')
      .setDesc(
        locale === 'ru'
          ? 'Сколько сообщений добавлять при нажатии на кнопку или прокрутке вверх'
          : 'How many messages to load when clicking the button or scrolling up',
      )
      .addDropdown(dd => {
        const stepOptions = [10, 20, 50, 100];
        stepOptions.forEach(n => dd.addOption(String(n), String(n)));
        const current = String(plugin.settings.messageLoadStep ?? 20);
        dd.setValue(current);
        dd.onChange(async (value: string) => {
          const num = Math.max(1, Math.min(1000, parseInt(value) || 20));
          plugin.settings.messageLoadStep = num;
          await this.plugin.saveSettings();
        });
      })
      .settingEl.setAttribute('title', locale === 'ru' ? 'По умолчанию: 20' : 'Default: 20');
  }
}
