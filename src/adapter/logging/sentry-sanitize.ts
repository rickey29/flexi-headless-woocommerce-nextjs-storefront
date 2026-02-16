/**
 * Sentry PII Sanitization Utility
 *
 * Implements moderate PII sanitization for Sentry error reporting:
 * - Masks passwords, payment tokens, and sensitive credentials
 * - Masks full addresses (keeps city/state/country for context)
 * - Masks email addresses (keeps domain for debugging)
 * - Keeps partial names and IDs for debugging context
 *
 * This is LESS aggressive than the regular sanitize.ts to preserve
 * debugging context while still protecting customer PII.
 *
 * @since 1.0.0
 */

/**
 * Masks an email address (keeps domain for debugging)
 * Example: john.doe@example.com -> j***@example.com
 */
function maskEmail(email: string): string {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return '[INVALID_EMAIL]';
  }

  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return '[INVALID_EMAIL]';

  // Keep first character of local part
  const maskedLocal = localPart.length > 1 ? `${localPart[0]}***` : '***';

  return `${maskedLocal}@${domain}`;
}

/**
 * Masks a phone number (keeps last 4 digits)
 * Example: +1-555-123-4567 -> ***-***-4567
 */
function maskPhone(phone: string): string {
  if (!phone || typeof phone !== 'string') return '[REDACTED]';

  const digits = phone.replace(/\D/g, '');
  const lastFour = digits.slice(-4);
  return `***-***-${lastFour}`;
}

/**
 * Masks a name (keeps first letter)
 * Example: John Smith -> J*** S***
 */
function maskName(name: string): string {
  if (!name || typeof name !== 'string') return '[REDACTED]';

  return name
    .split(' ')
    .map((part) => (part.length > 0 ? `${part[0]}***` : ''))
    .join(' ');
}

/**
 * Sensitive field patterns to completely redact
 */
const SENSITIVE_PATTERNS = [
  'password',
  'passwd',
  'pwd',
  'secret',
  'token',
  'api_key',
  'apikey',
  'auth',
  'credit_card',
  'card_number',
  'cvv',
  'cvc',
  'ssn',
  'tax_id',
  'payment_method_token',
  'stripe_token',
  'payment_token',
] as const;

/**
 * Check if a field name indicates sensitive data
 */
export function isSensitiveField(fieldName: string): boolean {
  const lower = fieldName.toLowerCase();
  return SENSITIVE_PATTERNS.some((pattern) => lower.includes(pattern));
}

/**
 * Sanitize a single value based on field name
 */
function sanitizeValue(key: string, value: unknown): unknown {
  const keyLower = key.toLowerCase();

  // Completely mask sensitive fields
  if (isSensitiveField(keyLower)) {
    return '[REDACTED]';
  }

  // Handle string values
  if (typeof value === 'string') {
    // Sanitize email (keep domain)
    if (keyLower.includes('email') && value.includes('@')) {
      return maskEmail(value);
    }

    // Sanitize phone numbers
    if (keyLower.includes('phone') || keyLower.includes('tel')) {
      return maskPhone(value);
    }

    // Sanitize names (keep first letter)
    if (
      keyLower.includes('first_name') ||
      keyLower.includes('last_name') ||
      keyLower.includes('name')
    ) {
      return maskName(value);
    }

    // Return other strings as-is
    return value;
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return value.map((item, index) => {
      if (typeof item === 'object' && item !== null) {
        return sanitizeForSentry(item);
      }
      return sanitizeValue(`${key}_${index}`, item);
    });
  }

  // Handle objects
  if (typeof value === 'object' && value !== null) {
    // Check if this is an address object
    if (isAddressObject(value)) {
      return sanitizeAddress(value);
    }

    // Recursively sanitize nested objects
    return sanitizeForSentry(value);
  }

  // Return primitives as-is (numbers, booleans, null, undefined)
  return value;
}

/**
 * Check if an object looks like an address
 */
function isAddressObject(obj: object): boolean {
  const keys = Object.keys(obj).map((k) => k.toLowerCase());
  const addressIndicators = ['address_1', 'address_2', 'street', 'city', 'state', 'postcode'];
  return addressIndicators.some((indicator) => keys.includes(indicator));
}

/**
 * Sanitize address object (keep city/state/country, mask street)
 */
function sanitizeAddress(address: object): object {
  const sanitized: Record<string, unknown> = {};
  const keepFields = ['city', 'state', 'country', 'postcode', 'country_code', 'state_code'];
  const maskFields = ['address_1', 'address_2', 'street', 'line1', 'line2'];

  for (const [key, value] of Object.entries(address)) {
    const keyLower = key.toLowerCase();

    if (keepFields.includes(keyLower)) {
      sanitized[key] = value;
    } else if (maskFields.includes(keyLower)) {
      sanitized[key] = '[REDACTED]';
    } else {
      // Unknown field - sanitize recursively if object
      sanitized[key] =
        typeof value === 'object' && value !== null
          ? sanitizeForSentry(value)
          : sanitizeValue(key, value);
    }
  }

  return sanitized;
}

/**
 * Sanitize an object for Sentry error reporting
 *
 * Implements moderate PII sanitization:
 * - Masks passwords, tokens, and payment info
 * - Masks email local parts (keeps domain)
 * - Masks phone numbers (keeps partial)
 * - Masks full addresses (keeps city/state/country)
 * - Keeps partial names for context
 *
 * @param data - The data to sanitize
 * @returns Sanitized data safe for Sentry
 */
export function sanitizeForSentry(data: unknown): Record<string, unknown> | unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item, index) =>
      typeof item === 'object' && item !== null
        ? sanitizeForSentry(item)
        : sanitizeValue(`item_${index}`, item),
    );
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    sanitized[key] = sanitizeValue(key, value);
  }

  return sanitized;
}

/**
 * Sanitize error for Sentry
 *
 * Extracts safe error information and sanitizes any attached context.
 *
 * @param error - The error to sanitize
 * @param context - Additional context to include (will be sanitized)
 * @returns Sanitized error object
 */
export function sanitizeError(
  error: Error | unknown,
  context?: Record<string, unknown>,
): {
  message: string;
  name: string;
  stack?: string;
  context?: unknown;
} {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
      context: context ? sanitizeForSentry(context) : undefined,
    };
  }

  return {
    message: String(error),
    name: 'Unknown Error',
    context: context ? sanitizeForSentry(context) : undefined,
  };
}
