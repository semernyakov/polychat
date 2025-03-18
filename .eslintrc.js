module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'prettier'
    ],
    plugins: ['@typescript-eslint', 'react', 'react-hooks'],
    env: {
        browser: true,
        node: true,
        jest: true
    },
    settings: {
        react: {
            version: 'detect'
        }
    },
    rules: {
        '@typescript-eslint/no-empty-function': ['error', {
            allow: ['arrowFunctions', 'methods']
        }],
        '@typescript-eslint/triple-slash-reference': 'off',
        'react/react-in-jsx-scope': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off'
    },
    overrides: [
        {
            files: ['src/tests/**/*', 'src/services/**/*'],
            rules: {
                '@typescript-eslint/no-empty-function': 'off'
            }
        }
    ]
}; 