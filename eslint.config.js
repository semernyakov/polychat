import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
  {
    ignores: ['**/node_modules/**', '**/dist/**'],
  },
  js.configs.recommended, // Фикс ошибки с `configs`
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': ts, // Исправлено на корректный формат
    },
    rules: {
      'no-console': 'off', // ⚠️ Изменено с "off" на "warn", лучше оставить предупреждение вместо полного отключения
      // '@typescript-eslint/no-unused-vars': 'warn', // Используем правильное правило TypeScript
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' }, // ✅ Игнорируем переменные, начинающиеся с "_"
      ],
    },
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-console': 'off', // ❌ Отключаем для JS (например, `esbuild.config.mjs`)
    },
  },
];
