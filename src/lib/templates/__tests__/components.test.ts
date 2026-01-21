/**
 * Tests for reusable UI components
 */

import { describe, it, expect } from 'vitest';
import { rating } from '../components/rating';
import { price } from '../components/price';
import { productCard, productCardsGrid } from '../components/product-card';

describe('rating component', () => {
  describe('rendering', () => {
    it('should return empty string when review count is 0', () => {
      const result = rating({ averageRating: 0, reviewCount: 0 });
      expect(result).toBe('');
    });

    it('should render stars when reviews exist', () => {
      const result = rating({ averageRating: 4, reviewCount: 10 });
      expect(result).toContain('★');
    });

    it('should render review count', () => {
      const result = rating({ averageRating: 4, reviewCount: 25 });
      expect(result).toContain('25');
      expect(result).toContain('reviews');
    });

    it('should render correct number of stars for rating 5', () => {
      const result = rating({ averageRating: 5, reviewCount: 1 });
      expect(result).toContain('★★★★★');
    });

    it('should render correct number of stars for rating 3', () => {
      const result = rating({ averageRating: 3, reviewCount: 1 });
      expect(result).toContain('★★★');
      // Should not have more than 3 stars
      expect((result.match(/★/g) || []).length).toBe(3);
    });

    it('should render correct number of stars for rating 1', () => {
      const result = rating({ averageRating: 1, reviewCount: 1 });
      expect((result.match(/★/g) || []).length).toBe(1);
    });

    it('should round decimal ratings', () => {
      const result = rating({ averageRating: 4.7, reviewCount: 1 });
      // 4.7 rounds to 5 stars
      expect((result.match(/★/g) || []).length).toBe(5);
    });

    it('should round down for lower decimals', () => {
      const result = rating({ averageRating: 4.2, reviewCount: 1 });
      // 4.2 rounds to 4 stars
      expect((result.match(/★/g) || []).length).toBe(4);
    });
  });

  describe('styling', () => {
    it('should include flex container', () => {
      const result = rating({ averageRating: 4, reviewCount: 5 });
      expect(result).toContain('flex');
      expect(result).toContain('items-center');
    });

    it('should include yellow color for stars', () => {
      const result = rating({ averageRating: 4, reviewCount: 5 });
      expect(result).toContain('text-yellow-500');
    });

    it('should include light text for review count', () => {
      const result = rating({ averageRating: 4, reviewCount: 5 });
      expect(result).toContain('text-storefront-text-light');
    });
  });
});

describe('price component', () => {
  describe('regular price', () => {
    it('should render price when not on sale', () => {
      const result = price({
        priceFormatted: '$29.99',
        onSale: false,
      });
      expect(result).toContain('$29.99');
    });

    it('should not include strikethrough when not on sale', () => {
      const result = price({
        priceFormatted: '$29.99',
        onSale: false,
      });
      expect(result).not.toContain('line-through');
    });

    it('should include semibold text', () => {
      const result = price({
        priceFormatted: '$29.99',
        onSale: false,
      });
      expect(result).toContain('font-semibold');
    });
  });

  describe('sale price', () => {
    it('should render both prices when on sale', () => {
      const result = price({
        priceFormatted: '$19.99',
        regularPriceFormatted: '$29.99',
        onSale: true,
      });
      expect(result).toContain('$19.99');
      expect(result).toContain('$29.99');
    });

    it('should strikethrough regular price when on sale', () => {
      const result = price({
        priceFormatted: '$19.99',
        regularPriceFormatted: '$29.99',
        onSale: true,
      });
      expect(result).toContain('line-through');
    });

    it('should render sale price in success color', () => {
      const result = price({
        priceFormatted: '$19.99',
        regularPriceFormatted: '$29.99',
        onSale: true,
      });
      expect(result).toContain('text-storefront-success');
    });

    it('should render regular price in light color', () => {
      const result = price({
        priceFormatted: '$19.99',
        regularPriceFormatted: '$29.99',
        onSale: true,
      });
      expect(result).toContain('text-storefront-text-light');
    });

    it('should render regular price only when on_sale but no regular price provided', () => {
      const result = price({
        priceFormatted: '$19.99',
        onSale: true,
        // regularPriceFormatted not provided
      });
      expect(result).toContain('$19.99');
      expect(result).not.toContain('line-through');
    });
  });

  describe('XSS protection', () => {
    it('should escape HTML in price', () => {
      const result = price({
        priceFormatted: '<script>alert(1)</script>',
        onSale: false,
      });
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });

    it('should escape HTML in regular price', () => {
      const result = price({
        priceFormatted: '$19.99',
        regularPriceFormatted: '<img src=x onerror=alert(1)>',
        onSale: true,
      });
      expect(result).not.toContain('<img');
      expect(result).toContain('&lt;img');
    });
  });
});

