/**
 * Currency utility tests
 *
 * Tests for currency formatting with ISO 4217 standards.
 */

import { describe, test, expect, vi, afterEach } from 'vitest';
import { formatCurrency } from '@/core/utils/currency';

describe('formatCurrency', () => {
  describe('standard 2-decimal currencies', () => {
    test('should format USD with 2 decimal places', () => {
      const result = formatCurrency(19.99, 'USD', 'en-US');

      expect(result).toContain('19');
      expect(result).toContain('99');
    });

    test('should format EUR with 2 decimal places', () => {
      const result = formatCurrency(29.5, 'EUR', 'de-DE');

      expect(result).toContain('29');
      // May be formatted as 29,50 in de-DE locale
      expect(result).toMatch(/50/);
    });

    test('should format GBP with 2 decimal places', () => {
      const result = formatCurrency(15, 'GBP', 'en-GB');

      expect(result).toContain('15');
      // Padded to 15.00
      expect(result).toMatch(/15[.,]00/);
    });

    test('should pad decimals for whole numbers', () => {
      const result = formatCurrency(100, 'USD', 'en-US');

      expect(result).toContain('100');
      // Padded with decimals
      expect(result).toMatch(/100[.,]00/);
    });
  });

  describe('zero-decimal currencies', () => {
    test('should format JPY without decimal places', () => {
      const result = formatCurrency(1500, 'JPY', 'ja-JP');

      // Result contains the number (possibly with thousands separator)
      expect(result).toMatch(/1[,.\s]?500/);
      // Should not end with .00 or ,00 (two zeros after separator)
      expect(result).not.toMatch(/[.,]00$/);
    });

    test('should format KRW without decimal places', () => {
      const result = formatCurrency(50000, 'KRW', 'ko-KR');

      expect(result).toContain('50');
      // Should not end with .00 or ,00
      expect(result).not.toMatch(/[.,]00$/);
    });

    test('should format VND without decimal places', () => {
      const result = formatCurrency(100000, 'VND', 'vi-VN');

      // Should not end with .00 or ,00
      expect(result).not.toMatch(/[.,]00$/);
    });

    test('should format CLP without decimal places', () => {
      const result = formatCurrency(5000, 'CLP');

      expect(result).not.toMatch(/[.,]00$/);
    });

    test('should format ISK without decimal places', () => {
      const result = formatCurrency(1500, 'ISK');

      expect(result).not.toMatch(/[.,]00$/);
    });

    test('should format HUF without decimal places', () => {
      const result = formatCurrency(3500, 'HUF', 'hu-HU');

      expect(result).not.toMatch(/[.,]00$/);
    });

    test('should format TWD without decimal places', () => {
      const result = formatCurrency(1000, 'TWD', 'zh-TW');

      expect(result).not.toMatch(/[.,]00$/);
    });
  });

  describe('three-decimal currencies', () => {
    test('should format BHD with 3 decimal places', () => {
      const result = formatCurrency(10.5, 'BHD');

      // Should have 3 decimal places: 10.500
      expect(result).toContain('500');
    });

    test('should format KWD with 3 decimal places', () => {
      const result = formatCurrency(5.123, 'KWD');

      // Should preserve all 3 decimal places
      expect(result).toContain('123');
    });

    test('should format OMR with 3 decimal places', () => {
      const result = formatCurrency(25, 'OMR');

      // Should pad to 3 decimal places: 25.000
      expect(result).toContain('000');
    });

    test('should format TND with 3 decimal places', () => {
      const result = formatCurrency(100.456, 'TND');

      // Should preserve all 3 decimal places
      expect(result).toContain('456');
    });
  });

  describe('locale normalization', () => {
    test('should convert underscore to hyphen in locale (en_US -> en-US)', () => {
      // This should not throw an error
      const result = formatCurrency(19.99, 'USD', 'en_US');

      expect(result).toContain('19');
      expect(result).toContain('99');
    });

    test('should handle WordPress-style locales (de_DE)', () => {
      const result = formatCurrency(29.99, 'EUR', 'de_DE');

      expect(result).toContain('29');
      expect(result).toContain('99');
    });

    test('should handle locale with region (fr_FR)', () => {
      const result = formatCurrency(45.5, 'EUR', 'fr_FR');

      expect(result).toContain('45');
      expect(result).toContain('50');
    });
  });

  describe('fallback behavior', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('should use fallback symbol when Intl fails', () => {
      vi.spyOn(Intl, 'NumberFormat').mockImplementation(() => {
        throw new Error('Unsupported');
      });

      const result = formatCurrency(19.99, 'XYZ', undefined, '$');

      expect(result).toBe('$19.99');
    });

    test('should use currency code when Intl fails and no fallback symbol', () => {
      vi.spyOn(Intl, 'NumberFormat').mockImplementation(() => {
        throw new Error('Unsupported');
      });

      const result = formatCurrency(19.99, 'XYZ');

      expect(result).toBe('XYZ 19.99');
    });

    test('should respect decimal places in fallback', () => {
      vi.spyOn(Intl, 'NumberFormat').mockImplementation(() => {
        throw new Error('Unsupported');
      });

      const result = formatCurrency(1500, 'JPY', undefined, '¥');

      expect(result).toBe('¥1500');
    });

    test('should use 3 decimals in fallback for 3-decimal currencies', () => {
      vi.spyOn(Intl, 'NumberFormat').mockImplementation(() => {
        throw new Error('Unsupported');
      });

      const result = formatCurrency(10.5, 'BHD', undefined, 'BD');

      expect(result).toBe('BD10.500');
    });
  });

  describe('custom decimal places override', () => {
    test('should use custom decimal places when provided', () => {
      // Force 4 decimal places on USD (normally 2)
      const result = formatCurrency(19.9999, 'USD', 'en-US', undefined, 4);

      expect(result).toContain('9999');
    });

    test('should override zero-decimal currency', () => {
      // Force 2 decimal places on JPY (normally 0)
      const result = formatCurrency(1500.5, 'JPY', 'en-US', undefined, 2);

      expect(result).toContain('50');
    });

    test('should work with fallback when custom decimals provided', () => {
      vi.spyOn(Intl, 'NumberFormat').mockImplementation(() => {
        throw new Error('Unsupported');
      });

      const result = formatCurrency(19.1234, 'XYZ', undefined, '$', 4);

      expect(result).toBe('$19.1234');
    });
  });

  describe('edge cases', () => {
    test('should handle zero amount', () => {
      const result = formatCurrency(0, 'USD', 'en-US');

      expect(result).toContain('0');
      expect(result).toContain('00');
    });

    test('should handle negative amounts', () => {
      const result = formatCurrency(-19.99, 'USD', 'en-US');

      expect(result).toContain('19');
      expect(result).toContain('99');
      // Should have minus sign in some form
      expect(result).toMatch(/[-−]/);
    });

    test('should handle very large numbers', () => {
      const result = formatCurrency(1000000000, 'USD', 'en-US');

      expect(result).toContain('1');
    });

    test('should handle very small decimals', () => {
      const result = formatCurrency(0.01, 'USD', 'en-US');

      expect(result).toContain('01');
    });

    test('should handle undefined locale', () => {
      const result = formatCurrency(19.99, 'USD');

      expect(result).toContain('19');
      expect(result).toContain('99');
    });

    test('should handle lowercase currency codes', () => {
      const result = formatCurrency(1500, 'jpy', 'ja-JP');

      // Should still work (internal uppercasing)
      expect(result).toBeDefined();
    });
  });
});
