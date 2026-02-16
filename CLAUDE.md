# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Quick Links

| Topic | Document |
|-------|----------|
| Positioning & Identity | [docs/POSITIONING.md](docs/POSITIONING.md) |
| Architectural Rules | [docs/RULES.md](docs/RULES.md) |
| flexi/flexi-woo Boundary | [docs/BOUNDARY.md](docs/BOUNDARY.md) |
| API Reference | [docs/API.md](docs/API.md) |
| Logging | [docs/LOGGING.md](docs/LOGGING.md) |
| Security | [docs/SECURITY.md](docs/SECURITY.md) |
| Design System | [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) |
| Template Contract | [docs/template-contract-v1.md](docs/template-contract-v1.md) |
| Changelog | [CHANGELOG.md](CHANGELOG.md) |

---

## Documentation Requirements

**CRITICAL:** When implementing any feature or bug fix, you MUST update related documentation immediately as part of the same task. This includes:

1. **Code Comments** - Update JSDoc/TSDoc comments for modified functions
2. **CLAUDE.md** - Update this file if the change affects:
   - API endpoints or request/response formats
   - Environment variables or configuration
   - Project structure or architecture
   - Development commands or workflows
3. **README.md** - Update if the change affects user-facing features or setup
4. **CHANGELOG.md** - Add entry for significant changes (features, breaking changes, deprecations)
5. **Type Definitions** - Ensure TypeScript types match implementation

**Documentation is NOT optional.** A feature is not complete until its documentation is updated.

---

## Development Commands

This project uses **yarn** as the package manager (not npm).

| Command | Description |
|---------|-------------|
| `yarn dev` | Start development server at http://localhost:3000 |
| `yarn build` | Build for production (outputs to `.next/`) |
| `yarn start` | Start production server (requires build first) |
| `yarn lint` | Run ESLint with Next.js and TypeScript rules |
| `yarn test` | Run tests with Vitest |
| `yarn test:watch` | Run tests in watch mode |
| `yarn test:coverage` | Run tests with coverage report |

---

## Architecture Overview

### Core Principle

> **flexi is a pure rendering function: JSON in, HTML out, no side effects.**

For complete architectural rules, see [docs/RULES.md](docs/RULES.md).

### Technology Stack

- **Next.js 16.1.1** - React framework with SSR
- **React 19.2.3** - UI library
- **React Compiler** - Automatic memoization (enabled)
- **TypeScript** - Strict mode enabled
- **Tailwind CSS v4** - Utility-first styling
- **ESLint** - Code quality with Next.js core-web-vitals rules

### Layer Architecture

| Layer | Directory | Responsibility |
|-------|-----------|----------------|
| Core | `src/core/` | Pure logic, schemas, types, config |
| Adapter | `src/adapter/` | HTTP handling, WordPress integration, renderers |
| Themes | `src/themes/` | HTML string templates |
| API | `src/app/api/` | Next.js API routes (API only, no UI) |

See [ARCHITECTURE.md](ARCHITECTURE.md) for complete directory responsibilities.

---

## Key Configuration

### TypeScript Path Aliases

- `@/*` maps to the project root directory
- Example: `import Component from '@/lib/utils'`

### Styling

- **Tailwind CSS v4** with inline utility classes
- **WooCommerce Storefront theme** colors and typography
- See [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) for complete design system

### React Compiler

This project uses the React Compiler. Always follow the Rules of React: do not mutate props or state, and avoid manual memoization hooks like `useMemo` or `useCallback` unless explicitly asked.

---

## Project Structure

```
/src/
  /app/                  # Next.js App Router (API only)
    /api/v1/            # API routes for flexi-woo integration
  /core/                # Pure logic layer
    /schemas/           # Zod validation schemas
    /types/             # TypeScript types
    /config/            # Environment configuration
    /utils/             # Pure utility functions
  /adapter/             # IO and orchestration layer
    /http/              # Headers, rate limiting
    /renderers/         # Page orchestration
    /logging/           # Logger utilities
    /validation/        # Validation helpers
    /wordpress/         # WordPress integration constants
  /themes/              # HTML templates
    /global/            # Head, header, footer
    /product/           # Product page templates
/docs/                  # Documentation
/public/                # Static assets
```

### Adding API Routes

- Create `/app/api/[route-name]/route.ts`
- Export functions: `GET`, `POST`, `PUT`, `DELETE`, etc.
- See [docs/API.md](docs/API.md) for endpoint specifications

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `LOG_LEVEL` | `debug` (dev) / `warn` (prod) | Minimum log level |
| `LOG_JSON` | `false` (dev) / `true` (prod) | Enable JSON logging |
| `SENTRY_DSN` | - | Sentry DSN for error tracking (optional) |

See [docs/LOGGING.md](docs/LOGGING.md) for complete logging documentation.

---

## Related Projects

### flexi-woo (WordPress Plugin)

- **Location:** `/var/www/woo/wp-content/plugins/flexi-woo`
- **Purpose:** Bridges WooCommerce with the flexi renderer
- **Distribution:** GitHub only (not WordPress.org)

### flx/flx-woo (Separate Commercial Product)

FlxWoo is a **separate commercial product** with different goals:

| Aspect | FlexiWoo | FlxWoo |
|--------|----------|--------|
| Type | Infrastructure | Product |
| Model | Self-hosted | Centralized SaaS |
| Distribution | GitHub | WordPress.org |
| Analytics | Never | Yes |
| Cost | Free | Paid |

See [docs/POSITIONING.md](docs/POSITIONING.md) for complete positioning information.

---

## ESLint Configuration

- Uses flat config format (ESLint v9)
- Extends `next/core-web-vitals` and `next/typescript`
- Ignores: `.next/`, `build/`, `out/`, `next-env.d.ts`
