import { Plugin } from 'obsidian';
import { GroqPlugin, DEFAULT_SETTINGS } from './types/plugin';
import { AuthService } from './services/authService';
import { GroqService } from './services/groqService';
import { GroqChatSettingsTab } from './settings/GroqChatSettingsTab';
import { GroqChatView, VIEW_TYPE_GROQ_CHAT } from './views/GroqChatView';

export default class GroqChatPlugin extends Plugin implements GroqPlugin {
    settings = DEFAULT_SETTINGS;
    private authService: AuthService;
    private groqService: GroqService;

    async onload() {
        await this.loadSettings();

        this.authService = new AuthService(this.app, this);
        this.groqService = new GroqService(this.app, this);

        this.registerView(
            VIEW_TYPE_GROQ_CHAT,
            (leaf) => new GroqChatView(leaf, this)
        );

        this.addRibbonIcon('message-square', 'Groq Chat', () => {
            this.activateView();
        });

        this.addSettingTab(new GroqChatSettingsTab(this.app, this));
    }

    async onunload() {
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_GROQ_CHAT);
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    private async activateView() {
        const { workspace } = this.app;

        let leaf = workspace.getLeavesOfType(VIEW_TYPE_GROQ_CHAT)[0];

        if (!leaf) {
            const rightLeaf = workspace.getRightLeaf(false);
            if (rightLeaf) {
                leaf = rightLeaf;
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
}