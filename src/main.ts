import { Plugin } from 'obsidian';
import { GroqChatSettings, DEFAULT_SETTINGS } from './types/plugin';
import './styles/chat.css';
import { AuthService } from './services/authService';
import { AuthState, GoogleAuthConfig } from './types';
import { GroqSettingTab } from './settings';
import { GroqChatView } from './views/GroqChatView';
import { VIEW_TYPE_GROQ_CHAT } from './constants';
import { settingsUtils } from './utils/settingsUtils';
import { groqService } from './services/groqService';
import { authService } from './services/authService';

export default class GroqPlugin extends Plugin {
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
        await this.loadSettings();

        this.registerView(
            VIEW_TYPE_GROQ_CHAT,
            (leaf) => new GroqChatView(leaf, this)
        );

        this.addRibbonIcon('message-square', 'Groq Chat', () => {
            this.activateView();
        });

        this.addCommand({
            id: 'open-groq-chat',
            name: 'Открыть Groq Chat',
            callback: () => {
                this.activateView();
            },
        });

        this.addCommand({
            id: 'clear-conversation',
            name: 'Очистить диалог',
            callback: () => {
                this.clearConversation();
            },
        });

        this.addSettingTab(new GroqSettingTab(this.app, this));

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
                    this.updateViews();
                } catch (error) {
                    console.error('Ошибка авторизации:', error);
                    new Notice(`Ошибка авторизации: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
                    this.authState.error = 'Ошибка авторизации';
                }
            }
        });

        // Обработчик изменения настроек
        this.registerEvent(
            this.app.workspace.on('layout-change', () => {
                this.saveSettings();
                this.updateViews();
            })
        );
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
        this.updateViews();
    }

    async activateView() {
        const workspace = this.app.workspace;
        let leaf = workspace.getLeavesOfType(VIEW_TYPE_GROQ_CHAT)[0];

        if (!leaf) {
            leaf = workspace.getRightLeaf(false);
            if (leaf) {
                await leaf.setViewState({
                    type: VIEW_TYPE_GROQ_CHAT,
                    active: true,
                });
            }
        }

        if (leaf) {
            workspace.revealLeaf(leaf);
        }
    }

    clearConversation() {
        const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_GROQ_CHAT);
        for (const leaf of leaves) {
            const view = leaf.view as GroqChatView;
            view.clearConversation();
        }
    }

    updateViews() {
        const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_GROQ_CHAT);
        for (const leaf of leaves) {
            const view = leaf.view as GroqChatView;
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