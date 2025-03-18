import React from 'react';
import { createRoot } from 'react-dom/client';
import { WorkspaceLeaf, ItemView } from 'obsidian';
import GroqChatPlugin from '../main';
import { GroqChatPanel } from '../components/ChatPanel';
import { VIEW_TYPE_GROQ_CHAT } from '../constants';
import { GroqChatSettings } from '../types/plugin';

export class GroqChatView extends ItemView {
    plugin: GroqChatPlugin;
    private reactRoot: ReturnType<typeof createRoot> | null = null;

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
        try {
            this.reactRoot = createRoot(this.containerEl.children[1]);
            this.renderReactComponent();
        } catch (error) {
            console.error('Error opening Groq Chat view:', error);
        }
    }

    async onClose() {
        if (this.reactRoot) {
            this.reactRoot.unmount();
            this.reactRoot = null;
        }
    }

    updateSettings() {
        this.renderReactComponent();
    }

    clearConversation() {
        if (this.reactRoot) {
            this.renderReactComponent();
        }
    }

    private renderReactComponent() {
        if (this.reactRoot) {
            try {
                this.reactRoot.render(
                    <GroqChatPanel plugin={this.plugin} />
                );
            } catch (error) {
                console.error('Error rendering Groq Chat component:', error);
            }
        }
    }
}