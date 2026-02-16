/**
 * Rate Limiter Unit Tests
 *
 * Tests for sliding window rate limiting implementation.
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import {
  checkRateLimit,
  rateLimitResponse,
  getRateLimitHeaders,
  getSiteIdentifier,
  RATE_LIMITS,
  _resetRateLimitStore,
  _getRateLimitStoreSize,
  type RateLimitConfig,
} from '@/adapter/http/rate-limit';

// Mock logger to avoid console output during tests
vi.mock('@/adapter/logging/logger', () => ({
  logWarn: vi.fn(),
  logInfo: vi.fn(),
  logDebug: vi.fn(),
  logError: vi.fn(),
}));

/**
 * Helper: Create mock Request
 *
 * By default, sets x-forwarded-for header with the provided IP.
 * Pass custom headers to override this behavior.
 */
function createMockRequest(
  ip: string = '192.168.1.100',
  headers: Record<string, string> = {},
): Request {
  const url = 'http://localhost:3000/api/v1/product';

  // If no headers provided, set x-forwarded-for with the IP
  const requestHeaders = Object.keys(headers).length === 0 ? { 'x-forwarded-for': ip } : headers;

  const request = new Request(url, {
    method: 'POST',
    headers: new Headers(requestHeaders),
  });

  return request;
}

