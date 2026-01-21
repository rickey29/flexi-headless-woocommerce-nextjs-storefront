/**
 * Tests for product-related Zod schemas
 */

import { describe, it, expect } from 'vitest';
import {
  ProductImageSchema,
  ProductAttributeSchema,
  ProductVariationSchema,
  ProductCategorySchema,
  ProductTagSchema,
  RelatedProductSchema,
  ProductDimensionsSchema,
  ProductDataSchema,
  ProductRenderRequestSchema,
} from '../product';

// Test fixtures
const validImage = {
  id: 123,
  url: 'https://example.com/image.jpg',
  srcset: 'https://example.com/image-300.jpg 300w, https://example.com/image-600.jpg 600w',
  sizes: '(max-width: 600px) 300px, 600px',
  alt: 'Product image',
};

const validAttribute = {
  name: 'Color',
  slug: 'pa_color',
  options: ['Red', 'Blue', 'Green'],
  visible: true,
  variation: true,
};

const validVariation = {
  id: 456,
  sku: 'PROD-VAR-001',
  price: 1999,
  price_formatted: '$19.99',
  regular_price: 2499,
  regular_price_formatted: '$24.99',
  sale_price: 1999,
  sale_price_formatted: '$19.99',
  on_sale: true,
  stock_status: 'instock' as const,
  stock_quantity: 50,
  attributes: { pa_color: 'Red', pa_size: 'Large' },
  image: validImage,
};

const validCategory = {
  id: 10,
  name: 'Electronics',
  slug: 'electronics',
  permalink: 'https://example.com/category/electronics',
};

const validTag = {
  id: 20,
  name: 'Sale',
  slug: 'sale',
  permalink: 'https://example.com/tag/sale',
};

const validRelatedProduct = {
  id: 789,
  name: 'Related Product',
  price_formatted: '$29.99',
  image: validImage,
  permalink: 'https://example.com/product/related',
};

const validDimensions = {
  length: '10',
  width: '5',
  height: '3',
};

const validSiteInfo = {
  currency: 'USD',
  currency_symbol: '$',
  currency_position: 'left' as const,
  thousand_separator: ',',
  decimal_separator: '.',
  price_decimals: 2,
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
  gallery_images: [validImage],
  stock_status: 'instock' as const,
  stock_quantity: 100,
  manage_stock: true,
  backorders_allowed: false,
  is_low_stock: false,
  variations: [],
  attributes: [],
  default_attributes: {},
  categories: [validCategory],
  tags: [validTag],
  related_products: [validRelatedProduct],
  upsell_products: [],
  average_rating: 4.5,
  review_count: 25,
  reviews_allowed: true,
  weight: '1.5',
  dimensions: validDimensions,
  purchasable: true,
  virtual: false,
  downloadable: false,
};

