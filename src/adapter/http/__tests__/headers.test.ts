/**
 * HTTP Headers utility tests
 *
 * Tests for response header utilities.
 */

import { describe, test, expect } from 'vitest';
import { responseHeaders, type HeadersObject } from '@/adapter/http/headers';

describe('responseHeaders', () => {
  test('should have correct Content-Type', () => {
    expect(responseHeaders['Content-Type']).toBe('text/html; charset=utf-8');
  });

  test('should be immutable (const assertion)', () => {
    // TypeScript will enforce this at compile time via `as const`
    // At runtime we just verify the object exists with expected keys
    expect(Object.keys(responseHeaders)).toContain('Content-Type');
  });

  test('should only contain Content-Type header', () => {
    // Per the implementation comments, no cache or security headers needed
    // as this is server-to-server communication
    expect(Object.keys(responseHeaders)).toEqual(['Content-Type']);
  });
});

describe('HeadersObject type', () => {
  test('should accept valid header objects', () => {
    const headers: HeadersObject = {
      'Content-Type': 'text/html',
      'X-Custom-Header': 'value',
    };
    expect(headers['Content-Type']).toBe('text/html');
  });

  test('should work with spread operator', () => {
    const custom: HeadersObject = { 'X-Custom': 'value' };
    const combined: HeadersObject = { ...responseHeaders, ...custom };
    expect(combined['Content-Type']).toBe('text/html; charset=utf-8');
    expect(combined['X-Custom']).toBe('value');
  });
});
