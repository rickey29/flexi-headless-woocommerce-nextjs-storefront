/**
 * Product actions sub-module.
 * Handles add-to-cart form and purchase buttons.
 * Styled to match WooCommerce Storefront theme.
 */

import { sanitizeUrl } from '@/lib/utils';

export interface ProductActionsData {
  /** Product ID */
  productId: number;
  /** Home URL for form action */
  homeUrl: string;
  /** Whether product can be purchased */
  purchasable: boolean;
  /** Stock status */
  stockStatus: 'instock' | 'outofstock' | 'onbackorder';
}

/**
 * Generate the add-to-cart form HTML.
 * Returns empty string if product is not purchasable or out of stock.
 * Uses Storefront button styling (dark gray background like their theme).
 */
export function generateAddToCart(data: ProductActionsData): string {
  if (!data.purchasable || data.stockStatus === 'outofstock') {
    return '';
  }

  const formAction = `${data.homeUrl}/?add-to-cart=${data.productId}`;

  return `<form class="flex gap-3 items-center" action="${sanitizeUrl(formAction)}" method="post">
  <input type="number" name="quantity" value="1" min="1" class="w-16 rounded border border-storefront-border bg-storefront-bg px-3 py-2 text-center text-storefront-text focus:border-woo-purple focus:ring-1 focus:ring-woo-purple focus:outline-none">
  <button type="submit" class="rounded bg-storefront-text px-6 py-2 text-sm font-semibold text-white hover:bg-woo-purple focus:outline-none focus:ring-2 focus:ring-woo-purple focus:ring-offset-2 transition-colors">Add to Cart</button>
</form>`;
}