describe('productCard component', () => {
  const defaultProduct = {
    name: 'Test Product',
    permalink: 'https://example.com/product/test',
    priceFormatted: '$29.99',
    image: {
      url: 'https://example.com/image.jpg',
      alt: 'Product image',
    },
  };

  describe('rendering', () => {
    it('should render product name', () => {
      const result = productCard(defaultProduct);
      expect(result).toContain('Test Product');
    });

    it('should render product link', () => {
      const result = productCard(defaultProduct);
      expect(result).toContain('href="https://example.com/product/test"');
    });

    it('should render price', () => {
      const result = productCard(defaultProduct);
      expect(result).toContain('$29.99');
    });

    it('should render image when provided', () => {
      const result = productCard(defaultProduct);
      expect(result).toContain('<img');
      expect(result).toContain('src="https://example.com/image.jpg"');
      expect(result).toContain('alt="Product image"');
    });

    it('should render placeholder when no image', () => {
      const result = productCard({
        ...defaultProduct,
        image: undefined,
      });
      expect(result).not.toContain('<img');
      expect(result).toContain('bg-storefront-bg');
    });

    it('should use product name as alt text fallback', () => {
      const result = productCard({
        ...defaultProduct,
        image: {
          url: 'https://example.com/image.jpg',
          // alt not provided
        },
      });
      expect(result).toContain('alt="Test Product"');
    });
  });

  describe('styling', () => {
    it('should include group class for hover effects', () => {
      const result = productCard(defaultProduct);
      expect(result).toContain('class="group');
    });

    it('should include hover effect on name', () => {
      const result = productCard(defaultProduct);
      expect(result).toContain('group-hover:text-woo-purple');
    });

    it('should include border on image container', () => {
      const result = productCard(defaultProduct);
      expect(result).toContain('border-storefront-border');
    });

    it('should include aspect-square for image', () => {
      const result = productCard(defaultProduct);
      expect(result).toContain('aspect-square');
    });
  });

  describe('XSS protection', () => {
    it('should escape HTML in product name', () => {
      const result = productCard({
        ...defaultProduct,
        name: '<script>alert(1)</script>',
      });
      expect(result).not.toContain('<script>alert');
      expect(result).toContain('&lt;script&gt;');
    });

    it('should sanitize dangerous URL in permalink', () => {
      const result = productCard({
        ...defaultProduct,
        permalink: 'javascript:alert(1)',
      });
      expect(result).not.toContain('javascript:');
      expect(result).toContain('href="#"');
    });

    it('should escape HTML in image URL', () => {
      const result = productCard({
        ...defaultProduct,
        image: {
          url: 'https://example.com/image.jpg"><script>alert(1)</script>',
          alt: 'Test',
        },
      });
      expect(result).not.toContain('"><script>');
      expect(result).toContain('&quot;');
    });

    it('should escape HTML in price', () => {
      const result = productCard({
        ...defaultProduct,
        priceFormatted: '<script>alert(1)</script>',
      });
      expect(result).not.toContain('<script>alert');
    });
  });
});

describe('productCardsGrid component', () => {
  const products = [
    {
      name: 'Product 1',
      permalink: 'https://example.com/product/1',
      priceFormatted: '$10.00',
    },
    {
      name: 'Product 2',
      permalink: 'https://example.com/product/2',
      priceFormatted: '$20.00',
    },
    {
      name: 'Product 3',
      permalink: 'https://example.com/product/3',
      priceFormatted: '$30.00',
    },
  ];

  describe('rendering', () => {
    it('should return empty string for empty array', () => {
      const result = productCardsGrid([]);
      expect(result).toBe('');
    });

    it('should render all products', () => {
      const result = productCardsGrid(products);
      expect(result).toContain('Product 1');
      expect(result).toContain('Product 2');
      expect(result).toContain('Product 3');
    });

    it('should render single product', () => {
      const result = productCardsGrid([products[0]]);
      expect(result).toContain('Product 1');
    });
  });

  describe('styling', () => {
    it('should include grid container', () => {
      const result = productCardsGrid(products);
      expect(result).toContain('grid');
    });

    it('should include 2 columns on mobile', () => {
      const result = productCardsGrid(products);
      expect(result).toContain('grid-cols-2');
    });

    it('should include 4 columns on medium screens', () => {
      const result = productCardsGrid(products);
      expect(result).toContain('md:grid-cols-4');
    });

    it('should include gap between items', () => {
      const result = productCardsGrid(products);
      expect(result).toContain('gap-6');
    });
  });
});
