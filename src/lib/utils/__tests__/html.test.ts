/**
 * HTML utility tests
 *
 * Tests for XSS protection and HTML manipulation helpers.
 */

import { describe, test, expect } from 'vitest';
import { escapeHtml, stripHtml, sanitizeUrl, sanitizePaymentIcon, cleanHtml } from '../html';

describe('escapeHtml', () => {
  describe('basic escaping', () => {
    test('should escape ampersand', () => {
      expect(escapeHtml('foo & bar')).toBe('foo &amp; bar');
    });

    test('should escape less than', () => {
      expect(escapeHtml('1 < 2')).toBe('1 &lt; 2');
    });

    test('should escape greater than', () => {
      expect(escapeHtml('2 > 1')).toBe('2 &gt; 1');
    });

    test('should escape double quotes', () => {
      expect(escapeHtml('say "hello"')).toBe('say &quot;hello&quot;');
    });

    test('should escape single quotes', () => {
      expect(escapeHtml("it's working")).toBe('it&#039;s working');
    });

    test('should escape all special characters together', () => {
      expect(escapeHtml('<script>"alert(\'xss\')&"</script>')).toBe(
        '&lt;script&gt;&quot;alert(&#039;xss&#039;)&amp;&quot;&lt;/script&gt;',
      );
    });
  });

  describe('edge cases', () => {
    test('should return empty string for empty input', () => {
      expect(escapeHtml('')).toBe('');
    });

    test('should return empty string for null-ish input', () => {
      expect(escapeHtml(null as unknown as string)).toBe('');
      expect(escapeHtml(undefined as unknown as string)).toBe('');
    });

    test('should not modify string without special characters', () => {
      expect(escapeHtml('Hello World 123')).toBe('Hello World 123');
    });

    test('should handle multiple occurrences', () => {
      expect(escapeHtml('&&&&')).toBe('&amp;&amp;&amp;&amp;');
    });
  });

  describe('XSS attack vectors', () => {
    test('should neutralize script tags', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
      );
    });

    test('should neutralize event handlers in attributes', () => {
      expect(escapeHtml('<img onerror="alert(1)">')).toBe(
        '&lt;img onerror=&quot;alert(1)&quot;&gt;',
      );
    });

    test('should neutralize HTML injection', () => {
      expect(escapeHtml('<div onclick="steal()">Click me</div>')).toBe(
        '&lt;div onclick=&quot;steal()&quot;&gt;Click me&lt;/div&gt;',
      );
    });
  });
});

describe('stripHtml', () => {
  describe('basic stripping', () => {
    test('should remove simple tags', () => {
      expect(stripHtml('<p>Hello</p>')).toBe('Hello');
    });

    test('should remove nested tags', () => {
      expect(stripHtml('<div><p><strong>Text</strong></p></div>')).toBe('Text');
    });

    test('should remove self-closing tags', () => {
      expect(stripHtml('Hello<br/>World')).toBe('HelloWorld');
    });

    test('should remove tags with attributes', () => {
      expect(stripHtml('<a href="http://example.com" class="link">Link</a>')).toBe('Link');
    });

    test('should handle multiple tags', () => {
      expect(stripHtml('<h1>Title</h1><p>Paragraph</p>')).toBe('TitleParagraph');
    });
  });

  describe('edge cases', () => {
    test('should return empty string for empty input', () => {
      expect(stripHtml('')).toBe('');
    });

    test('should return empty string for null-ish input', () => {
      expect(stripHtml(null as unknown as string)).toBe('');
      expect(stripHtml(undefined as unknown as string)).toBe('');
    });

    test('should trim resulting string', () => {
      expect(stripHtml('  <p>  spaced  </p>  ')).toBe('spaced');
    });

    test('should not modify plain text', () => {
      expect(stripHtml('No HTML here')).toBe('No HTML here');
    });
  });
});

