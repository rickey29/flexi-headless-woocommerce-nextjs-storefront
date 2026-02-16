# Logging

flexi includes a production-ready logging system with PII sanitization.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `LOG_LEVEL` | `debug` (dev) / `warn` (prod) | Minimum log level: `debug`, `info`, `warn`, `error` |
| `LOG_JSON` | `false` (dev) / `true` (prod) | Enable structured JSON logging for log aggregation tools |
| `SENTRY_DSN` | - | Server-side Sentry DSN for error tracking (optional) |
| `NEXT_PUBLIC_SENTRY_DSN` | - | Client-side Sentry DSN (optional) |

---

## Logging Utilities

**Location:** `src/adapter/logging/logger.ts`

```typescript
import {
  logDebug,
  logInfo,
  logWarn,
  logError,
  generateRequestId,
  setRequestId,
  getRequestId,
} from '@/adapter/logging/logger';

// Generate unique request ID for tracing
const requestId = generateRequestId(); // "req_abc123_xyz789"

// Set request ID context (automatically included in all subsequent logs)
setRequestId(requestId);

// Log levels (respects LOG_LEVEL env var)
logDebug('Debug message', { context: 'value' });
logInfo('Info message');
logWarn('Warning message', { issue: 'details' });
logError('Error occurred', error, { context: 'value' });

// Get current request ID
const currentId = getRequestId();

// Specialized logging for render requests
logRenderRequest('product', requestId, { product_id: 123 });
logRenderComplete('product', requestId, 150, true); // 150ms, success

// Clear request ID when done
setRequestId(undefined);
```

---

## JSON Logging (Production)

When `LOG_JSON=true` (default in production), logs are output as structured JSON for log aggregation tools (CloudWatch, DataDog, etc.):

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "message": "Render complete",
  "request_id": "req_abc123",
  "context": { "duration_ms": 150 }
}
```

---

## PII Sanitization

**Location:** `src/adapter/logging/sanitize.ts`

All WooCommerce data should be sanitized before logging to prevent PII exposure:

```typescript
import { sanitizeProductData, sanitizeCartData, sanitizeRenderRequest } from '@/adapter/logging/sanitize';

// Sanitize before logging
logInfo('Received request', { data: sanitizeRenderRequest(requestData) });
```

### Sanitization Functions

| Function | Purpose |
|----------|---------|
| `sanitizeAddress()` | Masks names, emails, phones, addresses |
| `sanitizeProductData()` | Preserves product info, counts arrays |
| `sanitizeCartData()` | Preserves items/totals, redacts coupons |
| `sanitizeCheckoutData()` | Masks customer data, preserves payment/shipping info |
| `sanitizeOrderData()` | Masks customer data, preserves order summary |
| `sanitizePII()` | Regex-based masking for arbitrary text |

### What Gets Masked

- **Email addresses:** `john@example.com` → `j***@e***.com`
- **Phone numbers:** `555-1234` → `***-****`
- **Full names:** `John Smith` → `J*** S***`
- **Addresses:** Full masking
- **Payment information:** Never logged

---

## Logging Rules

### PII Sanitization Required

All logged data must be sanitized:

```typescript
// CORRECT
logInfo('Render request', { data: sanitizeRenderRequest(requestData) });

// WRONG: PII exposure
logInfo('Render request', { data: requestData });
```

### Never Log

- Email addresses (mask: `j***@e***.com`)
- Phone numbers (mask: `***-***-1234`)
- Full names (mask: `J*** S***`)
- Addresses
- Payment information
- IP addresses in production

---

## Sentry Integration (Optional)

flexi includes **automatic Sentry integration** for production error tracking. Sentry is **disabled by default** and only activates when configured.

### To Enable Sentry

1. Install `@sentry/nextjs`: `yarn add @sentry/nextjs`
2. Set environment variable: `SENTRY_DSN=https://your-dsn@sentry.io/project`

### How It Works

- In production, `logError()` automatically sends errors to Sentry
- PII is sanitized using `sanitizeForSentry()` before sending
- Request IDs are included for correlation
- No additional setup code required

### Sentry-Specific PII Sanitization

The `sentry-sanitize.ts` module provides moderate PII sanitization (less aggressive than logging) to preserve debugging context:

```typescript
import { sanitizeForSentry, sanitizeError } from '@/adapter/logging/sanitize';

// Sanitize data for Sentry (keeps city/state/country, masks street addresses)
const safeContext = sanitizeForSentry(customerData);

// Sanitize error with context
const safeError = sanitizeError(error, { order_id: 123, email: 'user@example.com' });
```

---

## Best Practices

1. **Always sanitize before logging** - Never log raw request data
2. **Use request IDs** - Correlate logs across a single request
3. **Appropriate log levels** - Debug for development, warn/error for production
4. **Structured logging** - Use JSON format in production for aggregation
5. **No PII ever** - When in doubt, mask it

---

## Related Documentation

- [Positioning & Boundaries](POSITIONING.md)
- [Architectural Rules](RULES.md)
- [flexi/flexi-woo Boundary](BOUNDARY.md)
- [API Reference](API.md)
- [Security](SECURITY.md)
- [Design System](DESIGN-SYSTEM.md)
- [Template Contract](template-contract-v1.md)
