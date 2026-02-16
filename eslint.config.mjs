import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import eslintConfigPrettier from 'eslint-config-prettier';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  eslintConfigPrettier,
  globalIgnores([
    '.next/**',
    'coverage/**',
    'next-env.d.ts',
  ]),
  {
    rules: {
      // Prevent console usage - use logger utility instead
      'no-console': 'error',
      // Allow underscore-prefixed variables to be unused
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    // Allow console in logger utility and CLI scripts
    files: ['src/adapter/logging/logger.ts'],
    rules: {
      'no-console': 'off',
    },
  },
]);

export default eslintConfig;
