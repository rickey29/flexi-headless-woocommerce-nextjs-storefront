# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-02-14

### Changed

- **Renderer URL** — Production URL changed from `https://flexi-storefront.flxwoo.com` to `https://flexi.flxwoo.com`

### Added

- **Status page** — Replaced default Next.js/Vercel boilerplate root page with a branded FlexiWoo status page showing service name, running indicator, and API endpoints list (`/`, `page.tsx`)
- **Layout metadata** — Updated `layout.tsx` metadata from "Create Next App" defaults to FlexiWoo branding

### Removed

- Dead code cleanup: `ButtonLoadingState` and `setButtonLoading()` client-side utilities (API-only app)
- Dead code cleanup: unused theme components (`product-card`, `rating`, `price`)
- Dead code cleanup: redundant `validateFlexiRequest()` (duplicate of `validateRequest()`)
- Dead code cleanup: `sanitizePaymentIcon()` (no payment icon rendering exists)
- Dead code cleanup: `fetchSiteInfo()` stub and WordPress site-info placeholder
- Dead code cleanup: deprecated `ErrorReporter` type and `setErrorReporter()`
- Dead code cleanup: unused Next.js boilerplate SVGs (`globe.svg`, `window.svg`, `file.svg`)

## [1.0.0] - 2026-01-31

### Added

- Account page support with `/api/v1/account` endpoint for My Account rendering
- Product rendering with full WooCommerce product type support (simple, variable, grouped, external)
- Thumbnail gallery for product images with navigation
- Health monitoring endpoint at `/api/v1/health`
- Production-ready logging system with configurable log levels
- Sentry integration for error tracking (optional, disabled by default)
- PII sanitization for all logged data
- Rate limiting for API endpoints
- Zod schema validation for all API requests
- React Compiler for automatic memoization
- Currency formatting utilities
- WooCommerce Storefront theme styling with custom Tailwind colors

### Changed

- Migrated to core/adapter/themes architecture for better separation of concerns
- Refactored templates to match WooCommerce reference HTML structure
- Updated to Next.js 16.1.6

### Fixed

- Add-to-cart button visibility and consistency across product types
- Variable product button color consistency

### Security

- DoS protection limits in Zod schemas (max items, string lengths)
- Updated Next.js to 16.1.6 to patch DoS vulnerability
