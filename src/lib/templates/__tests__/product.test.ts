/**
 * Tests for product page templates
 */

import { describe, it, expect } from 'vitest';
import {
  generateProductImages,
  generateMainImage,
  generateGallery,
} from '../product/product-images';
import { generateProductInfo } from '../product/product-info';
import { generateAddToCart } from '../product/product-actions';
import { generateProductTabs } from '../product/product-tabs';
import { generateRelatedProducts } from '../product/product-related';
import { generateCategories } from '../product/product-categories';
import { generateProductHtml } from '../product';

// Test fixtures
const validImage = {
  id: 1,
  url: 'https://example.com/image.jpg',
  srcset: 'https://example.com/image-300.jpg 300w',
  sizes: '(max-width: 600px) 300px',
  alt: 'Test image',
};

const validProductRequest = {
  home_url: 'https://example.com',
  product_data: {
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
    gallery_images: [validImage, validImage],
    stock_status: 'instock' as const,
    stock_quantity: 100,
    manage_stock: true,
    backorders_allowed: false,
    is_low_stock: false,
    variations: [],
    attributes: [],
    default_attributes: {},
    categories: [
      {
        id: 10,
        name: 'Electronics',
        slug: 'electronics',
        permalink: 'https://example.com/category/electronics',
      },
    ],
    tags: [],
    related_products: [
      {
        id: 200,
        name: 'Related Product',
        price_formatted: '$19.99',
        image: validImage,
        permalink: 'https://example.com/product/related',
      },
    ],
    upsell_products: [],
    average_rating: 4.5,
    review_count: 25,
    reviews_allowed: true,
    weight: '1.5',
    dimensions: { length: '10', width: '5', height: '3' },
    purchasable: true,
    virtual: false,
    downloadable: false,
  },
  site_info: {
    currency: 'USD',
    currency_symbol: '$',
    currency_position: 'left' as const,
    thousand_separator: ',',
    decimal_separator: '.',
    price_decimals: 2,
  },
};

describe('generateProductImages', () => {
  describe('main image', () => {
    it('should render main image when provided', () => {
      const result = generateMainImage({
        image: validImage,
        galleryImages: [],
        productName: 'Test',
      });
      expect(result).toContain('<img');
      expect(result).toContain('src="https://example.com/image.jpg"');
    });

    it('should include srcset attribute', () => {
      const result = generateMainImage({
        image: validImage,
        galleryImages: [],
        productName: 'Test',
      });
      expect(result).toContain('srcset=');
    });

    it('should include sizes attribute', () => {
      const result = generateMainImage({
        image: validImage,
        galleryImages: [],
        productName: 'Test',
      });
      expect(result).toContain('sizes=');
    });

    it('should render placeholder when no image', () => {
      const result = generateMainImage({
        image: null,
        galleryImages: [],
        productName: 'Test',
      });
      expect(result).not.toContain('<img');
      expect(result).toContain('No image');
    });

    it('should use product name as alt fallback', () => {
      const result = generateMainImage({
        image: { ...validImage, alt: '' },
        galleryImages: [],
        productName: 'Fallback Name',
      });
      expect(result).toContain('alt="Fallback Name"');
    });
  });

  describe('gallery', () => {
    it('should return empty string when no gallery images', () => {
      const result = generateGallery({
        image: null,
        galleryImages: [],
        productName: 'Test',
      });
      expect(result).toBe('');
    });

    it('should render gallery images', () => {
      const result = generateGallery({
        image: null,
        galleryImages: [validImage, validImage],
        productName: 'Test',
      });
      expect(result).toContain('grid');
      expect((result.match(/<img/g) || []).length).toBe(2);
    });

    it('should limit gallery to 4 images', () => {
      const result = generateGallery({
        image: null,
        galleryImages: [validImage, validImage, validImage, validImage, validImage, validImage],
        productName: 'Test',
      });
      expect((result.match(/<img/g) || []).length).toBe(4);
    });

    it('should include hover styling', () => {
      const result = generateGallery({
        image: null,
        galleryImages: [validImage],
        productName: 'Test',
      });
      expect(result).toContain('hover:border-woo-purple');
    });
  });

  describe('complete section', () => {
    it('should render both main image and gallery', () => {
      const result = generateProductImages({
        image: validImage,
        galleryImages: [validImage],
        productName: 'Test',
      });
      expect((result.match(/<img/g) || []).length).toBe(2);
    });
  });
});

