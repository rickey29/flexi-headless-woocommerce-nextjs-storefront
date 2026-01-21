/**
 * Product images sub-module.
 * Handles main image and gallery rendering.
 * Styled to match WooCommerce Storefront theme.
 */

import { escapeHtml } from '@/lib/utils';
import type { ProductImage } from '@/lib/schemas';

export interface ProductImagesData {
  /** Main product image */
  image: ProductImage | null;
  /** Gallery images */
  galleryImages: ProductImage[];
  /** Product name for alt text fallback */
  productName: string;
}

/**
 * Generate the main product image HTML.
 */
export function generateMainImage(data: ProductImagesData): string {
  if (data.image) {
    return `<img src="${escapeHtml(data.image.url)}" srcset="${escapeHtml(data.image.srcset)}" sizes="${escapeHtml(data.image.sizes)}" alt="${escapeHtml(data.image.alt || data.productName)}" class="w-full aspect-square object-cover">`;
  }

  return '<div class="w-full aspect-square bg-storefront-bg flex items-center justify-center text-storefront-text-light">No image</div>';
}

/**
 * Generate the gallery HTML.
 * Returns empty string if no gallery images.
 */
export function generateGallery(data: ProductImagesData): string {
  if (data.galleryImages.length === 0) return '';

  const images = data.galleryImages
    .slice(0, 4)
    .map(
      (img) =>
        `<img src="${escapeHtml(img.url)}" srcset="${escapeHtml(img.srcset)}" sizes="(max-width: 768px) 25vw, 150px" alt="${escapeHtml(img.alt)}" class="aspect-square object-cover cursor-pointer border border-storefront-border hover:border-woo-purple transition-colors">`,
    )
    .join('');

  return `<div class="grid grid-cols-4 gap-2 mt-4">${images}</div>`;
}

/**
 * Generate the complete product images section.
 */
export function generateProductImages(data: ProductImagesData): string {
  return `<div>
  <div class="border border-storefront-border overflow-hidden">${generateMainImage(data)}</div>
  ${generateGallery(data)}
</div>`;
}
