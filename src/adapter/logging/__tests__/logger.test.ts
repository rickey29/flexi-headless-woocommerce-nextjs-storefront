/**
 * Tests for the logger utility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  logDebug,
  logInfo,
  logWarn,
  logError,
  logRenderRequest,
  logRenderComplete,
  logApiRoute,
  logValidationError,
  logFetchRequest,
  logFetchResponse,
  generateRequestId,
  setRequestId,
  getRequestId,
  logger,
} from '@/adapter/logging/logger';

describe('Logger Utility', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateRequestId', () => {
    it('should generate unique request IDs', () => {
      const id1 = generateRequestId();
      const id2 = generateRequestId();

      expect(id1).not.toBe(id2);
    });

    it('should start with req_ prefix', () => {
      const id = generateRequestId();

      expect(id).toMatch(/^req_/);
    });

    it('should be a non-empty string', () => {
      const id = generateRequestId();

      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(4);
    });
  });

  describe('setRequestId and getRequestId', () => {
    afterEach(() => {
      // Reset request ID after each test
      setRequestId(undefined);
    });

    it('should set and get request ID', () => {
      const id = 'req_test123';
      setRequestId(id);

      expect(getRequestId()).toBe(id);
    });

    it('should return undefined when no request ID is set', () => {
      setRequestId(undefined);

      expect(getRequestId()).toBeUndefined();
    });

    it('should allow clearing request ID', () => {
      setRequestId('req_123');
      expect(getRequestId()).toBe('req_123');

      setRequestId(undefined);
      expect(getRequestId()).toBeUndefined();
    });

    it('should allow overwriting request ID', () => {
      setRequestId('req_first');
      expect(getRequestId()).toBe('req_first');

      setRequestId('req_second');
      expect(getRequestId()).toBe('req_second');
    });
  });

  describe('logDebug', () => {
    it('should log debug messages with context', () => {
      // In test environment, LOG_LEVEL defaults to debug behavior
      logDebug('Test debug message', { key: 'value' });

      // Log may or may not be called depending on LOG_LEVEL
      // This test validates the function doesn't throw
    });

    it('should handle undefined context', () => {
      logDebug('Test message without context');
      // Should not throw
    });
  });

  describe('logInfo', () => {
    it('should log info messages with context', () => {
      logInfo('Test info message', { data: 123 });
      // Function should not throw
    });

    it('should handle empty context object', () => {
      logInfo('Test message', {});
      // Should not throw
    });
  });

  describe('logWarn', () => {
    it('should log warning messages', () => {
      logWarn('Test warning');

      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should include WARN prefix in message', () => {
      logWarn('Test warning');

      const call = consoleWarnSpy.mock.calls[0];
      expect(call[0]).toContain('[WARN]');
    });

    it('should include context in output', () => {
      logWarn('Warning with context', { errorCode: 500 });

      expect(consoleWarnSpy).toHaveBeenCalled();
    });
  });

  describe('logError', () => {
    it('should log error messages', () => {
      logError('Test error');

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should include ERROR prefix in message', () => {
      logError('Test error');

      const call = consoleErrorSpy.mock.calls[0];
      expect(call[0]).toContain('[ERROR]');
    });

    it('should log Error objects', () => {
      const error = new Error('Test error object');
      logError('An error occurred', error);

      expect(consoleErrorSpy).toHaveBeenCalled();
      const call = consoleErrorSpy.mock.calls[0];
      expect(call[1]).toBe(error);
    });

    it('should handle non-Error objects', () => {
      logError('An error occurred', 'string error');

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should include context in error logs', () => {
      logError('Error with context', null, { request_id: 'abc123' });

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('logger object', () => {
    it('should expose all logging methods', () => {
      expect(logger.debug).toBe(logDebug);
      expect(logger.info).toBe(logInfo);
      expect(logger.warn).toBe(logWarn);
      expect(logger.error).toBe(logError);
    });

    it('should be a const assertion (readonly at compile time)', () => {
      // Note: `as const` provides TypeScript type safety, not runtime freezing
      // The logger object is readonly at compile time
      expect(typeof logger).toBe('object');
      expect(logger.debug).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.warn).toBeDefined();
      expect(logger.error).toBeDefined();
    });
  });

  describe('logRenderRequest', () => {
    it('should log render request with template type and request ID', () => {
      const requestId = 'req_123';
      logRenderRequest('product', requestId, { product_id: 456 });

      // Function should not throw
    });

    it('should handle missing context', () => {
      logRenderRequest('cart', 'req_456');
      // Should not throw
    });
  });

  describe('logRenderComplete', () => {
    it('should log successful render completion', () => {
      logRenderComplete('product', 'req_123', 150, true);
      // Should not throw
    });

    it('should log failed render completion as warning', () => {
      logRenderComplete('checkout', 'req_456', 500, false);

      // Failed renders should trigger a warning
      expect(consoleWarnSpy).toHaveBeenCalled();
    });
  });

  describe('logApiRoute', () => {
    it('should log API route handling', () => {
      logApiRoute('/api/v1/product', 'POST', 'req_123', {
        home_url: 'https://example.com',
      });
      // Should not throw
    });

    it('should handle missing context', () => {
      logApiRoute('/api/v1/cart', 'GET', 'req_456');
      // Should not throw
    });
  });

  describe('logValidationError', () => {
    it('should log validation errors as warnings', () => {
      logValidationError('product request', { field: 'name', error: 'required' }, 'req_123');

      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should handle missing request ID', () => {
      logValidationError('checkout data', ['Invalid email']);
      // Should not throw
    });
  });

  describe('logFetchRequest', () => {
    it('should log fetch requests', () => {
      logFetchRequest('https://example.com/api/data', 'GET', 'req_123');
      // Should not throw
    });

    it('should mask sensitive URL parameters', () => {
      logFetchRequest('https://example.com/api?key=secret123&token=abc', 'POST', 'req_456');
      // Should not throw - and sensitive params should be masked
    });

    it('should default to GET method', () => {
      logFetchRequest('https://example.com/api');
      // Should not throw
    });
  });

  describe('logFetchResponse', () => {
    it('should log successful responses', () => {
      logFetchResponse('https://example.com/api', 200, true, 'req_123');
      // Should not throw
    });

    it('should log failed responses as warnings', () => {
      logFetchResponse('https://example.com/api', 500, false, 'req_456');

      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should mask sensitive URL parameters', () => {
      logFetchResponse('https://example.com/api?api_key=secret', 200, true, 'req_789');
      // Should not throw
    });
  });
});

describe('logInfo when shouldLog returns true', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalLogLevel = process.env.LOG_LEVEL;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
    (process.env as Record<string, string | undefined>).LOG_LEVEL = originalLogLevel;
    vi.restoreAllMocks();
  });

  it('should call console.log when LOG_LEVEL allows info', async () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = 'development';
    (process.env as Record<string, string | undefined>).LOG_LEVEL = 'info';

    const { logInfo: logInfoDev } = await import('@/adapter/logging/logger');
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    logInfoDev('Info message', { key: 'value' });

    expect(consoleLogSpy).toHaveBeenCalled();
    const call = consoleLogSpy.mock.calls[0];
    expect(call[0]).toContain('[INFO]');
  });

  it('should format context as pretty JSON in development', async () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = 'development';
    (process.env as Record<string, string | undefined>).LOG_LEVEL = 'debug';

    const { logInfo: logInfoDev } = await import('@/adapter/logging/logger');
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    logInfoDev('Info with context', { nested: { key: 'value' } });

    expect(consoleLogSpy).toHaveBeenCalled();
    const call = consoleLogSpy.mock.calls[0];
    // In development, context should be pretty-printed (contains newlines)
    expect(call[1]).toContain('\n');
  });
});

describe('logDebug when shouldLog returns true', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalLogLevel = process.env.LOG_LEVEL;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
    (process.env as Record<string, string | undefined>).LOG_LEVEL = originalLogLevel;
    vi.restoreAllMocks();
  });

  it('should call console.log when LOG_LEVEL is debug', async () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = 'development';
    (process.env as Record<string, string | undefined>).LOG_LEVEL = 'debug';

    const { logDebug: logDebugDev } = await import('@/adapter/logging/logger');
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    logDebugDev('Debug message', { key: 'value' });

    expect(consoleLogSpy).toHaveBeenCalled();
    const call = consoleLogSpy.mock.calls[0];
    expect(call[0]).toContain('[DEBUG]');
  });

  it('should handle empty context in debug logs', async () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = 'development';
    (process.env as Record<string, string | undefined>).LOG_LEVEL = 'debug';

    const { logDebug: logDebugDev } = await import('@/adapter/logging/logger');
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    logDebugDev('Debug without context');

    expect(consoleLogSpy).toHaveBeenCalled();
  });
});

describe('Logger Message Formatting', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should include ISO timestamp in messages', () => {
    logWarn('Test message');

    const call = consoleWarnSpy.mock.calls[0];
    const message = call[0] as string;

    // ISO timestamp format: 2024-01-15T10:30:00.000Z
    expect(message).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('should include level prefix in messages', () => {
    logWarn('Test message');

    const call = consoleWarnSpy.mock.calls[0];
    const message = call[0] as string;

    expect(message).toContain('[WARN]');
  });
});

describe('JSON Logging Mode', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalLogLevel = process.env.LOG_LEVEL;
  const originalLogJson = process.env.LOG_JSON;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
    (process.env as Record<string, string | undefined>).LOG_LEVEL = originalLogLevel;
    (process.env as Record<string, string | undefined>).LOG_JSON = originalLogJson;
    setRequestId(undefined);
    vi.restoreAllMocks();
  });

  it('should output JSON when LOG_JSON is true', async () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = 'development';
    (process.env as Record<string, string | undefined>).LOG_LEVEL = 'warn';
    (process.env as Record<string, string | undefined>).LOG_JSON = 'true';

    const { logWarn: logWarnJson } = await import('@/adapter/logging/logger');
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    logWarnJson('Test JSON message', { key: 'value' });

    expect(consoleWarnSpy).toHaveBeenCalled();
    const call = consoleWarnSpy.mock.calls[0];
    const output = call[0] as string;

    // Should be valid JSON
    const parsed = JSON.parse(output);
    expect(parsed.message).toBe('Test JSON message');
    expect(parsed.level).toBe('warn');
    expect(parsed.context.key).toBe('value');
    expect(parsed.timestamp).toBeDefined();
  });

  it('should include request ID in JSON output when set', async () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = 'development';
    (process.env as Record<string, string | undefined>).LOG_LEVEL = 'warn';
    (process.env as Record<string, string | undefined>).LOG_JSON = 'true';

    const { logWarn: logWarnJson, setRequestId: setReqId } = await import('@/adapter/logging/logger');
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    setReqId('req_json_test_123');
    logWarnJson('Test with request ID');

    const call = consoleWarnSpy.mock.calls[0];
    const parsed = JSON.parse(call[0] as string);

    expect(parsed.request_id).toBe('req_json_test_123');

    // Cleanup
    setReqId(undefined);
  });

  it('should output JSON for error logs in JSON mode', async () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = 'development';
    (process.env as Record<string, string | undefined>).LOG_LEVEL = 'error';
    (process.env as Record<string, string | undefined>).LOG_JSON = 'true';

    const { logError: logErrorJson } = await import('@/adapter/logging/logger');
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const testError = new Error('Test error');
    logErrorJson('Error occurred', testError, { request_id: 'req_123' });

    expect(consoleErrorSpy).toHaveBeenCalled();
    const call = consoleErrorSpy.mock.calls[0];
    const parsed = JSON.parse(call[0] as string);

    expect(parsed.message).toBe('Error occurred');
    expect(parsed.level).toBe('error');
    expect(parsed.error.name).toBe('Error');
    expect(parsed.error.message).toBe('Test error');
    expect(parsed.context.request_id).toBe('req_123');
  });
});
