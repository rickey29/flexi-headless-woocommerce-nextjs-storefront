# Template Contract — v1 (HTML Strings Only)

## Scope
This document defines the **stable contract** between:
- flexi-woo (data provider)
- flexi (renderer)

This contract applies to **all templates**.

---

## Design Principles

- Templates are **pure functions**
- Templates return **HTML strings only**
- No JSX, React, or component frameworks
- No WordPress or WooCommerce calls inside templates

---

## Execution Flow (v1)

1. WordPress request reaches `template_redirect`
2. flexi-woo determines route eligibility
3. flexi-woo builds a JSON payload
4. Payload is sent to flexi renderer
5. flexi renders HTML OR signals fallback
6. flexi-woo outputs HTML or resumes Storefront

---

## RenderContextV1 (required input)

The renderer receives a JSON payload containing:

### request
- `url`
- `method`
- `query`
- `headers`

### route
- `name` (e.g. `product`, `cart`, `checkout`)
- `params` (ids, slugs, etc.)

### viewer
- `is_authenticated`
- `id` (optional)

### locale
- `language`
- `currency`

### site
- `home_url`

### flags
- `debug_trace`
- `headless_enabled`

---

## Template Data

Template data is:
- Fully resolved **before rendering**
- Specific to each template type
- Produced by flexi-woo, not by templates

Examples:
- Product template receives product data
- Cart template receives cart snapshot
- Account template receives page type + data

---

## RenderResultV1 (output)

### Required
- `html: string`

### Optional
- `status: number`
- `headers: object`
- `cache: { mode, ttlSeconds, tags }`
- `fallback: { allowed, reason }`

---

## Failure Rules

If rendering fails:
- flexi returns HTTP 503
- A fallback reason header is included
- flexi-woo resumes Storefront execution

In development:
- Missing required data SHOULD fail loudly

In production:
- Missing data SHOULD fallback safely

---

## Cache Rules (v1)

- Product pages MAY be cached
- Cart, checkout, payment, account pages MUST NOT be cached
- Renderer never assumes caching — cache policy is decided by flexi-woo

---

## Versioning

This contract is **v1**.
Breaking changes require a new version document.

---

## Related Documentation

- [Positioning & Boundaries](POSITIONING.md)
- [Architectural Rules](RULES.md)
- [flexi/flexi-woo Boundary](BOUNDARY.md)
- [API Reference](API.md)
- [Logging](LOGGING.md)
- [Security](SECURITY.md)
- [Design System](DESIGN-SYSTEM.md)
