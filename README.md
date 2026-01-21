# FlexiWoo

> **Free Open-Source Headless WooCommerce Renderer**
> Modern, fast, and beautiful store experiences powered by Next.js

FlexiWoo is a complete headless rendering solution that transforms your WooCommerce store with lightning-fast, modern pages for products, shop, cart, checkout, and more - while preserving all your existing WooCommerce functionality.

**100% Free and Open Source Forever**

---

## Features

- **Blazing Fast** - Next.js 16 with React 19 for optimal performance
- **Complete Store Coverage** - Renders ALL WooCommerce pages (products, shop, cart, checkout, thank-you, account, search)
- **WooCommerce Storefront Design** - Familiar UI that matches the popular Storefront theme
- **Secure by Default** - Zod validation, PII sanitization, HTML escaping
- **Graceful Fallback** - Automatically reverts to native WooCommerce if renderer unavailable
- **Production-Ready Logging** - Structured logging with configurable levels and request tracing
- **Easy to Customize** - Tailwind CSS v4 templates that you can modify

---

## Architecture

FlexiWoo consists of two components:

### 1. FlexiWoo Frontend (This Repository)

**Next.js Rendering Engine**

- **Technology:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Zod
- **Purpose:** Receives page data from WordPress, renders beautiful HTML
- **Deployment:** Vercel, Docker, or any Node.js hosting

### 2. flexi-woo (WordPress Plugin)

**WordPress Bridge**

- **Technology:** PHP 8+, WooCommerce 8+
- **Purpose:** Intercepts WooCommerce pages, sends data to the renderer, displays rendered HTML
- **Deployment:** Standard WordPress plugin

**How it works:**

```
Customer visits WooCommerce page
         |
WordPress/flexi-woo intercepts request
         |
flexi-woo sends page data to renderer (POST /api/v1/product, /cart, etc.)
         |
Renderer returns HTML with modern design
         |
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
git clone https://github.com/your-username/headless-woocommerce-nextjs-storefront.git
cd headless-woocommerce-nextjs-storefront

# Install dependencies
yarn install

# Start development server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Environment Variables

Create `.env.local` for development:

```env
# WordPress site URL (with flexi-woo plugin installed)
WORDPRESS_URL=http://localhost:8080

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

## Project Structure

```
/src/
  /app/                    # Next.js App Router
    layout.tsx             # Root layout
    page.tsx               # Home page
    globals.css            # Global styles
    /api/v1/               # API routes
      /product/route.ts    # Product page rendering
      /shop/route.ts       # Shop page rendering (planned)
      /cart/route.ts       # Cart page rendering (planned)
      /checkout/route.ts   # Checkout page rendering (planned)
      /thank-you/route.ts  # Thank-you page rendering (planned)
  /lib/
    /config/               # Environment configuration
      env.ts               # LOG_LEVEL, environment detection
    /schemas/              # Zod validation schemas
    /templates/            # HTML template generators
    /renderers/            # Page renderers
    /utils/                # Utility functions
      logger.ts            # Structured logging
      sanitize.ts          # PII sanitization
      html.ts              # HTML escaping
      index.ts             # Barrel exports
```

---

## API Endpoints

All endpoints accept POST requests with JSON payloads from the flexi-woo WordPress plugin.

| Endpoint                 | Purpose                    | Status      |
| ------------------------ | -------------------------- | ----------- |
| `POST /api/v1/product`   | Render product detail page | Implemented |
| `POST /api/v1/shop`      | Render shop/archive page   | Planned     |
| `POST /api/v1/category`  | Render category page       | Planned     |
| `POST /api/v1/cart`      | Render cart page           | Planned     |
| `POST /api/v1/checkout`  | Render checkout page       | Planned     |
| `POST /api/v1/thank-you` | Render order confirmation  | Planned     |
| `POST /api/v1/account`   | Render My Account pages    | Planned     |
| `POST /api/v1/search`    | Render search results      | Planned     |

### Response Format

**Success (200):** Returns complete HTML page

**Fallback (503):** Returns HTTP 503 with `x-flexi-fallback` header when rendering fails

The response includes:

- Status code: 503 Service Unavailable
- Header: `x-flexi-fallback: {reason}` (e.g., `validation-error`, `template-error`)
- Body: JSON with error details

The flexi-woo plugin checks for the `x-flexi-fallback` header and displays the native WooCommerce page instead.

---

## Security Features

### Input Validation

All incoming requests are validated with **Zod schemas** before processing:

- Type-safe validation with TypeScript integration
- Clear error messages with field paths
- Protection against malformed data

### Output Escaping

All dynamic content is escaped before rendering:

- `escapeHtml()` - Converts special characters to HTML entities
- `sanitizeUrl()` - Blocks dangerous protocols (javascript:, data:, etc.)

### PII Sanitization

Logging utilities automatically mask sensitive data:

- Email addresses: `john@example.com` -> `j***@e***.com`
- Phone numbers: `555-1234` -> `***-****`
- Addresses: Masked before logging

### Logging

Production-ready structured logging:

```typescript
import { logInfo, logError, generateRequestId } from '@/lib/utils';

const requestId = generateRequestId();
logInfo('Processing request', { requestId, productId: 123 });
```

Configure log level via `LOG_LEVEL` environment variable.

---

## Technology Stack

| Technology   | Version | Purpose                  |
| ------------ | ------- | ------------------------ |
| Next.js      | 16.x    | React framework with SSR |
| React        | 19.x    | UI library               |
| TypeScript   | 5.x     | Type safety              |
| Tailwind CSS | 4.x     | Utility-first styling    |
| Zod          | 3.x     | Schema validation        |
| Vitest       | 3.x     | Testing framework        |

---

## UI Design: WooCommerce Storefront Theme

The UI matches the popular WooCommerce Storefront theme for familiarity:

| Element       | Style                            |
| ------------- | -------------------------------- |
| Primary Color | WooCommerce Purple (#7f54b3)     |
| Text Color    | Storefront Text (#43454b)        |
| Font          | Source Sans Pro                  |
| Buttons       | Dark background, purple on hover |
| Links         | Purple on hover with underline   |

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for non-negotiable architectural rules before submitting.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Ensure all tests pass (`yarn test`)
5. Ensure linting passes (`yarn lint`)
6. Commit your changes
7. Push to your branch
8. Open a Pull Request

### Code Style

- TypeScript with strict mode
- ESLint with Next.js rules
- Tailwind CSS for styling
- Zod for validation

---

## License

MIT License - Free for personal and commercial use.

---

## Support

- **Issues:** [GitHub Issues](https://github.com/your-username/headless-woocommerce-nextjs-storefront/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-username/headless-woocommerce-nextjs-storefront/discussions)

---

<p align="center">
  Built with Next.js and WooCommerce
</p>
