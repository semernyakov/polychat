// main.ts
import { Plugin, Notice } from 'obsidian';
import { GroqChatSettings } from './types/plugin';
import './styles/chat.css';
import { AuthService } from './services/authService';
import { AuthState, GoogleAuthConfig } from './types';
import { GroqChatSettingsTab } from './settings';
import { GroqChatView } from './views/GroqChatView';
import { VIEW_TYPE_GROQ_CHAT } from './constants';
import { createRoot } from 'react-dom/client';
import App from '../ui/src/App';
import React from 'react';
import { settingsUtils } from './utils/settingsUtils';
import { groqService } from './services/groqService';
import { historyService } from './services/historyService';
import { authService } from './services/authService';

const DEFAULT_SETTINGS: GroqChatSettings = {
    groqApiKey: '',
    defaultModel: 'llama3-8b-8192',
    historyStorageMethod: 'note',
    googleToken: '',
};

export default class GroqChatPlugin extends Plugin {
    private authState: AuthState = {
        isAuthenticated: false
    };

    private googleAuthConfig: GoogleAuthConfig = {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: '', // Removed client secret. User will input via settings
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

        // Initialize authentication state
        if (this.settings.googleToken) {
            try {
                const authService = AuthService.getInstance();
                const isValid = await authService.verifyToken(this.settings.googleToken);
                this.authState.isAuthenticated = isValid;
                if (!isValid) {
                    this.settings.googleToken = '';
                    await this.saveSettings();
                }
            } catch (error) {
                console.error('Error verifying token:', error);
                new Notice(`Error verifying Google token: ${error instanceof Error ? error.message : String(error)}.  Please re-authenticate.`, 5000); // Show a user-friendly notice
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
            this.app.workspace.on('groq-chat:settings-change', async () => {
                await this.saveSettings();
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
        // Notify the React view that settings have changed
        this.app.workspace.trigger('groq-chat:settings-change');
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
            await view.saveState();
        }
    }
}

// views/GroqChatView.ts
import { WorkspaceLeaf, View } from 'obsidian';
import ReactDOM from 'react-dom/client';

export const VIEW_TYPE_GROQ_CHAT = 'groq-chat-view';

import { GroqChatViewProps } from './types/views';

interface AppProps {
    settings: GroqChatSettings;
}

export class GroqChatView extends View {
    plugin: GroqChatPlugin;
    root: ReactDOM.Root | null = null;
    reactComponent: React.ReactElement<AppProps>;

    constructor(leaf: WorkspaceLeaf, plugin: GroqChatPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType() {
        return VIEW_TYPE_GROQ_CHAT;
    }

    getDisplayText() {
        return 'Groq Chat';
    }

    async onOpen() {
       // Create a React root
        this.root = createRoot(this.contentEl);

        // Create React component with initial settings
        this.reactComponent = React.createElement<AppProps>(App, { settings: this.plugin.settings });

        // Render the React application
        this.root.render(this.reactComponent);
    }

    async onClose() {
       if (this.root) {
            this.root.unmount();
            this.root = null;
       }
    }

    updateSettings(newSettings: GroqChatSettings) {
        // Re-render the component with new settings
        this.reactComponent = React.createElement<AppProps>(App, { settings: newSettings });
        this.root.render(this.reactComponent);
    }

    async saveState() {
        // Implementation of saveState method
    }
}