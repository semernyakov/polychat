/**
 * Utility functions for handling model names and their proper casing
 */

// Mapping of model name prefixes to their proper casing
const MODEL_NAME_PREFIX_MAP: Record<string, string> = {
  'llama': 'Llama',
  'gemma': 'Gemma',
  'qwen': 'Qwen',
  'mistral': 'Mistral',
  'deepseek': 'DeepSeek',
  'mixtral': 'Mixtral',
  'llama-guard': 'Llama Guard',
  'llama-3': 'Llama-3',
  'saba': 'Saba',
  'coder': 'Coder',
  'versatile': 'Versatile',
  'instant': 'Instant',
  'preview': 'Preview',
  'specdec': 'SpecDec',
  'distill': 'Distill',
  'allam': 'Llama', // Fixing typo
  'guard': 'Guard', // For Llama Guard
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
  
  return modelName;
}
