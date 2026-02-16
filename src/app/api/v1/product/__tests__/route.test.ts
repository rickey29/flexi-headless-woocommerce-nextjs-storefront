/**
 * API Route Integration Tests for /api/v1/product
 *
 * Tests for POST request handling, validation, rate limiting, and error responses.
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from '../route';

// Mock the renderer - use the re-export path that route.ts imports from
vi.mock('@/adapter/renderers/product', () => ({
  renderProductPage: vi.fn().mockResolvedValue('<html><body>Rendered Product</body></html>'),
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

vi.mock('@/adapter/logging/sanitize', () => ({
  sanitizeProductData: vi.fn((data) => data),
}));

vi.mock('@/adapter/http/rate-limit', () => ({
  checkRateLimit: vi.fn().mockReturnValue({
    allowed: true,
    current: 1,
    limit: 100,
    retryAfter: 60,
    resetAt: Math.floor(Date.now() / 1000) + 60,
    remaining: 99,
  }),
  rateLimitResponse: vi.fn().mockReturnValue(
    new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: { 'Retry-After': '60' },
    }),
  ),
  getRateLimitHeaders: vi.fn().mockReturnValue({
    'X-RateLimit-Limit': '100',
    'X-RateLimit-Remaining': '99',
  }),
  RATE_LIMITS: {
    PRODUCT: { limit: 600, window: 60000, identifier: 'product' },
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

const validImage = {
  id: 123,
  url: 'https://example.com/image.jpg',
  srcset: 'https://example.com/image-300.jpg 300w',
  sizes: '(max-width: 600px) 300px',
  alt: 'Product image',
};

const validCategory = {
  id: 10,
  name: 'Electronics',
  slug: 'electronics',
  permalink: 'https://example.com/category/electronics',
};

const validProductData = {
  id: 100,
  name: 'Test Product',
  slug: 'test-product',
  type: 'simple' as const,
  status: 'publish',
  permalink: 'https://example.com/product/test-product',
  sku: 'TEST-001',
  price: 2999,
  price_formatted: '$29.99',
  regular_price: 3999,
  regular_price_formatted: '$39.99',
  sale_price: 2999,
  sale_price_formatted: '$29.99',
  on_sale: true,
  price_html: '<del>$39.99</del> <ins>$29.99</ins>',
  short_description: '<p>Short description</p>',
  description: '<p>Full description</p>',
  image: validImage,
  gallery_images: [],
  stock_status: 'instock' as const,
  stock_quantity: 100,
  manage_stock: true,
  backorders_allowed: false,
  is_low_stock: false,
  variations: [],
  attributes: [],
  default_attributes: {},
  categories: [validCategory],
  tags: [],
  related_products: [],
  upsell_products: [],
  average_rating: 4.5,
  review_count: 25,
  reviews_allowed: true,
  weight: '1.5',
  dimensions: { length: '10', width: '5', height: '3' },
  purchasable: true,
  virtual: false,
  downloadable: false,
};

const validRequest = {
  home_url: 'https://example.com',
  product_data: validProductData,
  site_info: validSiteInfo,
};

/**
 * Helper: Create NextRequest with JSON body
 */
function createRequest(body: unknown): NextRequest {
  const url = 'http://localhost:3000/api/v1/product';
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
  const url = 'http://localhost:3000/api/v1/product';
  return new NextRequest(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': '192.168.1.100',
    },
    body,
  });
}

describe('POST /api/v1/product', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('successful requests', () => {
    test('should return 200 with HTML for valid request', async () => {
      const request = createRequest(validRequest);
      const response = await POST(request);

      expect(response.status).toBe(200);
      const body = await response.text();
      expect(body).toContain('Rendered Product');
    });

    test('should return correct Content-Type header', async () => {
      const request = createRequest(validRequest);
      const response = await POST(request);

      expect(response.headers.get('Content-Type')).toBe('text/html; charset=utf-8');
    });

    test('should return rate limit headers', async () => {
      const request = createRequest(validRequest);
      const response = await POST(request);

      expect(response.headers.get('X-RateLimit-Limit')).toBe('100');
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('99');
    });
  });

  describe('validation errors', () => {
    // Note: Validation errors return 503 (not 400) by design.
    // This signals WordPress to use native rendering as a fallback.
    // The x-flexi-fallback header provides the reason.

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

    test('should return 503 for missing product_data', async () => {
      const { product_data: _product_data, ...withoutProduct } = validRequest;
      const request = createRequest(withoutProduct);
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

    test('should return 503 for invalid product_data', async () => {
      const request = createRequest({
        ...validRequest,
        product_data: { id: 'invalid' },
      });
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
      const { renderProductPage } = await import('@/adapter/renderers/product');
      vi.mocked(renderProductPage).mockRejectedValueOnce(new Error('Render failed'));

      const request = createRequest(validRequest);
      const response = await POST(request);

      expect(response.status).toBe(503);
    });

    test('should include x-flexi-fallback header on render error', async () => {
      const { renderProductPage } = await import('@/adapter/renderers/product');
      vi.mocked(renderProductPage).mockRejectedValueOnce(new Error('Render failed'));

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
        current: 100,
        limit: 100,
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
      const { renderProductPage } = await import('@/adapter/renderers/product');

      vi.mocked(checkRateLimit).mockReturnValueOnce({
        allowed: false,
        current: 100,
        limit: 100,
        retryAfter: 60,
        resetAt: Math.floor(Date.now() / 1000) + 60,
        remaining: 0,
      });

      const request = createRequest(validRequest);
      await POST(request);

      // Renderer should NOT be called when rate limited
      expect(renderProductPage).not.toHaveBeenCalled();
    });
  });
});

describe('GET /api/v1/product', () => {
  test('should return 405 Method Not Allowed', async () => {
    const response = await GET();

    expect(response.status).toBe(405);
    const body = await response.json();
    expect(body.error).toBe('Method not allowed');
  });
});
