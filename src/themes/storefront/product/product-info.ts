/**
 * Product info sub-module.
 * Handles title, price, and short description.
 * Styled to match reference HTML.
 */

import { escapeHtml } from '@/core/utils/html';

export interface ProductInfoData {
  /** Product name */
  name: string;
  /** Current price formatted */
  priceFormatted: string;
  /** Short description HTML */
  shortDescription?: string;
}

/**
 * Generate the product info section HTML.
 */
export function generateProductInfo(data: ProductInfoData): string {
  const shortDescHtml = data.shortDescription
    ? `<p class="text-gray-500 mb-6">${data.shortDescription}</p>`
    : '';

  return `<h1 class="text-3xl md:text-4xl font-light text-[#9b6a9b] mb-4">${escapeHtml(data.name)}</h1>
<p class="text-lg text-gray-500 mb-5">${escapeHtml(data.priceFormatted)}</p>
${shortDescHtml}`;
}
