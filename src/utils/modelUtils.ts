/**
 * Utility functions for handling model names and their proper casing
 */
import { GroqModelInfo } from '../settings/GroqChatSettings';

// Mapping of model name prefixes to their proper casing
const MODEL_NAME_PREFIX_MAP: Record<string, string> = {
  llama: 'Llama',
  gemma: 'Gemma',
  qwen: 'Qwen',
  mistral: 'Mistral',
  deepseek: 'DeepSeek',
  mixtral: 'Mixtral',
  'llama-guard': 'Llama Guard',
  'llama-3': 'Llama 3',
  'llama-4': 'Llama 4',
  saba: 'Saba',
  coder: 'Coder',
  versatile: 'Versatile',
  instant: 'Instant',
  preview: 'Preview',
  specdec: 'SpecDec',
  distill: 'Distill',
  allam: 'Allam',
  guard: 'Guard',
  'prompt-guard': 'Prompt Guard',
  maverick: 'Maverick',
  scout: 'Scout',
  qwq: 'QwQ',
  'deepseek-r1': 'DeepSeek-R1',
  'saba-24b': 'Saba-24B',
  '7b': '7B',
  '8b': '8B',
  '9b': '9B',
  '11b': '11B',
  '17b': '17B',
  '32b': '32B',
  '70b': '70B',
  '90b': '90B',
  '128e': '128E',
  '16e': '16E',
  kimi: 'Kimi',
  openai: 'OpenAI',
  groq: 'Groq',
  meta: 'Meta',
  compound: 'Compound',
  'compound-mini': 'Compound Mini',
  playai: 'PlayAI',
  tts: 'TTS',
  arabic: 'Arabic',
  whisper: 'Whisper',
  large: 'Large',
  'large-v3': 'Large v3',
  'large-v3-turbo': 'Large v3 Turbo',
  instruct: 'Instruct',
  '0905': '0905',
};

/**
 * Fixes the casing of model names to match the official branding
 * @param modelName The model name to fix
 * @returns The model name with proper casing
 */
export function fixModelNameCasing(modelName: string): string {
  if (!modelName) return modelName;

  // Handle special cases first
  // Specific model name transformations
  const specificMappings: Record<string, string> = {
    'gemma2-9b-it': 'Gemma 2 9B Instruct',
    'llama-3.1-8b-instant': 'Llama 3.1 8B Instant',
    'llama-3.3-70b-versatile': 'Llama 3.3 70B Versatile',
    'meta-llama/llama-4-maverick-17b-128e-instruct': 'Llama 4 Maverick 17B 128E Instruct',
    'meta-llama/llama-4-scout-17b-16e-instruct': 'Llama 4 Scout 17B 16E Instruct',
    'llama-guard-4-12b': 'Llama Guard 4 12B',
    'llama-prompt-guard-2-22m': 'Llama Prompt Guard 2 22M',
    'llama-prompt-guard-2-86m': 'Llama Prompt Guard 2 86M',
    'allam-2-7b': 'Allam 2 7B',
    'deepseek-r1-distill-llama-70b': 'DeepSeek-R1-Distill-Llama-70B',
    'moonshotai/kimi-k2-instruct': 'Kimi K2 Instruct',
    'moonshotai/kimi-k2-instruct-0905': 'Kimi K2 Instruct (0905)',
    'groq/compound': 'Groq Compound',
    'groq/compound-mini': 'Groq Compound Mini',
    'playai-tts': 'PlayAI TTS',
    'playai-tts-arabic': 'PlayAI TTS (Arabic)',
    'whisper-large-v3': 'Whisper Large v3',
    'whisper-large-v3-turbo': 'Whisper Large v3 Turbo',
    'qwen/qwen3-32b': 'Qwen3 32B',
    'openai/gpt-oss-120b': 'Community OSS Model (120B)',
    'openai/gpt-oss-20b': 'Community OSS Model (20B)',
  };

  if (specificMappings[modelName]) {
    return specificMappings[modelName];
  }

  // Apply prefix mapping
  for (const [prefix, properCasing] of Object.entries(MODEL_NAME_PREFIX_MAP)) {
    // Use word boundaries to avoid partial matches
    const regex = new RegExp(`\\b${prefix}\\b`, 'gi');
    modelName = modelName.replace(regex, properCasing);
  }

  // Special handling for specific patterns
  // Fix "llama3" to "Llama3"
  modelName = modelName.replace(/\bllama3\b/gi, 'Llama3');

  // Fix "gemma2" to "Gemma2"
  modelName = modelName.replace(/\bgemma2\b/gi, 'Gemma2');

  // Fix "qwen1.5" to "Qwen1.5"
  modelName = modelName.replace(/\bqwen1.5\b/gi, 'Qwen1.5');

  // Fix "qwen2" to "Qwen2"
  modelName = modelName.replace(/\bqwen2\b/gi, 'Qwen2');

  // Fix "mistral7b" to "Mistral7B"
  modelName = modelName.replace(/\bmistral7b\b/gi, 'Mistral7B');

  // Fix "mixtral8x7b" to "Mixtral8x7B"
  modelName = modelName.replace(/\bmixtral8x7b\b/gi, 'Mixtral8x7B');

  // Handle dashes between numbers and letters (e.g., 8b -> 8B)
  modelName = modelName.replace(/(\d)([a-z])/g, (match, num, letter) => num + letter.toUpperCase());

  // Handle version numbers with dots (preserve dots in versions)
  modelName = modelName.replace(/(\d)\.(\d)/g, '$1.$2');

  // Replace dashes with spaces for better readability, except in specific cases
  modelName = modelName.replace(/-/g, ' ');

  // Clean up extra spaces
  modelName = modelName.replace(/\s+/g, ' ').trim();

  return modelName;
}

/**
 * Groups models by their owner affiliation
 * @param models Array of model objects
 * @returns Object with owners as keys and arrays of models as values
 */
export function groupModelsByOwner(models: GroqModelInfo[]): Record<string, GroqModelInfo[]> {
  const grouped: Record<string, GroqModelInfo[]> = {};

  models.forEach(model => {
    // Use the owned_by field or default to 'Unknown'
    const owner = model.owned_by || model.developer?.name || 'Unknown';

    if (!grouped[owner]) {
      grouped[owner] = [];
    }

    grouped[owner].push(model);
  });

  return grouped;
}

/**
 * Checks if a model is in preview status
 * @param model The model object to check
 * @returns True if the model is in preview status
 */
export function isPreviewModel(model: GroqModelInfo): boolean {
  // Check if the model has a release_status field with value 'preview'
  if (model.releaseStatus === 'preview') {
    return true;
  }

  // Check if the model name contains 'preview'
  if (model.name && model.name.toLowerCase().includes('preview')) {
    return true;
  }

  // Check if the model ID contains 'preview'
  if (model.id && model.id.toLowerCase().includes('preview')) {
    return true;
  }

  return false;
}
