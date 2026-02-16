/**
 * Rate Limiting Utility
 *
 * Implements sliding window rate limiting for API endpoints.
 * Protects against abuse and DoS attacks.
 *
 * ## Algorithm
 *
 * **Sliding Window Counter:**
 * - More accurate than fixed window (prevents burst at boundaries)
 * - Memory efficient (only stores timestamps)
 * - Simple to implement and reason about
 *
 * ## Storage Backend
 *
 * **Current Implementation:** In-memory using Map (single-instance only)
 * - Zero external dependencies
 * - Resets on process restart
 * - **NOT suitable for multi-instance/distributed deployments**
 *
 * **For Production/Distributed Deployments:**
 * Replace Map storage with Redis. Consider:
 * - `@upstash/ratelimit` - Serverless-friendly Redis rate limiting
 * - `rate-limiter-flexible` - Full-featured Node.js rate limiting
 * - Redis ZADD/ZRANGEBYSCORE - Custom sliding window implementation
 *
 * **Migration Guide:**
 * 1. Replace `rateLimitStore` Map with Redis client
 * 2. Update `checkRateLimit()` to use Redis ZADD for timestamps
 * 3. Update `cleanupExpiredEntries()` to use ZREMRANGEBYSCORE
 * 4. Configure Redis connection via environment variables
 *
 * @module rate-limit
 */

import { NextResponse } from 'next/server';
import { logWarn } from '../logging/logger';
/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Time window in milliseconds */
  window: number;
  /** Identifier for this rate limit (e.g., 'product', 'checkout') */
  identifier: string;
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Current number of requests in window */
  current: number;
  /** Maximum allowed requests */
  limit: number;
  /** Time until rate limit resets (seconds) */
  retryAfter: number;
  /** Timestamp when rate limit resets (Unix timestamp in seconds) */
  resetAt: number;
  /** Remaining requests allowed */
  remaining: number;
}

/**
 * Rate limit configurations for each endpoint.
 *
 * Limits are per-site, per-minute to protect Next.js from WordPress misconfiguration.
 * These are much higher than end-user rate limits (which are enforced by WordPress).
 *
 * Examples of WordPress misconfiguration that these limits prevent:
 * - Infinite redirect loops calling Next.js repeatedly
 * - Aggressive caching plugins making excessive requests
 * - Development/staging sites with debug code
 * - Plugin conflicts causing request storms
 */
export const RATE_LIMITS = {
  /**
   * Product: 600 requests/min per site (10 req/sec sustained)
   * Typical: 5-20 req/min per site
   * Allows high-traffic sites with product browsing
   */
  PRODUCT: {
    limit: 600,
    window: 60 * 1000, // 1 minute in ms
    identifier: 'product',
  },

  /**
   * Shop: 600 requests/min per site (10 req/sec sustained)
   * Typical: 5-15 req/min per site
   * Main shop page, frequently accessed
   */
  SHOP: {
    limit: 600,
    window: 60 * 1000,
    identifier: 'shop',
  },

  /**
   * Category: 600 requests/min per site (10 req/sec sustained)
   * Typical: 5-15 req/min per site
   * Category browsing pages
   */
  CATEGORY: {
    limit: 600,
    window: 60 * 1000,
    identifier: 'category',
  },

  /**
   * Search: 300 requests/min per site (5 req/sec sustained)
   * Typical: 1-5 req/min per site
   * Lower limit as search can be expensive
   */
  SEARCH: {
    limit: 300,
    window: 60 * 1000,
    identifier: 'search',
  },

  /**
   * Cart: 300 requests/min per site (5 req/sec sustained)
   * Typical: 1-5 req/min per site
   * Cart operations
   */
  CART: {
    limit: 300,
    window: 60 * 1000,
    identifier: 'cart',
  },

  /**
   * Checkout: 200 requests/min per site (~3 req/sec sustained)
   * Typical: 0.5-2 req/min per site
   * Lower than cart because checkout pages are visited less frequently
   */
  CHECKOUT: {
    limit: 200,
    window: 60 * 1000,
    identifier: 'checkout',
  },

  /**
   * Thank You: 60 requests/min per site (1 req/sec sustained)
   * Typical: 0.1-0.5 req/min per site
   * Lower because order confirmation pages are visited once per order
   */
  THANK_YOU: {
    limit: 60,
    window: 60 * 1000,
    identifier: 'thank-you',
  },

  /**
   * Account: 300 requests/min per site (5 req/sec sustained)
   * Typical: 1-3 req/min per site
   * My Account pages (dashboard, orders, addresses, etc.)
   */
  ACCOUNT: {
    limit: 300,
    window: 60 * 1000,
    identifier: 'account',
  },

  /**
   * Health: 120 requests/min per site (2 req/sec sustained)
   * Typical: 1-2 req/min per site (monitoring systems)
   */
  HEALTH: {
    limit: 120,
    window: 60 * 1000,
    identifier: 'health',
  },
} as const;

