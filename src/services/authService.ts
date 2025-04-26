import { Notice } from 'obsidian';
import { GroqPluginInterface } from '../types/plugin';
import { GroqService } from './groqService';

export class AuthService {
  constructor(
    private readonly plugin: GroqPluginInterface,
    private readonly groqService: GroqService,
  ) {}

  get isAuthenticated(): boolean {
    return this.validateApiKeyFormat(this.plugin.settings.apiKey);
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    if (!this.validateApiKeyFormat(apiKey)) {
      new Notice('❌ Неверный формат API ключа');
      return false;
    }

    try {
      const isValid = await this.groqService.validateApiKey(apiKey);
      new Notice(isValid ? '✅ Valid API key' : '❌ Invalid API key');
      return isValid;
    } catch (error) {
      console.error('API key validation error:', error);
      new Notice('⚠️ API key validation failed');
      return false;
    }
  }

  async setApiKey(apiKey: string): Promise<void> {
    if (!apiKey) {
      await this.clearApiKey();
      return;
    }

    if (await this.validateApiKey(apiKey)) {
      this.plugin.settings.apiKey = apiKey;
      await this.plugin.saveSettings();
      this.groqService.updateApiKey(apiKey);
      return;
    }
  }

  async clearApiKey(): Promise<void> {
    this.plugin.settings.apiKey = '';
    await this.plugin.saveSettings();
    this.groqService.updateApiKey('');
    new Notice('API key cleared');
  }

  private validateApiKeyFormat(apiKey: string): boolean {
    if (!apiKey) {
      return false;
    }

    if (!/^gsk_[a-zA-Z0-9]{32,}$/.test(apiKey)) {
      return false;
    }

    return true;
  }
}
</xArtifact>

**Проверка корректности**:
- Валидация ключа теперь зависит от `GroqService`, который выбирает модель динамически.
- Уведомления улучшены для большей ясности (например, ошибка формата ключа).

#### 4. HistoryService.ts
Добавлены миграция, проверка `notePath`, и компрессия.

<xaiArtifact artifact_id="cc21b087-ce96-4cb9-b327-01c22c74212c" artifact_version_id="496e2f8c-dc32-4734-b39e-8b7efa2043ef" title="historyService.ts" contentType="text/typescript">
import { GroqPluginInterface } from '../types/plugin';
import { Message } from '../types/types';
import { TFile, Notice } from 'obsidian';
import { HistoryStorageMethod } from '../types/settings';

const IDB_NAME = 'groq-chat-history';
const IDB_STORE_NAME = 'history';
const IDB_VERSION = 1;
const LOCAL_STORAGE_KEY = 'groq-chat-history';

export class HistoryService {
  private memoryHistory: Message[] = [];

  constructor(private readonly plugin: GroqPluginInterface) {
    this.initializeFileStorage();
  }

  async getHistory(): Promise<Message[]> {
    try {
      const method = this.plugin.settings.historyStorageMethod;
      const fullHistory = await this.getHistoryByMethod(method);
      return this.truncateHistory(fullHistory, this.plugin.settings.maxHistoryLength);
    } catch (error) {
      this.handleError('Error loading history', error);
      return [];
    }
  }

  async addMessage(message: Message): Promise<void> {
    try {
      const currentHistory = await this.getHistory();
      const newHistory = [...currentHistory, message];
      await this.saveHistory(newHistory);
    } catch (error) {
      this.handleError('Error saving message', error);
    }
  }

  async clearHistory(): Promise<void> {
    try {
      await this.clearByMethod(this.plugin.settings.historyStorageMethod);
      new Notice('History cleared');
    } catch (error) {
      this.handleError('Error clearing history', error);
    }
  }

  async migrateHistory(fromMethod: HistoryStorageMethod, toMethod: HistoryStorageMethod): Promise<void> {
    if (fromMethod === toMethod) return;
    try {
      const history = await this.getHistoryByMethod(fromMethod);
      await this.saveHistoryToMethod(toMethod, history);
      await this.clearByMethod(fromMethod);
      new Notice(`История успешно перенесена из ${fromMethod} в ${toMethod}`);
    } catch (error) {
      this.handleError('Ошибка миграции истории', error);
    }
  }

