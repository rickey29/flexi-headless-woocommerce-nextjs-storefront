/**
 * Product info sub-module.
 * Handles title, rating, price, SKU, stock status, and short description.
 * Styled to match WooCommerce Storefront theme.
 */

import { escapeHtml } from '@/lib/utils';
import { rating } from '../components/rating';
import { price } from '../components/price';

export interface ProductInfoData {
  /** Product name */
  name: string;
  /** Average rating (0-5) */
  averageRating: number;
  /** Number of reviews */
  reviewCount: number;
  /** Current price formatted */
  priceFormatted: string;
  /** Regular price formatted (for sale items) */
  regularPriceFormatted?: string;
  /** Whether on sale */
  onSale: boolean;
  /** Product SKU */
  sku?: string;
  /** Short description HTML */
  shortDescription?: string;
  /** Stock status */
  stockStatus: 'instock' | 'outofstock' | 'onbackorder';
  /** Stock quantity (for low stock warning) */
  stockQuantity: number | null;
  /** Whether item is low stock */
  isLowStock: boolean;
}

/**
 * Get stock status Tailwind CSS class (Storefront colors).
 */
function getStockStatusClass(data: ProductInfoData): string {
  if (data.stockStatus === 'instock') {
    return data.isLowStock ? 'text-storefront-info' : 'text-storefront-success';
  }
  return 'text-storefront-error';
}

/**
 * Get stock status text.
 */
function getStockStatusText(data: ProductInfoData): string {
  if (data.stockStatus === 'instock') {
    return data.isLowStock ? `Only ${data.stockQuantity} left in stock` : 'In stock';
  }
  if (data.stockStatus === 'onbackorder') {
    return 'Available on backorder';
  }
  return 'Out of stock';
}

/**
 * Generate the product info section HTML.
 */
export function generateProductInfo(data: ProductInfoData): string {
  const ratingHtml = rating({
    averageRating: data.averageRating,
    reviewCount: data.reviewCount,
  });

  const priceHtml = price({
    priceFormatted: data.priceFormatted,
    regularPriceFormatted: data.regularPriceFormatted,
    onSale: data.onSale,
  });

  const stockClass = getStockStatusClass(data);
  const stockText = getStockStatusText(data);

  return `<h1 class="text-2xl text-storefront-text">${escapeHtml(data.name)}</h1>
${ratingHtml}
<div class="text-2xl">${priceHtml}</div>
${data.sku ? `<p class="text-sm text-storefront-text-light">SKU: ${escapeHtml(data.sku)}</p>` : ''}
${data.shortDescription ? `<div class="text-storefront-text-light">${data.shortDescription}</div>` : ''}
<p class="text-sm font-semibold ${stockClass}">${stockText}</p>`;
}
