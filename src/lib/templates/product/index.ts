/**
 * Product page orchestrator.
 * Composes all product sub-modules into a complete HTML document.
 * Styled to match WooCommerce Storefront theme.
 */

import type { ProductRenderRequest } from '@/lib/schemas';
import { cleanHtml, stripHtml } from '@/lib/utils';
import { head } from '../head';
import { header } from '../header';
import { footer } from '../footer';
import { generateProductImages } from './product-images';
import { generateProductInfo } from './product-info';
import { generateAddToCart } from './product-actions';
import { generateProductTabs } from './product-tabs';
import { generateRelatedProducts } from './product-related';
import { generateCategories } from './product-categories';

/**
 * Generate the complete product page HTML.
 */
export function generateProductHtml(request: ProductRenderRequest): string {
  const { home_url, product_data: product } = request;

  // Generate head section
  const headHtml = head({
    title: `${product.name} - Store`,
    description: stripHtml(product.short_description),
    canonicalUrl: product.permalink,
  });

  // Generate header
  // Note: site_name not in current SiteInfo schema, use default
  const headerHtml = header({
    siteName: 'Store',
    homeUrl: home_url,
  });

  // Generate footer
  const footerHtml = footer({
    siteName: 'Store',
  });

  // Generate product images section
  const imagesHtml = generateProductImages({
    image: product.image,
    galleryImages: product.gallery_images,
    productName: product.name,
  });

  // Generate product info section
  const infoHtml = generateProductInfo({
    name: product.name,
    averageRating: product.average_rating,
    reviewCount: product.review_count,
    priceFormatted: product.price_formatted,
    regularPriceFormatted: product.regular_price_formatted,
    onSale: product.on_sale,
    sku: product.sku,
    shortDescription: product.short_description,
    stockStatus: product.stock_status,
    stockQuantity: product.stock_quantity,
    isLowStock: product.is_low_stock,
  });

  // Generate add-to-cart form
  const addToCartHtml = generateAddToCart({
    productId: product.id,
    homeUrl: home_url,
    purchasable: product.purchasable,
    stockStatus: product.stock_status,
  });

  // Generate categories
  const categoriesHtml = generateCategories(product.categories);

  // Generate description tabs
  const tabsHtml = generateProductTabs({
    description: product.description,
  });

  // Generate related products
  const relatedHtml = generateRelatedProducts(product.related_products);

  // Compose the complete HTML document with Storefront-inspired styling
  const html = `<!DOCTYPE html>
<html lang="en">
${headHtml}
<body class="bg-white text-storefront-text">
  ${headerHtml}
  <main class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      ${imagesHtml}
      <div class="space-y-4">
        ${infoHtml}
        ${addToCartHtml}
        ${categoriesHtml}
      </div>
    </div>
    ${tabsHtml}
    ${relatedHtml}
  </main>
  ${footerHtml}
</body>
</html>`;

  return cleanHtml(html);
}

// Re-export sub-modules for direct access if needed
export { generateProductImages } from './product-images';
export { generateProductInfo } from './product-info';
export { generateAddToCart } from './product-actions';
export { generateProductTabs } from './product-tabs';
export { generateRelatedProducts } from './product-related';
export { generateCategories } from './product-categories';
