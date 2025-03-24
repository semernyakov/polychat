import { App, PluginSettingTab, Setting } from 'obsidian';
import GroqChatPlugin from '../main';
import { AuthService } from '../services/authService';
import { GroqModel, getModelInfo } from '../types/models';
import { GroqPlugin } from '@/types';

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

    this.addApiKeySetting();
    this.addModelSetting();
    this.addTemperatureSetting();
    this.addMaxTokensSetting();
    this.addHistoryStorageSettings();
  }

  private addApiKeySetting(): void {
    new Setting(this.containerEl)
      .setName('API Key')
      .addText(text => text
        .setValue(this.plugin.settings.apiKey)
        .onChange(async value => {
          this.plugin.settings.apiKey = value;
          await this.plugin.saveSettings();
        })
      );
  }

  private addModelSetting(): void {
    new Setting(this.containerEl)
      .setName('Model')
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
    new Setting(this.containerEl)
      .setName('Temperature')
      .addSlider(slider => slider
        .setLimits(0, 2, 0.1)
        .setValue(this.plugin.settings.temperature)
        .onChange(async value => {
          this.plugin.settings.temperature = value;
          await this.plugin.saveSettings();
        })
        .setDynamicTooltip()
      );
  }

  private addMaxTokensSetting(): void {
    new Setting(this.containerEl)
      .setName('Max Tokens')
      .addText(text => text
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
      .setName('Store chat history')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.storeHistory || false) // Ensure a default value
        .onChange(async value => {
          this.plugin.settings.storeHistory = value;
          await this.plugin.saveSettings();
        })
      );
  }
}