describe('generateProductInfo', () => {
  const baseInfo = {
    name: 'Test Product',
    averageRating: 4.5,
    reviewCount: 25,
    priceFormatted: '$29.99',
    onSale: false,
    stockStatus: 'instock' as const,
    stockQuantity: 100,
    isLowStock: false,
  };

  describe('product name', () => {
    it('should render product name in h1', () => {
      const result = generateProductInfo(baseInfo);
      expect(result).toContain('<h1');
      expect(result).toContain('Test Product');
    });

    it('should escape HTML in name', () => {
      const result = generateProductInfo({
        ...baseInfo,
        name: '<script>alert(1)</script>',
      });
      expect(result).not.toContain('<script>alert');
    });
  });

  describe('rating', () => {
    it('should render rating when reviews exist', () => {
      const result = generateProductInfo(baseInfo);
      expect(result).toContain('★');
      expect(result).toContain('25');
    });

    it('should not render rating when no reviews', () => {
      const result = generateProductInfo({
        ...baseInfo,
        reviewCount: 0,
      });
      expect(result).not.toContain('★');
    });
  });

  describe('price', () => {
    it('should render price', () => {
      const result = generateProductInfo(baseInfo);
      expect(result).toContain('$29.99');
    });

    it('should render sale price with strikethrough', () => {
      const result = generateProductInfo({
        ...baseInfo,
        onSale: true,
        regularPriceFormatted: '$39.99',
      });
      expect(result).toContain('$29.99');
      expect(result).toContain('$39.99');
      expect(result).toContain('line-through');
    });
  });

  describe('SKU', () => {
    it('should render SKU when provided', () => {
      const result = generateProductInfo({
        ...baseInfo,
        sku: 'TEST-001',
      });
      expect(result).toContain('SKU:');
      expect(result).toContain('TEST-001');
    });

    it('should not render SKU when not provided', () => {
      const result = generateProductInfo(baseInfo);
      expect(result).not.toContain('SKU:');
    });
  });

  describe('short description', () => {
    it('should render short description when provided', () => {
      const result = generateProductInfo({
        ...baseInfo,
        shortDescription: '<p>This is a description</p>',
      });
      expect(result).toContain('This is a description');
    });

    it('should not render short description when not provided', () => {
      const result = generateProductInfo(baseInfo);
      // Should not have extra div for description
      expect(result).not.toContain('text-storefront-text-light">undefined');
    });
  });

  describe('stock status', () => {
    it('should show "In stock" for in stock items', () => {
      const result = generateProductInfo(baseInfo);
      expect(result).toContain('In stock');
      expect(result).toContain('text-storefront-success');
    });

    it('should show low stock warning', () => {
      const result = generateProductInfo({
        ...baseInfo,
        isLowStock: true,
        stockQuantity: 3,
      });
      expect(result).toContain('Only 3 left in stock');
      expect(result).toContain('text-storefront-info');
    });

    it('should show "Out of stock" for out of stock items', () => {
      const result = generateProductInfo({
        ...baseInfo,
        stockStatus: 'outofstock',
      });
      expect(result).toContain('Out of stock');
      expect(result).toContain('text-storefront-error');
    });

    it('should show "Available on backorder" for backorder items', () => {
      const result = generateProductInfo({
        ...baseInfo,
        stockStatus: 'onbackorder',
      });
      expect(result).toContain('Available on backorder');
    });
  });
});

describe('generateAddToCart', () => {
  const baseData = {
    productId: 100,
    homeUrl: 'https://example.com',
    purchasable: true,
    stockStatus: 'instock' as const,
  };

  describe('form rendering', () => {
    it('should render form when purchasable and in stock', () => {
      const result = generateAddToCart(baseData);
      expect(result).toContain('<form');
      expect(result).toContain('</form>');
    });

    it('should include quantity input', () => {
      const result = generateAddToCart(baseData);
      expect(result).toContain('type="number"');
      expect(result).toContain('name="quantity"');
      expect(result).toContain('value="1"');
      expect(result).toContain('min="1"');
    });

    it('should include submit button', () => {
      const result = generateAddToCart(baseData);
      expect(result).toContain('type="submit"');
      expect(result).toContain('Add to Cart');
    });

    it('should include correct form action', () => {
      const result = generateAddToCart(baseData);
      expect(result).toContain('action="');
      expect(result).toContain('?add-to-cart=100');
    });

    it('should use POST method', () => {
      const result = generateAddToCart(baseData);
      expect(result).toContain('method="post"');
    });
  });

  describe('disabled states', () => {
    it('should return empty string when not purchasable', () => {
      const result = generateAddToCart({
        ...baseData,
        purchasable: false,
      });
      expect(result).toBe('');
    });

    it('should return empty string when out of stock', () => {
      const result = generateAddToCart({
        ...baseData,
        stockStatus: 'outofstock',
      });
      expect(result).toBe('');
    });

    it('should render form when on backorder', () => {
      const result = generateAddToCart({
        ...baseData,
        stockStatus: 'onbackorder',
      });
      expect(result).toContain('<form');
    });
  });

  describe('styling', () => {
    it('should include Storefront button styling', () => {
      const result = generateAddToCart(baseData);
      expect(result).toContain('bg-storefront-text');
      expect(result).toContain('hover:bg-woo-purple');
    });

    it('should include focus ring styling', () => {
      const result = generateAddToCart(baseData);
      expect(result).toContain('focus:ring-woo-purple');
    });
  });

  describe('XSS protection', () => {
    it('should sanitize dangerous URLs in homeUrl', () => {
      const result = generateAddToCart({
        ...baseData,
        homeUrl: 'javascript:alert(1)',
      });
      expect(result).not.toContain('javascript:');
    });
  });
});

