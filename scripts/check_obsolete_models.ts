import { MODEL_INFO } from '../src/types/models';
import * as fs from 'fs';
import * as path from 'path';

// Get the plugin directory path
const pluginDir = path.join(__dirname, '..');
const vaultDir = path.join(pluginDir, '..', '..'); // Go up two levels from plugin dir to reach vault root
const configDir = process.env.OBSIDIAN_CONFIG_DIR || '.obsidian';

// Load the latest groqAvailableModels.json (or settings.json if exists)
const settingsPath = path.join(vaultDir, configDir, 'plugins/groq-chat-plugin/data/settings.json');
let availableModels: string[] = [];
if (fs.existsSync(settingsPath)) {
  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
  if (Array.isArray(settings.groqAvailableModels)) {
    availableModels = settings.groqAvailableModels.map((m: any) => m.id);
  }
}

const staticModelIds = Object.keys(MODEL_INFO);
const obsolete = staticModelIds.filter(id => !availableModels.includes(id));

console.log('Obsolete (static, not in fresh API):');
obsolete.forEach(id => {
  const info = MODEL_INFO[id as keyof typeof MODEL_INFO];
  console.log(`- ${id} (${info?.name || ''})`);
});

if (obsolete.length === 0) {
  console.log('No obsolete static models found.');
}