/**
 * In-memory storage for rate limit data
 * Map<key, timestamps[]>
 * Key format: "siteId:identifier" (e.g., "abc123xyz456:product" or "ip:192.168.1.1:product")
 */
const rateLimitStore = new Map<string, number[]>();

/**
 * Track last violation log time per site to prevent log spam
 * Map<siteId, timestamp>
 */
const violationLogCache = new Map<string, number>();

/**
 * Request counter for cleanup trigger
 */
let requestCounter = 0;

/**
 * Cleanup interval (every N requests)
 */
const CLEANUP_INTERVAL = 100;

/**
 * Violation log interval (1 hour in ms)
 */
const VIOLATION_LOG_INTERVAL = 60 * 60 * 1000;

/**
 * Extract site identifier from WordPress request.
 *
 * Site-based rate limiting protects Next.js from WordPress misconfiguration
 * (e.g., infinite loops, caching issues causing excessive requests).
 *
 * WordPress sends X-FlexiWoo-Site-ID header (SHA-256 hash of site URL).
 *
 * Priority order:
 * 1. x-flexiwoo-site-id header (from WordPress plugin)
 * 2. x-forwarded-for header (backward compatibility)
 * 3. x-real-ip header (backward compatibility)
 * 4. 'unknown' (fallback)
 *
 * @param request - Request object
 * @returns Site ID or IP-based fallback identifier
 */
export function getSiteIdentifier(request: Request): string {
  // Primary: X-FlexiWoo-Site-ID header from WordPress
  const siteId = request.headers.get('x-flexiwoo-site-id');
  if (siteId) {
    // Validate format: reasonable length, alphanumeric and hyphens only
    const isValid = siteId.length >= 8 && siteId.length <= 64 && /^[a-zA-Z0-9-]+$/.test(siteId);

    if (isValid) {
      return siteId;
    }
  }

  // Fallback: Use IP-based identifier for backward compatibility
  // This handles old WordPress versions or direct API calls (non-WordPress)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0].trim();
    if (firstIp) {
      return `ip:${firstIp}`;
    }
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return `ip:${realIp}`;
  }

  return 'unknown';
}

/**
 * Check rate limit for a request
 *
 * Uses site-based rate limiting to track WordPress sites independently.
 * Falls back to IP-based limiting for backward compatibility.
 *
 * @param request - Request object
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(request: Request, config: RateLimitConfig): RateLimitResult {
  const siteId = getSiteIdentifier(request);
  const key = `${siteId}:${config.identifier}`;
  const now = Date.now();
  const windowStart = now - config.window;

  // Get existing timestamps for this key
  let timestamps = rateLimitStore.get(key) || [];

  // Filter out timestamps outside the current window (sliding window)
  timestamps = timestamps.filter((timestamp) => timestamp > windowStart);

  // Calculate current count and remaining
  const current = timestamps.length;
  const remaining = Math.max(0, config.limit - current - 1);
  const allowed = current < config.limit;

  // Calculate reset time (end of current window)
  const oldestTimestamp = timestamps[0] || now;
  const resetAt = Math.ceil((oldestTimestamp + config.window) / 1000); // Unix timestamp in seconds
  const retryAfter = Math.max(1, Math.ceil((oldestTimestamp + config.window - now) / 1000));

  // If allowed, add current timestamp
  if (allowed) {
    timestamps.push(now);
    rateLimitStore.set(key, timestamps);
  } else {
    // Rate limit exceeded - log first violation per hour
    logRateLimitViolation(siteId, config.identifier, current, config.limit, retryAfter);
  }

  // Trigger cleanup periodically
  requestCounter++;
  if (requestCounter >= CLEANUP_INTERVAL) {
    cleanupExpiredEntries(config.window);
    requestCounter = 0;
  }

  return {
    allowed,
    current,
    limit: config.limit,
    retryAfter,
    resetAt,
    remaining,
  };
}

/**
 * Log rate limit violation (only first per site/IP per hour to reduce noise)
 *
 * @param siteId - Site identifier (site ID or IP-based fallback)
 * @param identifier - Rate limit identifier
 * @param current - Current request count
 * @param limit - Rate limit
 * @param retryAfter - Retry after seconds
 */