describe('generateProductTabs', () => {
  describe('rendering', () => {
    it('should return empty string when no description', () => {
      const result = generateProductTabs({ description: undefined });
      expect(result).toBe('');
    });

    it('should return empty string for empty description', () => {
      const result = generateProductTabs({ description: '' });
      expect(result).toBe('');
    });

    it('should render description when provided', () => {
      const result = generateProductTabs({
        description: '<p>This is the full description</p>',
      });
      expect(result).toContain('This is the full description');
    });

    it('should render Description tab heading', () => {
      const result = generateProductTabs({ description: 'Test' });
      expect(result).toContain('Description');
    });
  });

  describe('styling', () => {
    it('should include border styling for tab', () => {
      const result = generateProductTabs({ description: 'Test' });
      expect(result).toContain('border-b-2');
      expect(result).toContain('border-woo-purple');
    });

    it('should include top margin', () => {
      const result = generateProductTabs({ description: 'Test' });
      expect(result).toContain('mt-10');
    });
  });
});

describe('generateRelatedProducts', () => {
  const relatedProducts = [
    {
      id: 200,
      name: 'Related 1',
      price_formatted: '$19.99',
      image: validImage,
      permalink: 'https://example.com/product/related-1',
    },
    {
      id: 201,
      name: 'Related 2',
      price_formatted: '$29.99',
      image: null,
      permalink: 'https://example.com/product/related-2',
    },
  ];

  describe('rendering', () => {
    it('should return empty string for empty array', () => {
      const result = generateRelatedProducts([]);
      expect(result).toBe('');
    });

    it('should render related products section', () => {
      const result = generateRelatedProducts(relatedProducts);
      expect(result).toContain('Related Products');
    });

    it('should render all products', () => {
      const result = generateRelatedProducts(relatedProducts);
      expect(result).toContain('Related 1');
      expect(result).toContain('Related 2');
    });

    it('should use product card grid', () => {
      const result = generateRelatedProducts(relatedProducts);
      expect(result).toContain('grid');
    });
  });

  describe('styling', () => {
    it('should include top margin', () => {
      const result = generateRelatedProducts(relatedProducts);
      expect(result).toContain('mt-12');
    });

    it('should include heading styling', () => {
      const result = generateRelatedProducts(relatedProducts);
      expect(result).toContain('text-xl');
    });
  });
});

describe('generateCategories', () => {
  const categories = [
    {
      id: 10,
      name: 'Electronics',
      slug: 'electronics',
      permalink: 'https://example.com/category/electronics',
    },
    { id: 11, name: 'Gadgets', slug: 'gadgets', permalink: 'https://example.com/category/gadgets' },
  ];

  describe('rendering', () => {
    it('should return empty string for empty array', () => {
      const result = generateCategories([]);
      expect(result).toBe('');
    });

    it('should render category label', () => {
      const result = generateCategories(categories);
      expect(result).toContain('Category:');
    });

    it('should render all categories', () => {
      const result = generateCategories(categories);
      expect(result).toContain('Electronics');
      expect(result).toContain('Gadgets');
    });

    it('should render categories as links', () => {
      const result = generateCategories(categories);
      expect(result).toContain('href="https://example.com/category/electronics"');
      expect(result).toContain('href="https://example.com/category/gadgets"');
    });

    it('should separate categories with commas', () => {
      const result = generateCategories(categories);
      expect(result).toContain(', ');
    });
  });

  describe('styling', () => {
    it('should include hover effect', () => {
      const result = generateCategories(categories);
      expect(result).toContain('hover:text-woo-purple');
      expect(result).toContain('hover:underline');
    });
  });

  describe('XSS protection', () => {
    it('should escape HTML in category name', () => {
      const result = generateCategories([
        {
          id: 10,
          name: '<script>alert(1)</script>',
          slug: 'test',
          permalink: 'https://example.com',
        },
      ]);
      expect(result).not.toContain('<script>alert');
    });

    it('should sanitize dangerous URLs', () => {
      const result = generateCategories([
        { id: 10, name: 'Test', slug: 'test', permalink: 'javascript:alert(1)' },
      ]);
      expect(result).not.toContain('javascript:');
    });
  });
});

