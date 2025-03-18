import { ItemView, WorkspaceLeaf } from 'obsidian';
import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { ChatPanel } from '../components/ChatPanel';
import { GroqPlugin } from '../types/plugin';

export const VIEW_TYPE_GROQ_CHAT = 'groq-chat-view';

export class GroqChatView extends ItemView {
    private plugin: GroqPlugin;
    private root: Root;

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
        
        const rootEl = container.createDiv({ cls: 'groq-chat-container' });
        this.root = createRoot(rootEl);
        
        this.root.render(<ChatPanel plugin={this.plugin} />);
    }

    async onClose(): Promise<void> {
        if (this.root) {
            this.root.unmount();
        }
    }

    async rerender(): Promise<void> {
        if (this.root) {
            this.root.render(
                <ChatPanel plugin={this.plugin} />
            );
        }
    }

    async refreshSettings(): Promise<void> {
        if (this.root) {
            this.root.render(
                <ChatPanel plugin={this.plugin} />
            );
        }
    }

    render() {
        return (
            <div className="groq-chat-view">
                <ChatPanel plugin={this.plugin} />
            </div>
        );
    }
}