# Design System

flexi uses a design system based on the WooCommerce Storefront theme for familiar, consistent UI.

---

## Design Goal

The UI should match the look and feel of the WooCommerce Storefront theme so end users feel familiar with the design.

---

## Color Palette

### Tailwind Custom Theme Colors

Defined in `head.ts`:

| Color Name | Hex Value | Usage |
|------------|-----------|-------|
| `woo-purple` | #7f54b3 | Primary accent, buttons on hover, links on hover, focus states |
| `woo-purple-dark` | #6b4799 | Darker purple variant |
| `storefront-text` | #43454b | Main body text, headings |
| `storefront-text-light` | #6b6b6b | Secondary text, labels, descriptions |
| `storefront-link` | #2c2d33 | Default link color |
| `storefront-border` | rgba(0,0,0,0.05) | Subtle borders, dividers |
| `storefront-success` | #0f834d | Success messages, sale prices, "FREE" shipping |
| `storefront-error` | #e2401c | Error messages, required field indicators |
| `storefront-info` | #3d9cd2 | Info notices |
| `storefront-bg` | #f5f5f5 | Background color for sections |

---

## Typography

### Font Family

**Source Sans Pro** (Google Fonts) - Storefront's default font

### Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| Light | 300 | Headings (matches Storefront's elegant heading style) |
| Normal | 400 | Body text |
| Semibold | 600 | Emphasis, prices |

---

## UI Patterns

### Buttons

Dark background with white text, hover to WooCommerce purple:

```html
<button class="bg-storefront-text text-white hover:bg-woo-purple">
  Add to Cart
</button>
```

### Links

Hover to WooCommerce purple with underline:

```html
<a class="text-storefront-link hover:text-woo-purple hover:underline">
  View Details
</a>
```

### Focus States

WooCommerce purple ring:

```html
<input class="focus:ring-woo-purple focus:border-woo-purple">
```

### Borders

Use subtle Storefront border color:

```html
<div class="border border-storefront-border">
```

### Cards/Sections

White background with subtle border:

```html
<div class="bg-white border border-storefront-border rounded">
```

---

## Example Usage in Templates

### Button

```typescript
<button class="bg-storefront-text text-white hover:bg-woo-purple">Add to Cart</button>
```

### Link

```typescript
<a class="text-storefront-link hover:text-woo-purple hover:underline">View Details</a>
```

### Heading

```typescript
<h1 class="text-2xl font-light text-storefront-text">Product Name</h1>
```

### Secondary Text

```typescript
<p class="text-sm text-storefront-text-light">SKU: ABC123</p>
```

### Success/Sale Price

```typescript
<span class="text-storefront-success font-semibold">$19.99</span>
```

### Error Message

```typescript
<span class="text-storefront-error">This field is required</span>
```

### Info Notice

```typescript
<div class="bg-storefront-info/10 text-storefront-info p-4 rounded">
  Shipping calculated at checkout
</div>
```

---

## Responsive Design

### Breakpoints

Use Tailwind's responsive prefixes:

| Prefix | Min Width | Usage |
|--------|-----------|-------|
| `sm:` | 640px | Small screens |
| `md:` | 768px | Medium screens (tablets) |
| `lg:` | 1024px | Large screens (desktops) |
| `xl:` | 1280px | Extra large screens |
| `2xl:` | 1536px | Wide screens |

### Example

```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <!-- Product grid -->
</div>
```

---

## Dark Mode

### Classes

Use `dark:` prefix for dark mode styles:

```html
<div class="bg-white dark:bg-gray-900 text-storefront-text dark:text-gray-100">
```

### CSS Variables

Global styles in `/app/globals.css` define CSS variables:

- `--background` and `--foreground` for theme colors
- Dark mode via `prefers-color-scheme` media query

---

## Consistency with flx

Both flexi and flx use the identical Storefront theme colors and typography to ensure visual consistency when both plugins are active on a WooCommerce store.

---

## Font Optimization

- Uses `next/font` for optimized Google Fonts loading
- Source Sans Pro is configured in `/app/layout.tsx`
- Fonts are automatically self-hosted and optimized

---

## Related Documentation

- [Positioning & Boundaries](POSITIONING.md)
- [Architectural Rules](RULES.md)
- [flexi/flexi-woo Boundary](BOUNDARY.md)
- [API Reference](API.md)
- [Logging](LOGGING.md)
- [Security](SECURITY.md)
- [Template Contract](template-contract-v1.md)
