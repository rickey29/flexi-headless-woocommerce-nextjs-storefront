# FlexiWoo Positioning & Boundaries

> **This is the single source of truth for FlexiWoo's positioning.**

---

## Core Identity

> **FlexiWoo is INFRASTRUCTURE, not a product.**

FlexiWoo (flexi + flexi-woo) is a **free, open-source reference rendering engine** for WooCommerce pages. It is designed for developers and agencies who want full ownership and control over their headless WooCommerce UI rendering.

---

## What FlexiWoo IS

- **Reference Infrastructure** - A rendering substrate that developers fork, customize, and self-host
- **Fork-Friendly by Design** - Opinionated and minimal so developers can extend it their way
- **Developer-First** - Target audience is developers and agencies, not end-users seeking a plug-and-play solution
- **UI-Only** - Renders HTML pages; does not process payments, manage sessions, or handle commerce logic
- **Local-Only** - Self-hosted by each developer/agency; no centralized SaaS dependency
- **GitHub Distribution** - flexi-woo is distributed via GitHub, NOT WordPress.org

---

## What FlexiWoo is NOT

- **NOT a mass-market WordPress plugin** - flexi-woo is not intended for the WordPress.org plugin directory
- **NOT a product for everyone** - It requires developer knowledge to deploy and customize
- **NOT a SaaS** - Each user self-hosts their own flexi instance
- **NOT a conversion optimization tool** - That's flx/flx-woo territory
- **NOT competing with flx** - FlexiWoo is infrastructure; flx is a product (different purposes)

---

## MUST / MUST NOT Rules

### FlexiWoo MUST:

- Remain free and open-source forever
- Be easy to fork, customize, and self-host
- Work without any external SaaS dependencies
- Focus on UI rendering only (stateless HTML generation)
- Maintain clear architectural boundaries

### FlexiWoo MUST NOT:

- Include analytics, tracking, or telemetry
- Require connection to any centralized service
- Add "conversion optimization" or payment processing features
- Compete with flx/flx-woo's product scope
- Be distributed via WordPress.org (GitHub only)

---

## FlexiWoo vs FlxWoo Comparison

| Aspect | FlexiWoo (flexi + flexi-woo) | FlxWoo (flx + flx-woo) |
|--------|------------------------------|------------------------|
| **Type** | Infrastructure | Product |
| **Model** | Self-hosted, fork-friendly | Centralized SaaS |
| **Audience** | Developers, agencies | WooCommerce merchants |
| **Distribution** | GitHub only | WordPress.org |
| **Scope** | All WooCommerce pages (UI only) | Cart/checkout/thank-you + payment optimization |
| **Analytics** | Never | Yes (conversion tracking, A/B testing) |
| **Cost** | Free forever | Paid subscription |

**Key Distinction:**
- FlexiWoo renders pages (infrastructure)
- FlxWoo runs the checkout (product)
- They share architectural patterns, not responsibility

---

## Multi-Project Architecture

FlexiWoo consists of two interconnected sub-projects:

### 1. flexi (Next.js Renderer)

- Stateless HTML rendering engine for WooCommerce pages
- Renders ALL WooCommerce page types: products, shop, categories, cart, checkout, thank-you, account, search
- Provides REST APIs that receive page data and return rendered HTML
- Free and open-source forever (MIT license)
- Fork-friendly: designed for developers to customize and self-host

### 2. flexi-woo (WordPress Plugin)

- Bridges WooCommerce with the flexi renderer
- Intercepts WooCommerce page requests and sends data to flexi for rendering
- Read-only: never mutates WooCommerce state
- **Distributed via GitHub only** (not WordPress.org)
- Free and open-source forever (MIT license)

**Project Naming:**

- **FlexiWoo**: Overall project name (infrastructure)
- **flexi**: Next.js renderer sub-project
- **flexi-woo**: WordPress plugin sub-project

---

## Installation Scenarios

| Scenario | UI Rendering | Payment/Conversion Features |
|----------|--------------|----------------------------|
| **FlexiWoo only** | flexi renders ALL pages (self-hosted) | WooCommerce native |
| **flx-woo only** | flx renders cart/checkout/thank-you only | flx optimization features |
| **Both installed** | flexi renders ALL pages (priority 5) | flx-woo adds payment features (priority 10) |

When both are installed, FlexiWoo handles UI rendering for all pages; flx-woo provides premium payment/conversion features on top.

---

## Plugin Priority Architecture

### Route Coverage

- **flexi-woo (Infrastructure)**: Handles ALL WooCommerce pages (product, shop, category, account, search, cart, checkout, thank-you, etc.)
- **flx-woo (Product)**: Provides payment/conversion optimization; includes basic UI rendering for cart/checkout/thank-you as fallback when FlexiWoo is not installed

### Function Separation

- **FlexiWoo (Infrastructure)**: Solves the headless UI rendering problem - stateless HTML generation for WooCommerce pages
- **FlxWoo (Product)**: Solves payment processing and conversion optimization - checkout product with analytics, A/B testing, etc.

### Technical Priority

When both plugins are active:

- **flexi-woo** uses `template_redirect` hook at **priority 5** for UI rendering (early bypass for 30-40% performance gain)
- **flx-woo** uses `template_redirect` hook at **priority 10** for UI rendering (runs later, as fallback)
- **flx-woo** uses payment-specific hooks at **priority 10** for payment/conversion features
- Lower priority number runs first → flexi-woo renders the UI for ALL pages (including cart/checkout/thank-you)
- flx-woo's template_redirect handler (priority 10) is skipped when flexi-woo renders, but its payment hooks remain active

---

## Request Flow

```
Customer Browser
      ↓
WordPress Store (WooCommerce)
      ↓
flexi-woo (intercepts ALL WooCommerce pages)
      ↓ POST page data (product, shop, cart, checkout, thank-you, etc.)
flexi (this project) - Renders HTML for ALL pages
      ↓ Returns rendered HTML
WordPress displays complete headless store
      ↓
[Optional] flx-woo provides payment optimization features
```

---

## Target Audience

FlexiWoo is designed for **developers and agencies** who want:

- Full ownership and control over their headless WooCommerce UI
- A reference implementation to fork and customize
- No vendor lock-in or SaaS dependencies

---

## Related Documentation

- [Architectural Rules](RULES.md)
- [flexi/flexi-woo Boundary](BOUNDARY.md)
- [API Reference](API.md)
- [Logging](LOGGING.md)
- [Security](SECURITY.md)
- [Design System](DESIGN-SYSTEM.md)
- [Template Contract](template-contract-v1.md)
