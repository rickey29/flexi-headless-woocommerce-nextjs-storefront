/**
 * Tests for the PII sanitization utilities
 */

import { describe, it, expect } from 'vitest';
import {
  sanitizeAddress,
  sanitizeProductData,
  sanitizeCartData,
  sanitizeCheckoutData,
  sanitizeOrderData,
  sanitizeRenderRequest,
  sanitizePII,
} from '../sanitize';

describe('sanitizeAddress', () => {
  it('should return null for null input', () => {
    expect(sanitizeAddress(null)).toBeNull();
  });

  it('should return null for undefined input', () => {
    expect(sanitizeAddress(undefined)).toBeNull();
  });

  it('should mask first and last names', () => {
    const address = {
      first_name: 'John',
      last_name: 'Smith',
    };

    const result = sanitizeAddress(address);

    expect(result?.first_name).toBe('J***');
    expect(result?.last_name).toBe('S***');
  });

  it('should mask email addresses', () => {
    const address = {
      email: 'john.doe@example.com',
    };

    const result = sanitizeAddress(address);

    expect(result?.email).not.toBe('john.doe@example.com');
    expect(result?.email).toContain('@');
    expect(result?.email).toContain('***');
  });

  it('should mask phone numbers', () => {
    const address = {
      phone: '+1-555-123-4567',
    };

    const result = sanitizeAddress(address);

    expect(result?.phone).not.toBe('+1-555-123-4567');
    expect(result?.phone).toContain('***');
    expect(result?.phone).toContain('4567'); // Last 4 digits preserved
  });

  it('should mask street addresses', () => {
    const address = {
      address_1: '123 Main Street',
      address_2: 'Apt 4B',
    };

    const result = sanitizeAddress(address);

    expect(result?.address_1).toBe('123***');
    expect(result?.address_2).toBe('Apt***');
  });

  it('should mask city partially', () => {
    const address = {
      city: 'New York',
    };

    const result = sanitizeAddress(address);

    expect(result?.city).toBe('Ne***');
  });

  it('should preserve state and country', () => {
    const address = {
      state: 'NY',
      country: 'US',
    };

    const result = sanitizeAddress(address);

    expect(result?.state).toBe('NY');
    expect(result?.country).toBe('US');
  });

  it('should redact company name', () => {
    const address = {
      company: 'Acme Corp',
    };

    const result = sanitizeAddress(address);

    expect(result?.company).toBe('[redacted]');
  });

  it('should mask postcode', () => {
    const address = {
      postcode: '10001',
    };

    const result = sanitizeAddress(address);

    expect(result?.postcode).toBe('***');
  });
});

describe('sanitizeProductData', () => {
  it('should return null for null input', () => {
    expect(sanitizeProductData(null)).toBeNull();
  });

  it('should preserve non-sensitive product fields', () => {
    const product = {
      id: 123,
      name: 'Test Product',
      slug: 'test-product',
      type: 'simple',
      status: 'publish',
      sku: 'TEST-123',
      price: '29.99',
      regular_price: '39.99',
      sale_price: '29.99',
      on_sale: true,
      stock_status: 'instock',
    };

    const result = sanitizeProductData(product);

    expect(result?.id).toBe(123);
    expect(result?.name).toBe('Test Product');
    expect(result?.slug).toBe('test-product');
    expect(result?.sku).toBe('TEST-123');
    expect(result?.on_sale).toBe(true);
  });

  it('should count arrays instead of exposing full data', () => {
    const product = {
      categories: [{ id: 1 }, { id: 2 }],
      images: [{ src: 'img1.jpg' }, { src: 'img2.jpg' }, { src: 'img3.jpg' }],
      variations: [{ id: 10 }, { id: 11 }],
      attributes: [{ name: 'color' }],
    };

    const result = sanitizeProductData(product);

    expect(result?.categories_count).toBe(2);
    expect(result?.images_count).toBe(3);
    expect(result?.variations_count).toBe(2);
    expect(result?.has_attributes).toBe(true);
  });

  it('should handle empty arrays', () => {
    const product = {
      categories: [],
      images: [],
      variations: [],
      attributes: [],
    };

    const result = sanitizeProductData(product);

    expect(result?.categories_count).toBe(0);
    expect(result?.images_count).toBe(0);
    expect(result?.variations_count).toBe(0);
    expect(result?.has_attributes).toBe(false);
  });
});

