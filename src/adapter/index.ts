/**
 * Adapter Layer Exports
 *
 * The Adapter layer handles site integration and data normalization:
 * - HTTP utilities (headers, rate limiting)
 * - Logging (console, Sentry integration)
 * - Page renderers (orchestrate themes)
 *
 * Layer Rules:
 * - Adapter may import Core
 * - Adapter may select a Theme
 * - Adapter must NOT be imported by Core or Theme
 */

// HTTP
export { responseHeaders, type HeadersObject } from './http/headers';
export {
  checkRateLimit,
  rateLimitResponse,
  getRateLimitHeaders,
  getSiteIdentifier,
  RATE_LIMITS,
  _resetRateLimitStore,
  _getRateLimitStoreSize,
  type RateLimitConfig,
  type RateLimitResult,
} from './http/rate-limit';

// Logging
export {
  logger,
  logDebug,
  logInfo,
  logWarn,
  logError,
  logRenderRequest,
  logRenderComplete,
  logApiRoute,
  logValidationError,
  logFetchRequest,
  logFetchResponse,
  generateRequestId,
  setRequestId,
  getRequestId,
  type LogContext,
} from './logging/logger';

export {
  sanitizeAddress,
  sanitizeProductData,
  sanitizeCartData,
  sanitizeCheckoutData,
  sanitizeOrderData,
  sanitizeRenderRequest,
  sanitizePII,
} from './logging/sanitize';

export { sanitizeForSentry, sanitizeError, isSensitiveField } from './logging/sentry-sanitize';

// Renderers
export { renderProductPage } from './renderers/product';
export { renderAccountPage } from './renderers/account';

// WordPress integration constants
export {
  FLEXI_WOO_API_NAMESPACE,
  WP_API_ENDPOINTS,
  WP_API_TIMEOUT,
} from './wordpress';
