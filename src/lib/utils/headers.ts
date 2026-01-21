/**
 * HTTP Headers utilities for API responses.
 *
 * Note: Cache prevention headers are NOT needed because:
 * - This service receives POST requests (never cached by CDNs)
 * - Next.js `force-dynamic` prevents server-side caching
 * - Response goes to WordPress (server), not browser
 *
 * Security headers are also NOT needed because:
 * - Returns HTML to WordPress (server-to-server)
 * - Browser never sees these headers
 * - Security headers should be configured at WordPress/Apache/Nginx level
 */

/**
 * Standard response headers for HTML responses.
 */
export const responseHeaders = {
  'Content-Type': 'text/html; charset=utf-8',
} as const;

/**
 * Type for header objects.
 */
export type HeadersObject = Record<string, string>;
