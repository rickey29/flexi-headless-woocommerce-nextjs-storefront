/**
 * Tests for the header template
 */

import { describe, it, expect } from 'vitest';
import { header } from '../header';

describe('header template', () => {
  const defaultOptions = {
    siteName: 'Test Store',
    homeUrl: 'https://example.com',
  };

  describe('structure', () => {
    it('should return valid header element', () => {
      const result = header(defaultOptions);
      expect(result).toMatch(/^<header/);
      expect(result).toMatch(/<\/header>$/);
    });

    it('should include site name', () => {
      const result = header(defaultOptions);
      expect(result).toContain('Test Store');
    });

    it('should include home URL link', () => {
      const result = header(defaultOptions);
      expect(result).toContain('href="https://example.com"');
    });

    it('should include anchor tag for logo', () => {
      const result = header(defaultOptions);
      expect(result).toContain('<a href=');
      expect(result).toContain('</a>');
    });
  });

  describe('Storefront styling', () => {
    it('should include border styling', () => {
      const result = header(defaultOptions);
      expect(result).toContain('border-b');
      expect(result).toContain('border-storefront-border');
    });

    it('should include white background', () => {
      const result = header(defaultOptions);
      expect(result).toContain('bg-white');
    });

    it('should include storefront text color', () => {
      const result = header(defaultOptions);
      expect(result).toContain('text-storefront-text');
    });

    it('should include hover state for logo', () => {
      const result = header(defaultOptions);
      expect(result).toContain('hover:text-woo-purple');
    });

    it('should include light font weight for logo', () => {
      const result = header(defaultOptions);
      expect(result).toContain('font-light');
    });

    it('should include responsive container', () => {
      const result = header(defaultOptions);
      expect(result).toContain('max-w-6xl');
      expect(result).toContain('mx-auto');
    });

    it('should include responsive padding', () => {
      const result = header(defaultOptions);
      expect(result).toContain('px-4');
      expect(result).toContain('sm:px-6');
      expect(result).toContain('lg:px-8');
    });
  });

  describe('XSS protection', () => {
    it('should escape HTML in site name', () => {
      const result = header({
        ...defaultOptions,
        siteName: '<script>alert("xss")</script>',
      });
      expect(result).not.toContain('<script>alert');
      expect(result).toContain('&lt;script&gt;');
    });

    it('should sanitize dangerous URL protocols', () => {
      const result = header({
        ...defaultOptions,
        homeUrl: 'javascript:alert(1)',
      });
      expect(result).not.toContain('javascript:');
      expect(result).toContain('href="#"');
    });

    it('should sanitize data: URLs', () => {
      const result = header({
        ...defaultOptions,
        homeUrl: 'data:text/html,<script>alert(1)</script>',
      });
      expect(result).not.toContain('data:');
      expect(result).toContain('href="#"');
    });

    it('should allow http URLs', () => {
      const result = header({
        ...defaultOptions,
        homeUrl: 'http://example.com',
      });
      expect(result).toContain('href="http://example.com"');
    });

    it('should allow https URLs', () => {
      const result = header({
        ...defaultOptions,
        homeUrl: 'https://example.com',
      });
      expect(result).toContain('href="https://example.com"');
    });

    it('should allow relative URLs', () => {
      const result = header({
        ...defaultOptions,
        homeUrl: '/',
      });
      expect(result).toContain('href="/"');
    });

    it('should escape special characters in URL', () => {
      const result = header({
        ...defaultOptions,
        homeUrl: 'https://example.com/path?a=1&b=2',
      });
      expect(result).toContain('&amp;');
    });
  });
});
