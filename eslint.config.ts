import { defineConfig, globalIgnores } from 'eslint/config';
import pluginJs from '@eslint/js';
import pluginTypeScriptESLint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginNode from 'eslint-plugin-n';
import pluginJsxA11y from 'eslint-plugin-jsx-a11y';
import parserTypeScript from '@typescript-eslint/parser';
import pluginImport from 'eslint-plugin-import';
import pluginPrettier from 'eslint-plugin-prettier/recommended';

import globals from 'globals';
import { builtinModules } from 'module';

/*
 * `src/common` is bundled into the main, the preload and the renderer build
 * alike, so anything only one of them can run has to stay out of it. The
 * renderer has no Node.js and no Electron at runtime; the main process has no
 * DOM and no React. Type-only imports are erased at build time and are allowed.
 * */
const commonImportMessage =
  '`src/common` is shared by every process. Keep process specific code in `src/main`, `src/preload` or `src/renderer`.';

const commonRestrictedImportPaths = [
  ...builtinModules,
  '@emotion/react',
  '@emotion/styled',
  '@reduxjs/toolkit',
  'i18next',
  'react',
  'react-dom',
  'react-i18next',
  'react-redux',
  'react-router-dom',
].map((name) => ({ name, message: commonImportMessage }));

const commonRestrictedImportPatterns = [
  {
    group: [
      'node:*',
      'electron/*',
      '@emotion/*',
      '@mui/*',
      'react-dom/*',
      '@/main/**',
      '@/preload/**',
      '@/renderer/**',
      '**/main/**',
      '**/preload/**',
      '**/renderer/**',
    ],
    message: commonImportMessage,
  },
];

/*
 * Globals that exist in one process only. `process` is included because Vite
 * inlines `process.env.NODE_ENV` for the renderer but nothing else of it.
 * */
const commonRestrictedGlobals = [
  '__dirname',
  '__filename',
  'document',
  'localStorage',
  'navigator',
  'process',
  'require',
  'sessionStorage',
  'window',
].map((name) => ({ name, message: commonImportMessage }));

export default defineConfig([
  pluginReact.configs.flat.recommended,
  pluginJs.configs.recommended,
  pluginReactHooks.configs.flat.recommended,
  pluginTypeScriptESLint.configs.recommended,
  pluginImport.flatConfigs.electron,
  pluginJsxA11y.flatConfigs.recommended,
  pluginNode.configs['flat/recommended-script'],
  globalIgnores([
    '**/node_modules',
    '**/dist',
    '**/.tscache',
    '**/release',
    '**/.idea',
    '**/.vscode',
    '**/.github',
    '**/buildAssets/builder',
    '**/tests/results',
    '**/package-lock.json',
  ]),
  {
    files: ['**/*.{js,mjs,cjs,jsx,tsx,ts}'],
    settings: {
      react: {
        version: 'detect',
      },
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        parser: parserTypeScript,
        ecmaVersion: 2022,
        ecmaFeatures: {
          jsx: true,
        },
        requireConfigFile: false,
      },
    },
    rules: {
      eqeqeq: 'error',
      'no-unused-vars': 'off',
      'no-underscore-dangle': 'warn',
      'no-case-declarations': 'off',
      'no-trailing-spaces': 'error',
      'no-unsafe-optional-chaining': 'off',
      'no-control-regex': 'off',
      'n/no-missing-import': 'off',
      'n/no-unsupported-features/node-builtins': 'off',
      'react/require-default-props': [
        'error',
        {
          forbidDefaultForRequired: true,
          functions: 'defaultArguments',
        },
      ],
      'react-hooks/exhaustive-deps': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/no-unknown-property': ['error', { ignore: ['css'] }],
      'react/jsx-filename-extension': [
        2,
        {
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.mts'],
        },
      ],
      'jsx-a11y/anchor-is-valid': 0,
      'jsx-a11y/label-has-associated-control': 1,
      'jsx-a11y/no-noninteractive-element-interactions': 0,
      'jsx-a11y/click-events-have-key-events': 0,
      'jsx-a11y/no-static-element-interactions': 0,
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
        },
      ],
    },
  },
  pluginPrettier,
  {
    // Keeps `src/common` runnable in every process, see the note above
    files: ['src/common/**/*.ts'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            ...commonRestrictedImportPaths,
            {
              name: 'electron',
              message: `${commonImportMessage} Electron types are fine, import them with \`import type\`.`,
              allowTypeImports: true,
            },
          ],
          patterns: commonRestrictedImportPatterns,
        },
      ],
      'no-restricted-globals': ['error', ...commonRestrictedGlobals],
    },
  },
  {
    // The renderer talks to the main process through the preload bridge only.
    // Reaching into `src/main` would bundle main process code, Node.js imports
    // and all, into the web page.
    files: ['src/renderer/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'electron',
              message:
                'The renderer has no Electron at runtime. Go through `window.mainApi`, or share the code via `src/common`. Types are fine with `import type`.',
              allowTypeImports: true,
            },
          ],
          patterns: [
            {
              group: ['@/main/**', '@/preload/**'],
              message:
                'The renderer cannot run main process code. Move what both sides need to `src/common`.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/main/**/*.ts', 'src/preload/**/*.ts'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/renderer/**'],
              message:
                'The main process cannot run renderer code. Move what both sides need to `src/common`.',
            },
          ],
        },
      ],
    },
  },
]);
