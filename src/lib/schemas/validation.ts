import { z } from 'zod';
import { NextResponse } from 'next/server';

/**
 * Validation result type for consistent handling.
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; response: NextResponse };

/**
 * Options for customizing validation behavior.
 */
export interface ValidationOptions {
  /** HTTP status code for error response (default: 503) */
  status?: number;
  /** Header name for fallback signal (default: 'x-flexi-fallback') */
  fallbackHeader?: string;
  /** Reason code for fallback header (default: 'invalid-request') */
  fallbackReason?: string;
}

/**
 * Validate request data against a Zod schema.
 * Returns a standardized error response with configurable fallback header on failure.
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @param options - Optional configuration (status, fallbackHeader, fallbackReason)
 *
 * @example
 * // Simple usage (uses flexi defaults)
 * const validation = validateRequest(schema, body);
 *
 * @example
 * // With custom options
 * const validation = validateRequest(schema, body, {
 *   status: 400,
 *   fallbackHeader: 'x-custom-fallback',
 *   fallbackReason: 'custom-error',
 * });
 */
export function validateRequest<T extends z.ZodSchema>(
  schema: T,
  data: unknown,
  options: ValidationOptions | string = {},
): ValidationResult<z.infer<T>> {
  // Support legacy signature: validateRequest(schema, data, 'fallbackReason')
  const opts: ValidationOptions =
    typeof options === 'string' ? { fallbackReason: options } : options;

  const {
    status = 503,
    fallbackHeader = 'x-flexi-fallback',
    fallbackReason = 'invalid-request',
  } = opts;

  const result = schema.safeParse(data);

  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const message = firstIssue
      ? `${firstIssue.path.join('.')}: ${firstIssue.message}`
      : 'Validation failed';

    const headers: Record<string, string> = {};
    if (fallbackHeader && fallbackReason) {
      headers[fallbackHeader] = fallbackReason;
    }

    return {
      success: false,
      response: NextResponse.json(
        {
          reason: fallbackReason,
          message,
          details: result.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status, headers },
      ),
    };
  }

  return { success: true, data: result.data };
}

/**
 * Validate request with flexi-specific defaults.
 * Returns standardized error response with x-flexi-fallback header for WordPress fallback support.
 *
 * Response format:
 * - reason: fallback reason code (e.g., 'invalid-request')
 * - message: human-readable summary of first error
 * - details: array of { path, message } for all validation errors
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @param fallbackReason - Reason code for x-flexi-fallback header
 */
export function validateFlexiRequest<T extends z.ZodSchema>(
  schema: T,
  data: unknown,
  fallbackReason: string = 'invalid-request',
): ValidationResult<z.infer<T>> {
  return validateRequest(schema, data, {
    status: 503,
    fallbackHeader: 'x-flexi-fallback',
    fallbackReason,
  });
}
