# Security

This document defines security rules and best practices for flexi.

---

## Core Security Principle

> **Trust nothing. Validate everything. Escape all output.**

All input comes from flexi-woo (WordPress plugin). WordPress plugins can be compromised. Therefore, flexi must validate and sanitize everything.

---

## Input Validation

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

### Type-Safe Validation

- Zod provides TypeScript integration for type safety
- Clear error messages with field paths
- Protection against malformed data

---

## Output Escaping

### HTML Escaping (Non-Negotiable)

All user-controlled content must be escaped before rendering:

```typescript
// CORRECT: XSS protection
`<h1>${escapeHtml(product.name)}</h1>`

// WRONG: XSS vulnerability
`<h1>${product.name}</h1>`
```

### What Must Be Escaped

Use `escapeHtml()` from `@/core/utils/html` for all:

- Product names, descriptions, SKUs
- Category and tag names
- Customer-provided data
- Any string from the request payload

### escapeHtml Function

**Location:** `src/core/utils/html.ts`

Converts special characters to HTML entities:

| Character | Entity |
|-----------|--------|
| `&` | `&amp;` |
| `<` | `&lt;` |
| `>` | `&gt;` |
| `"` | `&quot;` |
| `'` | `&#39;` |

---

## URL Sanitization

### All URLs Must Be Sanitized

```typescript
// CORRECT: Safe URLs
`<a href="${sanitizeUrl(product.permalink)}">`

// WRONG: javascript: injection possible
`<a href="${product.permalink}">`
```

### Blocked Protocols

The `sanitizeUrl()` function blocks dangerous protocols:

- `javascript:`
- `data:`
- `vbscript:`
- Other potentially harmful schemes

### Allowed Protocols

- `http://`
- `https://`
- Relative URLs (`/path/to/page`)

---

## No Dynamic Code Execution

flexi must never:

- Use `eval()` or `new Function()`
- Execute code from request payloads
- Dynamically import modules based on input

```typescript
// FORBIDDEN: Dynamic code execution
eval(userInput);
new Function('return ' + userInput)();

// FORBIDDEN: Dynamic imports from user input
const module = await import(userProvidedPath);
```

---

## PII Protection

### Sanitization Required in Logs

All logged data must be sanitized. See [LOGGING.md](LOGGING.md) for complete documentation.

```typescript
// CORRECT
logInfo('Render request', { data: sanitizeRenderRequest(requestData) });

// WRONG: PII exposure
logInfo('Render request', { data: requestData });
```

### Never Log

- Email addresses
- Phone numbers
- Full names
- Addresses
- Payment information
- IP addresses (in production)

---

## Security Checklist

Before submitting code, verify:

1. **Input Validation**
   - [ ] All input validated with Zod schemas
   - [ ] Invalid input returns 503 with `x-flexi-fallback`
   - [ ] No type assertions (`as`) on unvalidated data

2. **Output Escaping**
   - [ ] All user content HTML-escaped with `escapeHtml()`
   - [ ] All URLs sanitized with `sanitizeUrl()`
   - [ ] No raw string interpolation of user data

3. **No Code Execution**
   - [ ] No `eval()` or `new Function()`
   - [ ] No dynamic imports based on user input
   - [ ] No code execution from payloads

4. **PII Protection**
   - [ ] All logged data sanitized
   - [ ] No PII in error messages
   - [ ] No sensitive data in client responses

---

## Common Vulnerabilities to Avoid

### XSS (Cross-Site Scripting)

**Vulnerable:**
```typescript
`<div>${userInput}</div>`
```

**Safe:**
```typescript
`<div>${escapeHtml(userInput)}</div>`
```

### URL Injection

**Vulnerable:**
```typescript
`<a href="${url}">`
```

**Safe:**
```typescript
`<a href="${sanitizeUrl(url)}">`
```

### Prototype Pollution

**Mitigated by:** Zod validation prevents unexpected object properties

### SQL Injection

**Not applicable:** flexi does not use databases

### Command Injection

**Not applicable:** flexi does not execute shell commands

---

## Error Handling

### Graceful Degradation

When security validation fails:

1. Return HTTP 503
2. Include `x-flexi-fallback` header with reason
3. Log sanitized error details
4. WordPress renders native theme as fallback

```typescript
return new Response('Validation failed', {
  status: 503,
  headers: {
    'Content-Type': 'text/html; charset=utf-8',
    'x-flexi-fallback': 'validation-error',
  },
});
```

### Never Expose Internal Details

- Don't include stack traces in responses
- Don't expose file paths
- Don't leak database structure (if any)
- Don't expose environment variables

---

## Related Documentation

- [Positioning & Boundaries](POSITIONING.md)
- [Architectural Rules](RULES.md)
- [flexi/flexi-woo Boundary](BOUNDARY.md)
- [API Reference](API.md)
- [Logging](LOGGING.md)
- [Design System](DESIGN-SYSTEM.md)
- [Template Contract](template-contract-v1.md)
