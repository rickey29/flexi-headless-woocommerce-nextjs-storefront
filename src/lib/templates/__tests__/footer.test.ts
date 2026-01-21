/**
 * Tests for the footer template
 */

import { describe, it, expect } from 'vitest';
import { footer } from '../footer';

describe('footer template', () => {
  const defaultOptions = {
    siteName: 'Test Store',
  };

  describe('structure', () => {
    it('should return valid footer element', () => {
      const result = footer(defaultOptions);
      expect(result).toMatch(/^<footer/);
      expect(result).toMatch(/<\/footer>$/);
    });

    it('should include site name', () => {
      const result = footer(defaultOptions);
      expect(result).toContain('Test Store');
    });

    it('should include copyright symbol', () => {
      const result = footer(defaultOptions);
      expect(result).toContain('&copy;');
    });

    it('should include FlexiWoo attribution', () => {
      const result = footer(defaultOptions);
      expect(result).toContain('FlexiWoo');
      expect(result).toContain('Powered by');
    });

    it('should include link to FlexiWoo', () => {
      const result = footer(defaultOptions);
      expect(result).toContain('href=');
      expect(result).toContain('flexiwoo');
    });
  });

  describe('current year', () => {
    it('should include a 4-digit year', () => {
      const result = footer(defaultOptions);
      // Match any 4-digit year pattern
      expect(result).toMatch(/&copy; \d{4}/);
    });

    it('should include current year', () => {
      const currentYear = new Date().getFullYear();
      const result = footer(defaultOptions);
      expect(result).toContain(currentYear.toString());
    });
  });

  describe('Storefront styling', () => {
    it('should include top margin', () => {
      const result = footer(defaultOptions);
      expect(result).toContain('mt-12');
    });

    it('should include border styling', () => {
      const result = footer(defaultOptions);
      expect(result).toContain('border-t');
      expect(result).toContain('border-storefront-border');
    });

    it('should include storefront background', () => {
      const result = footer(defaultOptions);
      expect(result).toContain('bg-storefront-bg');
    });

    it('should include light text color', () => {
      const result = footer(defaultOptions);
      expect(result).toContain('text-storefront-text-light');
    });

    it('should include centered text', () => {
      const result = footer(defaultOptions);
      expect(result).toContain('text-center');
    });

    it('should include small text size', () => {
      const result = footer(defaultOptions);
      expect(result).toContain('text-sm');
    });

    it('should include responsive container', () => {
      const result = footer(defaultOptions);
      expect(result).toContain('max-w-6xl');
      expect(result).toContain('mx-auto');
    });

    it('should include hover state for link', () => {
      const result = footer(defaultOptions);
      expect(result).toContain('hover:text-woo-purple');
      expect(result).toContain('hover:underline');
    });
  });

  describe('XSS protection', () => {
    it('should escape HTML in site name', () => {
      const result = footer({
        siteName: '<script>alert("xss")</script>',
      });
      expect(result).not.toContain('<script>alert');
      expect(result).toContain('&lt;script&gt;');
    });

    it('should escape special characters in site name', () => {
      const result = footer({
        siteName: 'Store "Name" & <Company>',
      });
      expect(result).toContain('&quot;Name&quot;');
      expect(result).toContain('&amp;');
      expect(result).toContain('&lt;Company&gt;');
    });
  });
});