describe('sanitizeUrl', () => {
  describe('safe URLs', () => {
    test('should allow http URLs', () => {
      expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
    });

    test('should allow https URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
    });

    test('should allow protocol-relative URLs', () => {
      expect(sanitizeUrl('//example.com/path')).toBe('//example.com/path');
    });

    test('should allow relative URLs', () => {
      expect(sanitizeUrl('/path/to/page')).toBe('/path/to/page');
    });

    test('should allow hash URLs', () => {
      expect(sanitizeUrl('#section')).toBe('#section');
    });

    test('should allow mailto URLs', () => {
      expect(sanitizeUrl('mailto:test@example.com')).toBe('mailto:test@example.com');
    });

    test('should allow tel URLs', () => {
      expect(sanitizeUrl('tel:+1234567890')).toBe('tel:+1234567890');
    });
  });

  describe('dangerous URLs', () => {
    test('should block javascript: protocol', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe('#');
    });

    test('should block JavaScript: with mixed case', () => {
      expect(sanitizeUrl('JavaScript:alert(1)')).toBe('#');
    });

    test('should block data: protocol', () => {
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('#');
    });

    test('should block vbscript: protocol', () => {
      expect(sanitizeUrl('vbscript:msgbox("xss")')).toBe('#');
    });

    test('should block file: protocol', () => {
      expect(sanitizeUrl('file:///etc/passwd')).toBe('#');
    });

    test('should block about: protocol', () => {
      expect(sanitizeUrl('about:blank')).toBe('#');
    });
  });

  describe('edge cases', () => {
    test('should return # for empty input', () => {
      expect(sanitizeUrl('')).toBe('#');
    });

    test('should return # for null-ish input', () => {
      expect(sanitizeUrl(null as unknown as string)).toBe('#');
      expect(sanitizeUrl(undefined as unknown as string)).toBe('#');
    });

    test('should handle URLs with whitespace', () => {
      expect(sanitizeUrl('  javascript:alert(1)  ')).toBe('#');
    });

    test('should escape special characters in allowed URLs', () => {
      expect(sanitizeUrl('http://example.com/?q=<script>')).toBe(
        'http://example.com/?q=&lt;script&gt;',
      );
    });
  });
});

describe('cleanHtml', () => {
  describe('comment removal', () => {
    test('should remove single-line comments', () => {
      expect(cleanHtml('Hello <!-- comment --> World')).toBe('Hello  World');
    });

    test('should remove multi-line comments', () => {
      const html = `Hello
<!-- multi
line
comment -->
World`;
      expect(cleanHtml(html)).toBe('Hello\nWorld');
    });

    test('should remove multiple comments', () => {
      expect(cleanHtml('<!-- a -->text<!-- b -->')).toBe('text');
    });
  });

  describe('whitespace cleanup', () => {
    test('should remove trailing whitespace from lines', () => {
      expect(cleanHtml('Hello   \nWorld  ')).toBe('Hello\nWorld');
    });

    test('should remove trailing tabs', () => {
      expect(cleanHtml('Hello\t\t\nWorld')).toBe('Hello\nWorld');
    });

    test('should remove empty lines', () => {
      expect(cleanHtml('Hello\n\n\nWorld')).toBe('Hello\nWorld');
    });

    test('should remove lines with only whitespace', () => {
      expect(cleanHtml('Hello\n   \nWorld')).toBe('Hello\nWorld');
    });
  });

  describe('combined cleanup', () => {
    test('should clean comments and whitespace together', () => {
      const html = `<div>
<!-- comment -->

Content
</div>`;
      expect(cleanHtml(html)).toBe('<div>\nContent\n</div>');
    });
  });
});

