/**
 * API Route Integration Tests for /api/v1/account
 *
 * Tests for POST request handling, validation, rate limiting, and error responses.
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from '../route';

// Mock the renderer
vi.mock('@/adapter/renderers/account', () => ({
  renderAccountPage: vi.fn().mockResolvedValue('<html><body>Rendered Account</body></html>'),
}));

// Mock the adapter modules - matching the canonical import paths
vi.mock('@/adapter/logging/logger', () => ({
  generateRequestId: vi.fn().mockReturnValue('test-request-id'),
  setRequestId: vi.fn(),
  logRenderRequest: vi.fn(),
  logRenderComplete: vi.fn(),
  logValidationError: vi.fn(),
  logError: vi.fn(),
}));

vi.mock('@/adapter/http/rate-limit', () => ({
  checkRateLimit: vi.fn().mockReturnValue({
    allowed: true,
    current: 1,
    limit: 300,
    retryAfter: 60,
    resetAt: Math.floor(Date.now() / 1000) + 60,
    remaining: 299,
  }),
  rateLimitResponse: vi.fn().mockReturnValue(
    new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: { 'Retry-After': '60' },
    }),
  ),
  getRateLimitHeaders: vi.fn().mockReturnValue({
    'X-RateLimit-Limit': '300',
    'X-RateLimit-Remaining': '299',
  }),
  RATE_LIMITS: {
    ACCOUNT: { limit: 300, window: 60000, identifier: 'account' },
  },
}));

// Valid test fixtures (matching schema requirements)
const validSiteInfo = {
  currency: 'USD',
  currency_symbol: '$',
  currency_position: 'left' as const,
  thousand_separator: ',',
  decimal_separator: '.',
  price_decimals: 2,
};

const validLoginForm = {
  action_url: 'https://example.com/my-account',
  nonce: 'abc123',
  redirect_url: 'https://example.com/my-account',
  lost_password_url: 'https://example.com/my-account/lost-password',
};

const validRequest = {
  home_url: 'https://example.com',
  page_type: 'login',
  site_info: validSiteInfo,
  login_form: validLoginForm,
};

/**
 * Helper: Create NextRequest with JSON body
 */
function createRequest(body: unknown): NextRequest {
  const url = 'http://localhost:3000/api/v1/account';
  return new NextRequest(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': '192.168.1.100',
    },
    body: JSON.stringify(body),
  });
}

/**
 * Helper: Create NextRequest with raw body (for invalid JSON tests)
 */
function createRawRequest(body: string): NextRequest {
  const url = 'http://localhost:3000/api/v1/account';
  return new NextRequest(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': '192.168.1.100',
    },
    body,
  });
}

