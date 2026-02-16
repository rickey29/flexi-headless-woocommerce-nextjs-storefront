/**
 * Production-ready logging utility
 *
 * Features:
 * - Configurable log levels via LOG_LEVEL env var
 * - Structured JSON logging in production for log aggregation
 * - Request tracing with request IDs
 * - Optional Sentry integration for production error tracking
 * - PII sanitization for sensitive data
 *
 * @since 1.0.0
 * @updated 1.1.0 - Added JSON logging, request tracing, Sentry integration
 */

import { config, shouldLog } from '@/core/config';
import type { LogLevel, LogContext } from '@/core/types';
import { sanitizeForSentry } from './sentry-sanitize';

// Re-export types from core
export type { LogContext } from '@/core/types';

/**
 * Structured log entry for JSON output
 */
interface StructuredLog {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  request_id?: string;
}

/**
 * Current request ID for tracing (set per-request)
 */
let currentRequestId: string | undefined;

/**
 * Set the current request ID for tracing
 * Call this at the start of each request handler
 */
export function setRequestId(requestId: string | undefined): void {
  currentRequestId = requestId;
}

/**
 * Get the current request ID
 */
export function getRequestId(): string | undefined {
  return currentRequestId;
}

/**
 * Generate a unique request ID for tracing
 */
export function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Format error for structured logging
 */
function formatError(error: Error | unknown): StructuredLog['error'] | undefined {
  if (!error) return undefined;
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: config.IS_DEVELOPMENT ? error.stack : undefined,
    };
  }
  return {
    name: 'UnknownError',
    message: String(error),
  };
}

/**
 * Output a structured log entry
 */
function outputLog(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: Error | unknown,
): void {
  const entry: StructuredLog = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };

  if (currentRequestId) {
    entry.request_id = currentRequestId;
  }

  if (context && Object.keys(context).length > 0) {
    entry.context = context;
  }

  if (error) {
    entry.error = formatError(error);
  }

  // JSON output for production/when LOG_JSON is true
  if (config.LOG_JSON) {
    const jsonOutput = JSON.stringify(entry);
    switch (level) {
      case 'error':
        console.error(jsonOutput);
        break;
      case 'warn':
        console.warn(jsonOutput);
        break;
      default:
        console.log(jsonOutput);
    }
  } else {
    // Human-readable format for development
    const prefix = `[${entry.timestamp}] [${level.toUpperCase()}]`;
    const reqId = entry.request_id ? ` [${entry.request_id}]` : '';
    const formattedMessage = `${prefix}${reqId} ${message}`;

    switch (level) {
      case 'error':
        console.error(
          formattedMessage,
          error || '',
          context ? JSON.stringify(context, null, 2) : '',
        );
        break;
      case 'warn':
        console.warn(formattedMessage, context ? JSON.stringify(context, null, 2) : '');
        break;
      default:
        console.log(formattedMessage, context ? JSON.stringify(context, null, 2) : '');
    }
  }
}

/**
 * Log a debug message
 * Only logged when LOG_LEVEL is 'debug'
 */
export function logDebug(message: string, context?: LogContext): void {
  if (shouldLog('debug')) {
    outputLog('debug', message, context);
  }
}

/**
 * Log an info message
 * Logged when LOG_LEVEL is 'debug' or 'info'
 */
export function logInfo(message: string, context?: LogContext): void {
  if (shouldLog('info')) {
    outputLog('info', message, context);
  }
}

/**
 * Log a warning message
 * Logged when LOG_LEVEL is 'debug', 'info', or 'warn'
 */
export function logWarn(message: string, context?: LogContext): void {
  if (shouldLog('warn')) {
    outputLog('warn', message, context);
  }
}

/**
 * Log an error message
 * Always logged (unless LOG_LEVEL is explicitly set higher)
 * In production, errors are also sent to Sentry for monitoring (if configured)
 */
export function logError(message: string, error?: Error | unknown, context?: LogContext): void {
  if (shouldLog('error')) {
    outputLog('error', message, context, error);
  }

  // Send to Sentry in production (if enabled via SENTRY_DSN)
  if (config.IS_PRODUCTION && config.SENTRY_ENABLED) {
    import('@sentry/nextjs')
      .then((Sentry) => {
        const sanitizedContext = context
          ? (sanitizeForSentry(context) as Record<string, unknown>)
          : undefined;

        if (error instanceof Error) {
          Sentry.captureException(error, {
            extra: {
              ...sanitizedContext,
              request_id: currentRequestId,
            },
            tags: {
              logger_message: message,
              request_id: currentRequestId,
            },
          });
        } else {
          Sentry.captureMessage(message, {
            level: 'error',
            extra: {
              error,
              context: sanitizedContext,
              request_id: currentRequestId,
            },
          });
        }
      })
      .catch((err) => {
        console.error('[logger] Failed to import Sentry', err);
      });
  }

}

