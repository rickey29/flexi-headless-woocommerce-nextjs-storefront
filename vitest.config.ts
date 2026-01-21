import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Use happy-dom for browser-like environment (better ESM support)
    environment: 'happy-dom',

    // Enable global test APIs (describe, it, expect, etc.)
    globals: true,

    // Setup files to run before each test file
    setupFiles: ['./vitest.setup.ts'],

    // Explicit timeouts
    testTimeout: 10000,
    hookTimeout: 10000,

    // Better test output
    reporters: ['verbose'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '.next/',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/types/**',
        'vitest.config.ts',
        'vitest.setup.ts',
        'next.config.ts',
        'tailwind.config.ts',
        'src/**/index.ts',
      ],
      // Coverage thresholds (enforced)
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },

    // Include test files
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

    // Exclude patterns
    exclude: ['node_modules', 'dist', '.next', '.idea', '.git', '.cache'],
  },

  // Path aliases (must match tsconfig.json)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
