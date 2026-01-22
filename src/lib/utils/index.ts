/**
 * Utility exports for the flexi.
 */

export { responseHeaders, type HeadersObject } from './headers';
export { escapeHtml, stripHtml, sanitizeUrl, sanitizePaymentIcon, cleanHtml } from './html';

// Logging utilities
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
  setErrorReporter,
  type LogContext,
  type ErrorReporter,
} from './logger';

// Sentry sanitization utilities (for error reporting)
export { sanitizeForSentry, sanitizeError, isSensitiveField } from './sentry-sanitize';

// Sanitization utilities
export {
  sanitizeAddress,
  sanitizeProductData,
  sanitizeCartData,
  sanitizeCheckoutData,
  sanitizeOrderData,
  sanitizeRenderRequest,
  sanitizePII,
} from './sanitize';

// Rate limiting utilities
export {
  checkRateLimit,
  rateLimitResponse,
  getRateLimitHeaders,
  getSiteIdentifier,
  RATE_LIMITS,
  type RateLimitConfig,
  type RateLimitResult,
} from './rate-limit';

// Currency utilities
export { formatCurrency } from './currency';

// Button loading state utilities
export { ButtonLoadingState, setButtonLoading } from './loading-state';
