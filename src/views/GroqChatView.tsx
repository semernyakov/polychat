import { ItemView, WorkspaceLeaf } from 'obsidian';
import * as React from 'react';
import { Root, createRoot } from 'react-dom/client';
import ChatPanel from '../components/ChatPanel';
import { GroqChatPlugin } from '../types/plugin';

export const VIEW_TYPE_GROQ = 'groq-chat-view';

export class GroqChatView extends ItemView {
    private root: Root | null = null;
    private plugin: GroqChatPlugin;

    constructor(leaf: WorkspaceLeaf, plugin: GroqChatPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType(): string {
        return VIEW_TYPE_GROQ;
    }

    getDisplayText(): string {
        return 'Groq Chat';
    }

    async onOpen(): Promise<void> {
        const container = this.containerEl.children[1];
        container.empty();
        container.createEl('div', { attr: { id: 'groq-chat-root' } });

        const root = createRoot(container.children[0] as HTMLElement);
        this.root = root;

        root.render(
            <ChatPanel plugin={this.plugin} />
        );
    }

    async onClose(): Promise<void> {
        if (this.root) {
            this.root.unmount();
            this.root = null;
        }
    }
}