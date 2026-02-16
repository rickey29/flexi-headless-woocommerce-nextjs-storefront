# Architectural Rules

> **These rules are non-negotiable. If a contribution violates any rule, it will not be accepted.**

For positioning and project identity, see [POSITIONING.md](POSITIONING.md).

---

## Core Principle

> **flexi is a pure rendering function: JSON in, HTML out, no side effects.**

Any code that violates this principle does not belong in flexi.

---

## What flexi IS

flexi is:

- A **stateless HTML rendering engine** for WooCommerce pages
- A **template composition system** using server-side string generation
- A **validation layer** that rejects malformed input gracefully
- A **security boundary** that sanitizes all output

**flexi is NOT a commerce engine, API gateway, or state manager.**

---

## What flexi MUST NEVER Do

flexi must **NEVER**:

- Store state between requests (no databases, no files, no global variables)
- Make outbound HTTP requests to WooCommerce or external services
- Calculate prices, taxes, shipping, or totals
- Validate business logic (cart rules, stock levels, coupon validity)
- Process payments or handle checkout submission
- Authenticate users or manage sessions
- Cache rendered output (caching is the caller's responsibility)
- Trust input data without Zod validation
- Include analytics, tracking, or telemetry
- Connect to external SaaS services
- Add "conversion optimization" features

**If your code needs to do any of the above, it belongs in flexi-woo or flx, not flexi.**

---

## Rendering Rules

### Pure Functions Only

All rendering functions must be:

- **Deterministic**: Same input always produces same output
- **Side-effect free**: No I/O, no mutations, no external calls
- **Synchronous**: No async operations in template generation

```typescript
// CORRECT: Pure rendering function
function renderPrice(price: string, onSale: boolean): string {
  return onSale
    ? `<span class="sale">${escapeHtml(price)}</span>`
    : `<span>${escapeHtml(price)}</span>`;
}

// WRONG: Side effect (logging in render)
function renderPrice(price: string): string {
  console.log(`Rendering price: ${price}`); // Side effect!
  return `<span>${price}</span>`;
}
```

### No State Persistence

flexi must not:

- Write to the filesystem
- Use global variables to store request data
- Accumulate data across requests
- Use in-memory caches that persist between requests (rate limiting is the exception)

---

## Input Validation Rules

### Zod Schemas Required

Every API endpoint must:

- Define a Zod schema for request validation
- Reject invalid requests with 503 + `x-flexi-fallback` header
- Never render with unvalidated data

```typescript
// CORRECT: Validate before rendering
const result = ProductRenderRequestSchema.safeParse(body);
if (!result.success) {
  return new Response('Validation failed', {
    status: 503,
    headers: { 'x-flexi-fallback': 'validation-error' },
  });
}
return renderProductPage(result.data);

// WRONG: Render without validation
return renderProductPage(body as ProductRenderRequest);
```

### Trust Nothing

- All input comes from flexi-woo (WordPress plugin)
- WordPress plugins can be compromised
- Validate and sanitize everything

---

## Security Rules

See [SECURITY.md](SECURITY.md) for complete security guidelines.

**Non-negotiable:**

- All user-controlled content must be HTML-escaped
- All URLs must be sanitized
- No dynamic code execution (`eval()`, `new Function()`)
- No code execution from request payloads

---

## Fallback Rules

### Graceful Degradation

When flexi cannot render, it must:

1. Return HTTP 503
2. Include `x-flexi-fallback` header with reason
3. Log the error (sanitized, no PII)

```typescript
return new Response('Render failed', {
  status: 503,
  headers: {
    'Content-Type': 'text/html; charset=utf-8',
    'x-flexi-fallback': 'template-error',
  },
});
```

### Never Crash

- Catch all errors in API routes
- Return fallback response instead of throwing
- WordPress will render native theme as backup

---

## Logging Rules

See [LOGGING.md](LOGGING.md) for complete logging documentation.

**Non-negotiable:**

- All logged data must be PII-sanitized
- Never log: email addresses, phone numbers, full names, addresses, payment info, IP addresses in production

---

## Template Architecture Rules

### Composable Templates

Templates must be:

- Small, focused functions
- Composable (templates call templates)
- Located in `/src/themes/`

### No Business Logic in Templates

Templates must only:

- Compose HTML strings
- Apply conditional rendering based on data presence
- Call `escapeHtml()` and `sanitizeUrl()`

Templates must never:

- Calculate values
- Make decisions about commerce rules
- Validate business constraints

---

## Performance Rules

### Render Fast

Target: < 100ms render time for any page

- No async operations in templates
- No database queries
- No external HTTP calls
- No heavy computation

### No Blocking Operations

API routes may use async for:

- Request parsing
- Rate limit checks
- Logging

But template generation must be synchronous.

---

## Explicitly Forbidden

The following are **not allowed** in FlexiWoo:

- React components or JSX templates
- Client-side rendering
- Next.js UI pages
- Mixing data fetching into templates
- Feature flags without active usage

---

## Anti-Patterns (Immediate Rejection)

Pull requests will be rejected if they include:

- State persistence between requests
- Outbound HTTP calls during rendering
- Unescaped user content in HTML
- Business logic in templates
- Price/tax/shipping calculations
- Unvalidated input rendering
- PII in logs
- "Just this once" exceptions

---

## Architectural Checklist

Before submitting a PR, verify:

1. Is rendering pure and side-effect free?
2. Is all input validated with Zod schemas?
3. Is all user content HTML-escaped?
4. Does failure return 503 with `x-flexi-fallback`?
5. Are logs free of PII?

**If any answer is NO → fix it before submitting.**

---

## Quick Reference

| Rule | Summary |
|------|---------|
| Core | JSON in, HTML out, no side effects |
| Never | Store state, make HTTP calls, or calculate prices |
| Render | Pure functions only, no state persistence |
| Validate | Zod validation required, trust nothing |
| Escape | HTML escape everything, sanitize URLs |
| Fallback | Return 503 + x-flexi-fallback on failure |
| Logs | Sanitize all logs, never log PII |
| Templates | Composable templates, no business logic |
| Performance | Render in < 100ms, no blocking operations |
| Exceptions | No "just this once" exceptions |

---

## Related Documentation

- [Positioning & Boundaries](POSITIONING.md)
- [flexi/flexi-woo Boundary](BOUNDARY.md)
- [API Reference](API.md)
- [Logging](LOGGING.md)
- [Security](SECURITY.md)
- [Design System](DESIGN-SYSTEM.md)
- [Template Contract](template-contract-v1.md)
