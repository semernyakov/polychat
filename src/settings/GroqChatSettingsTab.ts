import { App, PluginSettingTab, Setting } from 'obsidian';
import GroqChatPlugin from '../main';
import { AuthService } from '../services/authService';
import { GroqModel, getModelInfo } from '../types/models';
import { GroqPlugin } from '@/types';
import { Notice } from 'obsidian';

export class GroqChatSettingsTab extends PluginSettingTab {
  plugin: GroqChatPlugin;
  private authService: AuthService;

  constructor(app: App, plugin: GroqChatPlugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.authService = new AuthService(app, plugin as unknown as GroqPlugin, plugin.groqService);
  }

  display(): void {
    this.containerEl.empty();
    this.containerEl.createEl('h2', { text: 'Groq Chat Settings' });
    this.containerEl.createEl('p', { 
      text: 'Настройте параметры для работы с Groq API' 
    }).style.marginBottom = '1.5rem';

    this.addApiKeySetting();
    this.addModelSetting();
    this.addTemperatureSetting();
    this.addMaxTokensSetting();
    this.addHistoryStorageSettings();
  }

  private addApiKeySetting(): void {
    const setting = new Setting(this.containerEl)
      .setName('API Key')
      .setDesc('Ваш уникальный ключ для доступа к Groq API. Получите его на сайте Groq.')
      .addText(text => text
        .setPlaceholder('Введите ваш API ключ')
        .setValue(this.plugin.settings.apiKey)
        .onChange(async value => {
          this.plugin.settings.apiKey = value;
          await this.plugin.saveSettings();
        })
      );

    // Добавляем кнопку проверки API ключа
    setting.addButton(button => button
      .setButtonText('Проверить ключ')
      .setCta()
      .onClick(async () => {
        const isValid = await this.authService.validateApiKey(this.plugin.settings.apiKey);
        if (isValid) {
          new Notice('API ключ действителен');
        } else {
          new Notice('Неверный API ключ');
        }
      })
    );
  }

  private addModelSetting(): void {
    new Setting(this.containerEl)
      .setName('Модель')
      .setDesc('Выберите модель для генерации ответов. Разные модели имеют разные возможности и стоимость.')
      .addDropdown(dropdown => {
        Object.values(GroqModel).forEach(model => {
          dropdown.addOption(model, getModelInfo(model).name);
        });
        dropdown.setValue(this.plugin.settings.model);
        dropdown.onChange(async value => {
          this.plugin.settings.model = value as GroqModel;
          await this.plugin.saveSettings();
        });
      });
  }

  private addTemperatureSetting(): void {
    const setting = new Setting(this.containerEl)
      .setName('Температура')
      .setDesc('Контролирует случайность ответов. Более высокие значения делают ответы более креативными, но менее точными.')
      .addSlider(slider => slider
        .setLimits(0, 2, 0.1)
        .setValue(this.plugin.settings.temperature)
        .onChange(async value => {
          this.plugin.settings.temperature = value;
          await this.plugin.saveSettings();
        })
        .setDynamicTooltip()
      );

    // Добавляем визуальные метки для температуры
    const valueContainer = setting.controlEl.createDiv();
    valueContainer.style.display = 'flex';
    valueContainer.style.justifyContent = 'space-between';
    valueContainer.style.width = '100%';
    valueContainer.createSpan({ text: 'Точно' });
    valueContainer.createSpan({ text: 'Баланс' });
    valueContainer.createSpan({ text: 'Креативно' });
  }

  private addMaxTokensSetting(): void {
    new Setting(this.containerEl)
      .setName('Макс. токенов')
      .setDesc('Максимальное количество токенов в ответе. Один токен ≈ 0.75 слова на английском.')
      .addText(text => text
        .setPlaceholder('Введите число')
        .setValue(this.plugin.settings.maxTokens.toString())
        .onChange(async value => {
          const numValue = parseInt(value);
          if (!isNaN(numValue)) {
            this.plugin.settings.maxTokens = numValue;
            await this.plugin.saveSettings();
          }
        })
      );
  }

  private addHistoryStorageSettings(): void {
    new Setting(this.containerEl)
      .setName('Хранение истории')
      .setDesc('Сохранять ли историю чата для последующих сессий.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.storeHistory || false)
        .onChange(async value => {
          this.plugin.settings.storeHistory = value;
          await this.plugin.saveSettings();
        })
      );
  }
}

