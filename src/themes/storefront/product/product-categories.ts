/**
 * Product categories sub-module.
 * Handles category display in SKU section.
 * Styled to match reference HTML.
 */

import { escapeHtml, sanitizeUrl } from '@/core/utils/html';
import type { ProductCategory } from '@/core/schemas';

/**
 * Generate the categories HTML for SKU section.
 * Returns empty string if no categories.
 */
export function generateCategories(categories: ProductCategory[]): string {
  if (categories.length === 0) return '';

  const links = categories
    .map(
      (cat) =>
        `<a href="${sanitizeUrl(cat.permalink)}" class="text-gray-600 underline hover:text-gray-800">${escapeHtml(cat.name)}</a>`,
    )
    .join(', ');

  return `<p>Category: ${links}</p>`;
}
