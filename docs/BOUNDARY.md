# Flexi / Flexi-Woo Boundary

## Purpose
This document defines the **hard architectural boundary** between `flexi` and `flexi-woo`.
Its goal is to prevent drift while converting Storefront page-by-page to headless.

This boundary is **mandatory**, not advisory.

---

## Definitions

### flexi (core renderer)
`flexi` is a **headless HTML rendering service**.

It:
- Receives structured JSON payloads
- Renders **HTML strings only**
- Returns HTML or an explicit fallback signal

It has **no knowledge of WordPress or WooCommerce internals**.

---

### flexi-woo (WordPress / WooCommerce adapter)
`flexi-woo` is a **WordPress plugin** that:
- Intercepts requests at `template_redirect`
- Decides whether headless rendering applies
- Collects WooCommerce + WordPress data
- Calls `flexi`
- Outputs HTML or falls back to the original theme

---

## Hard Rules

### flexi MUST NOT
- Call WordPress or WooCommerce functions
- Know WooCommerce concepts (cart, checkout, gateways, coupons)
- Perform authentication or nonce validation
- Read or write WordPress options, transients, or user meta
- Contain routing or URL parsing logic

### flexi-woo MUST NOT
- Implement a generic rendering framework
- Implement a generic template engine
- Define cross-platform abstractions
- Handle non-Woo commerce logic
- Perform HTML rendering logic itself

---

## Ownership by Responsibility

### Belongs in flexi
- Template registry
- Rendering pipeline (resolve → render → respond)
- RenderContext definition
- Template contract versioning
- Renderer-side fallback signaling (e.g. 503 + reason)
- Renderer-side performance timing

### Belongs in flexi-woo
- `template_redirect` interception
- Route detection (product, cart, checkout, account, etc.)
- WooCommerce data aggregation
- Viewer/user context construction
- Caching of rendered HTML
- Cache invalidation via Woo hooks
- HTTP response headers
- Fallback to Storefront theme

---

## Fallback Contract

- `flexi` signals fallback by returning HTTP 503 with a reason header
- `flexi-woo` interprets the signal
- WordPress theme execution resumes normally

Fallback is **not an error** — it is a supported execution path.

---

## Enforcement

- Every new file MUST clearly belong to either `flexi` or `flexi-woo`
- No “temporary” Woo logic is allowed inside flexi
- All Woo-specific behavior belongs in flexi-woo

If unsure: **default to flexi-woo**.

---

## Related Documentation

- [Positioning & Boundaries](POSITIONING.md)
- [Architectural Rules](RULES.md)
- [API Reference](API.md)
- [Logging](LOGGING.md)
- [Security](SECURITY.md)
- [Design System](DESIGN-SYSTEM.md)
- [Template Contract](template-contract-v1.md)
