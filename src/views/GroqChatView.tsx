import { ItemView, WorkspaceLeaf } from 'obsidian';
import { createRoot, Root } from 'react-dom/client';
import React from 'react';
import { ChatPanel } from '../components/ChatPanel';
import { GroqPlugin } from '../types/plugin';

export const VIEW_TYPE_GROQ_CHAT = 'groq-chat-view';

export class GroqChatView extends ItemView {
    private root: Root | null = null;
    private plugin: GroqPlugin;

    constructor(leaf: WorkspaceLeaf, plugin: GroqPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType(): string {
        return VIEW_TYPE_GROQ_CHAT;
    }

    getDisplayText(): string {
        return 'Groq Chat';
    }

    async onOpen(): Promise<void> {
        const container = this.containerEl.children[1];
        container.empty();
        container.createEl('div', { attr: { id: 'groq-chat-root' } });
        
        this.root = createRoot(container.querySelector('#groq-chat-root')!);
        this.root.render(<ChatPanel plugin={this.plugin} />);
    }

    async onClose(): Promise<void> {
        if (this.root) {
            this.root.unmount();
            this.root = null;
        }
    }

    clearConversation() {
        const container = this.containerEl.children[1];
        if (container) {
            this.root?.render(
                <ChatPanel plugin={this.plugin} key={Date.now()} />
            );
        }
    }

    updateSettings(settings: any) {
        const container = this.containerEl.children[1];
        if (container) {
            this.root?.render(
                <ChatPanel plugin={this.plugin} key={Date.now()} />
            );
        }
    }
}