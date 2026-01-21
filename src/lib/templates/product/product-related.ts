/**
 * Related products sub-module.
 * Handles related products grid using the reusable product card component.
 * Styled to match WooCommerce Storefront theme.
 */

import { productCardsGrid, type ProductCardData } from '../components/product-card';
import type { RelatedProduct } from '@/lib/schemas';

/**
 * Transform RelatedProduct to ProductCardData.
 */
function toProductCardData(product: RelatedProduct): ProductCardData {
  return {
    name: product.name,
    permalink: product.permalink,
    priceFormatted: product.price_formatted,
    image: product.image ? { url: product.image.url, alt: product.image.alt } : undefined,
  };
}

/**
 * Generate the related products section HTML.
 * Returns empty string if no related products.
 */
export function generateRelatedProducts(products: RelatedProduct[]): string {
  if (products.length === 0) return '';

  const cardData = products.map(toProductCardData);

  return `<div class="mt-12">
  <h2 class="text-xl text-storefront-text mb-6">Related Products</h2>
  ${productCardsGrid(cardData)}
</div>`;
}