describe('sanitizeCartData', () => {
  it('should return null for null input', () => {
    expect(sanitizeCartData(null)).toBeNull();
  });

  it('should preserve item count and formatted prices', () => {
    const cart = {
      items: [
        { product_id: 1, product_name: 'Item 1', quantity: 2, price_formatted: '$20.00' },
        { product_id: 2, product_name: 'Item 2', quantity: 1, price_formatted: '$15.00' },
      ],
      subtotal_formatted: '$55.00',
      total_formatted: '$60.00',
    };

    const result = sanitizeCartData(cart);

    expect(result?.items_count).toBe(2);
    expect(result?.subtotal_formatted).toBe('$55.00');
    expect(result?.total_formatted).toBe('$60.00');
  });

  it('should sanitize cart items', () => {
    const cart = {
      items: [{ product_id: 1, product_name: 'Item 1', quantity: 2, price_formatted: '$20.00' }],
    };

    const result = sanitizeCartData(cart);
    const items = result?.items as Array<Record<string, unknown>>;

    expect(items[0].product_id).toBe(1);
    expect(items[0].product_name).toBe('Item 1');
    expect(items[0].quantity).toBe(2);
  });

  it('should redact coupon details but preserve count', () => {
    const cart = {
      items: [],
      coupons: ['SAVE10', 'FREESHIP'],
    };

    const result = sanitizeCartData(cart);

    expect(result?.coupons_count).toBe(2);
  });
});

describe('sanitizeCheckoutData', () => {
  it('should return null for null input', () => {
    expect(sanitizeCheckoutData(null)).toBeNull();
  });

  it('should mask customer email', () => {
    const checkout = {
      customer_email: 'customer@example.com',
    };

    const result = sanitizeCheckoutData(checkout);

    expect(result?.customer_email).not.toBe('customer@example.com');
    expect(result?.customer_email).toContain('***');
  });

  it('should redact customer note', () => {
    const checkout = {
      customer_note: 'Please deliver after 5pm',
    };

    const result = sanitizeCheckoutData(checkout);

    expect(result?.customer_note).toBe('[redacted]');
  });

  it('should sanitize billing and shipping addresses', () => {
    const checkout = {
      billing_address: {
        first_name: 'John',
        email: 'john@example.com',
      },
      shipping_address: {
        first_name: 'Jane',
        phone: '+1-555-123-4567',
      },
    };

    const result = sanitizeCheckoutData(checkout);

    const billing = result?.billing_address as Record<string, unknown>;
    const shipping = result?.shipping_address as Record<string, unknown>;

    expect(billing?.first_name).toBe('J***');
    expect(shipping?.first_name).toBe('J***');
  });

  it('should preserve payment gateway IDs and titles only', () => {
    const checkout = {
      payment_gateways: [
        { id: 'stripe', title: 'Credit Card', description: 'Pay with card', settings: {} },
        { id: 'paypal', title: 'PayPal', api_key: 'secret' },
      ],
    };

    const result = sanitizeCheckoutData(checkout);
    const gateways = result?.payment_gateways as Array<Record<string, unknown>>;

    expect(gateways[0]).toEqual({ id: 'stripe', title: 'Credit Card' });
    expect(gateways[1]).toEqual({ id: 'paypal', title: 'PayPal' });
  });

  it('should preserve shipping method summary', () => {
    const checkout = {
      shipping_methods: [
        { id: 'flat_rate', label: 'Flat Rate', cost_formatted: '$10.00', secret: 'x' },
      ],
    };

    const result = sanitizeCheckoutData(checkout);
    const methods = result?.shipping_methods as Array<Record<string, unknown>>;

    expect(methods[0]).toEqual({
      id: 'flat_rate',
      label: 'Flat Rate',
      cost_formatted: '$10.00',
    });
  });
});

describe('sanitizeOrderData', () => {
  it('should return null for null input', () => {
    expect(sanitizeOrderData(null)).toBeNull();
  });

  it('should preserve order ID and number', () => {
    const order = {
      order_id: 12345,
      order_number: '#12345',
    };

    const result = sanitizeOrderData(order);

    expect(result?.order_id).toBe(12345);
    expect(result?.order_number).toBe('#12345');
  });

  it('should redact order key', () => {
    const order = {
      order_key: 'wc_order_abc123xyz',
    };

    const result = sanitizeOrderData(order);

    expect(result?.order_key).toBe('[redacted]');
  });

  it('should sanitize addresses', () => {
    const order = {
      billing_address: { first_name: 'John', email: 'john@test.com' },
      shipping_address: { first_name: 'Jane' },
    };

    const result = sanitizeOrderData(order);

    const billing = result?.billing_address as Record<string, unknown>;
    expect(billing?.first_name).toBe('J***');
  });

  it('should preserve order item summary', () => {
    const order = {
      items: [{ product_id: 1, name: 'Product A', quantity: 2, total_formatted: '$40.00' }],
    };

    const result = sanitizeOrderData(order);
    const items = result?.items as Array<Record<string, unknown>>;

    expect(items[0]).toEqual({
      product_id: 1,
      name: 'Product A',
      quantity: 2,
      total_formatted: '$40.00',
    });
    expect(result?.items_count).toBe(1);
  });
});

