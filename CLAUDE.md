# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Important:** Before making changes, review [CONTRIBUTING.md](CONTRIBUTING.md) for non-negotiable architectural rules.

## Project Overview

FlexiWoo is a **FREE open-source headless WooCommerce renderer** built with Next.js. It receives page data from a WordPress plugin (flexi-woo) and renders modern, fast HTML pages.

**Core Principle:** FlexiWoo is a pure rendering function - JSON in, HTML out, no side effects.

## Development Commands

This project uses **yarn** as the package manager (not npm).

```bash
yarn dev              # Start development server at http://localhost:3000
yarn build            # Build for production
yarn start            # Start production server
yarn lint             # Run ESLint
yarn test             # Run tests with Vitest
yarn test:watch       # Run tests in watch mode
yarn test:coverage    # Run tests with coverage report
```

## Architecture

### Technology Stack

- **Next.js 16** - React framework with App Router
- **React 19** - UI library with React Compiler enabled
- **TypeScript** - Strict mode enabled
- **Tailwind CSS v4** - Utility-first styling (CDN-based for templates)
- **Zod** - Schema validation
- **Vitest** - Testing framework

### Project Structure

```
/src/
  /app/                  # Next.js App Router
    layout.tsx           # Root layout
    page.tsx             # Home page
    globals.css          # Global styles
    /api/v1/             # API routes for rendering
      /product/route.ts  # Product page renderer
  /lib/
    /config/             # Environment configuration
      env.ts             # LOG_LEVEL, environment detection
    /schemas/            # Zod validation schemas
      product.ts         # Product data schemas
      shared.ts          # Shared schemas (images, categories, etc.)
      validation.ts      # Validation utilities
    /templates/          # HTML template generators
      head.ts            # <head> section with Tailwind config
      header.ts          # Site header
      footer.ts          # Site footer
      /components/       # Reusable UI components
      /product/          # Product page templates
    /renderers/          # Page orchestrators
      product.ts         # Product page renderer
    /utils/              # Utility functions
      html.ts            # HTML escaping (escapeHtml, sanitizeUrl)
      logger.ts          # Structured logging
      sanitize.ts        # PII sanitization
      rate-limit.ts      # Rate limiting
      headers.ts         # Response headers
```

### Key Patterns

**1. Rendering Flow:**
```
WordPress -> POST /api/v1/product -> Validate with Zod -> Render templates -> Return HTML
```

**2. Error Handling:**
- Return 503 with `x-flexi-fallback` header on failure
- WordPress falls back to native theme rendering
- Never crash - always return a valid response

**3. Security:**
- All user content must be escaped with `escapeHtml()`
- All URLs must be sanitized with `sanitizeUrl()`
- All input must be validated with Zod schemas
- All logs must be sanitized for PII

## API Routes

### POST /api/v1/product

Renders a product detail page.

**Request:**
```typescript
{
  home_url: string;           // WordPress site URL
  product_data: ProductData;  // Product information
  site_info: SiteInfo;        // Currency, formatting settings
}
```

**Success Response (200):**
- Content-Type: text/html; charset=utf-8
- Body: Complete HTML page

**Failure Response (503):**
- Header: x-flexi-fallback: {reason}
- Body: JSON with error details

## Schemas

All schemas are defined with Zod and handle WordPress/WooCommerce data quirks:

- Empty arrays that WordPress sends as objects: `{}`
- Numbers that may come as strings: `"123"` or `123`
- Optional fields with various default values

## Templates

Templates are pure functions that generate HTML strings:

```typescript
// Pure rendering function - no side effects
function renderPrice(price: string, onSale: boolean): string {
  return onSale
    ? `<span class="sale">${escapeHtml(price)}</span>`
    : `<span>${escapeHtml(price)}</span>`;
}
```

## UI Design: WooCommerce Storefront Theme

Templates use Storefront theme colors defined in `head.ts`:

| Color               | Hex       | Usage                    |
| ------------------- | --------- | ------------------------ |
| `woo-purple`        | #7f54b3   | Primary accent, buttons  |
| `storefront-text`   | #43454b   | Main text, headings      |
| `storefront-success`| #0f834d   | Sale prices, success     |
| `storefront-error`  | #e2401c   | Errors, required fields  |

## Logging

```typescript
import { logInfo, logError, generateRequestId } from '@/lib/utils';

const requestId = generateRequestId();
logInfo('Processing', { requestId });
logError('Failed', error, { requestId });
```

**Environment Variables:**
- `LOG_LEVEL`: debug, info, warn, error (default: debug in dev, warn in prod)
- `LOG_JSON`: true/false (default: false in dev, true in prod)
- `SENTRY_DSN`: Optional Sentry error tracking

## Non-Negotiable Rules

1. **No state between requests** - No databases, files, or globals
2. **No outbound HTTP calls** - All data comes from the request
3. **No business logic** - No price calculations, validation of commerce rules
4. **Escape everything** - All user content must be HTML escaped
5. **Validate everything** - All input must pass Zod validation
6. **Sanitize logs** - No PII in logs (emails, names, addresses)

See [CONTRIBUTING.md](CONTRIBUTING.md) for complete rules.
