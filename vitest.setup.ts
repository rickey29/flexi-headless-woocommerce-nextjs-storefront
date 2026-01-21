/**
 * Vitest setup file
 *
 * This file runs before each test file.
 * Use it for global setup, mocks, and test configuration.
 */

import { beforeAll, afterEach, afterAll, vi } from 'vitest';

// Note: @sentry/nextjs is mocked via vitest.config.ts alias
// pointing to src/lib/utils/__mocks__/sentry.ts

// Global test setup
beforeAll(() => {
  // Vitest automatically sets NODE_ENV to 'test'
  // No need to set it manually
});

// Clean up after each test
afterEach(() => {
  // Clear all mocks after each test
  // This ensures test isolation
  vi.clearAllMocks();
});

// Global teardown
afterAll(() => {
  // Cleanup after all tests
  // Restore mocked functions
  vi.restoreAllMocks();
});
