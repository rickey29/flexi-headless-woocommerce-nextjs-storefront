/**
 * Product categories sub-module.
 * Handles category tags display.
 * Styled to match WooCommerce Storefront theme.
 */

import { escapeHtml, sanitizeUrl } from '@/lib/utils';
import type { ProductCategory } from '@/lib/schemas';

/**
 * Generate the categories HTML.
 * Returns empty string if no categories.
 */
export function generateCategories(categories: ProductCategory[]): string {
  if (categories.length === 0) return '';

  const tags = categories
    .map(
      (cat) =>
        `<a href="${sanitizeUrl(cat.permalink)}" class="text-sm text-storefront-link hover:text-woo-purple hover:underline">${escapeHtml(cat.name)}</a>`,
    )
    .join(', ');

  return `<p class="text-sm text-storefront-text-light">Category: ${tags}</p>`;
}