/**
 * Logger object with all methods
 */
export const logger = {
  debug: logDebug,
  info: logInfo,
  warn: logWarn,
  error: logError,
} as const;

// ============================================================================
// Specialized Logging Functions
// ============================================================================

/**
 * Log an incoming render request
 * @param templateType - Type of template being rendered (product, shop, cart, etc.)
 * @param requestId - Unique request ID for tracing
 * @param context - Additional context (home_url, product_id, etc.)
 */
export function logRenderRequest(
  templateType: string,
  requestId: string,
  context?: LogContext,
): void {
  const prevRequestId = currentRequestId;
  setRequestId(requestId);

  logDebug(`[RENDER] Incoming ${templateType} request`, {
    template: templateType,
    ...context,
  });

  setRequestId(prevRequestId);
}

/**
 * Log render completion with timing
 * @param templateType - Type of template rendered
 * @param requestId - Unique request ID for tracing
 * @param durationMs - Time taken to render in milliseconds
 * @param success - Whether render was successful
 */
export function logRenderComplete(
  templateType: string,
  requestId: string,
  durationMs: number,
  success: boolean,
): void {
  const prevRequestId = currentRequestId;
  setRequestId(requestId);

  const icon = success ? '\u2713' : '\u2717';
  const message = `[RENDER ${icon}] ${templateType} completed`;

  if (success) {
    logDebug(message, { duration_ms: durationMs, success });
  } else {
    logWarn(message, { duration_ms: durationMs, success });
  }

  setRequestId(prevRequestId);
}

/**
 * Log API route handling
 * @param route - API route path
 * @param method - HTTP method
 * @param requestId - Unique request ID
 * @param context - Additional context
 */
export function logApiRoute(
  route: string,
  method: string,
  requestId: string,
  context?: LogContext,
): void {
  const prevRequestId = currentRequestId;
  setRequestId(requestId);

  logDebug(`[API] ${method} ${route}`, context);

  setRequestId(prevRequestId);
}

/**
 * Log validation errors
 * @param context - Context description (e.g., "product request")
 * @param errors - Validation error details
 * @param requestId - Optional request ID for tracing
 */
export function logValidationError(context: string, errors: unknown, requestId?: string): void {
  const prevRequestId = currentRequestId;
  if (requestId) setRequestId(requestId);

  logWarn(`[VALIDATION] ${context} failed validation`, { errors });

  if (requestId) setRequestId(prevRequestId);
}

/**
 * Log fetch request to external service (WordPress)
 * @param url - URL being fetched
 * @param method - HTTP method
 * @param requestId - Request ID for tracing
 */
export function logFetchRequest(url: string, method: string = 'GET', requestId?: string): void {
  // Mask any sensitive parts of URL (query params with keys like 'key', 'token', etc.)
  const maskedUrl = url.replace(/([?&](key|token|secret|api_key)=)[^&]+/gi, '$1***');

  const prevRequestId = currentRequestId;
  if (requestId) setRequestId(requestId);

  logDebug(`[FETCH] ${method} ${maskedUrl}`);

  if (requestId) setRequestId(prevRequestId);
}

/**
 * Log fetch response from external service
 * @param url - URL that was fetched
 * @param status - HTTP status code
 * @param ok - Whether response was successful
 * @param requestId - Request ID for tracing
 */
export function logFetchResponse(
  url: string,
  status: number,
  ok: boolean,
  requestId?: string,
): void {
  const icon = ok ? '\u2713' : '\u2717';
  const maskedUrl = url.replace(/([?&](key|token|secret|api_key)=)[^&]+/gi, '$1***');

  const prevRequestId = currentRequestId;
  if (requestId) setRequestId(requestId);

  const message = `[FETCH ${icon}] ${status} ${maskedUrl}`;

  if (ok) {
    logDebug(message);
  } else {
    logWarn(message);
  }

  if (requestId) setRequestId(prevRequestId);
}
