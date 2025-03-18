import { WorkspaceLeaf } from 'obsidian';
import { GroqPlugin } from './plugin';

export interface GroqChatViewProps {
    leaf: WorkspaceLeaf;
    plugin: GroqPlugin;
}