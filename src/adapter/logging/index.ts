/**
 * Logging exports.
 */

// Logger
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
} from './logger';

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

// Sentry sanitization utilities
export { sanitizeForSentry, sanitizeError, isSensitiveField } from './sentry-sanitize';
