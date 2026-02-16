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
