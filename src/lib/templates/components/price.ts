/**
 * Price display component.
 * Handles regular and sale price formatting.
 */

import { escapeHtml } from '@/lib/utils';

export interface PriceData {
  /** Current price (formatted string) */
  priceFormatted: string;
  /** Original price (formatted string) - only for sale items */
  regularPriceFormatted?: string;
  /** Whether item is on sale */
  onSale: boolean;
}

/**
 * Generate price display HTML.
 * Shows original price crossed out when on sale.
 */
export function price(data: PriceData): string {
  if (data.onSale && data.regularPriceFormatted) {
    return `<span class="text-lg text-storefront-text-light line-through mr-2">${escapeHtml(data.regularPriceFormatted)}</span><span class="text-storefront-success font-semibold">${escapeHtml(data.priceFormatted)}</span>`;
  }

  return `<span class="text-storefront-text font-semibold">${escapeHtml(data.priceFormatted)}</span>`;
}
