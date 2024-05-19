// eslint.config.js
import { eslint } from '@eslint/js';
import airbnb from 'eslint-config-airbnb-base';
import globals from 'globals';

export default [
  eslint.config({
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Add your custom rules here
    },
  }),
  airbnb,
];

