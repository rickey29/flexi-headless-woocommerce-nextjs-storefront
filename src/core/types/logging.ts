/**
 * Logging types.
 *
 * @module core/types/logging
 */

/**
 * Log levels in order of verbosity (lowest to highest)
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Context object for structured logging
 */
export interface LogContext {
  [key: string]: unknown;
}

