/**
 * Product card component.
 * Reusable card for displaying products in grids (related products, shop, search, etc.)
 * Styled to match WooCommerce Storefront theme.
 */

import { escapeHtml, sanitizeUrl } from '@/lib/utils';

export interface ProductCardData {
  /** Product name */
  name: string;
  /** Product permalink */
  permalink: string;
  /** Formatted price string */
  priceFormatted: string;
  /** Product image */
  image?: {
    url: string;
    alt?: string;
  };
}

/**
 * Generate a product card HTML.
 */
export function productCard(product: ProductCardData): string {
  const imageHtml = product.image
    ? `<img src="${escapeHtml(product.image.url)}" alt="${escapeHtml(product.image.alt || product.name)}" class="aspect-square object-cover w-full">`
    : '<div class="aspect-square bg-storefront-bg"></div>';

  return `<a href="${sanitizeUrl(product.permalink)}" class="group block">
  <div class="border border-storefront-border overflow-hidden mb-3">
    ${imageHtml}
  </div>
  <h3 class="text-sm text-storefront-text group-hover:text-woo-purple">${escapeHtml(product.name)}</h3>
  <p class="text-storefront-text font-semibold mt-1">${escapeHtml(product.priceFormatted)}</p>
</a>`;
}

/**
 * Generate a grid of product cards.
 */
export function productCardsGrid(products: ProductCardData[]): string {
  if (products.length === 0) return '';

  return `<div class="grid grid-cols-2 md:grid-cols-4 gap-6">
  ${products.map(productCard).join('')}
</div>`;
}
