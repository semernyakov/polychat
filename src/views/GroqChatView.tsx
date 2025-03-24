import { ItemView, WorkspaceLeaf } from 'obsidian';
import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { ChatPanel } from '../components/ChatPanel';
import { GroqPlugin } from '../types/plugin';

export const VIEW_TYPE_GROQ_CHAT = 'groq-chat-view';
export const VIEW_DISPLAY_TEXT = 'Groq Chat';

export class GroqChatView extends ItemView {
  private readonly plugin: GroqPlugin;
  private root: Root | null = null;

  constructor(leaf: WorkspaceLeaf, plugin: GroqPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return VIEW_TYPE_GROQ_CHAT;
  }

  getDisplayText(): string {
    return VIEW_DISPLAY_TEXT;
  }

  getIcon(): string {
    return 'message-square'; // Используем стандартную иконку Obsidian
  }

  async onOpen(): Promise<void> {
    this.renderView();
  }

  async onClose(): Promise<void> {
    this.unmountReactRoot();
  }

  async refreshView(): Promise<void> {
    this.renderView();
  }

  private renderView(): void {
    const container = this.containerEl.children[1];
    container.empty();

    try {
      const rootEl = container.createDiv({ cls: 'groq-chat-view-container' });
      this.unmountReactRoot(); // Очищаем предыдущий root при повторном рендере
      this.root = createRoot(rootEl);
      this.root.render(
        <React.StrictMode>
          <ChatPanel plugin={this.plugin} />
        </React.StrictMode>,
      );
    } catch (error) {
      this.showError(container, error);
    }
  }

  private unmountReactRoot(): void {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }

  private showError(container: Element, error: unknown): void {
    container.empty();
    const errorEl = container.createDiv({ cls: 'groq-chat-error' });
    errorEl.createEl('h3', { text: 'Ошибка при загрузке чата' });
    errorEl.createEl('p', {
      text: error instanceof Error ? error.message : 'Неизвестная ошибка',
    });
    console.error('GroqChatView error:', error);
  }
}
