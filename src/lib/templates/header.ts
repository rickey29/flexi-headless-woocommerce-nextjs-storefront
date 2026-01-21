/**
 * Site header generator.
 * Creates the navigation header with logo and links.
 * Styled to match WooCommerce Storefront theme.
 */

import { escapeHtml, sanitizeUrl } from '@/lib/utils';

export interface HeaderOptions {
  /** Site name for logo text */
  siteName: string;
  /** Home URL for logo link */
  homeUrl: string;
  /** Current page identifier (for navigation highlighting) */
  currentPage?: string;
}

/**
 * Generate the site header HTML.
 * Uses Storefront-inspired styling.
 */
export function header(options: HeaderOptions): string {
  const { siteName, homeUrl } = options;

  return `<header class="border-b border-storefront-border bg-white">
  <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
    <a href="${sanitizeUrl(homeUrl)}" class="text-2xl font-light text-storefront-text no-underline hover:text-woo-purple">${escapeHtml(siteName)}</a>
  </div>
</header>`;
}
