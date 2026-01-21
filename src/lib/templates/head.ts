/**
 * HTML document head generator.
 * Creates the <head> section with meta tags, title, and Tailwind CSS.
 * Styled to match WooCommerce Storefront theme.
 */

import { escapeHtml } from '@/lib/utils';

export interface HeadOptions {
  /** Page title */
  title: string;
  /** Meta description */
  description?: string;
  /** Canonical URL */
  canonicalUrl?: string;
}

/**
 * Storefront theme custom styles for Tailwind CSS v4.
 * Colors and typography match the official WooCommerce Storefront theme.
 */
const storefrontStyles = `
<style type="text/tailwindcss">
@theme {
  /* Storefront Color Palette */
  --color-woo-purple: #7f54b3;
  --color-woo-purple-dark: #6b4799;
  --color-storefront-text: #43454b;
  --color-storefront-text-light: #6b6b6b;
  --color-storefront-link: #2c2d33;
  --color-storefront-border: rgba(0, 0, 0, 0.05);
  --color-storefront-success: #0f834d;
  --color-storefront-error: #e2401c;
  --color-storefront-info: #3d9cd2;
  --color-storefront-bg: #f5f5f5;
}
</style>
<style>
/* Storefront base styles */
body {
  font-family: "Source Sans Pro", "HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
/* Lighter heading weights like Storefront */
h1, h2, h3, h4, h5, h6 {
  font-weight: 300;
}
</style>`;

/**
 * Generate the HTML <head> section.
 * Uses Tailwind CSS v4 browser runtime via CDN with Storefront theme customizations.
 */
export function head(options: HeadOptions): string {
  const { title, description, canonicalUrl } = options;

  return `<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  ${description ? `<meta name="description" content="${escapeHtml(description)}">` : ''}
  ${canonicalUrl ? `<link rel="canonical" href="${escapeHtml(canonicalUrl)}">` : ''}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  ${storefrontStyles}
</head>`;
}
