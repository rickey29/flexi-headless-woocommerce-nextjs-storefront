# Headless WooCommerce — FlexiWoo (Next.js Reference Implementation)

FlexiWoo is a production-ready Headless WooCommerce reference implementation built with Next.js.

It provides a self-hosted rendering layer that keeps WooCommerce as the transactional backend while enabling a modern decoupled frontend architecture.

FlexiWoo is infrastructure, not a SaaS product — it is designed for developers and agencies who want full frontend control while preserving WooCommerce compatibility.

---

## What is Headless WooCommerce

Headless WooCommerce separates the frontend presentation layer from the WooCommerce backend, allowing modern frameworks to render pages while WooCommerce continues handling products, orders, and payments.

FlexiWoo is **infrastructure**, not a product:

- **Reference Implementation** - A starting point for developers to fork and customize
- **Fork-Friendly** - Opinionated and minimal so you can extend it your way
- **Self-Hosted** - You run your own flexi instance; no SaaS dependency
- **Developer-First** - Designed for developers and agencies, not end-users
- **UI-Only** - Renders HTML pages; does not process payments or manage sessions

For complete positioning, see [docs/POSITIONING.md](docs/POSITIONING.md).

---

## Why Headless WooCommerce is Hard

- **Session Coupling** - WooCommerce ties cart and checkout state to server-side PHP sessions, which a decoupled frontend cannot access without bridging cookies and nonces across domains
- **Cart State Drift** - Cart contents can diverge between the frontend and WooCommerce when concurrent requests, coupons, or inventory changes modify server state between renders
- **Payment Gateway Redirects** - Many gateways assume checkout is served by WordPress and redirect to wp-relative URLs, breaking the flow when the frontend runs on a separate host
- **Return-to-Checkout Edge Cases** - Payment callbacks, 3-D Secure returns, and order-pay links expect WordPress-routed URLs and session continuity that a headless frontend must reconstruct
- **Timing and Race Conditions** - Nonce expiration, shipping rate recalculation, and coupon validation can fail when the delay between frontend render and backend POST exceeds WooCommerce's expected timing
- **Plugin Compatibility** - WooCommerce extensions often inject markup via PHP hooks or enqueue scripts that assume a WordPress theme, making them invisible or broken in a headless setup
- **Cache Invalidation** - Aggressive caching of product or cart data can serve stale prices, stock levels, or session tokens; correct invalidation requires coordination between the CDN, the renderer, and WooCommerce
- **Theme-Coupled Hooks** - WooCommerce core and many plugins fire actions and filters inside theme templates; decoupling the theme removes those execution paths and their side effects

---

## FlexiWoo Headless Architecture

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

## Headless WooCommerce Architecture

Headless WooCommerce separates the frontend rendering layer from the WooCommerce backend engine. WooCommerce remains responsible for products, customers, orders, payments, and server-side session behavior. The flexi-woo plugin intercepts WooCommerce page requests and assembles the page data needed for rendering. It sends this data to flexi (the Next.js renderer) over REST endpoints such as product, cart, and checkout payloads. flexi renders the page into HTML and returns the result to WordPress. WordPress then serves the rendered HTML to the visitor while preserving WooCommerce's native transactional logic. If the renderer is unavailable, the request falls back to native WooCommerce rendering to maintain availability.

For a broader conceptual explanation, see the [headless WooCommerce overview on FlexPlat](https://flexplat.com/headless-woocommerce).

---

## Headless WooCommerce Checkout (Important)

FlexiWoo renders the checkout page as a headless frontend, but it does not process payments or manage orders. WooCommerce continues to handle payment gateways, order creation, and server-side session logic. FlexiWoo is UI-only for checkout and does not replace WooCommerce's payment infrastructure. This separation preserves compatibility with existing gateways and WooCommerce extensions.

---

## Quick Start

### Prerequisites

- **Node.js:** 18+
- **Yarn:** 1.22+ (this project uses yarn, not npm)
- **WordPress:** 6.0+ with WooCommerce 8.0+ (for the flexi-woo plugin)

### Installation

```bash
# Clone the repository
git clone https://github.com/rickey29/flexiwoo-headless-woocommerce.git
cd flexiwoo-headless-woocommerce

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

## When FlexiWoo is Enough — and When It Isn't

FlexiWoo is suitable when you need a production-ready headless rendering layer for WooCommerce pages with minimal architectural overhead. It works well for agencies and developers who want full control over frontend templates while keeping WooCommerce as the backend engine. FlexiWoo is not a payment orchestration or checkout recovery system; WooCommerce continues to handle transactions and order lifecycle management. For advanced payment reliability, recovery workflows, or enterprise guarantees, additional infrastructure may be required.

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

- **Issues:** [GitHub Issues](https://github.com/rickey29/flexiwoo-headless-woocommerce/issues)
- **Discussions:** [GitHub Discussions](https://github.com/rickey29/flexiwoo-headless-woocommerce/discussions)

---

<p align="center">
  Built with Next.js and WooCommerce
</p>
