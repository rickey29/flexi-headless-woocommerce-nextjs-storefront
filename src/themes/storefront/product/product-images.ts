/**
 * Product images sub-module.
 * Handles main image rendering with zoom button.
 * Styled to match reference HTML.
 */

import { escapeHtml } from '@/core/utils/html';
import type { ProductImage } from '@/core/schemas';

export interface ProductImageData {
  /** Main product image */
  image: ProductImage | null;
  /** Gallery images */
  galleryImages?: ProductImage[];
  /** Product name for alt text */
  productName: string;
}

/**
 * Generate the product image section HTML.
 * Includes thumbnail gallery below the main image (main image + up to 2 gallery images = 3 total).
 * Clicking a thumbnail changes the main image.
 */
export function generateProductImage(data: ProductImageData): string {
  const imageHtml = data.image
    ? `<img id="flexi-main-image" src="${escapeHtml(data.image.url)}" alt="${escapeHtml(data.image.alt || data.productName)}" class="w-full aspect-square object-contain p-8">`
    : '<div class="w-full aspect-square flex items-center justify-center text-gray-500 p-8">No image</div>';

  // Build thumbnail gallery: main image + up to 2 gallery images = 3 total
  const thumbnails = [data.image, ...(data.galleryImages || [])]
    .filter((img): img is ProductImage => img !== null)
    .slice(0, 3);

  // Only show thumbnails if there are at least 2 images
  const thumbnailsHtml =
    thumbnails.length > 1
      ? `<div id="flexi-thumbnails" class="grid grid-cols-3 gap-2 mt-4">
      ${thumbnails
        .map(
          (img, index) =>
            `<img src="${escapeHtml(img.url)}" alt="${escapeHtml(img.alt || data.productName)}" class="flexi-thumbnail aspect-square object-cover cursor-pointer border-2 ${index === 0 ? 'border-woo-purple' : 'border-gray-200'} hover:border-woo-purple transition-colors">`,
        )
        .join('')}
    </div>
    <script>
      (function() {
        var mainImg = document.getElementById('flexi-main-image');
        var thumbs = document.querySelectorAll('.flexi-thumbnail');
        thumbs.forEach(function(thumb) {
          thumb.addEventListener('click', function() {
            mainImg.src = this.src;
            mainImg.alt = this.alt;
            thumbs.forEach(function(t) { t.classList.remove('border-woo-purple'); t.classList.add('border-gray-200'); });
            this.classList.remove('border-gray-200');
            this.classList.add('border-woo-purple');
          });
        });
      })();
    </script>`
      : '';

  return `<div class="relative bg-white mb-8 md:mb-0 md:w-5/12 lg:w-[45%]">
    ${imageHtml}
    <button class="absolute top-3 right-3 bg-white rounded-full p-1.5 shadow-sm border border-gray-200">
      <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>
      </svg>
    </button>
    ${thumbnailsHtml}
  </div>`;
}

// Legacy exports for backward compatibility
export interface ProductImagesData {
  image: ProductImage | null;
  galleryImages: ProductImage[];
  productName: string;
}

export function generateMainImage(data: ProductImagesData): string {
  return generateProductImage({ image: data.image, productName: data.productName });
}

export function generateGallery(data: ProductImagesData): string {
  if (data.galleryImages.length === 0) return '';

  const images = data.galleryImages
    .slice(0, 4)
    .map(
      (img) =>
        `<img src="${escapeHtml(img.url)}" srcset="${escapeHtml(img.srcset)}" sizes="(max-width: 768px) 25vw, 150px" alt="${escapeHtml(img.alt)}" class="aspect-square object-cover cursor-pointer border border-gray-200 hover:border-[#7f54b3] transition-colors">`,
    )
    .join('');

  return `<div class="grid grid-cols-4 gap-2 mt-4">${images}</div>`;
}

export function generateProductImages(data: ProductImagesData): string {
  return generateProductImage({ image: data.image, productName: data.productName });
}
