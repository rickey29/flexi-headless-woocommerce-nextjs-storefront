/**
 * Product tabs sub-module.
 * Handles description and reviews tabs in two-column layout.
 * Styled to match reference HTML.
 */

export interface ProductTabsData {
  /** Full product description HTML */
  description?: string;
  /** Review count */
  reviewCount?: number;
  /** Product permalink for reviews link */
  productUrl?: string;
  /** Whether to show Additional Information tab (for variable products with visible attributes) */
  hasAdditionalInfo?: boolean;
}

/**
 * Generate the product tabs section HTML.
 * Returns empty string if no description.
 */
export function generateProductTabs(data: ProductTabsData): string {
  if (!data.description) return '';

  const reviewCount = data.reviewCount ?? 0;
  const reviewsUrl = data.productUrl ? `${data.productUrl}#reviews` : '#reviews';

  // Additional Information tab link (only for variable products with visible attributes)
  const additionalInfoTab = data.hasAdditionalInfo
    ? `<div class="py-3 md:border-b md:border-gray-200">
        <a href="#" class="text-[#7f54b3] hover:underline">Additional information</a>
      </div>`
    : '';

  return `<section class="border-t border-gray-200 py-8 md:py-10">
  <div class="flex flex-col md:flex-row md:gap-10 lg:gap-16">
    <div class="md:w-1/4 lg:w-1/5 mb-4 md:mb-0">
      <div class="flex items-center justify-between py-3 border-b border-gray-200">
        <span class="text-gray-700">Description</span>
        <svg class="w-4 h-4 text-gray-400 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
        <svg class="w-4 h-4 text-gray-400 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </div>
      ${additionalInfoTab}
      <div class="py-3 md:border-b md:border-gray-200">
        <a href="${reviewsUrl}" class="text-[#7f54b3] hover:underline">Reviews (${reviewCount})</a>
      </div>
    </div>
    <div class="md:w-3/4 lg:w-4/5 pt-2 md:pt-0">
      <h2 class="text-2xl font-light text-[#9b6a9b] mb-4">Description</h2>
      <div class="text-gray-500 leading-7">${data.description}</div>
    </div>
  </div>
</section>`;
}