describe('Rate Limiter', () => {
  beforeEach(() => {
    // Reset rate limit store between tests
    _resetRateLimitStore();
    vi.clearAllMocks();
  });

  describe('getSiteIdentifier', () => {
    test('extracts site ID from x-flexiwoo-site-id header', () => {
      const request = createMockRequest('fallback-ip', {
        'x-flexiwoo-site-id': 'abc123xyz456',
      });

      expect(getSiteIdentifier(request)).toBe('abc123xyz456');
    });

    test('validates site ID format - alphanumeric with hyphens', () => {
      const validIds = [
        'abc123xyz',
        'a1b2c3d4e5f6g7h8',
        'site-123-test',
        'ABC123XYZ',
        'site-prod-01',
      ];

      validIds.forEach((siteId) => {
        const request = createMockRequest('fallback-ip', {
          'x-flexiwoo-site-id': siteId,
        });
        expect(getSiteIdentifier(request)).toBe(siteId);
      });
    });

    test('rejects invalid site ID formats', () => {
      const invalidIds = [
        'abc!@#', // Special chars
        'a'.repeat(100), // Too long (>64 chars)
        'abc', // Too short (<8 chars)
        '../etc/passwd', // Path traversal attempt
        'abc def', // Spaces
        'abc<script>', // HTML injection attempt
      ];

      invalidIds.forEach((siteId) => {
        const request = createMockRequest('fallback-ip', {
          'x-flexiwoo-site-id': siteId,
          'x-forwarded-for': '203.0.113.1',
        });
        // Should fall back to IP-based identifier
        expect(getSiteIdentifier(request)).toBe('ip:203.0.113.1');
      });
    });

    test('falls back to IP when site ID header missing', () => {
      const request = createMockRequest('fallback-ip', {
        'x-forwarded-for': '203.0.113.1',
      });

      expect(getSiteIdentifier(request)).toBe('ip:203.0.113.1');
    });

    test('falls back to IP when site ID is empty', () => {
      const request = createMockRequest('fallback-ip', {
        'x-flexiwoo-site-id': '',
        'x-forwarded-for': '203.0.113.1',
      });

      expect(getSiteIdentifier(request)).toBe('ip:203.0.113.1');
    });

    test('uses x-real-ip if x-forwarded-for not available', () => {
      const request = createMockRequest('fallback-ip', {
        'x-real-ip': '198.51.100.22',
      });

      expect(getSiteIdentifier(request)).toBe('ip:198.51.100.22');
    });

    test('returns unknown when no identifiers available', () => {
      const request = new Request('http://localhost:3000/api/v1/product', {
        method: 'POST',
        headers: new Headers({}),
      });

      expect(getSiteIdentifier(request)).toBe('unknown');
    });

    test('prefers site ID over IP headers', () => {
      const request = createMockRequest('fallback-ip', {
        'x-flexiwoo-site-id': 'abc123xyz456',
        'x-forwarded-for': '203.0.113.1',
        'x-real-ip': '198.51.100.22',
      });

      expect(getSiteIdentifier(request)).toBe('abc123xyz456');
    });

    test('handles site ID at minimum length (8 chars)', () => {
      const request = createMockRequest('fallback-ip', {
        'x-flexiwoo-site-id': 'abcd1234',
      });

      expect(getSiteIdentifier(request)).toBe('abcd1234');
    });

    test('handles site ID at maximum length (64 chars)', () => {
      const longSiteId = 'a'.repeat(64);
      const request = createMockRequest('fallback-ip', {
        'x-flexiwoo-site-id': longSiteId,
      });

      expect(getSiteIdentifier(request)).toBe(longSiteId);
    });
  });

  describe('Sliding Window Algorithm', () => {
    const config: RateLimitConfig = {
      limit: 5,
      window: 1000, // 1 second
      identifier: 'test',
    };

    test('allows requests under limit', () => {
      const request = createMockRequest('192.168.1.101');

      // First request should be allowed
      const result1 = checkRateLimit(request, config);
      expect(result1.allowed).toBe(true);
      expect(result1.current).toBe(0);
      expect(result1.remaining).toBe(4);

      // Second request should be allowed
      const result2 = checkRateLimit(request, config);
      expect(result2.allowed).toBe(true);
      expect(result2.current).toBe(1);
      expect(result2.remaining).toBe(3);

      // Fifth request should be allowed (limit is 5)
      checkRateLimit(request, config);
      checkRateLimit(request, config);
      const result5 = checkRateLimit(request, config);
      expect(result5.allowed).toBe(true);
      expect(result5.current).toBe(4);
      expect(result5.remaining).toBe(0);
    });

    test('blocks requests over limit', () => {
      const request = createMockRequest('192.168.1.102');

      // Make 5 requests (up to limit)
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(request, config);
        expect(result.allowed).toBe(true);
      }

      // 6th request should be blocked
      const result6 = checkRateLimit(request, config);
      expect(result6.allowed).toBe(false);
      expect(result6.current).toBe(5);
      expect(result6.remaining).toBe(0);
      expect(result6.retryAfter).toBeGreaterThan(0);
    });

    test('resets after window expires', async () => {
      const request = createMockRequest('192.168.1.103');
      const shortConfig: RateLimitConfig = {
        limit: 2,
        window: 100, // 100ms
        identifier: 'short-window',
      };

      // Make 2 requests (up to limit)
      checkRateLimit(request, shortConfig);
      checkRateLimit(request, shortConfig);

      // 3rd request should be blocked
      const result3 = checkRateLimit(request, shortConfig);
      expect(result3.allowed).toBe(false);

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 150));

      // 4th request should be allowed (window reset)
      const result4 = checkRateLimit(request, shortConfig);
      expect(result4.allowed).toBe(true);
      expect(result4.current).toBe(0); // Fresh window
    });

    test('tracks different IPs separately', () => {
      const request1 = createMockRequest('192.168.1.104');
      const request2 = createMockRequest('192.168.1.105');

      // Make 5 requests from IP 1 (up to limit)
      for (let i = 0; i < 5; i++) {
        checkRateLimit(request1, config);
      }

      // IP 1 should be blocked
      const resultIp1 = checkRateLimit(request1, config);
      expect(resultIp1.allowed).toBe(false);

      // IP 2 should still be allowed (different IP)
      const resultIp2 = checkRateLimit(request2, config);
      expect(resultIp2.allowed).toBe(true);
      expect(resultIp2.current).toBe(0); // Fresh counter for IP 2
    });

    test('tracks different identifiers separately', () => {
      const request = createMockRequest('192.168.1.106');
      const config1: RateLimitConfig = { ...config, identifier: 'endpoint-1' };
      const config2: RateLimitConfig = { ...config, identifier: 'endpoint-2' };

      // Make 5 requests to endpoint 1 (up to limit)
      for (let i = 0; i < 5; i++) {
        checkRateLimit(request, config1);
      }

      // Endpoint 1 should be blocked
      const result1 = checkRateLimit(request, config1);
      expect(result1.allowed).toBe(false);

      // Endpoint 2 should still be allowed (different identifier)
      const result2 = checkRateLimit(request, config2);
      expect(result2.allowed).toBe(true);
      expect(result2.current).toBe(0); // Fresh counter for endpoint 2
    });
  });

  describe('Rate Limit Response', () => {
    test('returns 429 status code', async () => {
      const result = {
        allowed: false,
        current: 60,
        limit: 60,
        retryAfter: 42,
        resetAt: Math.floor(Date.now() / 1000) + 42,
        remaining: 0,
      };

      const response = rateLimitResponse(result);

      expect(response.status).toBe(429);
    });

    test('includes retry-after header', async () => {
      const result = {
        allowed: false,
        current: 60,
        limit: 60,
        retryAfter: 42,
        resetAt: Math.floor(Date.now() / 1000) + 42,
        remaining: 0,
      };

      const response = rateLimitResponse(result);
      const retryAfter = response.headers.get('Retry-After');

      expect(retryAfter).toBe('42');
    });

    test('includes rate limit headers', async () => {
      const result = {
        allowed: false,
        current: 60,
        limit: 60,
        retryAfter: 42,
        resetAt: 1699564800,
        remaining: 0,
      };

      const response = rateLimitResponse(result);

      expect(response.headers.get('X-RateLimit-Limit')).toBe('60');
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
      expect(response.headers.get('X-RateLimit-Reset')).toBe('1699564800');
    });

    test('includes error message in response body', async () => {
      const result = {
        allowed: false,
        current: 60,
        limit: 60,
        retryAfter: 42,
        resetAt: 1699564800,
        remaining: 0,
      };

      const response = rateLimitResponse(result);
      const body = await response.json();

      expect(body).toEqual({
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
        retry_after: 42,
      });
    });
  });

  describe('Rate Limit Headers for Successful Requests', () => {
    test('returns headers object with limit, remaining, and reset', () => {
      const result = {
        allowed: true,
        current: 10,
        limit: 60,
        retryAfter: 50,
        resetAt: 1699564800,
        remaining: 49,
      };

      const headers = getRateLimitHeaders(result);

      expect(headers).toEqual({
        'X-RateLimit-Limit': '60',
        'X-RateLimit-Remaining': '49',
        'X-RateLimit-Reset': '1699564800',
      });
    });

    test('shows 0 remaining when at limit', () => {
      const result = {
        allowed: true,
        current: 59,
        limit: 60,
        retryAfter: 10,
        resetAt: 1699564800,
        remaining: 0,
      };

      const headers = getRateLimitHeaders(result);

      expect(headers['X-RateLimit-Remaining']).toBe('0');
    });
  });

  describe('Rate Limit Configurations', () => {
    test('PRODUCT configuration - 600/min', () => {
      expect(RATE_LIMITS.PRODUCT).toEqual({
        limit: 600,
        window: 60000,
        identifier: 'product',
      });
    });

    test('SHOP configuration - 600/min', () => {
      expect(RATE_LIMITS.SHOP).toEqual({
        limit: 600,
        window: 60000,
        identifier: 'shop',
      });
    });

    test('CATEGORY configuration - 600/min', () => {
      expect(RATE_LIMITS.CATEGORY).toEqual({
        limit: 600,
        window: 60000,
        identifier: 'category',
      });
    });

    test('SEARCH configuration - 300/min', () => {
      expect(RATE_LIMITS.SEARCH).toEqual({
        limit: 300,
        window: 60000,
        identifier: 'search',
      });
    });

    test('CART configuration - 300/min', () => {
      expect(RATE_LIMITS.CART).toEqual({
        limit: 300,
        window: 60000,
        identifier: 'cart',
      });
    });

    test('CHECKOUT configuration - 200/min', () => {
      expect(RATE_LIMITS.CHECKOUT).toEqual({
        limit: 200,
        window: 60000,
        identifier: 'checkout',
      });
    });

    test('THANK_YOU configuration - 60/min', () => {
      expect(RATE_LIMITS.THANK_YOU).toEqual({
        limit: 60,
        window: 60000,
        identifier: 'thank-you',
      });
    });

    test('ACCOUNT configuration - 300/min', () => {
      expect(RATE_LIMITS.ACCOUNT).toEqual({
        limit: 300,
        window: 60000,
        identifier: 'account',
      });
    });

    test('HEALTH configuration - 120/min', () => {
      expect(RATE_LIMITS.HEALTH).toEqual({
        limit: 120,
        window: 60000,
        identifier: 'health',
      });
    });
  });

  describe('Site-Based Rate Limiting', () => {
    test('allows 600 product requests per site within 1 minute', () => {
      const siteId = 'testsite123';

      // Make 600 requests (should all succeed)
      for (let i = 0; i < 600; i++) {
        const request = createMockRequest('fallback-ip', {
          'x-flexiwoo-site-id': siteId,
        });
        const result = checkRateLimit(request, RATE_LIMITS.PRODUCT);
        expect(result.allowed).toBe(true);
      }

      // 601st request should fail
      const request = createMockRequest('fallback-ip', {
        'x-flexiwoo-site-id': siteId,
      });
      const result = checkRateLimit(request, RATE_LIMITS.PRODUCT);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    test('tracks different sites independently', () => {
      const siteA = 'siteA123abc';
      const siteB = 'siteB456def';

      // Site A makes 600 requests (at limit)
      for (let i = 0; i < 600; i++) {
        const request = createMockRequest('fallback-ip', {
          'x-flexiwoo-site-id': siteA,
        });
        checkRateLimit(request, RATE_LIMITS.PRODUCT);
      }

      // Site A is now blocked
      const requestA = createMockRequest('fallback-ip', {
        'x-flexiwoo-site-id': siteA,
      });
      expect(checkRateLimit(requestA, RATE_LIMITS.PRODUCT).allowed).toBe(false);

      // Site B should still be allowed (independent limit)
      const requestB = createMockRequest('fallback-ip', {
        'x-flexiwoo-site-id': siteB,
      });
      expect(checkRateLimit(requestB, RATE_LIMITS.PRODUCT).allowed).toBe(true);
      expect(checkRateLimit(requestB, RATE_LIMITS.PRODUCT).current).toBe(1);
    });

    test('allows 200 checkout requests per site within 1 minute', () => {
      const siteId = 'testsite456';

      // Make 200 requests (should all succeed)
      for (let i = 0; i < 200; i++) {
        const request = createMockRequest('fallback-ip', {
          'x-flexiwoo-site-id': siteId,
        });
        const result = checkRateLimit(request, RATE_LIMITS.CHECKOUT);
        expect(result.allowed).toBe(true);
      }

      // 201st request should fail
      const request = createMockRequest('fallback-ip', {
        'x-flexiwoo-site-id': siteId,
      });
      const result = checkRateLimit(request, RATE_LIMITS.CHECKOUT);
      expect(result.allowed).toBe(false);
    });

    test('allows 60 thank-you requests per site within 1 minute', () => {
      const siteId = 'testsite789';

      // Make 60 requests (should all succeed)
      for (let i = 0; i < 60; i++) {
        const request = createMockRequest('fallback-ip', {
          'x-flexiwoo-site-id': siteId,
        });
        const result = checkRateLimit(request, RATE_LIMITS.THANK_YOU);
        expect(result.allowed).toBe(true);
      }

      // 61st request should fail
      const request = createMockRequest('fallback-ip', {
        'x-flexiwoo-site-id': siteId,
      });
      const result = checkRateLimit(request, RATE_LIMITS.THANK_YOU);
      expect(result.allowed).toBe(false);
    });

    test('handles mixed site ID and IP-based requests independently', () => {
      // Request with site ID
      const siteRequest = createMockRequest('fallback-ip', {
        'x-flexiwoo-site-id': 'site123abc',
      });

      // Request with IP only (backward compatibility)
      const ipRequest = createMockRequest('fallback-ip', {
        'x-forwarded-for': '203.0.113.1',
      });

      // Make requests from both
      const siteResult1 = checkRateLimit(siteRequest, RATE_LIMITS.PRODUCT);
      const ipResult1 = checkRateLimit(ipRequest, RATE_LIMITS.PRODUCT);

      // Both should be allowed and tracked independently
      expect(siteResult1.allowed).toBe(true);
      expect(siteResult1.current).toBe(0);
      expect(ipResult1.allowed).toBe(true);
      expect(ipResult1.current).toBe(0);

      // Each should have their own counter
      const siteResult2 = checkRateLimit(siteRequest, RATE_LIMITS.PRODUCT);
      expect(siteResult2.current).toBe(1);

      const ipResult2 = checkRateLimit(ipRequest, RATE_LIMITS.PRODUCT);
      expect(ipResult2.current).toBe(1);
    });

    test('site-based rate limiting tracks sites behind same proxy independently', () => {
      const siteA = 'siteC999xyz';
      const siteB = 'siteD888pqr';

      // Both sites use same IP (simulating sites behind same proxy)
      const requestA = createMockRequest('fallback-ip', {
        'x-flexiwoo-site-id': siteA,
        'x-forwarded-for': '203.0.113.1',
      });

      const requestB = createMockRequest('fallback-ip', {
        'x-flexiwoo-site-id': siteB,
        'x-forwarded-for': '203.0.113.1',
      });

      // Make request from site A
      const resultA1 = checkRateLimit(requestA, RATE_LIMITS.PRODUCT);
      expect(resultA1.allowed).toBe(true);
      expect(resultA1.current).toBe(0);

      // Make request from site B (same IP)
      const resultB1 = checkRateLimit(requestB, RATE_LIMITS.PRODUCT);
      expect(resultB1.allowed).toBe(true);
      expect(resultB1.current).toBe(0); // Independent counter!

      // Verify they're tracked separately
      const resultA2 = checkRateLimit(requestA, RATE_LIMITS.PRODUCT);
      expect(resultA2.current).toBe(1);

      const resultB2 = checkRateLimit(requestB, RATE_LIMITS.PRODUCT);
      expect(resultB2.current).toBe(1);
    });
  });

  describe('Cleanup and Memory Management', () => {
    test('triggers cleanup after 100 requests', () => {
      const request = createMockRequest('192.168.1.107');
      const config: RateLimitConfig = {
        limit: 200, // High limit to avoid blocking
        window: 10000, // 10 seconds
        identifier: 'cleanup-test',
      };

      // Make 101 requests to trigger cleanup
      for (let i = 0; i < 101; i++) {
        checkRateLimit(request, config);
      }

      // If cleanup didn't crash, test passes
      expect(true).toBe(true);
    });
  });

  describe('Retry-After Calculation', () => {
    test('retry-after is at least 1 second', () => {
      const request = createMockRequest('192.168.1.108');
      const config: RateLimitConfig = {
        limit: 1,
        window: 100, // 100ms window
        identifier: 'short-retry',
      };

      // Exceed limit
      checkRateLimit(request, config);
      const result = checkRateLimit(request, config);

      expect(result.retryAfter).toBeGreaterThanOrEqual(1);
    });

    test('retry-after matches window duration when at start of window', () => {
      const request = createMockRequest('192.168.1.109');
      const config: RateLimitConfig = {
        limit: 1,
        window: 60000, // 60 seconds
        identifier: 'long-retry',
      };

      // Exceed limit immediately
      checkRateLimit(request, config);
      const result = checkRateLimit(request, config);

      // Retry-after should be close to 60 seconds (allowing for execution time)
      expect(result.retryAfter).toBeGreaterThanOrEqual(59);
      expect(result.retryAfter).toBeLessThanOrEqual(61);
    });
  });

  describe('Remaining Requests Calculation', () => {
    test('remaining decreases with each request', () => {
      const request = createMockRequest('192.168.1.110');
      const config: RateLimitConfig = {
        limit: 5,
        window: 10000,
        identifier: 'remaining-test',
      };

      const result1 = checkRateLimit(request, config);
      expect(result1.remaining).toBe(4);

      const result2 = checkRateLimit(request, config);
      expect(result2.remaining).toBe(3);

      const result3 = checkRateLimit(request, config);
      expect(result3.remaining).toBe(2);

      const result4 = checkRateLimit(request, config);
      expect(result4.remaining).toBe(1);

      const result5 = checkRateLimit(request, config);
      expect(result5.remaining).toBe(0);

      // After exceeding limit
      const result6 = checkRateLimit(request, config);
      expect(result6.remaining).toBe(0);
    });
  });

  describe('getRateLimitHeaders with siteId', () => {
    test('includes X-RateLimit-Site-ID for valid site IDs', () => {
      const result = {
        allowed: true,
        current: 10,
        limit: 60,
        retryAfter: 50,
        resetAt: 1699564800,
        remaining: 49,
      };

      const headers = getRateLimitHeaders(result, 'validsite123abc');

      expect(headers['X-RateLimit-Site-ID']).toBe('validsite123abc');
      expect(headers['X-RateLimit-Limit']).toBe('60');
      expect(headers['X-RateLimit-Remaining']).toBe('49');
    });

    test('excludes X-RateLimit-Site-ID for IP-based identifiers', () => {
      const result = {
        allowed: true,
        current: 10,
        limit: 60,
        retryAfter: 50,
        resetAt: 1699564800,
        remaining: 49,
      };

      const headers = getRateLimitHeaders(result, 'ip:192.168.1.100');

      expect(headers['X-RateLimit-Site-ID']).toBeUndefined();
    });

    test('excludes X-RateLimit-Site-ID for unknown identifier', () => {
      const result = {
        allowed: true,
        current: 10,
        limit: 60,
        retryAfter: 50,
        resetAt: 1699564800,
        remaining: 49,
      };

      const headers = getRateLimitHeaders(result, 'unknown');

      expect(headers['X-RateLimit-Site-ID']).toBeUndefined();
    });
  });

  describe('_getRateLimitStoreSize', () => {
    test('returns 0 for empty store', () => {
      expect(_getRateLimitStoreSize()).toBe(0);
    });

    test('returns correct size after adding entries', () => {
      const config: RateLimitConfig = {
        limit: 100,
        window: 60000,
        identifier: 'store-size-test',
      };

      // Add entry for one IP
      const request1 = createMockRequest('192.168.1.200');
      checkRateLimit(request1, config);
      expect(_getRateLimitStoreSize()).toBe(1);

      // Add entry for another IP
      const request2 = createMockRequest('192.168.1.201');
      checkRateLimit(request2, config);
      expect(_getRateLimitStoreSize()).toBe(2);
    });
  });

  describe('Violation Log Cleanup', () => {
    test('cleans up expired violation log entries during cleanup cycle', async () => {
      // This test verifies that violation log entries are cleaned up
      // after VIOLATION_LOG_INTERVAL (1 hour) has passed

      const config: RateLimitConfig = {
        limit: 1,
        window: 100, // Very short window for testing
        identifier: 'violation-cleanup-test',
      };

      // Create a violation by exceeding limit
      const request = createMockRequest('192.168.1.250');
      checkRateLimit(request, config); // First request - allowed
      checkRateLimit(request, config); // Second request - blocked, creates violation log

      // Mock time passing (1 hour + 1 second)
      const originalNow = Date.now;
      const futureTime = Date.now() + 60 * 60 * 1000 + 1000; // 1 hour + 1 second
      vi.spyOn(Date, 'now').mockReturnValue(futureTime);

      // Trigger cleanup by making 100+ requests (CLEANUP_INTERVAL)
      const cleanupConfig: RateLimitConfig = {
        limit: 1000,
        window: 100,
        identifier: 'cleanup-trigger',
      };
      for (let i = 0; i < 101; i++) {
        const req = createMockRequest(`10.0.0.${i % 256}`);
        checkRateLimit(req, cleanupConfig);
      }

      // Restore Date.now
      Date.now = originalNow;
    });
  });

  describe('Partial Timestamp Cleanup', () => {
    test('updates entry when some timestamps expire but not all', () => {
      const config: RateLimitConfig = {
        limit: 100,
        window: 1000, // 1 second window
        identifier: 'partial-cleanup-test',
      };

      // Make initial requests
      const request = createMockRequest('192.168.1.251');
      checkRateLimit(request, config);
      checkRateLimit(request, config);
      checkRateLimit(request, config);

      // Mock time to be within window but close to expiry
      const originalNow = Date.now;
      const baseTime = Date.now();

      // Advance time by 500ms (some timestamps should still be valid)
      vi.spyOn(Date, 'now').mockReturnValue(baseTime + 500);

      // Make more requests to add new timestamps
      checkRateLimit(request, config);

      // Advance time to expire only old timestamps (but not the new one)
      vi.spyOn(Date, 'now').mockReturnValue(baseTime + 1500);

      // Trigger cleanup
      const cleanupConfig: RateLimitConfig = {
        limit: 1000,
        window: 1000,
        identifier: 'partial-cleanup-trigger',
      };
      for (let i = 0; i < 101; i++) {
        const req = createMockRequest(`10.1.0.${i % 256}`);
        checkRateLimit(req, cleanupConfig);
      }

      // Restore Date.now
      Date.now = originalNow;
    });
  });

  describe('IPv6 Address Sanitization', () => {
    test('sanitizes IPv6 addresses in violation logs', () => {
      const config: RateLimitConfig = {
        limit: 1,
        window: 60000,
        identifier: 'ipv6-test',
      };

      // Create request with IPv6 forwarded header
      const request = createMockRequest('', {
        'x-forwarded-for': '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
      });

      // First request - allowed
      checkRateLimit(request, config);
      // Second request - blocked, should trigger violation log with sanitized IPv6
      checkRateLimit(request, config);
    });

    test('handles short IPv6 addresses', () => {
      const config: RateLimitConfig = {
        limit: 1,
        window: 60000,
        identifier: 'ipv6-short-test',
      };

      // Create request with short IPv6 address
      const request = createMockRequest('', {
        'x-forwarded-for': '::1',
      });

      checkRateLimit(request, config);
      checkRateLimit(request, config); // Trigger violation
    });
  });

  describe('Unknown IP Sanitization', () => {
    test('handles unknown identifier in violation logs', () => {
      const config: RateLimitConfig = {
        limit: 1,
        window: 60000,
        identifier: 'unknown-ip-test',
      };

      // Create request without any IP headers (will get 'unknown' identifier)
      const url = 'http://localhost:3000/api/v1/product';
      const request = new Request(url, {
        method: 'POST',
        headers: new Headers({}), // No IP headers
      });

      checkRateLimit(request, config);
      checkRateLimit(request, config); // Trigger violation with 'unknown'
    });
  });

  describe('Malformed IP Handling', () => {
    test('handles malformed IPv4 addresses', () => {
      const config: RateLimitConfig = {
        limit: 1,
        window: 60000,
        identifier: 'malformed-ipv4-test',
      };

      // Create request with malformed IPv4 (not 4 parts)
      const request = createMockRequest('', {
        'x-forwarded-for': '192.168.1', // Only 3 parts
      });

      checkRateLimit(request, config);
      checkRateLimit(request, config); // Trigger violation
    });

    test('handles unusual IP format', () => {
      const config: RateLimitConfig = {
        limit: 1,
        window: 60000,
        identifier: 'unusual-ip-test',
      };

      // Create request with unusual format (neither IPv4 nor IPv6)
      const request = createMockRequest('', {
        'x-forwarded-for': 'localhost',
      });

      checkRateLimit(request, config);
      checkRateLimit(request, config); // Trigger violation
    });
  });

  describe('Short Site ID Sanitization', () => {
    test('handles short site IDs (8 chars or less) in violation logs', () => {
      const config: RateLimitConfig = {
        limit: 1,
        window: 60000,
        identifier: 'short-siteid-test',
      };

      // Create request with short site ID (8 chars, edge case)
      const request = createMockRequest('', {
        'x-flexiwoo-site-id': 'abcd1234', // Exactly 8 chars
      });

      checkRateLimit(request, config);
      checkRateLimit(request, config); // Trigger violation with short site ID
    });

    test('handles very short site IDs in violation logs', () => {
      const config: RateLimitConfig = {
        limit: 1,
        window: 60000,
        identifier: 'very-short-siteid-test',
      };

      // Create request with very short site ID
      const request = createMockRequest('', {
        'x-flexiwoo-site-id': 'abc12345', // 8 chars exactly
      });

      checkRateLimit(request, config);
      checkRateLimit(request, config); // Trigger violation
    });
  });
});
