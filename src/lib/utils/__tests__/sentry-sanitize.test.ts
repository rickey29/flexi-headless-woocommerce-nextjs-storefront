/**
 * Tests for Sentry PII Sanitization
 *
 * CRITICAL: This code protects customer PII. All functions must be thoroughly tested.
 */

import { describe, it, expect } from 'vitest';
import { sanitizeForSentry, sanitizeError, isSensitiveField } from '../sentry-sanitize';

describe('Sentry PII Sanitization', () => {
  describe('isSensitiveField', () => {
    it('should detect password fields', () => {
      expect(isSensitiveField('password')).toBe(true);
      expect(isSensitiveField('user_password')).toBe(true);
      expect(isSensitiveField('PASSWORD')).toBe(true);
    });

    it('should detect token fields', () => {
      expect(isSensitiveField('token')).toBe(true);
      expect(isSensitiveField('api_token')).toBe(true);
      expect(isSensitiveField('stripe_token')).toBe(true);
    });

    it('should detect api key fields', () => {
      expect(isSensitiveField('api_key')).toBe(true);
      expect(isSensitiveField('apikey')).toBe(true);
      expect(isSensitiveField('API_KEY')).toBe(true);
    });

    it('should not detect non-sensitive fields', () => {
      expect(isSensitiveField('username')).toBe(false);
      expect(isSensitiveField('email')).toBe(false);
      expect(isSensitiveField('product_id')).toBe(false);
    });
  });

  describe('Email Masking', () => {
    it('should mask email local part while keeping domain', () => {
      const data = { email: 'john.doe@example.com' };
      const result = sanitizeForSentry(data) as Record<string, unknown>;
      expect(result.email).toBe('j***@example.com');
    });

    it('should mask short email addresses', () => {
      const data = { email: 'a@example.com' };
      const result = sanitizeForSentry(data) as Record<string, unknown>;
      expect(result.email).toBe('***@example.com');
    });

    it('should handle billing_email field', () => {
      const data = { billing_email: 'customer@test.com' };
      const result = sanitizeForSentry(data) as Record<string, unknown>;
      expect(result.billing_email).toBe('c***@test.com');
    });

    it('should not mask invalid email formats without @', () => {
      const data = { email: 'not-an-email' };
      const result = sanitizeForSentry(data) as Record<string, unknown>;
      expect(result.email).toBe('not-an-email');
    });

    it('should not mask empty email', () => {
      const data = { email: '' };
      const result = sanitizeForSentry(data) as Record<string, unknown>;
      expect(result.email).toBe('');
    });

    it('should handle email with no local part', () => {
      const data = { email: '@example.com' };
      const result = sanitizeForSentry(data) as Record<string, unknown>;
      expect(result.email).toBe('[INVALID_EMAIL]');
    });
  });

  describe('Phone Number Masking', () => {
    it('should mask phone number keeping last 4 digits', () => {
      const data = { phone: '+1-555-123-4567' };
      const result = sanitizeForSentry(data) as Record<string, unknown>;
      expect(result.phone).toBe('***-***-4567');
    });

    it('should handle phone field variations', () => {
      const data = {
        phone: '555-1234',
        billing_phone: '(555) 123-4567',
        telephone: '555.123.4567',
      };
      const result = sanitizeForSentry(data) as Record<string, unknown>;
      expect(result.phone).toBe('***-***-1234');
      expect(result.billing_phone).toBe('***-***-4567');
      expect(result.telephone).toBe('***-***-4567');
    });

    it('should handle international phone format', () => {
      const data = { phone: '+44 20 7946 0958' };
      const result = sanitizeForSentry(data) as Record<string, unknown>;
      expect(result.phone).toBe('***-***-0958');
    });
  });

  describe('Name Masking', () => {
    it('should mask single name keeping first letter', () => {
      const data = { first_name: 'John' };
      const result = sanitizeForSentry(data) as Record<string, unknown>;
      expect(result.first_name).toBe('J***');
    });

    it('should mask full name', () => {
      const data = { name: 'John Doe' };
      const result = sanitizeForSentry(data) as Record<string, unknown>;
      expect(result.name).toBe('J*** D***');
    });

    it('should mask multiple name parts', () => {
      const data = { name: 'Mary Jane Watson' };
      const result = sanitizeForSentry(data) as Record<string, unknown>;
      expect(result.name).toBe('M*** J*** W***');
    });

    it('should handle last_name field', () => {
      const data = { last_name: 'Smith' };
      const result = sanitizeForSentry(data) as Record<string, unknown>;
      expect(result.last_name).toBe('S***');
    });
  });

  describe('Sensitive Field Redaction', () => {
    it('should completely redact password fields', () => {
      const data = {
        password: 'secret123',
        confirm_password: 'secret123',
      };
      const result = sanitizeForSentry(data) as Record<string, unknown>;
      expect(result.password).toBe('[REDACTED]');
      expect(result.confirm_password).toBe('[REDACTED]');
    });

    it('should redact all payment-related fields', () => {
      const data = {
        credit_card: '4111111111111111',
        card_number: '4111111111111111',
        cvv: '123',
        cvc: '456',
        stripe_token: 'tok_abc123',
        payment_token: 'pm_abc123',
      };
      const result = sanitizeForSentry(data) as Record<string, unknown>;
      expect(result.credit_card).toBe('[REDACTED]');
      expect(result.card_number).toBe('[REDACTED]');
      expect(result.cvv).toBe('[REDACTED]');
      expect(result.cvc).toBe('[REDACTED]');
      expect(result.stripe_token).toBe('[REDACTED]');
      expect(result.payment_token).toBe('[REDACTED]');
    });

    it('should redact authentication tokens', () => {
      const data = {
        token: 'abc123',
        api_key: 'key_abc123',
        apikey: 'key_xyz789',
        secret: 'my-secret',
        auth: 'Bearer token123',
      };
      const result = sanitizeForSentry(data) as Record<string, unknown>;
      expect(result.token).toBe('[REDACTED]');
      expect(result.api_key).toBe('[REDACTED]');
      expect(result.apikey).toBe('[REDACTED]');
      expect(result.secret).toBe('[REDACTED]');
      expect(result.auth).toBe('[REDACTED]');
    });

    it('should redact SSN and tax IDs', () => {
      const data = {
        ssn: '123-45-6789',
        tax_id: '12-3456789',
      };
      const result = sanitizeForSentry(data) as Record<string, unknown>;
      expect(result.ssn).toBe('[REDACTED]');
      expect(result.tax_id).toBe('[REDACTED]');
    });
  });

  describe('Address Sanitization', () => {
    it('should mask street addresses but keep city/state/country', () => {
      const data = {
        billing_address: {
          address_1: '123 Main St',
          address_2: 'Apt 4B',
          city: 'Springfield',
          state: 'IL',
          postcode: '62701',
          country: 'US',
        },
      };
      const result = sanitizeForSentry(data) as Record<string, unknown>;
      const address = result.billing_address as Record<string, unknown>;

      expect(address.address_1).toBe('[REDACTED]');
      expect(address.address_2).toBe('[REDACTED]');
      expect(address.city).toBe('Springfield');
      expect(address.state).toBe('IL');
      expect(address.postcode).toBe('62701');
      expect(address.country).toBe('US');
    });

    it('should handle address with line1/line2 format', () => {
      const data = {
        address: {
          line1: '789 Elm St',
          line2: 'Suite 100',
          city: 'Austin',
          state: 'TX',
        },
      };
      const result = sanitizeForSentry(data) as Record<string, unknown>;
      const address = result.address as Record<string, unknown>;

      expect(address.line1).toBe('[REDACTED]');
      expect(address.line2).toBe('[REDACTED]');
      expect(address.city).toBe('Austin');
      expect(address.state).toBe('TX');
    });
  });

  describe('Nested Objects', () => {
    it('should recursively sanitize nested objects', () => {
      const data = {
        user: {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'secret',
          metadata: {
            phone: '555-1234',
            api_key: 'key123',
          },
        },
      };
      const result = sanitizeForSentry(data) as Record<string, unknown>;
      const user = result.user as Record<string, unknown>;
      const metadata = user.metadata as Record<string, unknown>;

      expect(user.name).toBe('J*** D***');
      expect(user.email).toBe('j***@example.com');
      expect(user.password).toBe('[REDACTED]');
      expect(metadata.phone).toBe('***-***-1234');
      expect(metadata.api_key).toBe('[REDACTED]');
    });
  });

  describe('Arrays', () => {
    it('should sanitize arrays of objects', () => {
      const data = {
        users: [
          { name: 'Alice', email: 'alice@example.com' },
          { name: 'Bob', email: 'bob@example.com' },
        ],
      };
      const result = sanitizeForSentry(data) as Record<string, unknown>;
      const users = result.users as Array<Record<string, unknown>>;

      expect(users[0].name).toBe('A***');
      expect(users[0].email).toBe('a***@example.com');
      expect(users[1].name).toBe('B***');
      expect(users[1].email).toBe('b***@example.com');
    });

    it('should handle arrays with mixed types', () => {
      const data = {
        items: ['plain string', { email: 'test@example.com' }, 123, true],
      };
      const result = sanitizeForSentry(data) as Record<string, unknown>;
      const items = result.items as Array<unknown>;

      expect(items[0]).toBe('plain string');
      expect((items[1] as Record<string, unknown>).email).toBe('t***@example.com');
      expect(items[2]).toBe(123);
      expect(items[3]).toBe(true);
    });
  });

  describe('Primitive Types', () => {
    it('should preserve numbers', () => {
      const data = {
        price: 99.99,
        quantity: 5,
        user_id: 12345,
      };
      const result = sanitizeForSentry(data) as Record<string, unknown>;

      expect(result.price).toBe(99.99);
      expect(result.quantity).toBe(5);
      expect(result.user_id).toBe(12345);
    });

    it('should preserve booleans', () => {
      const data = {
        is_active: true,
        is_verified: false,
      };
      const result = sanitizeForSentry(data) as Record<string, unknown>;

      expect(result.is_active).toBe(true);
      expect(result.is_verified).toBe(false);
    });

    it('should preserve null and undefined', () => {
      const data = {
        field1: null,
        field2: undefined,
      };
      const result = sanitizeForSentry(data) as Record<string, unknown>;

      expect(result.field1).toBe(null);
      expect(result.field2).toBe(undefined);
    });

    it('should handle null input', () => {
      const result = sanitizeForSentry(null);
      expect(result).toBe(null);
    });

    it('should handle undefined input', () => {
      const result = sanitizeForSentry(undefined);
      expect(result).toBe(undefined);
    });

    it('should handle primitive string input', () => {
      const result = sanitizeForSentry('just a string');
      expect(result).toBe('just a string');
    });

    it('should handle number input', () => {
      const result = sanitizeForSentry(42);
      expect(result).toBe(42);
    });
  });

  describe('sanitizeError()', () => {
    it('should sanitize Error instances', () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n  at test.ts:10:5';

      const result = sanitizeError(error);

      expect(result.message).toBe('Test error');
      expect(result.name).toBe('Error');
      expect(result.stack).toBe('Error: Test error\n  at test.ts:10:5');
      expect(result.context).toBeUndefined();
    });

    it('should sanitize Error with context', () => {
      const error = new Error('Payment failed');
      const context = {
        user_email: 'customer@example.com',
        card_number: '4111111111111111',
        amount: 99.99,
      };

      const result = sanitizeError(error, context);
      const sanitizedContext = result.context as Record<string, unknown>;

      expect(result.message).toBe('Payment failed');
      expect(sanitizedContext.user_email).toBe('c***@example.com');
      expect(sanitizedContext.card_number).toBe('[REDACTED]');
      expect(sanitizedContext.amount).toBe(99.99);
    });

    it('should handle non-Error objects', () => {
      const error = 'String error message';

      const result = sanitizeError(error);

      expect(result.message).toBe('String error message');
      expect(result.name).toBe('Unknown Error');
      expect(result.stack).toBeUndefined();
    });

    it('should handle non-Error with context', () => {
      const error = { code: 'PAYMENT_FAILED' };
      const context = { token: 'abc123' };

      const result = sanitizeError(error, context);
      const sanitizedContext = result.context as Record<string, unknown>;

      expect(result.message).toBe('[object Object]');
      expect(result.name).toBe('Unknown Error');
      expect(sanitizedContext.token).toBe('[REDACTED]');
    });
  });

  describe('Real-world WooCommerce Data', () => {
    it('should sanitize real-world WooCommerce checkout data', () => {
      const data = {
        billing: {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          phone: '555-123-4567',
          address_1: '123 Main St',
          city: 'Springfield',
          state: 'IL',
          postcode: '62701',
        },
        payment_method: 'stripe',
        payment_token: 'tok_abc123',
        order_total: 149.99,
        items: [{ product_id: 123, quantity: 2 }],
      };

      const result = sanitizeForSentry(data) as Record<string, unknown>;
      const billing = result.billing as Record<string, unknown>;

      // Verify PII is masked
      expect(billing.first_name).toBe('J***');
      expect(billing.last_name).toBe('D***');
      expect(billing.email).toBe('j***@example.com');
      expect(billing.phone).toBe('***-***-4567');
      expect(billing.address_1).toBe('[REDACTED]');

      // Verify safe data is preserved
      expect(billing.city).toBe('Springfield');
      expect(billing.state).toBe('IL');
      expect(billing.postcode).toBe('62701');
      expect(result.payment_token).toBe('[REDACTED]');
      expect(result.payment_method).toBe('stripe');
      expect(result.order_total).toBe(149.99);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty objects', () => {
      const data = {};
      const result = sanitizeForSentry(data);
      expect(result).toEqual({});
    });

    it('should handle objects with only sensitive fields', () => {
      const data = {
        password: 'secret',
        api_key: 'key123',
        token: 'tok_abc',
      };
      const result = sanitizeForSentry(data) as Record<string, unknown>;

      expect(result.password).toBe('[REDACTED]');
      expect(result.api_key).toBe('[REDACTED]');
      expect(result.token).toBe('[REDACTED]');
    });
  });
});
