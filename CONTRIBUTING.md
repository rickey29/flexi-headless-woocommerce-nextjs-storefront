# Contributing to headless-woocommerce-nextjs-storefront

Thank you for contributing to this project.

This project is a **stateless rendering engine** with intentionally strict architectural boundaries. These rules are not preferences — they are **non-negotiable constraints** designed to keep this project fast, secure, and predictable.

**If a contribution violates any rule below, it will not be accepted.**

---

## 1. Core Principle (Must Read)

> **This project is a pure rendering function: JSON in, HTML out, no side effects.**

Any code that violates this principle does not belong in this project.

---

## 2. What This Project IS

This project is:

- A **stateless HTML rendering engine** for WooCommerce pages
- A **template composition system** using server-side string generation
- A **validation layer** that rejects malformed input gracefully
- A **security boundary** that sanitizes all output

**This project is NOT a commerce engine, API gateway, or state manager.**

---

## 3. What This Project Is NOT (Non-Negotiable)

This project must **NEVER**:

- Store state between requests (no databases, no files, no global variables)
- Make outbound HTTP requests to WooCommerce or external services
- Calculate prices, taxes, shipping, or totals
- Validate business logic (cart rules, stock levels, coupon validity)
- Process payments or handle checkout submission
- Authenticate users or manage sessions
- Cache rendered output (caching is the caller's responsibility)
- Trust input data without Zod validation

**If your code needs to do any of the above, it belongs in flexi-woo or flx, not this project.**

---

## 4. Rendering Rules

### 4.1 Pure Functions Only

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

### 4.2 No State Persistence

This project must not:

- Write to the filesystem
- Use global variables to store request data
- Accumulate data across requests
- Use in-memory caches that persist between requests (rate limiting is the exception)

---

## 5. Input Validation Rules

### 5.1 Zod Schemas Required

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

### 5.2 Trust Nothing

- All input comes from flexi-woo (WordPress plugin)
- WordPress plugins can be compromised
- Validate and sanitize everything

---

## 6. Security Rules (Non-Negotiable)

### 6.1 HTML Escaping

All user-controlled content must be escaped:

```typescript
// CORRECT
`<h1>${escapeHtml(product.name)}</h1>`
// WRONG: XSS vulnerability
`<h1>${product.name}</h1>`;
```

Use `escapeHtml()` from `@/lib/utils` for all:

- Product names, descriptions, SKUs
- Category and tag names
- Customer-provided data
- Any string from the request payload

### 6.2 URL Sanitization

All URLs must be sanitized:

```typescript
// CORRECT
`<a href="${sanitizeUrl(product.permalink)}">`
// WRONG: javascript: injection possible
`<a href="${product.permalink}">`;
```

### 6.3 No Dynamic Code Execution

This project must never:

- Use `eval()` or `new Function()`
- Execute code from request payloads
- Dynamically import modules based on input

---

## 7. Fallback Rules

### 7.1 Graceful Degradation

When this project cannot render, it must:

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

### 7.2 Never Crash

- Catch all errors in API routes
- Return fallback response instead of throwing
- WordPress will render native theme as backup

---

## 8. Logging Rules

### 8.1 PII Sanitization Required

All logged data must be sanitized:

```typescript
// CORRECT
logInfo('Render request', { data: sanitizeRenderRequest(requestData) });

// WRONG: PII exposure
logInfo('Render request', { data: requestData });
```

### 8.2 Never Log

- Email addresses (mask: `j***@e***.com`)
- Phone numbers (mask: `***-***-1234`)
- Full names (mask: `J*** S***`)
- Addresses
- Payment information
- IP addresses in production

---

## 9. Template Architecture Rules

### 9.1 Composable Templates

Templates must be:

- Small, focused functions
- Composable (templates call templates)
- Located in `/src/lib/templates/`

```
templates/
├── head.ts           # <head> section
├── header.ts         # Site header
├── footer.ts         # Site footer
├── components/       # Reusable UI components
│   ├── price.ts
│   ├── rating.ts
│   └── product-card.ts
└── product/          # Product page sections
    ├── index.ts      # Orchestrator
    ├── product-images.ts
    └── product-info.ts
```

### 9.2 No Business Logic in Templates

Templates must only:

- Compose HTML strings
- Apply conditional rendering based on data presence
- Call `escapeHtml()` and `sanitizeUrl()`

Templates must never:

- Calculate values
- Make decisions about commerce rules
- Validate business constraints

---

## 10. Performance Rules

### 10.1 Render Fast

Target: < 100ms render time for any page

- No async operations in templates
- No database queries
- No external HTTP calls
- No heavy computation

### 10.2 No Blocking Operations

API routes may use async for:

- Request parsing
- Rate limit checks
- Logging

But template generation must be synchronous.

---

## 11. Anti-Patterns (Immediate Rejection)

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

## 12. Architectural Checklist (Before Submitting)

Before submitting a PR, verify:

1. Is rendering pure and side-effect free?
2. Is all input validated with Zod schemas?
3. Is all user content HTML-escaped?
4. Does failure return 503 with `x-flexi-fallback`?
5. Are logs free of PII?

**If any answer is NO → fix it before submitting.**

---

## 13. Final Note

This project's strength comes from **what it refuses to do**.

Maintaining strict boundaries allows:

- Predictable rendering behavior
- Safe operation under any input
- Clean separation from commerce logic
- Horizontal scaling without state concerns

---

## Quick Reference

| Section | Rule                                                    |
| ------- | ------------------------------------------------------- |
| §1      | JSON in, HTML out, no side effects                      |
| §3      | Never store state, make HTTP calls, or calculate prices |
| §4      | Pure functions only, no state persistence               |
| §5      | Zod validation required, trust nothing                  |
| §6      | HTML escape everything, sanitize URLs                   |
| §7      | Return 503 + x-flexi-fallback on failure                |
| §8      | Sanitize all logs, never log PII                        |
| §9      | Composable templates, no business logic                 |
| §10     | Render in < 100ms, no blocking operations               |
| §11     | No "just this once" exceptions                          |
