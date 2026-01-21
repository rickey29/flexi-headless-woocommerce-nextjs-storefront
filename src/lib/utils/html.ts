/**
 * HTML utility functions for template rendering.
 * Provides XSS protection and HTML manipulation helpers.
 */

/**
 * HTML escape character map - defined at module level for efficiency.
 * Avoids recreating the object on every call to escapeHtml().
 */
const HTML_ESCAPE_MAP: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;',
} as const;

/**
 * Escape HTML special characters to prevent XSS.
 * @param str - The text to escape
 * @returns Escaped HTML string
 */
export function escapeHtml(str: string): string {
  if (!str) return '';
  return str.replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char] || char);
}

/**
 * Strip HTML tags from string.
 * @param str - The HTML string to strip
 * @returns Plain text with HTML tags removed
 */
export function stripHtml(str: string): string {
  if (!str) return '';
  return str.replace(/<[^>]*>/g, '').trim();
}

/**
 * Sanitize URL to prevent XSS via dangerous protocols.
 * Blocks: javascript:, data:, vbscript:, file:, about:
 * Allows: http://, https://, //, /, #, mailto:, tel:
 * @param url - The URL to sanitize
 * @returns Sanitized URL or '#' if dangerous
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '#';

  const trimmedUrl = url.trim().toLowerCase();

  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'about:'];

  for (const protocol of dangerousProtocols) {
    if (trimmedUrl.startsWith(protocol)) {
      return '#';
    }
  }

  // Allow safe URLs
  return escapeHtml(url);
}

/**
 * Sanitize payment gateway icon HTML.
 * Extracts img src, sanitizes it, and rebuilds a safe img tag.
 * Falls back to empty string if HTML is invalid or dangerous.
 * @param iconHtml - Payment gateway icon HTML (typically <img> tag)
 * @returns Safe HTML or empty string
 */
export function sanitizePaymentIcon(iconHtml: string): string {
  if (!iconHtml) return '';

  // Match img tag and extract src attribute
  // This regex looks for: <img ...src="URL"... > or <img ...src='URL'... >
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/i;
  const match = iconHtml.match(imgRegex);

  if (!match) {
    // Not a valid img tag, return empty string for safety
    return '';
  }

  const srcUrl = match[1];

  // Check if the URL uses a dangerous protocol
  const trimmedUrl = srcUrl.trim().toLowerCase();
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'about:'];

  for (const protocol of dangerousProtocols) {
    if (trimmedUrl.startsWith(protocol)) {
      // Dangerous URL, return empty string
      return '';
    }
  }

  // Extract alt attribute if present
  const altRegex = /alt=["']([^"']*)["']/i;
  const altMatch = iconHtml.match(altRegex);
  const altText = altMatch ? escapeHtml(altMatch[1]) : '';

  // Extract width attribute if present
  const widthRegex = /width=["']?([^"'\s>]+)["']?/i;
  const widthMatch = iconHtml.match(widthRegex);
  const width = widthMatch ? escapeHtml(widthMatch[1]) : '';

  // Extract height attribute if present
  const heightRegex = /height=["']?([^"'\s>]+)["']?/i;
  const heightMatch = iconHtml.match(heightRegex);
  const height = heightMatch ? escapeHtml(heightMatch[1]) : '';

  // Extract class attribute if present
  const classRegex = /class=["']([^"']*)["']/i;
  const classMatch = iconHtml.match(classRegex);
  const originalClass = classMatch ? escapeHtml(classMatch[1]) : '';

  // Extract style attribute if present
  const styleRegex = /style=["']([^"']*)["']/i;
  const styleMatch = iconHtml.match(styleRegex);
  const style = styleMatch ? escapeHtml(styleMatch[1]) : '';

  // Reconstruct safe img tag with sanitized src and preserved attributes
  const safeSrc = escapeHtml(srcUrl);
  let imgTag = `<img src="${safeSrc}"`;

  if (altText) imgTag += ` alt="${altText}"`;
  if (width) imgTag += ` width="${width}"`;
  if (height) imgTag += ` height="${height}"`;
  if (originalClass) imgTag += ` class="${originalClass}"`;
  if (style) imgTag += ` style="${style}"`;

  imgTag += ' loading="lazy">';

  return imgTag;
}

/**
 * Clean HTML by removing comments, trailing whitespace, and empty lines.
 * @param html - The HTML string to clean
 * @returns Cleaned HTML string
 */
export function cleanHtml(html: string): string {
  // 1. Remove HTML comments
  html = html.replace(/<!--[\s\S]*?-->/g, '');

  // 2. Clean whitespace at the end of each line
  html = html.replace(/[ \t]+$/gm, '');

  // 3. Remove completely empty lines
  html = html.replace(/^\s*[\r\n]/gm, '');

  return html;
}