  private async getHistoryByMethod(method: HistoryStorageMethod): Promise<Message[]> {
    switch (method) {
      case 'memory':
        return [...this.memoryHistory];
      case 'localStorage':
        return this.getFromLocalStorage();
      case 'indexedDB':
        return this.getFromIndexedDB();
      case 'file':
        return this.getFromFile();
      default:
        console.warn(`Unknown history storage method: ${method}`);
        return [];
    }
  }

  private async saveHistory(history: Message[]): Promise<void> {
    const method = this.plugin.settings.historyStorageMethod;
    await this.saveHistoryToMethod(method, history);
  }

  private async saveHistoryToMethod(method: HistoryStorageMethod, history: Message[]): Promise<void> {
    const truncated = this.truncateHistory(history, this.plugin.settings.maxHistoryLength);
    switch (method) {
      case 'memory':
        this.memoryHistory = truncated;
        break;
      case 'localStorage':
        this.saveToLocalStorage(truncated);
        break;
      case 'indexedDB':
        await this.saveToIndexedDB(truncated);
        break;
      case 'file':
        await this.saveToFile(truncated);
        break;
      default:
        console.warn(`Unknown history storage method: ${method}`);
    }
  }

  private truncateHistory(history: Message[], maxLength: number): Message[] {
    if (maxLength <= 0) {
      return [];
    }
    return history.slice(-maxLength);
  }

