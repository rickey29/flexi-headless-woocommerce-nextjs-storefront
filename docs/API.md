# API Reference

This document defines all API endpoints for flexi-woo integration.

---

## Overview

flexi exposes REST API endpoints that receive page data from flexi-woo (WordPress plugin) and return rendered HTML.

**Communication Pattern:**

```
flexi-woo (WordPress) → POST /api/v1/{page-type} → flexi (renderer) → HTML response
```

---

## Core Product Pages

### POST /api/v1/product

Render single product detail page.

**Request:**

```json
{
  "home_url": "https://example.com",
  "product_data": {
    "id": 123,
    "name": "Product Name",
    "price": "$29.99",
    "images": [...],
    "variations": [...]
  }
}
```

**Response:** HTML page or 503 with `x-flexi-fallback` header

---

### POST /api/v1/shop

Render main shop/archive page with product grid.

**Request:**

```json
{
  "home_url": "https://example.com",
  "products": [...],
  "pagination": {
    "current_page": 1,
    "total_pages": 5
  }
}
```

**Response:** HTML page or 503 with `x-flexi-fallback` header

---

### POST /api/v1/category

Render product category page.

**Request:**

```json
{
  "home_url": "https://example.com",
  "category": {
    "id": 10,
    "name": "Clothing",
    "slug": "clothing"
  },
  "products": [...],
  "subcategories": [...]
}
```

**Response:** HTML page or 503 with `x-flexi-fallback` header

---

## Account & User Pages

### POST /api/v1/account

Render My Account pages (dashboard, orders, addresses, etc.).

**Request:**

```json
{
  "home_url": "https://example.com",
  "page_type": "dashboard",
  "account_data": {
    "user": {...},
    "orders": [...],
    "addresses": {...}
  }
}
```

**Response:** HTML page or 503 with `x-flexi-fallback` header

---

## Search & Filters

### POST /api/v1/search

Render search results page.

**Request:**

```json
{
  "home_url": "https://example.com",
  "query": "blue shirt",
  "results": [...],
  "pagination": {...}
}
```

**Response:** HTML page or 503 with `x-flexi-fallback` header

---

## Cart, Checkout & Thank You Pages

### POST /api/v1/cart

Render shopping cart page.

**Request:**

```json
{
  "home_url": "https://example.com",
  "cart_data": {
    "items": [...],
    "totals": {
      "subtotal": "$99.00",
      "tax": "$8.00",
      "total": "$107.00"
    },
    "coupons": [...]
  }
}
```

**Response:** HTML page or 503 with `x-flexi-fallback` header

---

### POST /api/v1/checkout

Render checkout page.

**Request:**

```json
{
  "home_url": "https://example.com",
  "checkout_data": {
    "cart": {...},
    "customer": {...},
    "payment_methods": [...],
    "shipping_methods": [...]
  }
}
```

**Response:** HTML page or 503 with `x-flexi-fallback` header

---

### POST /api/v1/thank-you

Render order confirmation/thank you page.

**Request:**

```json
{
  "home_url": "https://example.com",
  "order_data": {
    "order_id": "12345",
    "items": [...],
    "totals": {...},
    "customer": {...}
  }
}
```

**Response:** HTML page or 503 with `x-flexi-fallback` header

---

## Additional WooCommerce Pages

Plan for endpoints to handle:

- Tag archives
- Attribute/filter pages
- Brand pages (if using brand plugins)
- Wishlist pages (if using wishlist plugins)
- Other WooCommerce page types

---

## Endpoint Status

| Endpoint | Purpose | Status |
|----------|---------|--------|
| `POST /api/v1/product` | Render product detail page | Implemented |
| `POST /api/v1/shop` | Render shop/archive page | Planned |
| `POST /api/v1/category` | Render category page | Planned |
| `POST /api/v1/cart` | Render cart page | Planned |
| `POST /api/v1/checkout` | Render checkout page | Planned |
| `POST /api/v1/thank-you` | Render order confirmation | Planned |
| `POST /api/v1/account` | Render My Account pages | Implemented |
| `POST /api/v1/search` | Render search results | Planned |

---

## Response Format

### Success (200)

Returns complete HTML page as response body.

### Fallback (503)

When rendering fails, flexi returns:

- **Status code:** 503 Service Unavailable
- **Header:** `x-flexi-fallback: {reason}`
  - `validation-error` - Input validation failed
  - `template-error` - Template rendering failed
  - `internal-error` - Unexpected error
- **Body:** HTML error page or empty

The flexi-woo plugin checks for the `x-flexi-fallback` header and displays the native WooCommerce page instead.

---

## Fallback Strategy

All rendering endpoints should:

1. Return complete HTML on success (200)
2. Return 503 with `x-flexi-fallback: {reason}` header on failure
3. Support graceful degradation (WordPress shows native page if flexi fails)

**Fallback is not an error** — it is a supported execution path.

---

## flexi-woo → flexi Communication

flexi-woo sends rendering requests to flexi for ALL WooCommerce pages:

| Endpoint | Page Type |
|----------|-----------|
| POST `/api/v1/product` | Product detail page |
| POST `/api/v1/shop` | Shop/archive page |
| POST `/api/v1/category` | Category page |
| POST `/api/v1/account` | My Account pages |
| POST `/api/v1/search` | Search results |
| POST `/api/v1/cart` | Cart page |
| POST `/api/v1/checkout` | Checkout page |
| POST `/api/v1/thank-you` | Order confirmation page |

---

## flexi → flexi-woo Communication

Currently, flexi does not fetch data from flexi-woo. All data is pushed from flexi-woo to flexi via POST requests. Future REST API endpoints may be added when needed:

| Endpoint | Purpose | Status |
|----------|---------|--------|
| GET `/wp-json/flexi-woo/v1/site-info` | Fetch site metadata (currency, language, etc.) | Planned |
| GET `/wp-json/flexi-woo/v1/product/[id]` | Fetch product data | Planned |
| GET `/wp-json/flexi-woo/v1/categories` | Fetch category hierarchy | Planned |

---

## Configuration

### flexi-woo Configuration

flexi-woo uses `FLEXI_RENDERER_URL` to point to flexi:

- **Development:** `http://localhost:3000`
- **Production:** Custom domain pointing to flexi deployment (e.g., `https://render.flexiplat.com`)

### flexi Environment Variables

Create `.env.local` for development:

```env
# WordPress Site (for development/testing)
WORDPRESS_URL=http://localhost:8080  # Your WooCommerce dev site with flexi-woo

# Optional: API keys for production multi-tenant setup
# FLEXI_API_KEY=<optional-api-key-for-validation>
```

**Note:** flexi is designed as a free open-source solution. Unlike the premium flx product, flexi typically doesn't require complex analytics or API key management unless you're running it as a hosted service for multiple stores.

---

## Related Documentation

- [Positioning & Boundaries](POSITIONING.md)
- [Architectural Rules](RULES.md)
- [flexi/flexi-woo Boundary](BOUNDARY.md)
- [Logging](LOGGING.md)
- [Security](SECURITY.md)
- [Design System](DESIGN-SYSTEM.md)
- [Template Contract](template-contract-v1.md)
