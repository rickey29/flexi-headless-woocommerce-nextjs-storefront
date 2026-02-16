/**
 * Site header generator.
 * Creates the responsive navigation header with logo, search, nav links, and cart.
 * Styled to match WooCommerce Storefront theme.
 */

import { escapeHtml, sanitizeUrl } from '@/core/utils/html';

export interface HeaderOptions {
  /** Site name for logo text */
  siteName: string;
  /** Home URL for logo link */
  homeUrl: string;
  /** Navigation items */
  navItems?: { label: string; href: string }[];
  /** Cart total */
  cartTotal?: string;
  /** Cart item count */
  cartCount?: number;
}

/**
 * Generate the site header HTML.
 * Uses Storefront-inspired styling with mobile/desktop variants.
 */
export function header(options: HeaderOptions): string {
  const {
    siteName,
    homeUrl,
    navItems,
    cartTotal = '$0.00',
    cartCount = 0,
  } = options;

  // Build default nav items using homeUrl
  const defaultNavItems = [
    { label: 'Home', href: homeUrl },
    { label: 'Cart', href: `${homeUrl}/cart/` },
    { label: 'Checkout', href: `${homeUrl}/checkout/` },
    { label: 'My account', href: `${homeUrl}/my-account/` },
    { label: 'Sample Page', href: `${homeUrl}/sample-page/` },
    { label: 'Shop', href: `${homeUrl}/shop/` },
  ];

  const finalNavItems = navItems ?? defaultNavItems;

  const navLinksHtml = finalNavItems
    .map(
      (item) =>
        `<a href="${sanitizeUrl(item.href)}" class="hover:text-gray-900">${escapeHtml(item.label)}</a>`
    )
    .join('\n            ');

  return `<header>
    <!-- Mobile Header -->
    <div class="flex items-center justify-between px-5 py-5 md:hidden">
      <a href="${sanitizeUrl(homeUrl)}" class="text-xl font-bold text-gray-900">${escapeHtml(siteName)}</a>
      <button class="flex items-center gap-1.5 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-700">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
        </svg>
        Menu
      </button>
    </div>

    <!-- Desktop Header Row 1: Logo + Search -->
    <div class="hidden md:flex items-center justify-between px-6 lg:px-12 py-5">
      <a href="${sanitizeUrl(homeUrl)}" class="text-xl font-bold text-gray-900">${escapeHtml(siteName)}</a>
      <div class="relative">
        <input type="text" placeholder="Search products…" class="border border-gray-300 rounded-sm px-3 py-2 pl-9 text-sm w-56 bg-gray-50 placeholder-gray-400" />
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    <!-- Desktop Header Row 2: Navigation + Cart -->
    <div class="hidden md:flex items-center justify-between px-6 lg:px-12 py-3 border-t border-b border-gray-200">
      <nav class="flex gap-5 text-sm text-gray-600">
        ${navLinksHtml}
      </nav>
      <div class="flex items-center gap-3 text-sm">
        <span class="text-gray-700">${escapeHtml(cartTotal)}</span>
        <span class="text-gray-400">${cartCount} item${cartCount !== 1 ? 's' : ''}</span>
        <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      </div>
    </div>
  </header>`;
}
