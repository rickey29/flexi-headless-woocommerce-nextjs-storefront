/**
 * Product Renderer Tests
 *
 * Tests for the product page rendering pipeline.
 */

import { describe, test, expect, vi } from 'vitest';
import { renderProductPage } from '../product';
import type { ProductRenderRequest } from '@/lib/schemas';

// Mock the template generator
vi.mock('@/lib/templates', () => ({
  generateProductHtml: vi.fn().mockReturnValue('<html><body>Generated HTML</body></html>'),
}));

// Valid test fixtures
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

const validRequest: ProductRenderRequest = {
  home_url: 'https://example.com',
  product_data: validProductData,
  site_info: validSiteInfo,
};

describe('renderProductPage', () => {
  describe('basic rendering', () => {
    test('should return HTML string', async () => {
      const result = await renderProductPage(validRequest);

      expect(typeof result).toBe('string');
      expect(result).toContain('<html>');
    });

    test('should call generateProductHtml with request data', async () => {
      const { generateProductHtml } = await import('@/lib/templates');

      await renderProductPage(validRequest);

      expect(generateProductHtml).toHaveBeenCalledWith(validRequest);
    });

    test('should be an async function', () => {
      const result = renderProductPage(validRequest);

      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('error handling', () => {
    test('should propagate template errors', async () => {
      const { generateProductHtml } = await import('@/lib/templates');
      vi.mocked(generateProductHtml).mockImplementationOnce(() => {
        throw new Error('Template error');
      });

      await expect(renderProductPage(validRequest)).rejects.toThrow('Template error');
    });
  });

  describe('data transformation', () => {
    test('should pass home_url to template generator', async () => {
      const { generateProductHtml } = await import('@/lib/templates');

      await renderProductPage({
        ...validRequest,
        home_url: 'https://custom-site.com',
      });

      expect(generateProductHtml).toHaveBeenCalledWith(
        expect.objectContaining({
          home_url: 'https://custom-site.com',
        }),
      );
    });

    test('should pass product_data to template generator', async () => {
      const { generateProductHtml } = await import('@/lib/templates');

      await renderProductPage(validRequest);

      expect(generateProductHtml).toHaveBeenCalledWith(
        expect.objectContaining({
          product_data: expect.objectContaining({
            id: 100,
            name: 'Test Product',
          }),
        }),
      );
    });

    test('should pass site_info to template generator', async () => {
      const { generateProductHtml } = await import('@/lib/templates');

      await renderProductPage(validRequest);

      expect(generateProductHtml).toHaveBeenCalledWith(
        expect.objectContaining({
          site_info: expect.objectContaining({
            currency: 'USD',
            currency_symbol: '$',
          }),
        }),
      );
    });
  });
});
