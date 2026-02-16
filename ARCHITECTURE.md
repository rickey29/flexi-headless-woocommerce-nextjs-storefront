# FlexiWoo Architecture

## Purpose

FlexiWoo is a **headless HTML rendering engine** for WooCommerce.

It exposes **API endpoints that return raw HTML strings**.
It is **not** a React application, and it does **not** render JSX.

For positioning and project identity, see [docs/POSITIONING.md](docs/POSITIONING.md).

---

## Core Principles

1. **HTML strings only**
   - All templates return plain HTML strings
   - No JSX, no React components, no client-side rendering

2. **API-only surface**
   - FlexiWoo exposes functionality exclusively via API endpoints
   - There is no user-facing Next.js UI

3. **Strict layer separation**
   - Core: pure logic and contracts
   - Adapter: orchestration and IO
   - Themes: HTML templates only

4. **No speculative infrastructure**
   - Do not add systems (feature flags, services, analytics) unless actively used

---

## Directory Responsibilities

### `src/core/` — Core Layer (Pure, Stable)

Contains logic that is:
- Framework-agnostic
- Side-effect free
- Safe to reuse

Includes:
- `schemas/` — Zod schemas (runtime validation only)
- `types/` — TypeScript types and interfaces only
- `config/` — Environment parsing and configuration
- `utils/` — Pure utility functions

**Rules:**
- No HTTP, no WordPress calls
- No rendering
- No filesystem or network access

---

### `src/adapter/` — Adapter Layer (IO + Orchestration)

Responsible for:
- HTTP request/response handling
- WordPress REST API integration
- Calling renderers and returning HTML

Includes:
- `http/` — Headers, rate limiting, request helpers
- `wordpress/` — WordPress/WooCommerce API integration
- `renderers/` — Page orchestration (data → templates)
- `logging/`, `validation/`

**Rules:**
- Adapters may call core and themes
- Adapters must not contain business rules
- Adapters must not generate JSX or UI state

---

### `src/themes/` — Theme Layer (HTML Rendering)

Contains:
- HTML string templates only
- No network access
- No side effects

Structure:
- `global/` — Page skeleton (head, header, footer)
- `components/` — Reusable HTML blocks
- Feature folders (e.g. `product/`, `account/`)

**Rules:**
- Templates are pure functions
- No data fetching
- No environment access

---

### `src/app/` — Next.js API Router (API Only)

FlexiWoo uses Next.js **only** for API routing.

**Allowed:**
- `src/app/api/**`

**Not allowed:**
- `layout.tsx`
- `page.tsx`
- `globals.css`
- Any user-facing React pages

---

## Mental Model

> FlexiWoo is an **HTML rendering service**, not a web app.

If a change makes FlexiWoo feel more like a frontend application, it is almost certainly wrong.

---

## Related Documentation

- [Positioning & Boundaries](docs/POSITIONING.md)
- [Architectural Rules](docs/RULES.md)
- [flexi/flexi-woo Boundary](docs/BOUNDARY.md)
- [API Reference](docs/API.md)
- [Logging](docs/LOGGING.md)
- [Security](docs/SECURITY.md)
- [Design System](docs/DESIGN-SYSTEM.md)
- [Template Contract](docs/template-contract-v1.md)