describe('generateProductHtml', () => {
  describe('document structure', () => {
    it('should return valid HTML document', () => {
      const result = generateProductHtml(validProductRequest);
      expect(result).toMatch(/^<!DOCTYPE html>/);
      expect(result).toContain('<html');
      expect(result).toContain('</html>');
    });

    it('should include head section', () => {
      const result = generateProductHtml(validProductRequest);
      expect(result).toContain('<head>');
      expect(result).toContain('</head>');
    });

    it('should include body section', () => {
      const result = generateProductHtml(validProductRequest);
      expect(result).toContain('<body');
      expect(result).toContain('</body>');
    });

    it('should include header', () => {
      const result = generateProductHtml(validProductRequest);
      expect(result).toContain('<header');
      expect(result).toContain('</header>');
    });

    it('should include footer', () => {
      const result = generateProductHtml(validProductRequest);
      expect(result).toContain('<footer');
      expect(result).toContain('</footer>');
    });

    it('should include main element', () => {
      const result = generateProductHtml(validProductRequest);
      expect(result).toContain('<main');
      expect(result).toContain('</main>');
    });
  });

  describe('content integration', () => {
    it('should include product title in page title', () => {
      const result = generateProductHtml(validProductRequest);
      expect(result).toContain('<title>Test Product - Store</title>');
    });

    it('should include canonical URL', () => {
      const result = generateProductHtml(validProductRequest);
      expect(result).toContain('rel="canonical"');
      expect(result).toContain(validProductRequest.product_data.permalink);
    });

    it('should include product name', () => {
      const result = generateProductHtml(validProductRequest);
      expect(result).toContain('Test Product');
    });

    it('should include product price', () => {
      const result = generateProductHtml(validProductRequest);
      expect(result).toContain('$29.99');
    });

    it('should include product image', () => {
      const result = generateProductHtml(validProductRequest);
      expect(result).toContain('https://example.com/image.jpg');
    });

    it('should include add to cart form', () => {
      const result = generateProductHtml(validProductRequest);
      expect(result).toContain('Add to Cart');
    });

    it('should include categories', () => {
      const result = generateProductHtml(validProductRequest);
      expect(result).toContain('Electronics');
    });

    it('should include related products', () => {
      const result = generateProductHtml(validProductRequest);
      expect(result).toContain('Related Products');
      expect(result).toContain('Related Product');
    });

    it('should include description tab', () => {
      const result = generateProductHtml(validProductRequest);
      expect(result).toContain('Description');
      expect(result).toContain('Full description');
    });
  });

  describe('responsive layout', () => {
    it('should include responsive grid', () => {
      const result = generateProductHtml(validProductRequest);
      expect(result).toContain('grid-cols-1');
      expect(result).toContain('md:grid-cols-2');
    });

    it('should include responsive padding', () => {
      const result = generateProductHtml(validProductRequest);
      expect(result).toContain('px-4');
      expect(result).toContain('sm:px-6');
      expect(result).toContain('lg:px-8');
    });
  });

  describe('edge cases', () => {
    it('should handle product with no image', () => {
      const request = {
        ...validProductRequest,
        product_data: {
          ...validProductRequest.product_data,
          image: null,
          gallery_images: [],
        },
      };
      const result = generateProductHtml(request);
      expect(result).toContain('No image');
    });

    it('should handle product with no categories', () => {
      const request = {
        ...validProductRequest,
        product_data: {
          ...validProductRequest.product_data,
          categories: [],
        },
      };
      const result = generateProductHtml(request);
      expect(result).not.toContain('Category:');
    });

    it('should handle product with no related products', () => {
      const request = {
        ...validProductRequest,
        product_data: {
          ...validProductRequest.product_data,
          related_products: [],
        },
      };
      const result = generateProductHtml(request);
      expect(result).not.toContain('Related Products');
    });

    it('should handle product with no description', () => {
      const request = {
        ...validProductRequest,
        product_data: {
          ...validProductRequest.product_data,
          description: '',
        },
      };
      const result = generateProductHtml(request);
      // Should not have description tab
      expect(result).not.toMatch(/<h3[^>]*>Description<\/h3>/);
    });

    it('should handle out of stock product', () => {
      const request = {
        ...validProductRequest,
        product_data: {
          ...validProductRequest.product_data,
          stock_status: 'outofstock' as const,
          purchasable: true,
        },
      };
      const result = generateProductHtml(request);
      expect(result).toContain('Out of stock');
      expect(result).not.toContain('Add to Cart');
    });
  });
});
