/**
 * Tests for the head template
 */

import { describe, it, expect } from 'vitest';
import { head } from '../head';

describe('head template', () => {
  describe('required elements', () => {
    it('should return valid head element', () => {
      const result = head({ title: 'Test Page' });
      expect(result).toMatch(/^<head>/);
      expect(result).toMatch(/<\/head>$/);
    });

    it('should include charset meta tag', () => {
      const result = head({ title: 'Test' });
      expect(result).toContain('<meta charset="UTF-8">');
    });

    it('should include viewport meta tag', () => {
      const result = head({ title: 'Test' });
      expect(result).toContain('name="viewport"');
      expect(result).toContain('width=device-width');
    });

    it('should include title', () => {
      const result = head({ title: 'My Product Page' });
      expect(result).toContain('<title>My Product Page</title>');
    });

    it('should include Tailwind CSS CDN script', () => {
      const result = head({ title: 'Test' });
      expect(result).toContain('cdn.jsdelivr.net');
      expect(result).toContain('@tailwindcss/browser');
    });

    it('should include Google Fonts preconnect', () => {
      const result = head({ title: 'Test' });
      expect(result).toContain('fonts.googleapis.com');
      expect(result).toContain('fonts.gstatic.com');
    });

    it('should include Source Sans Pro font', () => {
      const result = head({ title: 'Test' });
      expect(result).toContain('Source+Sans+Pro');
    });
  });

  describe('Storefront theme styles', () => {
    it('should include Storefront color variables', () => {
      const result = head({ title: 'Test' });
      expect(result).toContain('--color-woo-purple');
      expect(result).toContain('#7f54b3');
    });

    it('should include storefront-text color', () => {
      const result = head({ title: 'Test' });
      expect(result).toContain('--color-storefront-text');
      expect(result).toContain('#43454b');
    });

    it('should include storefront-success color', () => {
      const result = head({ title: 'Test' });
      expect(result).toContain('--color-storefront-success');
      expect(result).toContain('#0f834d');
    });

    it('should include storefront-error color', () => {
      const result = head({ title: 'Test' });
      expect(result).toContain('--color-storefront-error');
      expect(result).toContain('#e2401c');
    });

    it('should include base font styles', () => {
      const result = head({ title: 'Test' });
      expect(result).toContain('font-family');
      expect(result).toContain('Source Sans Pro');
    });

    it('should include light heading weights', () => {
      const result = head({ title: 'Test' });
      expect(result).toContain('h1, h2, h3, h4, h5, h6');
      expect(result).toContain('font-weight: 300');
    });
  });

  describe('optional elements', () => {
    it('should include description meta tag when provided', () => {
      const result = head({
        title: 'Test',
        description: 'This is a test description',
      });
      expect(result).toContain('name="description"');
      expect(result).toContain('This is a test description');
    });

    it('should not include description meta tag when not provided', () => {
      const result = head({ title: 'Test' });
      expect(result).not.toContain('name="description"');
    });

    it('should include canonical URL when provided', () => {
      const result = head({
        title: 'Test',
        canonicalUrl: 'https://example.com/product/test',
      });
      expect(result).toContain('rel="canonical"');
      expect(result).toContain('https://example.com/product/test');
    });

    it('should not include canonical URL when not provided', () => {
      const result = head({ title: 'Test' });
      expect(result).not.toContain('rel="canonical"');
    });
  });

  describe('XSS protection', () => {
    it('should escape HTML in title', () => {
      const result = head({ title: '<script>alert("xss")</script>' });
      expect(result).not.toContain('<script>alert');
      expect(result).toContain('&lt;script&gt;');
    });

    it('should escape HTML in description', () => {
      const result = head({
        title: 'Test',
        description: '<img src=x onerror=alert(1)>',
      });
      expect(result).not.toContain('<img src=x');
      expect(result).toContain('&lt;img');
    });

    it('should escape HTML in canonical URL', () => {
      const result = head({
        title: 'Test',
        canonicalUrl: 'https://example.com/"><script>alert(1)</script>',
      });
      expect(result).not.toContain('"><script>');
      expect(result).toContain('&quot;');
    });

    it('should escape special characters in title', () => {
      const result = head({ title: 'Product "Name" & <Info>' });
      expect(result).toContain('&quot;Name&quot;');
      expect(result).toContain('&amp;');
      expect(result).toContain('&lt;Info&gt;');
    });
  });
});
