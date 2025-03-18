import { App, PluginSettingTab, Setting } from 'obsidian';
import { GroqPlugin } from '../types/plugin';
import { GroqModel, MODEL_DISPLAY_NAMES } from '../constants/models';

export class GroqChatSettingsTab extends PluginSettingTab {
    plugin: GroqPlugin;

    constructor(app: App, plugin: GroqPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'Groq Chat Settings' });

        new Setting(containerEl)
            .setName('API Key')
            .setDesc('Enter your Groq API key')
            .addText(text => text
                .setPlaceholder('Enter API key')
                .setValue(this.plugin.settings.apiKey)
                .onChange(async (value) => {
                    this.plugin.settings.apiKey = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Google Client ID')
            .setDesc('Enter your Google OAuth Client ID')
            .addText(text => text
                .setPlaceholder('Enter Client ID')
                .setValue(this.plugin.settings.googleClientId)
                .onChange(async (value) => {
                    this.plugin.settings.googleClientId = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Default Model')
            .setDesc('Select the default model to use')
            .addDropdown(dropdown => dropdown
                .addOptions(Object.entries(MODEL_DISPLAY_NAMES).reduce((acc, [key, value]) => {
                    acc[key] = value;
                    return acc;
                }, {} as Record<string, string>))
                .setValue(this.plugin.settings.defaultModel)
                .onChange(async (value) => {
                    this.plugin.settings.defaultModel = value as GroqModel;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Temperature')
            .setDesc('Set the temperature for responses (0.0 - 1.0)')
            .addSlider(slider => slider
                .setLimits(0, 1, 0.1)
                .setValue(this.plugin.settings.temperature)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.temperature = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Max Tokens')
            .setDesc('Set the maximum number of tokens for responses')
            .addText(text => text
                .setPlaceholder('Enter max tokens')
                .setValue(String(this.plugin.settings.maxTokens))
                .onChange(async (value) => {
                    const tokens = parseInt(value);
                    if (!isNaN(tokens)) {
                        this.plugin.settings.maxTokens = tokens;
                        await this.plugin.saveSettings();
                    }
                }));

        new Setting(containerEl)
            .setName('History Storage Method')
            .setDesc('Choose how to store chat history')
            .addDropdown(dropdown => dropdown
                .addOption('memory', 'Memory')
                .addOption('file', 'File')
                .setValue(this.plugin.settings.historyStorageMethod)
                .onChange(async (value: 'memory' | 'file') => {
                    this.plugin.settings.historyStorageMethod = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Max History Length')
            .setDesc('Set the maximum number of messages to keep in history')
            .addText(text => text
                .setPlaceholder('Enter max history length')
                .setValue(String(this.plugin.settings.maxHistoryLength))
                .onChange(async (value) => {
                    const length = parseInt(value);
                    if (!isNaN(length)) {
                        this.plugin.settings.maxHistoryLength = length;
                        await this.plugin.saveSettings();
                    }
                }));

        if (this.plugin.settings.historyStorageMethod === 'file') {
            new Setting(containerEl)
                .setName('Note Path')
                .setDesc('Set the path for the history note')
                .addText(text => text
                    .setPlaceholder('Enter note path')
                    .setValue(this.plugin.settings.notePath)
                    .onChange(async (value) => {
                        this.plugin.settings.notePath = value;
                        await this.plugin.saveSettings();
                    }));
        }
    }
} 