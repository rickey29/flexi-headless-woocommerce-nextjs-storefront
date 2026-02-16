# FlexiWoo (flexi)

> **Free Open-Source Reference Rendering Engine for WooCommerce**
> A fork-friendly infrastructure project for developers and agencies

FlexiWoo is a **reference rendering engine** that generates HTML for WooCommerce pages. It is designed for developers and agencies who want full ownership and control over their headless WooCommerce UI.

**100% Free and Open Source Forever (MIT License)**

---

## What FlexiWoo Is

FlexiWoo is **infrastructure**, not a product:

- **Reference Implementation** - A starting point for developers to fork and customize
- **Fork-Friendly** - Opinionated and minimal so you can extend it your way
- **Self-Hosted** - You run your own flexi instance; no SaaS dependency
- **Developer-First** - Designed for developers and agencies, not end-users
- **UI-Only** - Renders HTML pages; does not process payments or manage sessions

For complete positioning, see [docs/POSITIONING.md](docs/POSITIONING.md).

---

## Features

- **Fast Rendering** - Next.js 16 with React 19 for optimal performance
- **Complete Page Coverage** - Renders ALL WooCommerce pages (products, shop, cart, checkout, thank-you, account, search)
- **WooCommerce Storefront Design** - Familiar UI that matches the popular Storefront theme
- **Secure by Default** - Zod validation, PII sanitization, HTML escaping
- **Graceful Fallback** - Automatically reverts to native WooCommerce if renderer unavailable
- **Production-Ready Logging** - Structured logging with configurable levels and request tracing
- **Easy to Fork** - Clean Tailwind CSS v4 templates that you can customize
- **No Telemetry** - No analytics, tracking, or external service dependencies

---

## Architecture

FlexiWoo consists of two components:

### 1. flexi (This Repository)

**Next.js Rendering Engine**

- **Technology:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Zod
- **Purpose:** Receives page data from WordPress, renders HTML
- **Deployment:** Self-hosted on Vercel, Docker, or any Node.js hosting

### 2. flexi-woo (WordPress Plugin)

**WordPress Bridge** - [See flexi-woo on GitHub](https://github.com/rickey29/flexi-woo)

- **Technology:** PHP 8+, WooCommerce 8+
- **Purpose:** Intercepts WooCommerce pages, sends data to flexi, displays rendered HTML
- **Distribution:** GitHub only (not WordPress.org)

**How it works:**

```
Customer visits WooCommerce page
         ↓
WordPress/flexi-woo intercepts request
         ↓
flexi-woo sends page data to flexi (POST /api/v1/product, /cart, etc.)
         ↓
flexi renders HTML with modern design
         ↓
WordPress displays the rendered page
```

---

## Quick Start

### Prerequisites

- **Node.js:** 18+
- **Yarn:** 1.22+ (this project uses yarn, not npm)
- **WordPress:** 6.0+ with WooCommerce 8.0+ (for the flexi-woo plugin)

### Installation

```bash
# Clone the repository
git clone https://github.com/rickey29/flexi-storefront.git
cd flexi-storefront

# Install dependencies
yarn install

# Start development server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Environment Variables

Create `.env.local` for development:

```env
# Logging level: debug, info, warn, error
LOG_LEVEL=debug

# Optional: Sentry DSN for production error tracking
# SENTRY_DSN=https://your-sentry-dsn
```

---

## Development Commands

```bash
# Development
yarn dev              # Start dev server (http://localhost:3000)
yarn build            # Build for production
yarn start            # Start production server
yarn lint             # Run ESLint

# Testing
yarn test             # Run tests with Vitest
yarn test:watch       # Run tests in watch mode
yarn test:coverage    # Generate coverage report
```

---

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.1 | React framework with SSR |
| React | 19.2.3 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Utility-first styling |
| Zod | 4.x | Schema validation |
| Vitest | 4.x | Testing framework |

---

## Documentation

| Document | Description |
|----------|-------------|
| [docs/POSITIONING.md](docs/POSITIONING.md) | Project identity, FlexiWoo vs FlxWoo |
| [docs/RULES.md](docs/RULES.md) | Architectural rules (non-negotiable) |
| [docs/API.md](docs/API.md) | API endpoint reference |
| [docs/SECURITY.md](docs/SECURITY.md) | Security guidelines |
| [docs/LOGGING.md](docs/LOGGING.md) | Logging system documentation |
| [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) | UI design system |
| [docs/BOUNDARY.md](docs/BOUNDARY.md) | flexi/flexi-woo boundary |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Directory structure and layers |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guidelines |
| [CHANGELOG.md](CHANGELOG.md) | Version history and release notes |

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Ensure all tests pass (`yarn test`)
5. Ensure linting passes (`yarn lint`)
6. Commit your changes
7. Push to your branch
8. Open a Pull Request

---

## License

MIT License - Free for personal and commercial use.

---

## Support

- **Issues:** [GitHub Issues](https://github.com/rickey29/flexi-storefront/issues)
- **Discussions:** [GitHub Discussions](https://github.com/rickey29/flexi-storefront/discussions)

---

<p align="center">
  Built with Next.js and WooCommerce
</p>
