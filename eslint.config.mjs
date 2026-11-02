import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import react from 'eslint-plugin-react';
import hooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  { ignores: ['node_modules/**', '.expo/**', 'dist/**', 'coverage/**', 'android/**', 'ios/**',
    'public/**', 'playwright-report/**', 'test-results/**', 'docs/_site/**'] },
  js.configs.recommended, ...tseslint.configs.recommended,
  { languageOptions: { globals: { ...globals.browser, ...globals.node, ...globals.jest, __DEV__: 'readonly' } },
    rules: { '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': ['error', { allow: ['warn', 'error'] }] } },
  { files: ['**/*.{ts,tsx}'], plugins: { react, 'react-hooks': hooks },
    settings: { react: { version: 'detect' } }, rules: {
      ...react.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', 'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error', 'react-hooks/exhaustive-deps': 'warn'
    } },
);
