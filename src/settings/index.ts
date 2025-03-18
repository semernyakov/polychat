import { App, PluginSettingTab } from 'obsidian';
import { GroqPlugin } from '../types/plugin';
import { GROQ_MODELS } from '../constants';
import { authService } from '../services/authService';
import { Notice } from 'obsidian';

export interface GroqChatSettings {
    groqApiKey: string;
    defaultModel: typeof GROQ_MODELS.LLAMA_3_8B;
}

export const DEFAULT_SETTINGS: GroqChatSettings = {
    groqApiKey: '',
    defaultModel: GROQ_MODELS.LLAMA_3_8B
};

export class GroqChatSettingsTab extends PluginSettingTab {
    plugin: GroqPlugin;

    constructor(app: App, plugin: GroqPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'Настройки Groq Chat' });

        // Секция авторизации
        containerEl.createEl('h3', { text: 'Авторизация' });

        new Setting(containerEl)
            .setName('Авторизация через Google')
            .setDesc('Войдите в Groq через ваш аккаунт Google')
            .addButton(button => button
                .setButtonText(this.plugin.settings.groqApiKey ? 'Переавторизоваться' : 'Войти через Google')
                .onClick(async () => {
                    try {
                        await authService.initiateGoogleAuth();
                    } catch (error) {
                        new Notice(`Ошибка авторизации: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
                    }
                }));

        new Setting(containerEl)
            .setName('Groq API Key')
            .setDesc('Enter your Groq API key')
            .addText(text => text
                .setPlaceholder('Enter your api key')
                .setValue(this.plugin.settings.groqApiKey)
                .onChange(async (value) => {
                    this.plugin.settings.groqApiKey = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Default Model')
            .setDesc('Select the default Groq model to use')
            .addDropdown(dropdown => dropdown
                .addOption(GROQ_MODELS.LLAMA_3_8B, 'Llama 3 8B')
                .setValue(this.plugin.settings.defaultModel)
                .onChange(async (value) => {
                    this.plugin.settings.defaultModel = value as typeof GROQ_MODELS.LLAMA_3_8B;
                    await this.plugin.saveSettings();
                }));
    }
}