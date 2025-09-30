/**
 * Utility functions for handling model names and their proper casing
 */

// Mapping of model name prefixes to their proper casing
const MODEL_NAME_PREFIX_MAP: Record<string, string> = {
  llama: 'Llama',
  gemma: 'Gemma',
  qwen: 'Qwen',
  mistral: 'Mistral',
  deepseek: 'DeepSeek',
  mixtral: 'Mixtral',
  'llama-guard': 'Llama Guard',
  'llama-3': 'Llama-3',
  saba: 'Saba',
  coder: 'Coder',
  versatile: 'Versatile',
  instant: 'Instant',
  preview: 'Preview',
  specdec: 'SpecDec',
  distill: 'Distill',
  allam: 'Llama', // Fixing typo
  guard: 'Guard', // For Llama Guard
  maverick: 'Maverick',
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
  kimi: 'Kimi',
  openai: 'OpenAI',
};

/**
 * Fixes the casing of model names to match the official branding
 * @param modelName The model name to fix
 * @returns The model name with proper casing
 */
export function fixModelNameCasing(modelName: string): string {
  if (!modelName) return modelName;

  // Handle special cases first
  // Fix the "allam" typo
  if (modelName.toLowerCase().includes('allam')) {
    modelName = modelName.replace(/allam/gi, 'llama');
  }

  // Apply prefix mapping
  for (const [prefix, properCasing] of Object.entries(MODEL_NAME_PREFIX_MAP)) {
    // Use word boundaries to avoid partial matches
    const regex = new RegExp(`\\b${prefix}\\b`, 'gi');
    modelName = modelName.replace(regex, properCasing);
  }

  // Special handling for specific models
  // Fix "llama3" to "Llama3"
  modelName = modelName.replace(/\bllama3\b/gi, 'Llama3');

  // Fix "llama-3" to "Llama-3"
  modelName = modelName.replace(/\bllama-3\b/gi, 'Llama-3');

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

  return modelName;
}

/**
 * Groups models by their owner affiliation
 * @param models Array of model objects
 * @returns Object with owners as keys and arrays of models as values
 */
export function groupModelsByOwner(models: any[]): Record<string, any[]> {
  const grouped: Record<string, any[]> = {};

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
export function isPreviewModel(model: any): boolean {
  // Check if the model has a release_status field with value 'preview'
  if (model.release_status === 'preview' || model.releaseStatus === 'preview') {
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
