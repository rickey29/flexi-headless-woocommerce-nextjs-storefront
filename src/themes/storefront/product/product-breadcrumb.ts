/**
 * Product breadcrumb sub-module.
 * Handles breadcrumb navigation display.
 * Styled to match reference HTML.
 */

import { escapeHtml, sanitizeUrl } from '@/core/utils/html';
import type { ProductCategory } from '@/core/schemas';

export interface BreadcrumbData {
  /** Home URL */
  homeUrl: string;
  /** Product categories */
  categories: ProductCategory[];
  /** Product name */
  productName: string;
}

/**
 * Generate the breadcrumb HTML.
 */
export function generateBreadcrumb(data: BreadcrumbData): string {
  const categoryLinks = data.categories
    .map(
      (cat) =>
        `<a href="${sanitizeUrl(cat.permalink)}" class="underline hover:text-gray-700">${escapeHtml(cat.name)}</a>
      <span class="text-gray-400">/</span>`
    )
    .join('\n      ');

  return `<nav class="py-3 text-xs text-gray-500 flex items-center flex-wrap gap-x-1">
    <svg class="w-3 h-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
    </svg>
    <a href="${sanitizeUrl(data.homeUrl)}" class="underline hover:text-gray-700">Home</a>
    <span class="text-gray-400">/</span>
    ${categoryLinks}
    <span class="text-gray-600">${escapeHtml(data.productName)}</span>
  </nav>`;
}
