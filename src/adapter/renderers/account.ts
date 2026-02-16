/**
 * Account page renderer.
 * Delegates to the account template for HTML generation.
 */

import type { AccountRenderRequest } from '@/core/schemas';
import { generateAccountHtml } from '@/themes/storefront';

/**
 * Render an account page to HTML string.
 */
export async function renderAccountPage(request: AccountRenderRequest): Promise<string> {
  return generateAccountHtml(request);
}