describe('POST /api/v1/account', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('successful requests', () => {
    test('should return 200 with HTML for valid request', async () => {
      const request = createRequest(validRequest);
      const response = await POST(request);

      expect(response.status).toBe(200);
      const body = await response.text();
      expect(body).toContain('Rendered Account');
    });

    test('should return correct Content-Type header', async () => {
      const request = createRequest(validRequest);
      const response = await POST(request);

      expect(response.headers.get('Content-Type')).toBe('text/html; charset=utf-8');
    });

    test('should return rate limit headers', async () => {
      const request = createRequest(validRequest);
      const response = await POST(request);

      expect(response.headers.get('X-RateLimit-Limit')).toBe('300');
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('299');
    });

    test('should call setRequestId with generated request ID', async () => {
      const { setRequestId } = await import('@/adapter/logging/logger');
      const request = createRequest(validRequest);
      await POST(request);

      expect(setRequestId).toHaveBeenCalledWith('test-request-id');
    });
  });

  describe('rate limit configuration', () => {
    test('should use RATE_LIMITS.ACCOUNT (not PRODUCT)', async () => {
      const { checkRateLimit, RATE_LIMITS } = await import('@/adapter/http/rate-limit');
      const request = createRequest(validRequest);
      await POST(request);

      expect(checkRateLimit).toHaveBeenCalledWith(request, RATE_LIMITS.ACCOUNT);
    });
  });

  describe('validation errors', () => {
    test('should return 503 for missing home_url', async () => {
      const { home_url: _home_url, ...withoutUrl } = validRequest;
      const request = createRequest(withoutUrl);
      const response = await POST(request);

      expect(response.status).toBe(503);
      expect(response.headers.get('x-flexi-fallback')).toBe('invalid-request');
    });

    test('should return 503 for invalid home_url format', async () => {
      const request = createRequest({
        ...validRequest,
        home_url: 'not-a-url',
      });
      const response = await POST(request);

      expect(response.status).toBe(503);
      expect(response.headers.get('x-flexi-fallback')).toBe('invalid-request');
    });

    test('should return 503 for missing page_type', async () => {
      const { page_type: _page_type, ...withoutPageType } = validRequest;
      const request = createRequest(withoutPageType);
      const response = await POST(request);

      expect(response.status).toBe(503);
      expect(response.headers.get('x-flexi-fallback')).toBe('invalid-request');
    });

    test('should return 503 for invalid page_type', async () => {
      const request = createRequest({
        ...validRequest,
        page_type: 'invalid',
      });
      const response = await POST(request);

      expect(response.status).toBe(503);
      expect(response.headers.get('x-flexi-fallback')).toBe('invalid-request');
    });

    test('should return 503 for missing site_info', async () => {
      const { site_info: _site_info, ...withoutSiteInfo } = validRequest;
      const request = createRequest(withoutSiteInfo);
      const response = await POST(request);

      expect(response.status).toBe(503);
      expect(response.headers.get('x-flexi-fallback')).toBe('invalid-request');
    });

    test('should return validation error details in response body', async () => {
      const request = createRequest({
        ...validRequest,
        home_url: 'invalid',
      });
      const response = await POST(request);
      const body = await response.json();

      expect(body.reason).toBe('invalid-request');
      expect(body.message).toBeDefined();
      expect(body.details).toBeDefined();
      expect(Array.isArray(body.details)).toBe(true);
    });
  });

  describe('JSON parsing errors', () => {
    test('should return 503 for invalid JSON', async () => {
      const request = createRawRequest('{ invalid json }');
      const response = await POST(request);

      expect(response.status).toBe(503);
    });

    test('should include x-flexi-fallback header for invalid JSON', async () => {
      const request = createRawRequest('not json at all');
      const response = await POST(request);

      expect(response.headers.get('x-flexi-fallback')).toBe('invalid-json');
    });

    test('should return JSON error response for invalid JSON', async () => {
      const request = createRawRequest('{ broken }');
      const response = await POST(request);

      const body = await response.json();
      expect(body.reason).toBe('invalid-json');
      expect(body.message).toBe('Invalid JSON in request body');
    });
  });

  describe('render errors', () => {
    test('should return 503 when renderer throws', async () => {
      const { renderAccountPage } = await import('@/adapter/renderers/account');
      vi.mocked(renderAccountPage).mockRejectedValueOnce(new Error('Render failed'));

      const request = createRequest(validRequest);
      const response = await POST(request);

      expect(response.status).toBe(503);
    });

    test('should include x-flexi-fallback header on render error', async () => {
      const { renderAccountPage } = await import('@/adapter/renderers/account');
      vi.mocked(renderAccountPage).mockRejectedValueOnce(new Error('Render failed'));

      const request = createRequest(validRequest);
      const response = await POST(request);

      expect(response.headers.get('x-flexi-fallback')).toBe('render-error');
    });
  });

  describe('rate limiting', () => {
    test('should return 429 when rate limited', async () => {
      const { checkRateLimit, rateLimitResponse } = await import('@/adapter/http/rate-limit');
      vi.mocked(checkRateLimit).mockReturnValueOnce({
        allowed: false,
        current: 300,
        limit: 300,
        retryAfter: 60,
        resetAt: Math.floor(Date.now() / 1000) + 60,
        remaining: 0,
      });

      const request = createRequest(validRequest);
      await POST(request);

      expect(rateLimitResponse).toHaveBeenCalled();
    });

    test('should check rate limit before processing request', async () => {
      const { checkRateLimit } = await import('@/adapter/http/rate-limit');
      const { renderAccountPage } = await import('@/adapter/renderers/account');

      vi.mocked(checkRateLimit).mockReturnValueOnce({
        allowed: false,
        current: 300,
        limit: 300,
        retryAfter: 60,
        resetAt: Math.floor(Date.now() / 1000) + 60,
        remaining: 0,
      });

      const request = createRequest(validRequest);
      await POST(request);

      // Renderer should NOT be called when rate limited
      expect(renderAccountPage).not.toHaveBeenCalled();
    });
  });
});

describe('GET /api/v1/account', () => {
  test('should return 405 Method Not Allowed', async () => {
    const response = await GET();

    expect(response.status).toBe(405);
    const body = await response.json();
    expect(body.error).toBe('Method not allowed');
  });
});
