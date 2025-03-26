import { ItemView, WorkspaceLeaf } from 'obsidian';
import { createRoot } from 'react-dom/client';
import { ChatPanel } from '../components/ChatPanel';
import type { GroqPluginInterface } from '../types/plugin';

export const VIEW_TYPE_GROQ_CHAT = 'groq-chat-view';

export class GroqChatView extends ItemView {
  private root: ReturnType<typeof createRoot> | null = null;

  constructor(
    leaf: WorkspaceLeaf,
    private readonly plugin: GroqPluginInterface,
  ) {
    super(leaf);
  }

  getViewType() {
    return VIEW_TYPE_GROQ_CHAT;
  }
  getDisplayText() {
    return 'Groq Chat';
  }
  getIcon() {
    return 'message-square';
  }

  async onOpen() {
    this.renderView();
  }

  async onClose() {
    this.root?.unmount();
  }

  private renderView() {
    const container = this.containerEl.children[1];
    container.empty();

    const rootEl = container.createDiv({ cls: 'groq-container' });
    this.root = createRoot(rootEl);
    this.root.render(<ChatPanel plugin={this.plugin} />);
  }
}
