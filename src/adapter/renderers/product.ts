/**
 * Product page renderer.
 * Delegates to the modular template system for HTML generation.
 */

import type { ProductRenderRequest } from '@/core/schemas';
import { generateProductHtml } from '@/themes/storefront';

/**
 * Render a product page to HTML string.
 *
 * This function maintains backward compatibility with the existing API
 * while delegating to the new modular template system.
 */
export async function renderProductPage(request: ProductRenderRequest): Promise<string> {
  return generateProductHtml(request);
}