function logRateLimitViolation(
  siteId: string,
  identifier: string,
  current: number,
  limit: number,
  retryAfter: number,
): void {
  const now = Date.now();
  const lastLogTime = violationLogCache.get(siteId) || 0;

  // Only log if we haven't logged for this site ID in the last hour
  if (now - lastLogTime > VIOLATION_LOG_INTERVAL) {
    // Sanitize site ID for logging (partial redaction for privacy)
    const sanitizedSiteId = sanitizeSiteIdForLogging(siteId);

    logWarn(`Rate limit exceeded for ${identifier}`, {
      site_id: sanitizedSiteId,
      endpoint: identifier,
      current,
      limit,
      retry_after: retryAfter,
    });

    violationLogCache.set(siteId, now);
  }
}

/**
 * Sanitize site identifier for logging (privacy protection)
 *
 * For site IDs: Show first 8 chars + ***
 * For IP-based: Use existing IP sanitization
 *
 * @param siteId - Site identifier
 * @returns Sanitized identifier
 */
function sanitizeSiteIdForLogging(siteId: string): string {
  if (siteId === 'unknown') {
    return siteId;
  }

  // IP-based identifier (e.g., "ip:192.168.1.100")
  if (siteId.startsWith('ip:')) {
    const ip = siteId.substring(3);
    return `ip:${sanitizeIpForLogging(ip)}`;
  }

  // Site ID: show first 8 chars + ***
  if (siteId.length > 8) {
    return siteId.substring(0, 8) + '***';
  }

  return siteId;
}

/**
 * Sanitize IP address for logging (GDPR compliance)
 * Masks last octet: 192.168.1.100 -> 192.168.1.xxx
 *
 * @param ip - IP address
 * @returns Sanitized IP address
 */
function sanitizeIpForLogging(ip: string): string {
  if (ip === 'unknown') {
    return ip;
  }

  // IPv4: mask last octet
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      parts[3] = 'xxx';
      return parts.join('.');
    }
  }

  // IPv6: mask last segment
  if (ip.includes(':')) {
    const parts = ip.split(':');
    if (parts.length > 0) {
      parts[parts.length - 1] = 'xxxx';
      return parts.join(':');
    }
  }

  return ip;
}

/**
 * Cleanup expired entries from rate limit store
 * Removes entries with all timestamps outside the window
 *
 * @param windowMs - Window size in milliseconds
 */
function cleanupExpiredEntries(windowMs: number): void {
  const now = Date.now();
  const windowStart = now - windowMs;

  for (const [key, timestamps] of rateLimitStore.entries()) {
    // Filter timestamps within window
    const validTimestamps = timestamps.filter((ts) => ts > windowStart);

    if (validTimestamps.length === 0) {
      // All timestamps expired, remove entry
      rateLimitStore.delete(key);
    } else if (validTimestamps.length < timestamps.length) {
      // Some timestamps expired, update entry
      rateLimitStore.set(key, validTimestamps);
    }
  }

  // Also cleanup old violation log entries
  for (const [siteId, timestamp] of violationLogCache.entries()) {
    if (now - timestamp > VIOLATION_LOG_INTERVAL) {
      violationLogCache.delete(siteId);
    }
  }
}

/**
 * Create 429 rate limit response
 *
 * @param result - Rate limit result
 * @returns Next.js response with 429 status
 */
export function rateLimitResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    {
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please try again later.',
      retry_after: result.retryAfter,
    },
    {
      status: 429,
      headers: {
        'Retry-After': result.retryAfter.toString(),
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.resetAt.toString(),
      },
    },
  );
}

/**
 * Get rate limit headers for successful requests
 *
 * @param result - Rate limit result
 * @param siteId - Optional site identifier for debugging
 * @returns Headers object
 */
export function getRateLimitHeaders(
  result: RateLimitResult,
  siteId?: string,
): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetAt.toString(),
  };

  // Add site identifier to help with debugging (only for actual site IDs, not IP fallbacks)
  if (siteId && !siteId.startsWith('ip:') && siteId !== 'unknown') {
    headers['X-RateLimit-Site-ID'] = siteId;
  }

  return headers;
}

/**
 * Reset rate limit store (for testing purposes only)
 * @internal
 */
export function _resetRateLimitStore(): void {
  rateLimitStore.clear();
  violationLogCache.clear();
  requestCounter = 0;
}

/**
 * Get current store size (for testing purposes only)
 * @internal
 */
export function _getRateLimitStoreSize(): number {
  return rateLimitStore.size;
}