describe('sanitizeRenderRequest', () => {
  it('should return null for null input', () => {
    expect(sanitizeRenderRequest(null)).toBeNull();
  });

  it('should preserve home_url', () => {
    const request = {
      home_url: 'https://example.com',
    };

    const result = sanitizeRenderRequest(request);

    expect(result?.home_url).toBe('https://example.com');
  });

  it('should sanitize product_data if present', () => {
    const request = {
      home_url: 'https://example.com',
      product_data: {
        id: 123,
        name: 'Test Product',
        categories: [{ id: 1 }],
      },
    };

    const result = sanitizeRenderRequest(request);

    const product = result?.product_data as Record<string, unknown>;
    expect(product?.id).toBe(123);
    expect(product?.categories_count).toBe(1);
  });

  it('should sanitize cart_data if present', () => {
    const request = {
      home_url: 'https://example.com',
      cart_data: {
        items: [{ product_id: 1 }],
        total_formatted: '$50.00',
      },
    };

    const result = sanitizeRenderRequest(request);

    const cart = result?.cart_data as Record<string, unknown>;
    expect(cart?.items_count).toBe(1);
  });

  it('should sanitize checkout_data if present', () => {
    const request = {
      home_url: 'https://example.com',
      checkout_data: {
        customer_email: 'test@example.com',
      },
    };

    const result = sanitizeRenderRequest(request);

    const checkout = result?.checkout_data as Record<string, unknown>;
    expect(checkout?.customer_email).not.toBe('test@example.com');
  });

  it('should pass through site_info unchanged', () => {
    const request = {
      home_url: 'https://example.com',
      site_info: {
        currency: 'USD',
        locale: 'en_US',
      },
    };

    const result = sanitizeRenderRequest(request);

    expect(result?.site_info).toEqual({
      currency: 'USD',
      locale: 'en_US',
    });
  });

  it('should sanitize order_data when present', () => {
    const request = {
      home_url: 'https://example.com',
      order_data: {
        order_id: 12345,
        order_number: 'WC-12345',
        status: 'completed',
        billing_address: {
          first_name: 'John',
          last_name: 'Doe',
          email: 'customer@example.com',
          phone: '555-123-4567',
          address_1: '123 Main St',
          city: 'Anytown',
        },
        items: [{ product_id: 100, name: 'Product', quantity: 2 }],
        payment_method: 'stripe',
      },
    };

    const result = sanitizeRenderRequest(request);

    const order = result?.order_data as Record<string, unknown>;
    expect(order).toBeDefined();
    // Order ID and status should be preserved
    expect(order?.order_id).toBe(12345);
    expect(order?.order_number).toBe('WC-12345');
    expect(order?.status).toBe('completed');
    expect(order?.payment_method).toBe('stripe');
    // Items count should be computed
    expect(order?.items_count).toBe(1);
    // Billing address PII should be sanitized
    const billing = order?.billing_address as Record<string, unknown>;
    expect(billing?.first_name).not.toBe('John');
    expect(billing?.email).not.toBe('customer@example.com');
  });
});

describe('sanitizePII', () => {
  it('should return [invalid-input] for null', () => {
    expect(sanitizePII(null as unknown as string)).toBe('[invalid-input]');
  });

  it('should return [invalid-input] for non-string', () => {
    expect(sanitizePII(123 as unknown as string)).toBe('[invalid-input]');
  });

  it('should mask email addresses in text', () => {
    const text = 'Contact us at support@example.com for help';
    const result = sanitizePII(text);

    expect(result).not.toContain('support@example.com');
    expect(result).toContain('@');
    expect(result).toContain('***');
  });

  it('should mask phone numbers in text', () => {
    const text = 'Call us at 555-123-4567 for support';
    const result = sanitizePII(text);

    expect(result).not.toContain('555-123-4567');
    expect(result).toContain('4567'); // Last 4 preserved
  });

  it('should mask phone numbers with country code', () => {
    const text = 'International: +1-555-123-4567';
    const result = sanitizePII(text);

    expect(result).toContain('***');
    expect(result).toContain('4567');
  });

  it('should mask credit card numbers', () => {
    const text = 'Card: 4111-1111-1111-1111';
    const result = sanitizePII(text);

    expect(result).not.toContain('4111');
    expect(result).toContain('****-****-****-****');
  });

  it('should mask credit card numbers with spaces', () => {
    const text = 'Card: 4111 1111 1111 1111';
    const result = sanitizePII(text);

    expect(result).toContain('****');
  });

  it('should mask IP addresses', () => {
    const text = 'Request from 192.168.1.100';
    const result = sanitizePII(text);

    expect(result).not.toContain('192.168.1.100');
    expect(result).toContain('***.***.***.***');
  });

  it('should handle multiple PII types in same text', () => {
    const text = 'User john@test.com (555-123-4567) from 10.0.0.1 used card 4111111111111111';
    const result = sanitizePII(text);

    expect(result).not.toContain('john@test.com');
    expect(result).not.toContain('555-123-4567');
    expect(result).not.toContain('10.0.0.1');
    expect(result).not.toContain('4111111111111111');
  });

  it('should preserve non-PII text', () => {
    const text = 'Order #12345 contains 3 items';
    const result = sanitizePII(text);

    expect(result).toBe('Order #12345 contains 3 items');
  });
});
