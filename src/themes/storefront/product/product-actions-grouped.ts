/**
 * Grouped product actions sub-module.
 * Handles add-to-cart with quantity inputs per child product for grouped products.
 * Styled to match WooCommerce Storefront theme.
 */

import { escapeHtml, sanitizeUrl } from '@/core/utils/html';

export interface GroupedProductItem {
  id: number;
  name: string;
  permalink: string;
  price_formatted: string;
  regular_price_formatted: string;
  sale_price_formatted: string | null;
  on_sale: boolean;
}

export interface GroupedActionsData {
  /** Product ID */
  productId: number;
  /** Home URL for form action */
  homeUrl: string;
  /** Child products in the grouped product */
  groupedProducts: GroupedProductItem[];
  /** Whether product can be purchased */
  purchasable: boolean;
  /** Stock status */
  stockStatus: 'instock' | 'outofstock' | 'onbackorder';
}

/**
 * Generate the price HTML for a grouped product item.
 * Shows sale price with strikethrough regular price if on sale.
 */
function generateGroupedItemPrice(item: GroupedProductItem): string {
  if (item.on_sale && item.sale_price_formatted) {
    return `<span class="text-gray-400 line-through mr-2">${escapeHtml(item.regular_price_formatted)}</span><span class="text-gray-800">${escapeHtml(item.sale_price_formatted)}</span>`;
  }
  return `<span class="text-gray-800">${escapeHtml(item.price_formatted)}</span>`;
}

/**
 * Generate the grouped products table HTML.
 * Each row has a quantity input, product link, and price.
 */
function generateGroupedProductsTable(
  groupedProducts: GroupedProductItem[],
  isDisabled: boolean,
): string {
  if (groupedProducts.length === 0) {
    return '';
  }

  const rowsHtml = groupedProducts
    .map((item, index) => {
      const isOddRow = index % 2 === 0; // 0, 2, 4... get bg-gray-50
      const isLastRow = index === groupedProducts.length - 1;

      const bgClass = isOddRow ? 'bg-gray-50' : '';
      const borderClass = isLastRow ? '' : 'border-b border-gray-200';

      const priceHtml = generateGroupedItemPrice(item);
      const disabledAttr = isDisabled ? ' disabled' : '';

      return `<div class="flex items-center py-3 px-4 ${bgClass} ${borderClass}">
  <div class="flex items-stretch rounded-md border overflow-hidden mr-4" role="group" aria-label="Quantity">
    <button type="button" class="px-3 py-1.5 text-base leading-none" data-qty-action="decrease" aria-label="Decrease quantity"${disabledAttr}>&minus;</button>
    <input type="number" name="quantity[${item.id}]" value="0" min="0" inputmode="numeric" class="w-12 px-0 text-center border-x focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"${disabledAttr}>
    <button type="button" class="px-3 py-1.5 text-base leading-none" data-qty-action="increase" aria-label="Increase quantity"${disabledAttr}>+</button>
  </div>
  <a href="${sanitizeUrl(item.permalink)}" class="text-purple-700 flex-1">${escapeHtml(item.name)}</a>
  ${priceHtml}
</div>`;
    })
    .join('\n');

  return `<div class="mb-6 border border-gray-200">
${rowsHtml}
</div>`;
}

/**
 * Generate the add-to-cart section for grouped products.
 * Includes form with quantity inputs per child product and a simple add-to-cart button.
 *
 * Note: For grouped products, we don't check parent's purchasable status since
 * you buy the children, not the parent. Each child's purchasability is handled
 * by WooCommerce when processing the form.
 */
export function generateGroupedAddToCart(data: GroupedActionsData): string {
  // Form posts to home URL; WooCommerce processes via add-to-cart field
  const formAction = sanitizeUrl(data.homeUrl);

  // For grouped products, disable only if no child products available
  const hasChildren = data.groupedProducts.length > 0;
  const buttonClass = hasChildren
    ? 'bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded mb-6'
    : 'bg-gray-400 text-white px-6 py-3 rounded mb-6 cursor-not-allowed';
  const disabledAttr = hasChildren ? '' : ' disabled';

  // Generate grouped products table (inputs are never disabled for grouped products)
  const tableHtml = generateGroupedProductsTable(data.groupedProducts, false);

  return `<form action="${formAction}" method="post">
  <input type="hidden" name="add-to-cart" value="${data.productId}">
  ${tableHtml}
  <button type="submit" class="${buttonClass}"${disabledAttr}>Add to cart</button>
</form>`;
}