describe('sanitizePaymentIcon', () => {
  describe('valid img tags', () => {
    test('should extract and sanitize simple img tag', () => {
      const input = '<img src="https://example.com/icon.png">';
      const result = sanitizePaymentIcon(input);
      expect(result).toBe('<img src="https://example.com/icon.png" loading="lazy">');
    });

    test('should preserve alt attribute', () => {
      const input = '<img src="https://example.com/icon.png" alt="Payment Icon">';
      const result = sanitizePaymentIcon(input);
      expect(result).toBe(
        '<img src="https://example.com/icon.png" alt="Payment Icon" loading="lazy">',
      );
    });

    test('should preserve width and height attributes', () => {
      const input = '<img src="https://example.com/icon.png" width="32" height="24">';
      const result = sanitizePaymentIcon(input);
      expect(result).toBe(
        '<img src="https://example.com/icon.png" width="32" height="24" loading="lazy">',
      );
    });

    test('should preserve class attribute', () => {
      const input = '<img src="https://example.com/icon.png" class="payment-icon small">';
      const result = sanitizePaymentIcon(input);
      expect(result).toBe(
        '<img src="https://example.com/icon.png" class="payment-icon small" loading="lazy">',
      );
    });

    test('should preserve style attribute', () => {
      const input = '<img src="https://example.com/icon.png" style="border: none;">';
      const result = sanitizePaymentIcon(input);
      expect(result).toBe(
        '<img src="https://example.com/icon.png" style="border: none;" loading="lazy">',
      );
    });

    test('should preserve all attributes together', () => {
      const input =
        '<img src="https://example.com/icon.png" alt="Visa" width="32" height="24" class="icon" style="margin: 0;">';
      const result = sanitizePaymentIcon(input);
      expect(result).toBe(
        '<img src="https://example.com/icon.png" alt="Visa" width="32" height="24" class="icon" style="margin: 0;" loading="lazy">',
      );
    });

    test('should handle single-quoted attributes', () => {
      const input = "<img src='https://example.com/icon.png' alt='Icon'>";
      const result = sanitizePaymentIcon(input);
      expect(result).toBe('<img src="https://example.com/icon.png" alt="Icon" loading="lazy">');
    });
  });

  describe('dangerous protocols', () => {
    test('should return empty string for javascript: protocol', () => {
      const input = '<img src="javascript:alert(1)">';
      expect(sanitizePaymentIcon(input)).toBe('');
    });

    test('should return empty string for data: protocol', () => {
      const input = '<img src="data:image/svg+xml,<svg onload=alert(1)>">';
      expect(sanitizePaymentIcon(input)).toBe('');
    });

    test('should return empty string for vbscript: protocol', () => {
      const input = '<img src="vbscript:msgbox(1)">';
      expect(sanitizePaymentIcon(input)).toBe('');
    });

    test('should return empty string for file: protocol', () => {
      const input = '<img src="file:///etc/passwd">';
      expect(sanitizePaymentIcon(input)).toBe('');
    });

    test('should return empty string for about: protocol', () => {
      const input = '<img src="about:blank">';
      expect(sanitizePaymentIcon(input)).toBe('');
    });

    test('should handle mixed case dangerous protocols', () => {
      const input = '<img src="JavaScript:alert(1)">';
      expect(sanitizePaymentIcon(input)).toBe('');
    });
  });

  describe('invalid input', () => {
    test('should return empty string for empty input', () => {
      expect(sanitizePaymentIcon('')).toBe('');
    });

    test('should return empty string for null-ish input', () => {
      expect(sanitizePaymentIcon(null as unknown as string)).toBe('');
      expect(sanitizePaymentIcon(undefined as unknown as string)).toBe('');
    });

    test('should return empty string for non-img HTML', () => {
      expect(sanitizePaymentIcon('<div>Not an image</div>')).toBe('');
    });

    test('should return empty string for plain text', () => {
      expect(sanitizePaymentIcon('Just some text')).toBe('');
    });

    test('should return empty string for img without src', () => {
      expect(sanitizePaymentIcon('<img alt="No src">')).toBe('');
    });
  });

  describe('XSS prevention', () => {
    test('should escape special characters in src', () => {
      const input = '<img src="https://example.com/icon.png?q=<script>">';
      const result = sanitizePaymentIcon(input);
      expect(result).toContain('&lt;script&gt;');
    });

    test('should escape special characters in alt', () => {
      const input = '<img src="https://example.com/icon.png" alt="<script>alert(1)</script>">';
      const result = sanitizePaymentIcon(input);
      expect(result).toContain('&lt;script&gt;');
    });

    test('should not include onerror or other event handlers', () => {
      const input = '<img src="https://example.com/icon.png" onerror="alert(1)" onclick="steal()">';
      const result = sanitizePaymentIcon(input);
      expect(result).not.toContain('onerror');
      expect(result).not.toContain('onclick');
      expect(result).not.toContain('alert');
      expect(result).not.toContain('steal');
    });
  });
});