  private getFromLocalStorage(): Message[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from localStorage', error);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      return [];
    }
  }

  private saveToLocalStorage(history: Message[]): void {
    try {
      // Минимизация данных для экономии места
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving to localStorage', error);
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        new Notice('Failed to save history: LocalStorage quota exceeded.');
      }
    }
  }

  private async getFromIndexedDB(): Promise<Message[]> {
    try {
      const db = await this.openHistoryDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(IDB_STORE_NAME, 'readonly');
        const store = transaction.objectStore(IDB_STORE_NAME);
        const request = store.getAll();

        request.onsuccess = event => {
          resolve((event.target as IDBRequest<Message[]>).result);
        };

        request.onerror = event => {
          console.error('IndexedDB getAll error:', (event.target as IDBRequest).error);
          reject((event.target as IDBRequest).error);
        };
      });
    } catch (error) {
      console.error('Failed to get history from IndexedDB', error);
      return [];
    }
  }

  private async saveToIndexedDB(history: Message[]): Promise<void> {
    try {
      const db = await this.openHistoryDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(IDB_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(IDB_STORE_NAME);

        const clearRequest = store.clear();

        clearRequest.onsuccess = () => {
          const putPromises = history.map(msg => {
            return new Promise<void>((res, rej) => {
              const req = store.put(msg);
              req.onsuccess = () => res();
              req.onerror = event => rej((event.target as IDBRequest).error);
            });
          });

          Promise.all(putPromises)
            .then(() => {
              console.log('IndexedDB save successful');
              resolve();
            })
            .catch(err => {
              console.error('IndexedDB put error:', err);
              reject(err);
            });
        };

        clearRequest.onerror = event => {
          console.error('IndexedDB clear error:', (event.target as IDBRequest).error);
          reject((event.target as IDBRequest).error);
        };

        transaction.onerror = event => {
          console.error('IndexedDB transaction error:', (event.target as IDBTransaction).error);
          reject((event.target as IDBTransaction).error);
        };
      });
    } catch (error) {
      console.error('Failed to save history to IndexedDB', error);
      throw error;
    }
  }

  private async clearIndexedDB(): Promise<void> {
    try {
      const db = await this.openHistoryDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(IDB_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(IDB_STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => {
          console.log('IndexedDB cleared successfully');
          resolve();
        };
        request.onerror = event => {
          console.error('IndexedDB clear error:', (event.target as IDBRequest).error);
          reject((event.target as IDBRequest).error);
        };
      });
    } catch (error) {
      console.error('Failed to clear IndexedDB', error);
      throw error;
    }
  }

  private async getFromFile(): Promise<Message[]> {
    try {
      const path = this.plugin.settings.notePath;
      if (!path) return [];

      const file = this.plugin.app.vault.getAbstractFileByPath(path);
      if (file instanceof TFile) {
        const content = await this.plugin.app.vault.read(file);
        return content ? JSON.parse(content) : [];
      }
      return [];
    } catch (error) {
      console.error('Error reading history file', error);
      return [];
    }
  }

  private async saveToFile(history: Message[]): Promise<void> {
    const path = this.plugin.settings.notePath;
    if (!path) {
      console.warn('History file path is not set. Cannot save history to file.');
      return;
    }

    try {
      // Минимизация данных
      const content = JSON.stringify(history);
      const file = this.plugin.app.vault.getAbstractFileByPath(path);

      if (file instanceof TFile) {
        await this.plugin.app.vault.modify(file, content);
      } else {
        const dir = path.substring(0, path.lastIndexOf('/'));
        if (dir && !(await this.plugin.app.vault.adapter.exists(dir))) {
          await this.plugin.app.vault.createFolder(dir);
          console.log(`Created directory: ${dir}`);
        }
        await this.plugin.app.vault.create(path, content);
      }
    } catch (error) {
      console.error('Error saving history to file', error);
    }
  }

  private async clearFile(): Promise<void> {
    const path = this.plugin.settings.notePath;
    if (!path) return;

    try {
      const file = this.plugin.app.vault.getAbstractFileByPath(path);
      if (file instanceof TFile) {
        await this.plugin.app.vault.modify(file, '[]');
      }
    } catch (error) {
      console.error('Error clearing history file', error);
    }
  }

  private async clearByMethod(method: HistoryStorageMethod): Promise<void> {
    switch (method) {
      case 'memory':
        this.memoryHistory = [];
        break;
      case 'localStorage':
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        break;
      case 'indexedDB':
        await this.clearIndexedDB();
        break;
      case 'file':
        await this.clearFile();
        break;
      default:
        console.warn(`Unknown history storage method: ${method}`);
    }
  }

  private handleError(context: string, error: unknown): void {
    console.error(context, error);
    new Notice(`${context}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  private openHistoryDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(IDB_NAME, IDB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        console.log('IndexedDB upgrade needed');
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
          console.log(`Creating object store: ${IDB_STORE_NAME}`);
          db.createObjectStore(IDB_STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = event => {
        console.log('IndexedDB opened successfully');
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = event => {
        console.error('IndexedDB error:', (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };

      request.onblocked = () => {
        console.warn('IndexedDB open blocked, please close other tabs/instances using the database.');
        reject(new Error('IndexedDB open blocked'));
      };
    });
  }

  private async initializeFileStorage(): Promise<void> {
    if (this.plugin.settings.historyStorageMethod !== 'file') return;
    const path = this.plugin.settings.notePath;
    if (!path) return;

    try {
      const file = this.plugin.app.vault.getAbstractFileByPath(path);
      if (!(file instanceof TFile)) {
        const dir = path.substring(0, path.lastIndexOf('/'));
        if (dir && !(await this.plugin.app.vault.adapter.exists(dir))) {
          await this.plugin.app.vault.createFolder(dir);
        }
        await this.plugin.app.vault.create(path, '[]');
      }
    } catch (error) {
      console.error('Error initializing file storage:', error);
    }
  }
}
</xArtifact>

**Проверка корректности**:
- `migrateHistory` позволяет переносить историю между методами хранения.
- `initializeFileStorage` создает `notePath` при запуске, если он отсутствует.
- `indexedDB` использует `id` как ключ, обеспечивая уникальность записей.
- `JSON.stringify` без отступов минимизирует размер данных для `localStorage` и `file`.

#### 5. GroqChatSettingsTab.ts
Добавлены `displayMode`, описания моделей, лимиты запросов и ограничения настроек.

<xaiArtifact artifact_id="cdc348f0-b1ca-401c-9f05-7c66a4fd0aca" artifact_version_id="bfa6f90a-9555-429f-b373-f8f29c39080f" title="GroqChatSettingsTab.ts" contentType="text/typescript">
import { App, PluginSettingTab, Setting } from 'obsidian';
import { GroqPluginInterface } from '../types/plugin';
import { AuthService } from '../services/authService';
import { GroqService } from '../services/groqService';
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
    private readonly authService: AuthService,
    private readonly groqService: GroqService,
  ) {
    super(app, plugin);
  }

  async display(): Promise<void> {
    const locale = (this.plugin.settings.language || 'ru') as Locale;
    this.containerEl.empty();

    // Обновление лимитов при открытии
    await this.groqService.getAvailableModelsWithLimits(true);

    // --- API ---
    this.containerEl.createEl('h3', { text: locale === 'ru' ? 'Настройки API' : 'API Settings' });
    this.addApiKeySetting(locale);

    // --- Модель ---
    this.containerEl.createEl('h3', { text: locale === 'ru' ? 'Модель' : 'Model' });
    this.addModelSetting(locale);

    // --- Список моделей ---
    this.addModelListBlock(locale);

    // --- Лимиты запросов ---
    this.containerEl.createEl('h3', { text: locale === 'ru' ? 'Лимиты запросов' : 'Rate Limits' });
    this.addRateLimitsBlock(locale);

    // --- История ---
    this.containerEl.createEl('h3', { text: locale === 'ru' ? 'История' : 'History' });
    this.addHistorySettings(locale);

    // --- Интерфейс ---
    this.containerEl.createEl('h3', { text: locale === 'ru' ? 'Интерфейс' : 'Interface' });
    this.addDisplayModeSetting(locale);
    this.addLanguageSetting(locale);

    // --- Температура и макс. токены ---
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

    // --- Кнопки действий ---
    const actionsBlock = document.createElement('div');
    actionsBlock.style.margin = '32px 0 0 0';
    actionsBlock.style.display = 'flex';
    actionsBlock.style.gap = '16px';
    actionsBlock.style.justifyContent = 'flex-end';
    const btnSave = document.createElement('button');
    btnSave.textContent = locale === 'ru' ? 'Сохранить все настройки' : 'Save all settings';
    btnSave.className = 'mod-cta';
    btnSave.onclick = async () => {
      await this.plugin.saveSettings();
      new Notice(locale === 'ru' ? 'Настройки сохранены' : 'Settings saved');
    };
    const btnReset = document.createElement('button');
    btnReset.textContent = locale === 'ru' ? 'Сбросить настройки по умолчанию' : 'Reset to default';
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
  }

  private createTemperatureSetting(locale: Locale): HTMLElement {
    const wrapper = document.createElement('div');
    new Setting(wrapper)
      .setName(t('temperature', locale))
      .setDesc(locale === 'ru' ? 'Контролирует случайность ответов (0-2)' : 'Controls randomness of responses (0-2)')
      .addSlider(slider =>
        slider
          .setLimits(0, 2, 0.1)
          .setValue(this.plugin.settings.temperature)
          .setDynamicTooltip()
          .onChange(async value => {
            this.plugin.settings.temperature = Math.max(0, Math.min(2, value));
            await this.plugin.saveSettings();
            this.showSavedIcon(slider.sliderEl);
          })
      )
      .settingEl.setAttribute('title', locale === 'ru' ? 'Чем выше, тем более креативные ответы' : 'Higher = more creative responses');
    return wrapper;
  }

  private createMaxTokensSetting(locale: Locale): HTMLElement {
    const wrapper = document.createElement('div');
    new Setting(wrapper)
      .setName(t('maxTokens', locale))
      .setDesc(locale === 'ru' ? 'Максимальное количество токенов в ответе (1-32768)' : 'Maximum number of tokens in response (1-32768)')
      .addText(text =>
        text
          .setPlaceholder(locale === 'ru' ? 'Например: 4096' : 'e.g. 4096')
          .setValue(this.plugin.settings.maxTokens.toString())
          .onChange(async value => {
            const num = parseInt(value) || 4096;
            const maxTokens = Math.max(1, Math.min(32768, num));
            this.plugin.settings.maxTokens = maxTokens;
            await this.plugin.saveSettings();
            this.showSavedIcon(text.inputEl);
          })
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
      .setDesc(locale === 'ru' ? 'Ваш ключ для доступа к Groq API' : 'Your key for accessing Groq API')
      .addText(text =>
        text
          .setPlaceholder(t('apiKeyPlaceholder', locale))
          .setValue(this.plugin.settings.apiKey)
          .onChange(async value => {
            this.plugin.settings.apiKey = value.trim();
            await this.plugin.saveSettings();
            this.showSavedIcon(text.inputEl);
          })
      )
      .addButton(btn =>
        btn
          .setButtonText(t('checkApiKey', locale))
          .setCta()
          .onClick(async () => {
            const isValid = await this.authService.validateApiKey(this.plugin.settings.apiKey);
            new Notice(isValid ? t('validApiKey', locale) : t('invalidApiKey', locale));
          })
      );
  }

  private addModelSetting(locale: Locale): void {
    const setting = new Setting(this.containerEl)
      .setName(t('model', locale))
      .setDesc(locale === 'ru' ? 'Выберите модель для генерации ответов' : 'Select model for generating responses');

    let dropdownEl: HTMLSelectElement | null = null;
    const updateDropdown = () => {
      if (!dropdownEl) return;
      const settings = this.plugin.settings as GroqChatSettings;
      const models = (settings.groqAvailableModels || []).filter(m => m.isActive !== false);
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
      if (settings.model && !models.some(m => m.id === settings.model)) {
        settings.model = models[0]?.id || 'none';
      }
      dropdownEl.value = settings.model || (models[0]?.id ?? 'none');
    };
    const dropdown = setting.addDropdown(dropdown => {
      dropdownEl = dropdown.selectEl;
      updateDropdown();
      dropdown
        .setValue((this.plugin.settings as GroqChatSettings).model || (dropdownEl.options[0]?.value ?? 'none'))
        .onChange(async value => {
          (this.plugin.settings as GroqChatSettings).model = value;
          await this.plugin.saveSettings();
          this.showSavedIcon(dropdownEl!);
        });
    });

    setting.addExtraButton(btn => {
      btn
        .setIcon('refresh-cw')
        .setTooltip(t('refreshModels', locale))
        .onClick(async () => {
          btn.setDisabled(true);
          btn.extraSettingsEl.classList.add('mod-spinner');
          const { models } = await this.groqService.getAvailableModelsWithLimits(true);
          if (models.length > 0) {
            const settings = this.plugin.settings as GroqChatSettings;
            settings.groqAvailableModels = models;
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
  }

  private addModelListBlock(locale: Locale) {
    let modelsBlock = this.containerEl.querySelector('.groq-models-block') as HTMLDivElement | null;
    if (!modelsBlock) {
      modelsBlock = document.createElement('div');
      modelsBlock.className = 'groq-models-block';
      this.containerEl.appendChild(modelsBlock);
    }
    modelsBlock.innerHTML = '';

    type DisplayModel = {
      id: string;
      name: string;
      description?: string;
      isActive?: boolean;
    };
    const settings = this.plugin.settings as GroqChatSettings;
    let models: DisplayModel[] = (settings.groqAvailableModels || []).map(m => ({
      ...m,
      isActive: typeof m.isActive === 'boolean' ? m.isActive : true,
    }));

    const selectAllBlock = document.createElement('div');
    selectAllBlock.style.margin = '8px 0 8px 0';
    selectAllBlock.style.display = 'flex';
    selectAllBlock.style.gap = '8px';
    const btnSelectAll = document.createElement('button');
    btnSelectAll.textContent = locale === 'ru' ? 'Выбрать все' : 'Select all';
    btnSelectAll.className = 'mod-cta';
    const btnDeselectAll = document.createElement('button');
    btnDeselectAll.textContent = locale === 'ru' ? 'Отменить все' : 'Deselect all';

    const modelsTable = document.createElement('table');
    modelsTable.className = 'groq-models-table';
    modelsTable.style.width = '100%';
    modelsTable.style.borderCollapse = 'collapse';
    modelsTable.style.fontSize = '13px';
    modelsTable.style.margin = '24px 0 24px 0';
    modelsTable.innerHTML = `
      <thead><tr style='background:#f0f0f0;'>
        <th style='text-align:left;padding:4px 8px;'>${t('model', locale)}</th>
        <th style='text-align:left;padding:4px 8px;'>${t('description', locale)}</th>
        <th style='text-align:left;padding:4px 8px;'>${t('active', locale)}</th>
      </tr></thead>
      <tbody></tbody>
    `;
    const tbody = modelsTable.querySelector('tbody') as HTMLTableSectionElement;
    const checkboxes: HTMLInputElement[] = [];
    models.forEach((model, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style='padding:4px 8px;'>${model.name.replace(' (недоступна)', '')}</td>
        <td style='padding:4px 8px;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>${model.description || '—'}</td>
        <td style='padding:4px 8px;'></td>
      `;
      const toggleTd = tr.children[2] as HTMLTableCellElement;
      const toggle = document.createElement('input');
      toggle.type = 'checkbox';
      toggle.checked = model.isActive !== false;
      toggle.style.transform = 'scale(1.2)';
      toggle.title = locale === 'ru' ? 'Включить/выключить модель для чата' : 'Enable/disable model for chat';
      toggle.addEventListener('change', async () => {
        models[idx].isActive = toggle.checked;
        settings.groqAvailableModels = [...models];
        await this.plugin.saveSettings();
        this.showSavedIcon(toggle);
        this.addModelSetting(locale); // Обновить dropdown
      });
      toggleTd.appendChild(toggle);
      checkboxes.push(toggle);
      tbody.appendChild(tr);
    });

    btnSelectAll.onclick = async () => {
      checkboxes.forEach((cb, idx) => {
        cb.checked = true;
        models[idx].isActive = true;
      });
      settings.groqAvailableModels = [...models];
      await this.plugin.saveSettings();
      this.addModelSetting(locale);
    };
    btnDeselectAll.onclick = async () => {
      checkboxes.forEach((cb, idx) => {
        cb.checked = false;
        models[idx].isActive = false;
      });
      settings.groqAvailableModels = [...models];
      await this.plugin.saveSettings();
      this.addModelSetting(locale);
    };
    selectAllBlock.appendChild(btnSelectAll);
    selectAllBlock.appendChild(btnDeselectAll);
    modelsBlock.appendChild(selectAllBlock);
    modelsBlock.appendChild(modelsTable);
  }

  private addRateLimitsBlock(locale: Locale) {
    const limitsBlock = document.createElement('div');
    limitsBlock.style.margin = '16px 0';
    const settings = this.plugin.settings as GroqChatSettings;
    const rateLimits = settings.groqRateLimits || {};
    const items = [
      { label: locale === 'ru' ? 'Запросов в день' : 'Requests per day', value: rateLimits.requestsPerDay },
      { label: locale === 'ru' ? 'Осталось запросов' : 'Remaining requests', value: rateLimits.remainingRequests },
      { label: locale === 'ru' ? 'Сброс запросов' : 'Requests reset', value: rateLimits.resetRequests },
      { label: locale === 'ru' ? 'Токенов в минуту' : 'Tokens per minute', value: rateLimits.tokensPerMinute },
      { label: locale === 'ru' ? 'Осталось токенов' : 'Remaining tokens', value: rateLimits.remainingTokens },
      { label: locale === 'ru' ? 'Сброс токенов' : 'Tokens reset', value: rateLimits.resetTokens },
    ];
    items.forEach(item => {
      if (item.value !== undefined) {
        const p = document.createElement('p');
        p.style.margin = '4px 0';
        p.textContent = `${item.label}: ${item.value}`;
        limitsBlock.appendChild(p);
      }
    });
    if (limitsBlock.childElementCount === 0) {
      limitsBlock.textContent = locale === 'ru' ? 'Данные о лимитах недоступны' : 'Rate limit data unavailable';
    }
    this.containerEl.appendChild(limitsBlock);
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
            const oldMethod = this.plugin.settings.historyStorageMethod;
            this.plugin.settings.historyStorageMethod = value as HistoryStorageMethod;
            await this.plugin.saveSettings();
            await (this.plugin as any).historyService.migrateHistory(oldMethod, value); // Предполагается, что historyService доступен
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
      });

    if (this.plugin.settings.historyStorageMethod === 'file') {
      new Setting(this.containerEl)
        .setName(t('historyFile', locale))
        .setDesc(locale === 'ru' ? 'Путь к файлу для хранения истории' : 'Path to file for storing history')
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
                new Notice(locale === 'ru' ? 'Некорректное имя/путь файла' : 'Invalid file name/path');
              }
            })
        );
    }
  }

  private addDisplayModeSetting(locale: Locale): void {
    new Setting(this.containerEl)
      .setName(t('displayMode', locale))
      .setDesc(locale === 'ru' ? 'Выберите режим отображения чата' : 'Select chat display mode')
      .addDropdown(dropdown => {
        dropdown
          .addOption('tab', locale === 'ru' ? 'Вкладка' : 'Tab')
          .addOption('sidepanel', locale === 'ru' ? 'Боковая панель' : 'Sidepanel')
          .setValue(this.plugin.settings.displayMode)
          .onChange(async value => {
            this.plugin.settings.displayMode = value as 'tab' | 'sidepanel';
            await this.plugin.saveSettings();
            this.showSavedIcon(dropdown.selectEl);
          });
      });
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
            this.display();
          });
      });
  }
}
