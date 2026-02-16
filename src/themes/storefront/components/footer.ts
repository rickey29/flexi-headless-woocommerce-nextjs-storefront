/**
 * Site footer generator.
 * Creates the footer with attribution.
 * Styled to match WooCommerce Storefront theme.
 */

import { escapeHtml, sanitizeUrl } from '@/core/utils/html';

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
  const wooCommerceUrl = 'https://woocommerce.com/';

  return `<footer class="bg-gray-100 px-5 md:px-6 lg:px-12 py-8 mt-4">
    <div class="max-w-5xl md:max-w-none lg:max-w-6xl mx-auto text-sm text-gray-600">
      <p class="mb-1">&copy; ${escapeHtml(siteName)} ${year}</p>
      <p><a href="${sanitizeUrl(wooCommerceUrl)}" class="underline hover:text-gray-800">Built with WooCommerce</a>.</p>
    </div>
  </footer>`;
}

export interface MobileBottomNavOptions {
  /** Home URL */
  homeUrl: string;
}

/**
 * Generate the mobile bottom navigation bar HTML.
 * Only visible on mobile devices.
 */
export function mobileBottomNav(options: MobileBottomNavOptions): string {
  const { homeUrl } = options;
  const accountUrl = sanitizeUrl(`${homeUrl}/my-account/`);
  const searchUrl = sanitizeUrl(`${homeUrl}/?s=`);
  const cartUrl = sanitizeUrl(`${homeUrl}/cart/`);

  return `<nav class="fixed bottom-0 left-0 right-0 bg-[#3c3c3c] flex items-center justify-around py-3 md:hidden">
    <a href="${accountUrl}" class="text-white p-2">
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
      </svg>
    </a>
    <a href="${searchUrl}" class="text-white p-2">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </a>
    <a href="${cartUrl}" class="text-white p-2">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    </a>
  </nav>`;
}
