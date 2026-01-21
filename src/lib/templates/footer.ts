/**
 * Site footer generator.
 * Creates the footer with attribution.
 * Styled to match WooCommerce Storefront theme.
 */

import { escapeHtml } from '@/lib/utils';

export interface FooterOptions {
  /** Site name */
  siteName: string;
}

/**
 * Generate the site footer HTML.
 * Uses Storefront-inspired styling.
 */
export function footer(options: FooterOptions): string {
  const { siteName } = options;
  const year = new Date().getFullYear();

  return `<footer class="mt-12 border-t border-storefront-border bg-storefront-bg">
  <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 text-sm text-storefront-text-light text-center">
    <p>&copy; ${year} ${escapeHtml(siteName)}. Powered by <a href="https://github.com/user/flexiwoo" class="text-storefront-link hover:text-woo-purple hover:underline">FlexiWoo</a></p>
  </div>
</footer>`;
}
