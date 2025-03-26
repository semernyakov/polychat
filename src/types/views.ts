import { WorkspaceLeaf } from 'obsidian';
import { GroqPluginInterface } from './plugin';

export interface GroqChatViewProps {
  leaf: WorkspaceLeaf;
  plugin: GroqPluginInterface;
}
