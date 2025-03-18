import { App, PluginSettingTab, Setting } from 'obsidian';
import { GroqModel } from '../constants/models';
import { AuthService } from '../services/authService';
import { Notice } from 'obsidian';
import { GroqPlugin } from '../types/plugin';

export interface GroqChatSettings {
    apiKey: string;
    defaultModel: GroqModel;
}

export const DEFAULT_SETTINGS: GroqChatSettings = {
    apiKey: '',
    defaultModel: GroqModel.LLAMA_3_8B
};

export class GroqSettingTab extends PluginSettingTab {
    plugin: GroqPlugin;

    constructor(app: App, plugin: GroqPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'Настройки Groq Chat' });

        new Setting(containerEl)
            .setName('Авторизация')
            .setDesc('Войдите в свой аккаунт Groq для использования API')
            .addButton(button => button
                .setButtonText(this.plugin.settings.apiKey ? 'Переавторизоваться' : 'Войти через Google')
                .onClick(async () => {
                    await this.validateToken(this.plugin.settings.apiKey);
                    new Notice('Авторизация успешна!');
                }));

        new Setting(containerEl)
            .setName('API ключ')
            .setDesc('Введите ваш API ключ Groq')
            .addText(text => text
                .setPlaceholder('Введите API ключ')
                .setValue(this.plugin.settings.apiKey)
                .onChange(async (value) => {
                    this.plugin.settings.apiKey = value;
                    await this.plugin.saveData(this.plugin.settings);
                }));

        new Setting(containerEl)
            .setName('Модель по умолчанию')
            .setDesc('Выберите модель Groq для использования по умолчанию')
            .addDropdown(dropdown => dropdown
                .addOptions(Object.values(GroqModel).reduce((acc, model) => ({ ...acc, [model]: model }), {}))
                .setValue(this.plugin.settings.defaultModel)
                .onChange(async (value) => {
                    this.plugin.settings.defaultModel = value as GroqModel;
                    await this.plugin.saveData(this.plugin.settings);
                }));
    }

    async validateToken(token: string): Promise<boolean> {
        try {
            const auth = new AuthService(this.plugin);
            return await auth.validateToken(token);
        } catch (error) {
            console.error('Error validating token:', error);
            return false;
        }
    }
}

export { GroqChatSettingsTab } from './GroqChatSettingsTab';