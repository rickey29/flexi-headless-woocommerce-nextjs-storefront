/**
 * Environment configuration for flexi.
 *
 * Centralizes environment variable access and validation
 * for consistent behavior across the application.
 *
 * @since 1.0.0
 */

import type { LogLevel } from '@/core/types';

// Re-export LogLevel type from core/types for consumers
export type { LogLevel } from '@/core/types';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Parse LOG_LEVEL environment variable
 */
function parseLogLevel(): LogLevel {
  const level = process.env.LOG_LEVEL?.toLowerCase();
  if (level && level in LOG_LEVELS) {
    return level as LogLevel;
  }
  // Default: debug in development, warn in production
  return process.env.NODE_ENV === 'development' ? 'debug' : 'warn';
}

export const config = {
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_TEST: process.env.NODE_ENV === 'test',

  // Logging configuration
  LOG_LEVEL: parseLogLevel(),
  // JSON logging for production (easier to parse in log aggregation tools)
  LOG_JSON: process.env.LOG_JSON === 'true' || process.env.NODE_ENV === 'production',

  // Sentry error monitoring configuration (optional)
  // Sentry is disabled by default - set SENTRY_DSN to enable
  // ⚠️ SECURITY: DSN must be set via environment variables, never hard-coded
  SENTRY_ENABLED:
    process.env.NODE_ENV === 'production' &&
    !!(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN),
} as const;

/**
 * Check if a log level should be logged based on current configuration
 */
export function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[config.LOG_LEVEL];
}

/**
 * Validate required environment variables at startup
 * Currently no required variables, but this hook is available for future use
 */
function validateEnv(): void {
  // No required environment variables currently
  // Add validation here if needed in the future
}

// Run validation on module load
validateEnv();
