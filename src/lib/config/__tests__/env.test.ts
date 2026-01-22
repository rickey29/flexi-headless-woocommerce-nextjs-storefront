/**
 * Environment Configuration Tests
 *
 * Tests for env.ts configuration parsing and validation.
 * Uses dynamic imports with module reset to test different env configurations.
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';

// Store original env
const originalEnv = { ...process.env };

// Helper to safely set environment variables in tests
function setEnv(key: string, value: string | undefined): void {
  if (value === undefined) {
    delete (process.env as Record<string, string | undefined>)[key];
  } else {
    (process.env as Record<string, string | undefined>)[key] = value;
  }
}

describe('env configuration', () => {
  beforeEach(() => {
    // Reset modules before each test to re-evaluate config
    vi.resetModules();
    // Reset env to original state
    Object.keys(process.env).forEach((key) => {
      delete (process.env as Record<string, string | undefined>)[key];
    });
    Object.assign(process.env, originalEnv);
  });

  afterEach(() => {
    // Restore original env
    Object.keys(process.env).forEach((key) => {
      delete (process.env as Record<string, string | undefined>)[key];
    });
    Object.assign(process.env, originalEnv);
  });

  describe('NODE_ENV configuration', () => {
    test('should detect development environment', async () => {
      setEnv('NODE_ENV', 'development');
      const { config } = await import('../env');

      expect(config.NODE_ENV).toBe('development');
      expect(config.IS_DEVELOPMENT).toBe(true);
      expect(config.IS_PRODUCTION).toBe(false);
      expect(config.IS_TEST).toBe(false);
    });

    test('should detect production environment', async () => {
      setEnv('NODE_ENV', 'production');
      const { config } = await import('../env');

      expect(config.NODE_ENV).toBe('production');
      expect(config.IS_DEVELOPMENT).toBe(false);
      expect(config.IS_PRODUCTION).toBe(true);
      expect(config.IS_TEST).toBe(false);
    });

    test('should detect test environment', async () => {
      setEnv('NODE_ENV', 'test');
      const { config } = await import('../env');

      expect(config.NODE_ENV).toBe('test');
      expect(config.IS_DEVELOPMENT).toBe(false);
      expect(config.IS_PRODUCTION).toBe(false);
      expect(config.IS_TEST).toBe(true);
    });

    test('should default to development when NODE_ENV is not set', async () => {
      setEnv('NODE_ENV', undefined);
      const { config } = await import('../env');

      expect(config.NODE_ENV).toBe('development');
    });
  });

  describe('LOG_LEVEL configuration', () => {
    test('should parse valid log level: debug', async () => {
      setEnv('LOG_LEVEL', 'debug');
      const { config } = await import('../env');

      expect(config.LOG_LEVEL).toBe('debug');
    });

    test('should parse valid log level: info', async () => {
      setEnv('LOG_LEVEL', 'info');
      const { config } = await import('../env');

      expect(config.LOG_LEVEL).toBe('info');
    });

    test('should parse valid log level: warn', async () => {
      setEnv('LOG_LEVEL', 'warn');
      const { config } = await import('../env');

      expect(config.LOG_LEVEL).toBe('warn');
    });

    test('should parse valid log level: error', async () => {
      setEnv('LOG_LEVEL', 'error');
      const { config } = await import('../env');

      expect(config.LOG_LEVEL).toBe('error');
    });

    test('should handle uppercase LOG_LEVEL', async () => {
      setEnv('LOG_LEVEL', 'DEBUG');
      const { config } = await import('../env');

      expect(config.LOG_LEVEL).toBe('debug');
    });

    test('should handle mixed case LOG_LEVEL', async () => {
      setEnv('LOG_LEVEL', 'WaRn');
      const { config } = await import('../env');

      expect(config.LOG_LEVEL).toBe('warn');
    });

    test('should default to debug in development when LOG_LEVEL not set', async () => {
      setEnv('NODE_ENV', 'development');
      setEnv('LOG_LEVEL', undefined);
      const { config } = await import('../env');

      expect(config.LOG_LEVEL).toBe('debug');
    });

    test('should default to warn in production when LOG_LEVEL not set', async () => {
      setEnv('NODE_ENV', 'production');
      setEnv('LOG_LEVEL', undefined);
      const { config } = await import('../env');

      expect(config.LOG_LEVEL).toBe('warn');
    });

    test('should default to warn for invalid LOG_LEVEL in production', async () => {
      setEnv('NODE_ENV', 'production');
      setEnv('LOG_LEVEL', 'invalid');
      const { config } = await import('../env');

      expect(config.LOG_LEVEL).toBe('warn');
    });

    test('should default to debug for invalid LOG_LEVEL in development', async () => {
      setEnv('NODE_ENV', 'development');
      setEnv('LOG_LEVEL', 'invalid');
      const { config } = await import('../env');

      expect(config.LOG_LEVEL).toBe('debug');
    });
  });

  describe('FLEXI_DEBUG configuration', () => {
    test('should enable FLEXI_DEBUG when set to true', async () => {
      setEnv('FLEXI_DEBUG', 'true');
      const { config } = await import('../env');

      expect(config.FLEXI_DEBUG).toBe(true);
    });

    test('should disable FLEXI_DEBUG when set to false', async () => {
      setEnv('FLEXI_DEBUG', 'false');
      const { config } = await import('../env');

      expect(config.FLEXI_DEBUG).toBe(false);
    });

    test('should disable FLEXI_DEBUG when not set', async () => {
      setEnv('FLEXI_DEBUG', undefined);
      const { config } = await import('../env');

      expect(config.FLEXI_DEBUG).toBe(false);
    });

    test('should disable FLEXI_DEBUG for non-true values', async () => {
      setEnv('FLEXI_DEBUG', '1');
      const { config } = await import('../env');

      expect(config.FLEXI_DEBUG).toBe(false);
    });
  });

  describe('shouldLog function', () => {
    test('should log all levels when LOG_LEVEL is debug', async () => {
      setEnv('LOG_LEVEL', 'debug');
      const { shouldLog } = await import('../env');

      expect(shouldLog('debug')).toBe(true);
      expect(shouldLog('info')).toBe(true);
      expect(shouldLog('warn')).toBe(true);
      expect(shouldLog('error')).toBe(true);
    });

    test('should skip debug when LOG_LEVEL is info', async () => {
      setEnv('LOG_LEVEL', 'info');
      const { shouldLog } = await import('../env');

      expect(shouldLog('debug')).toBe(false);
      expect(shouldLog('info')).toBe(true);
      expect(shouldLog('warn')).toBe(true);
      expect(shouldLog('error')).toBe(true);
    });

    test('should skip debug and info when LOG_LEVEL is warn', async () => {
      setEnv('LOG_LEVEL', 'warn');
      const { shouldLog } = await import('../env');

      expect(shouldLog('debug')).toBe(false);
      expect(shouldLog('info')).toBe(false);
      expect(shouldLog('warn')).toBe(true);
      expect(shouldLog('error')).toBe(true);
    });

    test('should only log errors when LOG_LEVEL is error', async () => {
      setEnv('LOG_LEVEL', 'error');
      const { shouldLog } = await import('../env');

      expect(shouldLog('debug')).toBe(false);
      expect(shouldLog('info')).toBe(false);
      expect(shouldLog('warn')).toBe(false);
      expect(shouldLog('error')).toBe(true);
    });
  });

  describe('config immutability', () => {
    test('config should be readonly (const assertion)', async () => {
      const { config } = await import('../env');

      // Verify the config object exists and has expected properties
      expect(config).toHaveProperty('NODE_ENV');
      expect(config).toHaveProperty('IS_DEVELOPMENT');
      expect(config).toHaveProperty('IS_PRODUCTION');
      expect(config).toHaveProperty('IS_TEST');
      expect(config).toHaveProperty('LOG_LEVEL');
      expect(config).toHaveProperty('FLEXI_DEBUG');
    });
  });
});
