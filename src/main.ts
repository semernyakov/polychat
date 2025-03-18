import { Plugin, Notice } from 'obsidian';
import { GroqChatSettings } from './types/plugin';
import './styles/chat.css';
import { AuthService } from './services/authService';
import { AuthState, GoogleAuthConfig } from './types';
import { GroqChatSettingsTab } from './settings';
import { GroqChatView } from './views/GroqChatView';
import { VIEW_TYPE_GROQ_CHAT } from './constants';
import { settingsUtils } from './utils/settingsUtils';
import { groqService } from './services/groqService';
import { authService } from './services/authService';

const DEFAULT_SETTINGS: GroqChatSettings = {
    groqApiKey: '',
    defaultModel: 'llama3-8b-8192',
    historyStorageMethod: 'note',
    googleToken: '',
    maxHistoryLength: 100,
    temperature: 0.7,
    maxTokens: 1000
};

export default class GroqChatPlugin extends Plugin {
    private authState: AuthState = {
        isAuthenticated: false
    };

    private googleAuthConfig: GoogleAuthConfig = {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: '', // Удален клиентский секрет. Пользователь введет через настройки
        redirectUri: 'obsidian://groq-chat/auth/callback'
    };

    settings: GroqChatSettings;

    async onload() {
        // Загрузка настроек с валидацией
        const loadedSettings = await this.loadData();
        this.settings = settingsUtils.validateSettings(loadedSettings);

        // Проверка API ключа при загрузке
        if (this.settings.groqApiKey) {
            try {
                const isValid = await groqService.validateApiKey(this.settings.groqApiKey);
                if (!isValid) {
                    new Notice('Недействительный API ключ Groq. Пожалуйста, проверьте настройки.');
                    this.settings.groqApiKey = '';
                    await this.saveSettings();
                }
            } catch (error) {
                console.error('Ошибка при проверке API ключа:', error);
                new Notice('Ошибка при проверке API ключа Groq');
            }
        }

        // Инициализация состояния аутентификации
        if (this.settings.googleToken) {
            try {
                const authServiceInstance = AuthService.getInstance();
                const isValid = await authServiceInstance.verifyToken(this.settings.googleToken);
                this.authState.isAuthenticated = isValid;
                if (!isValid) {
                    this.settings.googleToken = '';
                    await this.saveSettings();
                }
            } catch (error) {
                console.error('Ошибка проверки токена:', error);
                new Notice(`Ошибка проверки Google токена: ${error instanceof Error ? error.message : String(error)}. Пожалуйста, повторно авторизуйтесь.`, 5000);
                this.authState.isAuthenticated = false;
                this.settings.googleToken = '';
                await this.saveSettings();
            }
        }

        // Регистрация обработчика callback URL
        this.registerObsidianProtocolHandler("groq-chat", async (params) => {
            if (params.action === "auth-callback" && params.code) {
                try {
                    const token = await authService.handleAuthCallback(params.code);
                    this.authState.isAuthenticated = true;
                    this.authState.token = token;
                    this.settings.groqApiKey = token;
                    await this.saveSettings();
                    new Notice('Успешная авторизация в Groq');
                    this.updateView();
                } catch (error) {
                    console.error('Ошибка авторизации:', error);
                    new Notice(`Ошибка авторизации: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
                    this.authState.error = 'Ошибка авторизации';
                }
            }
        });

        // Регистрация представления
        this.registerView(
            VIEW_TYPE_GROQ_CHAT,
            (leaf) => new GroqChatView(leaf, this)
        );

        // Добавление кнопки в боковую панель
        this.addRibbonIcon('message-square', 'Открыть Groq Chat', () => {
            this.activateView();
        });

        // Добавление вкладки настроек
        this.addSettingTab(new GroqChatSettingsTab(this.app, this));

        // Обработчик изменения настроек
        this.registerEvent(
            this.app.workspace.on('layout-change', () => {
                this.saveSettings();
                this.updateView();
            })
        );
    }

    async activateView() {
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_GROQ_CHAT);

        await this.app.workspace.getRightLeaf(false).setViewState({
            type: VIEW_TYPE_GROQ_CHAT,
            active: true,
        });

        this.app.workspace.revealLeaf(
            this.app.workspace.getLeavesOfType(VIEW_TYPE_GROQ_CHAT)[0]
        );
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
        // Уведомление React представления о том, что настройки изменились
        this.app.workspace.trigger('groq-chat:settings-change');
    }

    async clearHistory() {
        // Реализация метода clearHistory, требуемого интерфейсом GroqPlugin
        // Здесь должна быть логика очистки истории чата
        try {
            // Пример реализации
            const view = this.app.workspace.getLeavesOfType(VIEW_TYPE_GROQ_CHAT)[0]?.view;
            if (view instanceof GroqChatView) {
                // Предположим, что в ChatPanel есть метод clearHistory
                view.clearConversation?.();
            }
            new Notice('История чата очищена');
        } catch (error) {
            console.error('Ошибка при очистке истории:', error);
            new Notice('Ошибка при очистке истории чата');
        }
    }

    updateView() {
        const view = this.app.workspace.getLeavesOfType(VIEW_TYPE_GROQ_CHAT)[0]?.view;
        if (view instanceof GroqChatView) {
            view.updateSettings(this.settings);
        }
    }

    async onunload() {
        // Сохранение истории перед выгрузкой плагина
        const view = this.app.workspace.getLeavesOfType(VIEW_TYPE_GROQ_CHAT)[0]?.view;
        if (view instanceof GroqChatView) {
            await view.onClose(); // Используем существующий метод onClose вместо saveState
        }
    }
}