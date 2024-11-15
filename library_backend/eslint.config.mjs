// eslint.config.js

import globals from 'globals'
import js from '@eslint/js'
import prettierPlugin from 'eslint-plugin-prettier' // import Prettier-plugin

export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
      ecmaVersion: 'latest',
    },
  },
  {
    ignores: ['dist/**', 'build/**'],
  },
  {
    // Prettier-config
    plugins: {
      prettier: prettierPlugin, // prettier plugin
    },
    rules: {
      'prettier/prettier': 'error', //prettier rules as errors
    },
  },
]
