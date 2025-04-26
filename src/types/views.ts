import type { WorkspaceLeaf } from 'obsidian';
import type { GroqPluginInterface } from './plugin';

export interface GroqChatViewProps {
  leaf: WorkspaceLeaf;
  plugin: GroqPluginInterface;
}
