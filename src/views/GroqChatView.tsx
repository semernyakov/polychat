import React from 'react';
import { createRoot } from 'react-dom/client';
import { WorkspaceLeaf, View } from 'obsidian';
import GroqChatPlugin from '../main';
import { GroqChatPanel } from '../components/ChatPanel';
import { VIEW_TYPE_GROQ_CHAT } from '../constants';
import { GroqChatSettings } from '../types/plugin';

export class GroqChatView extends View {
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
            this.reactRoot = createRoot(this.contentEl);
            this.renderReactComponent(this.plugin.settings);
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

    updateSettings(newSettings: GroqChatSettings) {
        this.renderReactComponent(newSettings);
    }

    private renderReactComponent(settings: GroqChatSettings) {
        if (this.reactRoot) {
            try {
                this.reactRoot.render(
                    <GroqChatPanel settings={settings} plugin={this.plugin} />
                );
            } catch (error) {
                console.error('Error rendering Groq Chat component:', error);
            }
        }
    }
}