/**
 * Tests for shared Zod schemas
 */

import { describe, it, expect } from 'vitest';
import { SiteInfoSchema } from '../shared';

describe('SiteInfoSchema', () => {
  // Valid data fixture
  const validSiteInfo = {
    currency: 'USD',
    currency_symbol: '$',
    currency_position: 'left' as const,
    thousand_separator: ',',
    decimal_separator: '.',
    price_decimals: 2,
  };

  describe('valid data', () => {
    it('should accept valid site info', () => {
      const result = SiteInfoSchema.safeParse(validSiteInfo);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currency).toBe('USD');
        expect(result.data.currency_symbol).toBe('$');
      }
    });

    it('should accept all valid currency positions', () => {
      const positions = ['left', 'right', 'left_space', 'right_space'] as const;

      for (const position of positions) {
        const result = SiteInfoSchema.safeParse({
          ...validSiteInfo,
          currency_position: position,
        });
        expect(result.success).toBe(true);
      }
    });

    it('should accept zero price decimals', () => {
      const result = SiteInfoSchema.safeParse({
        ...validSiteInfo,
        price_decimals: 0,
      });
      expect(result.success).toBe(true);
    });

    it('should accept max price decimals of 10', () => {
      const result = SiteInfoSchema.safeParse({
        ...validSiteInfo,
        price_decimals: 10,
      });
      expect(result.success).toBe(true);
    });

    it('should accept non-ASCII currency symbols', () => {
      const result = SiteInfoSchema.safeParse({
        ...validSiteInfo,
        currency_symbol: '€',
      });
      expect(result.success).toBe(true);
    });

    it('should accept multi-character currency symbols', () => {
      const result = SiteInfoSchema.safeParse({
        ...validSiteInfo,
        currency_symbol: 'kr',
      });
      expect(result.success).toBe(true);
    });

    it('should accept different thousand/decimal separators', () => {
      const result = SiteInfoSchema.safeParse({
        ...validSiteInfo,
        thousand_separator: '.',
        decimal_separator: ',',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('invalid data', () => {
    it('should reject missing currency', () => {
      const { currency: _currency, ...withoutCurrency } = validSiteInfo;
      const result = SiteInfoSchema.safeParse(withoutCurrency);
      expect(result.success).toBe(false);
    });

    it('should reject missing currency_symbol', () => {
      const { currency_symbol: _currency_symbol, ...withoutSymbol } = validSiteInfo;
      const result = SiteInfoSchema.safeParse(withoutSymbol);
      expect(result.success).toBe(false);
    });

    it('should reject invalid currency position', () => {
      const result = SiteInfoSchema.safeParse({
        ...validSiteInfo,
        currency_position: 'center',
      });
      expect(result.success).toBe(false);
    });

    it('should reject negative price decimals', () => {
      const result = SiteInfoSchema.safeParse({
        ...validSiteInfo,
        price_decimals: -1,
      });
      expect(result.success).toBe(false);
    });

    it('should reject price decimals over 10', () => {
      const result = SiteInfoSchema.safeParse({
        ...validSiteInfo,
        price_decimals: 11,
      });
      expect(result.success).toBe(false);
    });

    it('should reject non-integer price decimals', () => {
      const result = SiteInfoSchema.safeParse({
        ...validSiteInfo,
        price_decimals: 2.5,
      });
      expect(result.success).toBe(false);
    });

    it('should reject currency over max length', () => {
      const result = SiteInfoSchema.safeParse({
        ...validSiteInfo,
        currency: 'A'.repeat(11),
      });
      expect(result.success).toBe(false);
    });

    it('should reject currency_symbol over max length', () => {
      const result = SiteInfoSchema.safeParse({
        ...validSiteInfo,
        currency_symbol: '$'.repeat(11),
      });
      expect(result.success).toBe(false);
    });

    it('should reject thousand_separator over max length', () => {
      const result = SiteInfoSchema.safeParse({
        ...validSiteInfo,
        thousand_separator: ','.repeat(6),
      });
      expect(result.success).toBe(false);
    });

    it('should reject decimal_separator over max length', () => {
      const result = SiteInfoSchema.safeParse({
        ...validSiteInfo,
        decimal_separator: '.'.repeat(6),
      });
      expect(result.success).toBe(false);
    });

    it('should reject null input', () => {
      const result = SiteInfoSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it('should reject undefined input', () => {
      const result = SiteInfoSchema.safeParse(undefined);
      expect(result.success).toBe(false);
    });

    it('should reject empty object', () => {
      const result = SiteInfoSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
