import { Plugin, WorkspaceLeaf } from 'obsidian';
import { GroqChatView, VIEW_TYPE_GROQ_CHAT } from './views/GroqChatView';
import { GroqChatSettingsTab } from './settings';
import { DEFAULT_SETTINGS, GroqChatSettings, GroqPlugin } from './types/plugin';
import { AuthService } from './services/authService';

export default class GroqChatPlugin extends Plugin implements GroqPlugin {
    settings: GroqChatSettings;
    private authService: AuthService;

    async onload() {
        await this.loadSettings();
        
        this.authService = new AuthService(this);

        this.addRibbonIcon('message-square', 'Groq Chat', () => {
            this.activateView();
        });

        this.addSettingTab(new GroqChatSettingsTab(this.app, this));

        this.registerView(
            VIEW_TYPE_GROQ_CHAT,
            (leaf: WorkspaceLeaf) => new GroqChatView(leaf, this)
        );

        this.addCommand({
            id: 'open-groq-chat',
            name: 'Open Groq Chat',
            callback: () => {
                this.activateView();
            },
        });
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async activateView() {
        const workspace = this.app.workspace;
        let leaf = workspace.getLeavesOfType(VIEW_TYPE_GROQ_CHAT)[0];

        if (!leaf) {
            const rightLeaf = workspace.getRightLeaf(false);
            const newLeaf = rightLeaf || workspace.getLeaf(true);
            if (newLeaf) {
                leaf = newLeaf;
            }
        }

        if (leaf) {
            await leaf.setViewState({ type: VIEW_TYPE_GROQ_CHAT });
            workspace.revealLeaf(leaf);
        }
    }

    onunload() {
        this.authService.stopServer();
    }
}