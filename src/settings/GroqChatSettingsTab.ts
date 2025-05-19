import { App, PluginSettingTab, Setting } from 'obsidian';
import { GroqPluginInterface } from '../types/plugin';
import { HistoryStorageMethod } from '../types/settings';
import { Notice } from 'obsidian';
import { isValidFileName } from '../utils/validation';
import { t, Locale } from '../localization';
import type { RateLimitsType } from '../services/groqService';
import type { GroqChatSettings } from './GroqChatSettings';

export class GroqChatSettingsTab extends PluginSettingTab {
  constructor(
    app: App,
    private readonly plugin: GroqPluginInterface,
  ) {
    super(app, plugin);
  }

  display(): void {
    const locale = (this.plugin.settings.language || 'ru') as Locale;
    this.containerEl.empty();
    // --- Красивый заголовок и приветствие ---
    const title = this.containerEl.createEl('h2', {
      text: locale === 'ru' ? '🚀 Добро пожаловать в настройки PolyChat Plugin!' : '🚀 Welcome to PolyChat Plugin Settings!'
    });
    title.style.marginTop = '0.5em';
    title.style.fontSize = '2em';
    title.style.fontWeight = 'bold';
    const subtitle = this.containerEl.createEl('div', {
      text: locale === 'ru'
        ? 'Настройте плагин под себя, чтобы общение с ИИ было максимально удобным и приятным! 😊'
        : 'Make your AI chat experience as friendly and delightful as possible! 😊'
    });
    subtitle.style.marginBottom = '1.5em';
    subtitle.style.fontSize = '1.15em';
    subtitle.style.color = '#555';
    // --- API ---
    this.containerEl.createEl('h3', { text: locale === 'ru' ? '🔑 Доступ к API' : '🔑 API Access' });
    // --- Ссылка на получение токена ---
    const tokenLink = this.containerEl.createEl('div');
    tokenLink.style.marginBottom = '1em';
    tokenLink.innerHTML = locale === 'ru'
      ? 'Получить токен Groq можно на <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer">официальном сайте Groq API</a>.'
      : 'You can get your Groq token at the <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer">official Groq API website</a>.';
    this.addApiKeySetting(locale);

    this.containerEl.createEl('h3', { text: locale === 'ru' ? '🤖 Выбор модели' : '🤖 Model Selection' });
    this.addModelSetting(locale);
    // --- Список моделей (отдельная строка) ---
    this.addModelListBlock(locale);
    // --- История ---
    this.containerEl.createEl('h3', { text: locale === 'ru' ? '🕓 История чата' : '🕓 Chat History' });
    this.addHistorySettings(locale);
    // --- Интерфейс ---
    this.containerEl.createEl('h3', { text: locale === 'ru' ? '👀 Интерфейс и язык' : '👀 Interface & Language' });
    // this.addDisplayModeSetting(locale); // Метод отсутствует
    // --- Температура и макс. токены в сетке ---
    const flexGrid = document.createElement('div');
    flexGrid.style.display = 'flex';
    flexGrid.style.gap = '16px';
    flexGrid.style.alignItems = 'flex-end';
    const tempDiv = document.createElement('div');
    tempDiv.style.flex = '1';
    tempDiv.appendChild(this.createTemperatureSetting(locale));
    const tokensDiv = document.createElement('div');
    tokensDiv.style.flex = '1';
    tokensDiv.appendChild(this.createMaxTokensSetting(locale));
    flexGrid.appendChild(tempDiv);
    flexGrid.appendChild(tokensDiv);
    this.containerEl.appendChild(flexGrid);
    this.addLanguageSetting(locale);

    // --- Кнопки "Сохранить все настройки" и "Сбросить настройки по умолчанию" ---
    const actionsBlock = document.createElement('div');
    actionsBlock.style.margin = '32px 0 0 0';
    actionsBlock.style.display = 'flex';
    actionsBlock.style.gap = '16px';
    actionsBlock.style.justifyContent = 'flex-end';
    const btnSave = document.createElement('button');
    btnSave.textContent = locale === 'ru' ? '✅ Сохранить все настройки' : '✅ Save all settings';
    btnSave.className = 'mod-cta';
    btnSave.onclick = async () => {
      await this.plugin.saveSettings();
      new Notice(locale === 'ru' ? 'Настройки сохранены' : 'Settings saved');
    };
    const btnReset = document.createElement('button');
    btnReset.textContent = locale === 'ru' ? '♻️ Сбросить настройки по умолчанию' : '♻️ Reset to default';
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
    const thanksBlock = this.containerEl.createEl('div');
    thanksBlock.style.margin = '2em 0 1em 0';
    thanksBlock.style.padding = '1em';
    thanksBlock.style.borderRadius = '8px';
    thanksBlock.style.textAlign = 'center';
    thanksBlock.style.transition = 'background 0.3s, color 0.3s';
    thanksBlock.style.background = 'linear-gradient(90deg, var(--background-modifier-box-hover, #f2f3f5) 0%, var(--background-secondary, #fcb69f) 100%)';
    thanksBlock.style.color = 'var(--text-normal, #222)';
    thanksBlock.style.border = '1px solid var(--background-modifier-border, #ddd)';
    // адаптация для темной темы
    if (document.body.classList.contains('theme-dark')) {
      thanksBlock.style.background = 'linear-gradient(90deg, var(--background-secondary, #23272e) 0%, #3a3f4b 100%)';
      thanksBlock.style.color = 'var(--text-normal, #eee)';
      thanksBlock.style.border = '1px solid var(--background-modifier-border, #333)';
    }
    thanksBlock.innerHTML = locale === 'ru'
      ? 'Спасибо за использование PolyChat Plugin! <br> Вы можете <a href="https://yoomoney.ru/fundraise/194GT5A5R07.250321" target="_blank" rel="noopener noreferrer">поддержать разработку на YooMoney</a> <br> <a href="https://github.com/semernyakov" target="_blank" rel="noopener noreferrer">Оставить отзыв на Github</a> или <a href="https://t.me/semernyakov" target="_blank" rel="noopener noreferrer"> или связаться со мной в Telegram</a> ❤️'
      : 'Thank you for using PolyChat Plugin! <br> You can <a href="https://yoomoney.ru/fundraise/194GT5A5R07.250321" target="_blank" rel="noopener noreferrer">support the author on YooMoney</a> <br> <a href="https://github.com/semernyakov" target="_blank" rel="noopener noreferrer">Leave a review on Github</a> or <a href="https://t.me/semernyakov" target="_blank" rel="noopener noreferrer">contact me in Telegram</a> ❤️';
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

  private showSavedIcon(targetEl: HTMLElement) {
    const icon = document.createElement('span');
    icon.textContent = '✓';
    icon.style.color = '#3cb371';
    icon.style.marginLeft = '8px';
    icon.style.fontWeight = 'bold';
    icon.style.fontSize = '16px';
    icon.style.transition = 'opacity 0.5s';
    targetEl.parentElement?.appendChild(icon);
    setTimeout(() => {
      icon.style.opacity = '0';
      setTimeout(() => icon.remove(), 500);
    }, 1200);
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
            const isValid = await this.plugin.authService.validateApiKey(this.plugin.settings.apiKey);
            new Notice(isValid ? t('validApiKey', locale) : t('invalidApiKey', locale));
          }),
      );
  }

  private async fetchGroqModels(apiKey: string): Promise<any[]> {
    try {
      const resp = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!resp.ok) throw new Error('API error');
      const data = await resp.json();
      return data.data || [];
    } catch (error) {
      return [];
    }
  }

  private addModelSetting(locale: Locale): void {
    const setting = new Setting(this.containerEl)
      .setName(t('model', locale))
      .setDesc(
        locale === 'ru'
          ? 'Выберите модель для генерации ответов'
          : 'Select model for generating responses',
      );

    // Dropdown для выбора модели
    let dropdownEl: HTMLSelectElement | null = null;
    const updateDropdown = () => {
      if (!dropdownEl) return;
      const settings = this.plugin.settings as GroqChatSettings;
      const models: { id: string; name: string; description?: string; isActive?: boolean }[] = (
        settings.groqAvailableModels || []
      ).filter(m => m.isActive !== false);
      dropdownEl.innerHTML = '';
      if (models.length === 0) {
        const opt = document.createElement('option');
        opt.value = 'none';
        opt.textContent = t('noModelsFound', locale);
        if (dropdownEl) dropdownEl.appendChild(opt);
      } else {
        models.forEach(model => {
          const opt = document.createElement('option');
          opt.value = model.id;
          opt.textContent = model.name;
          if (dropdownEl) dropdownEl.appendChild(opt);
        });
      }
      // Если текущая выбранная модель неактивна — выбрать первую активную
      if (settings.model && !models.some(m => m.id === settings.model)) {
        settings.model = models[0]?.id || 'none';
      }
      dropdownEl.value = settings.model || (models[0]?.id ?? 'none');
    };
    const dropdown = setting.addDropdown(dropdown => {
      dropdownEl = dropdown.selectEl;
      updateDropdown();
      dropdown
        .setValue(
          (this.plugin.settings as GroqChatSettings).model ||
            (dropdownEl.options[0]?.value ?? 'none'),
        )
        .onChange(async value => {
          (this.plugin.settings as GroqChatSettings).model = value;
          await this.plugin.saveSettings();
          this.showSavedIcon(dropdownEl!);
        });
    });

    // Кнопка обновления моделей
    setting.addExtraButton(btn => {
      btn
        .setIcon('refresh-cw')
        .setTooltip(t('refreshModels', locale))
        .onClick(async () => {
          btn.setDisabled(true);
          btn.extraSettingsEl.classList.add('mod-spinner');
          const apiModels = await this.fetchGroqModels(this.plugin.settings.apiKey);
          if (apiModels.length > 0) {
            const settings = this.plugin.settings as GroqChatSettings;
            settings.groqAvailableModels = apiModels.map((m: any) => ({
              id: m.id,
              name: m.name || m.id,
              description: m.description || '',
              isActive: true,
            }));
            await this.plugin.saveSettings();
            new Notice(t('modelsUpdated', locale));
            updateDropdown();
          } else {
            new Notice(t('modelsUpdateError', locale));
          }
          btn.setDisabled(false);
          btn.extraSettingsEl.classList.remove('mod-spinner');
        });
    });

    // Синхронизация при изменении активности моделей
    // Переопределим метод addModelListBlock, чтобы после изменений обновлять dropdown
    const origAddModelListBlock = this.addModelListBlock.bind(this);
    this.addModelListBlock = (loc: Locale) => {
      origAddModelListBlock(loc);
      updateDropdown();
    };
  }

  // --- Список моделей (таблица, отдельная строка) ---
  private addModelListBlock(locale: Locale) {
    // Создаём или находим отдельный контейнер для таблицы моделей
    let modelsBlock = this.containerEl.querySelector('.groq-models-block') as HTMLDivElement | null;
    if (!modelsBlock) {
      modelsBlock = document.createElement('div');
      modelsBlock.className = 'groq-models-block';
      this.containerEl.appendChild(modelsBlock);
    }
    modelsBlock.innerHTML = '';
    // Расширенный тип модели для таблицы
    type DisplayModel = {
      id: string;
      name: string;
      description?: string;
      created?: number;
      owned_by?: string;
      object?: string;
      isActive?: boolean;
      category?: string;
      developer?: { name: string; url?: string };
      maxTokens?: number;
      tokensPerMinute?: number;
      releaseStatus?: string;
    };
    const settings = this.plugin.settings as GroqChatSettings;
    let models: DisplayModel[] = (settings.groqAvailableModels || []) as DisplayModel[];
    // Нормализация: гарантировать наличие isActive у каждой модели
    models = models.map(m => ({
      ...m,
      isActive: typeof m.isActive === 'boolean' ? m.isActive : true,
    }));
    const rateLimits: RateLimitsType = settings.groqRateLimits || {};
    // --- Кнопки "Выбрать все" и "Отменить все" ---
    const selectAllBlock = document.createElement('div');
    selectAllBlock.style.margin = '8px 0 8px 0';
    selectAllBlock.style.display = 'flex';
    selectAllBlock.style.gap = '8px';
    const btnSelectAll = document.createElement('button');
    btnSelectAll.textContent = locale === 'ru' ? 'Выбрать все' : 'Select all';
    btnSelectAll.className = 'mod-cta';
    const btnDeselectAll = document.createElement('button');
    btnDeselectAll.textContent = locale === 'ru' ? 'Отменить все' : 'Deselect all';
    // --- Таблица ---
    const modelsTable = document.createElement('table');
    modelsTable.className = 'groq-models-table';
    modelsTable.style.width = '100%';
    modelsTable.style.borderCollapse = 'collapse';
    modelsTable.style.fontSize = '13px';
    modelsTable.style.margin = '24px 0 24px 0';
    modelsTable.innerHTML = `
      <thead><tr style='background:#f0f0f0;'>
        <th style='text-align:left;padding:4px 8px;'>${t('model', locale)}</th>
        <th style='text-align:left;padding:4px 8px;'>${t('active', locale)}</th>
      </tr></thead>
      <tbody></tbody>
    `;
    const tbody = modelsTable.querySelector('tbody') as HTMLTableSectionElement;
    // Сохраняем ссылки на чекбоксы для массовых операций
    const checkboxes: HTMLInputElement[] = [];
    models.forEach((model, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style='padding:4px 8px;'>${model.name.replace(' (недоступна)', '')}</td>
        <td style='padding:4px 8px;'></td>
      `;
      // Toggle для "Активна"
      const toggleTd = tr.children[1] as HTMLTableCellElement;
      const toggle = document.createElement('input');
      toggle.type = 'checkbox';
      toggle.checked = (model as any).isActive !== false;
      toggle.style.transform = 'scale(1.2)';
      toggle.title =
        locale === 'ru' ? 'Включить/выключить модель для чата' : 'Enable/disable model for chat';
      toggle.addEventListener('change', async () => {
        (models[idx] as any).isActive = toggle.checked;
        settings.groqAvailableModels = [...models];
        await this.plugin.saveSettings();
        this.showSavedIcon(toggle);
      });
      toggleTd.appendChild(toggle);
      checkboxes.push(toggle);
      tbody.appendChild(tr);
    });
    // Логика кнопок массового выбора
    btnSelectAll.onclick = async () => {
      checkboxes.forEach((cb, idx) => {
        cb.checked = true;
        (models[idx] as any).isActive = true;
      });
      settings.groqAvailableModels = [...models];
      await this.plugin.saveSettings();
    };
    btnDeselectAll.onclick = async () => {
      checkboxes.forEach((cb, idx) => {
        cb.checked = false;
        (models[idx] as any).isActive = false;
      });
      settings.groqAvailableModels = [...models];
      await this.plugin.saveSettings();
    };
    selectAllBlock.appendChild(btnSelectAll);
    selectAllBlock.appendChild(btnDeselectAll);
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
        text.inputEl.insertAdjacentHTML(
          'afterend',
          `<span style="font-size: var(--font-ui-smaller, 0.85em); margin-left: 5px;">(${locale === 'ru' ? '0 = не хранить' : '0 = do not store'})</span>`,
        );
        text.inputEl.type = 'number';
        text.inputEl.min = '0';
      })
      .settingEl.setAttribute('title', locale === 'ru' ? 'Настройки истории' : 'History settings');

    if (this.plugin.settings.historyStorageMethod === 'file') {
      new Setting(this.containerEl)
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
        )
        .settingEl.insertAdjacentHTML(
          'beforeend',
          `<p style="font-size: var(--font-ui-smaller, 0.85em); margin-top: 5px;">${locale === 'ru' ? 'Пример: notes/history.md' : 'Example: notes/history.md'}</p>`,
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
