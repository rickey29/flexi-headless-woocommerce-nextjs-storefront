/**
 * Related products sub-module.
 * Handles related products grid with full card details.
 * Styled to match reference HTML.
 */

import { escapeHtml, sanitizeUrl } from '@/core/utils/html';
import type { RelatedProduct } from '@/core/schemas';

// Background color for product cards (white to match product image backgrounds)
const cardBgColor = 'bg-white';

/**
 * Generate the related products section HTML.
 * Returns empty string if no related products.
 */
export function generateRelatedProducts(products: RelatedProduct[]): string {
  if (products.length === 0) return '';

  const cards = products
    .map((product) => {
      const imageHtml = product.image
        ? `<img src="${escapeHtml(product.image.url)}" alt="${escapeHtml(product.image.alt || product.name)}" class="w-full aspect-square object-contain p-8">`
        : '<div class="w-full aspect-square flex items-center justify-center text-gray-400 p-8">No image</div>';

      // Check if product is on sale (has both regular and sale price)
      const priceHtml =
        product.regular_price_formatted && product.price_formatted !== product.regular_price_formatted
          ? `<p class="text-gray-400 text-sm mb-3">
              <span class="line-through">${escapeHtml(product.regular_price_formatted)}</span>
              <span class="text-gray-600 ml-1">${escapeHtml(product.price_formatted)}</span>
            </p>`
          : `<p class="text-gray-600 text-sm mb-3">${escapeHtml(product.price_formatted)}</p>`;

      const saleBadge =
        product.regular_price_formatted && product.price_formatted !== product.regular_price_formatted
          ? '<span class="inline-block border border-gray-400 px-2 py-0.5 text-xs text-gray-600 mb-2">SALE!</span>'
          : '';

      const productUrl = sanitizeUrl(product.permalink);

      return `<div class="text-center">
        <a href="${productUrl}" class="${cardBgColor} mb-4 block">
          ${imageHtml}
        </a>
        <h3 class="text-gray-700 text-sm mb-2"><a href="${productUrl}" class="hover:text-[#7f54b3]">${escapeHtml(product.name)}</a></h3>
        ${saleBadge}
        ${priceHtml}
        <a href="${productUrl}?add-to-cart=${product.id}" class="inline-block bg-[#3c3c3c] text-white border border-gray-300 px-5 py-2 text-sm hover:bg-gray-800">Add to cart</a>
      </div>`;
    })
    .join('\n');

  return `<section class="border-t border-gray-200 py-8 md:py-12">
  <h2 class="text-2xl font-light text-gray-700 mb-8 md:text-center">Related products</h2>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
    ${cards}
  </div>
</section>`;
}