describe('ProductImageSchema', () => {
  describe('valid data', () => {
    it('should accept valid image data', () => {
      const result = ProductImageSchema.safeParse(validImage);
      expect(result.success).toBe(true);
    });

    it('should accept empty alt text', () => {
      const result = ProductImageSchema.safeParse({
        ...validImage,
        alt: '',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('invalid data', () => {
    it('should reject missing id', () => {
      const { id: _id, ...withoutId } = validImage;
      const result = ProductImageSchema.safeParse(withoutId);
      expect(result.success).toBe(false);
    });

    it('should reject non-numeric id', () => {
      const result = ProductImageSchema.safeParse({
        ...validImage,
        id: 'abc',
      });
      expect(result.success).toBe(false);
    });

    it('should reject URL over max length', () => {
      const result = ProductImageSchema.safeParse({
        ...validImage,
        url: 'https://example.com/' + 'a'.repeat(2048),
      });
      expect(result.success).toBe(false);
    });

    it('should reject srcset over max length', () => {
      const result = ProductImageSchema.safeParse({
        ...validImage,
        srcset: 'a'.repeat(4097),
      });
      expect(result.success).toBe(false);
    });

    it('should reject sizes over max length', () => {
      const result = ProductImageSchema.safeParse({
        ...validImage,
        sizes: 'a'.repeat(513),
      });
      expect(result.success).toBe(false);
    });

    it('should reject alt over max length', () => {
      const result = ProductImageSchema.safeParse({
        ...validImage,
        alt: 'a'.repeat(513),
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('ProductAttributeSchema', () => {
  describe('valid data', () => {
    it('should accept valid attribute data', () => {
      const result = ProductAttributeSchema.safeParse(validAttribute);
      expect(result.success).toBe(true);
    });

    it('should accept empty options array', () => {
      const result = ProductAttributeSchema.safeParse({
        ...validAttribute,
        options: [],
      });
      expect(result.success).toBe(true);
    });

    it('should transform number options to strings (WordPress quirk)', () => {
      const result = ProductAttributeSchema.safeParse({
        ...validAttribute,
        options: [1, 2, 3],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.options).toEqual(['1', '2', '3']);
      }
    });

    it('should handle mixed string and number options', () => {
      const result = ProductAttributeSchema.safeParse({
        ...validAttribute,
        options: ['Red', 42, 'Blue', 100],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.options).toEqual(['Red', '42', 'Blue', '100']);
      }
    });
  });

  describe('invalid data', () => {
    it('should reject options array over max length', () => {
      const result = ProductAttributeSchema.safeParse({
        ...validAttribute,
        options: Array(101).fill('option'),
      });
      expect(result.success).toBe(false);
    });

    it('should reject name over max length', () => {
      const result = ProductAttributeSchema.safeParse({
        ...validAttribute,
        name: 'a'.repeat(256),
      });
      expect(result.success).toBe(false);
    });

    it('should reject non-boolean visible', () => {
      const result = ProductAttributeSchema.safeParse({
        ...validAttribute,
        visible: 'yes',
      });
      expect(result.success).toBe(false);
    });

    it('should reject non-boolean variation', () => {
      const result = ProductAttributeSchema.safeParse({
        ...validAttribute,
        variation: 1,
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('ProductVariationSchema', () => {
  describe('valid data', () => {
    it('should accept valid variation data', () => {
      const result = ProductVariationSchema.safeParse(validVariation);
      expect(result.success).toBe(true);
    });

    it('should accept null sale_price', () => {
      const result = ProductVariationSchema.safeParse({
        ...validVariation,
        sale_price: null,
        sale_price_formatted: null,
        on_sale: false,
      });
      expect(result.success).toBe(true);
    });

    it('should accept null image', () => {
      const result = ProductVariationSchema.safeParse({
        ...validVariation,
        image: null,
      });
      expect(result.success).toBe(true);
    });

    it('should accept null stock_quantity', () => {
      const result = ProductVariationSchema.safeParse({
        ...validVariation,
        stock_quantity: null,
      });
      expect(result.success).toBe(true);
    });

    it('should accept all valid stock statuses', () => {
      const statuses = ['instock', 'outofstock', 'onbackorder'] as const;
      for (const status of statuses) {
        const result = ProductVariationSchema.safeParse({
          ...validVariation,
          stock_status: status,
        });
        expect(result.success).toBe(true);
      }
    });

    it('should accept stock_quantity of -1 (unlimited)', () => {
      const result = ProductVariationSchema.safeParse({
        ...validVariation,
        stock_quantity: -1,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('invalid data', () => {
    it('should reject invalid stock status', () => {
      const result = ProductVariationSchema.safeParse({
        ...validVariation,
        stock_status: 'available',
      });
      expect(result.success).toBe(false);
    });

    it('should reject negative price', () => {
      const result = ProductVariationSchema.safeParse({
        ...validVariation,
        price: -1,
      });
      expect(result.success).toBe(false);
    });

    it('should reject price over max', () => {
      const result = ProductVariationSchema.safeParse({
        ...validVariation,
        price: 100000001,
      });
      expect(result.success).toBe(false);
    });

    it('should reject stock_quantity under -1', () => {
      const result = ProductVariationSchema.safeParse({
        ...validVariation,
        stock_quantity: -2,
      });
      expect(result.success).toBe(false);
    });

    it('should reject stock_quantity over max', () => {
      const result = ProductVariationSchema.safeParse({
        ...validVariation,
        stock_quantity: 1000001,
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('ProductCategorySchema', () => {
  describe('valid data', () => {
    it('should accept valid category data', () => {
      const result = ProductCategorySchema.safeParse(validCategory);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid data', () => {
    it('should reject missing id', () => {
      const { id: _id, ...withoutId } = validCategory;
      const result = ProductCategorySchema.safeParse(withoutId);
      expect(result.success).toBe(false);
    });

    it('should reject name over max length', () => {
      const result = ProductCategorySchema.safeParse({
        ...validCategory,
        name: 'a'.repeat(256),
      });
      expect(result.success).toBe(false);
    });

    it('should reject permalink over max length', () => {
      const result = ProductCategorySchema.safeParse({
        ...validCategory,
        permalink: 'https://example.com/' + 'a'.repeat(2048),
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('ProductTagSchema', () => {
  describe('valid data', () => {
    it('should accept valid tag data', () => {
      const result = ProductTagSchema.safeParse(validTag);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid data', () => {
    it('should reject missing slug', () => {
      const { slug: _slug, ...withoutSlug } = validTag;
      const result = ProductTagSchema.safeParse(withoutSlug);
      expect(result.success).toBe(false);
    });
  });
});

describe('RelatedProductSchema', () => {
  describe('valid data', () => {
    it('should accept valid related product data', () => {
      const result = RelatedProductSchema.safeParse(validRelatedProduct);
      expect(result.success).toBe(true);
    });

    it('should accept null image', () => {
      const result = RelatedProductSchema.safeParse({
        ...validRelatedProduct,
        image: null,
      });
      expect(result.success).toBe(true);
    });
  });
});

describe('ProductDimensionsSchema', () => {
  describe('valid data', () => {
    it('should accept valid dimensions', () => {
      const result = ProductDimensionsSchema.safeParse(validDimensions);
      expect(result.success).toBe(true);
    });

    it('should accept empty dimension strings', () => {
      const result = ProductDimensionsSchema.safeParse({
        length: '',
        width: '',
        height: '',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('invalid data', () => {
    it('should reject dimension over max length', () => {
      const result = ProductDimensionsSchema.safeParse({
        ...validDimensions,
        length: 'a'.repeat(51),
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('ProductDataSchema', () => {
  describe('valid data', () => {
    it('should accept valid product data', () => {
      const result = ProductDataSchema.safeParse(validProductData);
      expect(result.success).toBe(true);
    });

    it('should accept all valid product types', () => {
      const types = ['simple', 'variable', 'grouped', 'external'] as const;
      for (const type of types) {
        const result = ProductDataSchema.safeParse({
          ...validProductData,
          type,
        });
        expect(result.success).toBe(true);
      }
    });

    it('should accept null sale prices', () => {
      const result = ProductDataSchema.safeParse({
        ...validProductData,
        sale_price: null,
        sale_price_formatted: null,
        on_sale: false,
      });
      expect(result.success).toBe(true);
    });

    it('should accept null image', () => {
      const result = ProductDataSchema.safeParse({
        ...validProductData,
        image: null,
      });
      expect(result.success).toBe(true);
    });

    it('should accept null stock_quantity', () => {
      const result = ProductDataSchema.safeParse({
        ...validProductData,
        stock_quantity: null,
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty arrays for gallery, variations, attributes', () => {
      const result = ProductDataSchema.safeParse({
        ...validProductData,
        gallery_images: [],
        variations: [],
        attributes: [],
        categories: [],
        tags: [],
        related_products: [],
        upsell_products: [],
      });
      expect(result.success).toBe(true);
    });

    it('should transform empty array default_attributes to empty object (WordPress quirk)', () => {
      const result = ProductDataSchema.safeParse({
        ...validProductData,
        default_attributes: [],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.default_attributes).toEqual({});
      }
    });

    it('should accept object default_attributes', () => {
      const result = ProductDataSchema.safeParse({
        ...validProductData,
        default_attributes: { pa_color: 'Red', pa_size: 'Large' },
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.default_attributes).toEqual({ pa_color: 'Red', pa_size: 'Large' });
      }
    });

    it('should accept zero rating', () => {
      const result = ProductDataSchema.safeParse({
        ...validProductData,
        average_rating: 0,
        review_count: 0,
      });
      expect(result.success).toBe(true);
    });

    it('should accept max rating of 5', () => {
      const result = ProductDataSchema.safeParse({
        ...validProductData,
        average_rating: 5,
      });
      expect(result.success).toBe(true);
    });

    it('should accept product with variations', () => {
      const result = ProductDataSchema.safeParse({
        ...validProductData,
        type: 'variable',
        variations: [validVariation],
        attributes: [validAttribute],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('invalid data', () => {
    it('should reject empty name', () => {
      const result = ProductDataSchema.safeParse({
        ...validProductData,
        name: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject name over max length', () => {
      const result = ProductDataSchema.safeParse({
        ...validProductData,
        name: 'a'.repeat(256),
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid product type', () => {
      const result = ProductDataSchema.safeParse({
        ...validProductData,
        type: 'subscription',
      });
      expect(result.success).toBe(false);
    });

    it('should reject negative price', () => {
      const result = ProductDataSchema.safeParse({
        ...validProductData,
        price: -1,
      });
      expect(result.success).toBe(false);
    });

    it('should reject price over max (100M)', () => {
      const result = ProductDataSchema.safeParse({
        ...validProductData,
        price: 100000001,
      });
      expect(result.success).toBe(false);
    });

    it('should reject rating over 5', () => {
      const result = ProductDataSchema.safeParse({
        ...validProductData,
        average_rating: 5.1,
      });
      expect(result.success).toBe(false);
    });

    it('should reject negative rating', () => {
      const result = ProductDataSchema.safeParse({
        ...validProductData,
        average_rating: -0.1,
      });
      expect(result.success).toBe(false);
    });

    it('should reject negative review_count', () => {
      const result = ProductDataSchema.safeParse({
        ...validProductData,
        review_count: -1,
      });
      expect(result.success).toBe(false);
    });

    it('should reject non-integer review_count', () => {
      const result = ProductDataSchema.safeParse({
        ...validProductData,
        review_count: 25.5,
      });
      expect(result.success).toBe(false);
    });

    it('should reject description over max length', () => {
      const result = ProductDataSchema.safeParse({
        ...validProductData,
        description: 'a'.repeat(100001),
      });
      expect(result.success).toBe(false);
    });

    it('should reject short_description over max length', () => {
      const result = ProductDataSchema.safeParse({
        ...validProductData,
        short_description: 'a'.repeat(5001),
      });
      expect(result.success).toBe(false);
    });

    it('should reject gallery_images over max count', () => {
      const result = ProductDataSchema.safeParse({
        ...validProductData,
        gallery_images: Array(51).fill(validImage),
      });
      expect(result.success).toBe(false);
    });

    it('should reject variations over max count', () => {
      const result = ProductDataSchema.safeParse({
        ...validProductData,
        variations: Array(501).fill(validVariation),
      });
      expect(result.success).toBe(false);
    });

    it('should reject attributes over max count', () => {
      const result = ProductDataSchema.safeParse({
        ...validProductData,
        attributes: Array(51).fill(validAttribute),
      });
      expect(result.success).toBe(false);
    });

    it('should reject categories over max count', () => {
      const result = ProductDataSchema.safeParse({
        ...validProductData,
        categories: Array(101).fill(validCategory),
      });
      expect(result.success).toBe(false);
    });

    it('should reject tags over max count', () => {
      const result = ProductDataSchema.safeParse({
        ...validProductData,
        tags: Array(101).fill(validTag),
      });
      expect(result.success).toBe(false);
    });

    it('should reject related_products over max count', () => {
      const result = ProductDataSchema.safeParse({
        ...validProductData,
        related_products: Array(51).fill(validRelatedProduct),
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const { id: _id, ...withoutId } = validProductData;
      const result = ProductDataSchema.safeParse(withoutId);
      expect(result.success).toBe(false);
    });
  });
});

describe('ProductRenderRequestSchema', () => {
  const validRequest = {
    home_url: 'https://example.com',
    product_data: validProductData,
    site_info: validSiteInfo,
  };

  describe('valid data', () => {
    it('should accept valid render request', () => {
      const result = ProductRenderRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should accept localhost URL', () => {
      const result = ProductRenderRequestSchema.safeParse({
        ...validRequest,
        home_url: 'http://localhost:8080',
      });
      expect(result.success).toBe(true);
    });

    it('should accept URL with path', () => {
      const result = ProductRenderRequestSchema.safeParse({
        ...validRequest,
        home_url: 'https://example.com/shop',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('invalid data', () => {
    it('should reject invalid URL format', () => {
      const result = ProductRenderRequestSchema.safeParse({
        ...validRequest,
        home_url: 'not-a-url',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const urlIssue = result.error.issues.find((i) => i.path.includes('home_url'));
        expect(urlIssue?.message).toBe('Invalid URL format for home_url');
      }
    });

    it('should reject URL without protocol', () => {
      const result = ProductRenderRequestSchema.safeParse({
        ...validRequest,
        home_url: 'example.com',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing home_url', () => {
      const { home_url: _home_url, ...withoutUrl } = validRequest;
      const result = ProductRenderRequestSchema.safeParse(withoutUrl);
      expect(result.success).toBe(false);
    });

    it('should reject missing product_data', () => {
      const { product_data: _product_data, ...withoutProduct } = validRequest;
      const result = ProductRenderRequestSchema.safeParse(withoutProduct);
      expect(result.success).toBe(false);
    });

    it('should reject missing site_info', () => {
      const { site_info: _site_info, ...withoutSiteInfo } = validRequest;
      const result = ProductRenderRequestSchema.safeParse(withoutSiteInfo);
      expect(result.success).toBe(false);
    });

    it('should reject invalid product_data', () => {
      const result = ProductRenderRequestSchema.safeParse({
        ...validRequest,
        product_data: { id: 'invalid' },
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid site_info', () => {
      const result = ProductRenderRequestSchema.safeParse({
        ...validRequest,
        site_info: { currency: 'USD' },
      });
      expect(result.success).toBe(false);
    });

    it('should reject null input', () => {
      const result = ProductRenderRequestSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it('should reject empty object', () => {
      const result = ProductRenderRequestSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
