/**
 * Product actions sub-module.
 * Handles add-to-cart form and purchase buttons.
 * Styled to match reference HTML.
 */

import { sanitizeUrl } from '@/core/utils/html';

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
 * Always renders the form; button is disabled if not purchasable or out of stock.
 * Uses WooCommerce standard POST format with add-to-cart hidden field.
 */
export function generateAddToCart(data: ProductActionsData): string {
  // Form posts to home URL; WooCommerce processes via add-to-cart field
  const formAction = sanitizeUrl(data.homeUrl);

  // Determine if button should be disabled
  const isDisabled = !data.purchasable || data.stockStatus === 'outofstock';
  const buttonClass = isDisabled
    ? 'bg-gray-400 text-white px-5 h-10 rounded text-sm font-medium cursor-not-allowed'
    : 'bg-[#3c3c3c] text-white px-5 h-10 rounded text-sm font-medium hover:bg-gray-800';
  const disabledAttr = isDisabled ? ' disabled' : '';

  return `<form class="flex items-center gap-2 mb-6" action="${formAction}" method="post">
  <input type="hidden" name="add-to-cart" value="${data.productId}">
  <div class="flex items-stretch rounded-md border overflow-hidden" role="group" aria-label="Quantity">
    <button type="button" class="px-3 py-1.5 text-base leading-none" data-qty-action="decrease" aria-label="Decrease quantity">&minus;</button>
    <input type="number" name="quantity" value="1" min="1" inputmode="numeric" class="w-12 px-0 text-center border-x focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none">
    <button type="button" class="px-3 py-1.5 text-base leading-none" data-qty-action="increase" aria-label="Increase quantity">+</button>
  </div>
  <button type="submit" class="${buttonClass}"${disabledAttr}>Add to cart</button>
</form>`;
}
