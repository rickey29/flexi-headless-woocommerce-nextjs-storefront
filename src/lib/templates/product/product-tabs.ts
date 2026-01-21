/**
 * Product tabs sub-module.
 * Handles description and other tabs.
 * Styled to match WooCommerce Storefront theme.
 */

export interface ProductTabsData {
  /** Full product description HTML */
  description?: string;
}

/**
 * Generate the product tabs section HTML.
 * Returns empty string if no description.
 */
export function generateProductTabs(data: ProductTabsData): string {
  if (!data.description) return '';

  return `<div class="mt-10">
  <div class="border-b border-storefront-border">
    <h3 class="inline-block border-b-2 border-woo-purple pb-3 text-base font-semibold text-storefront-text">Description</h3>
  </div>
  <div class="py-6 text-storefront-text-light leading-relaxed">${data.description}</div>
</div>`;
}
