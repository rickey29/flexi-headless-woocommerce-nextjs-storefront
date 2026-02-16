/**
 * External product add-to-cart sub-module.
 * Renders a buy button link for external/affiliate products.
 */

import { sanitizeUrl, escapeHtml } from '@/core/utils/html';

export interface ExternalActionsData {
  productUrl: string;
  buttonText: string;
}

/**
 * Generate external product buy button.
 * External products link to an external URL instead of adding to cart.
 */
export function generateExternalAddToCart(data: ExternalActionsData): string {
  const safeUrl = sanitizeUrl(data.productUrl);
  const safeText = escapeHtml(data.buttonText);

  return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="inline-block bg-gray-800 text-white text-sm px-6 py-3 rounded-sm w-full md:w-auto text-center mb-8">${safeText}</a>`;
}
