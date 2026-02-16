/**
 * Product page orchestrator.
 * Composes all product sub-modules into a complete HTML document.
 * Styled to match reference HTML (woo-simple-product-sunglasses.html).
 */

import type { ProductRenderRequest } from '@/core/schemas';
import { cleanHtml, stripHtml, escapeHtml } from '@/core/utils/html';
import { head } from '../components/head';
import { header } from '../components/header';
import { footer, mobileBottomNav } from '../components/footer';
import { generateProductImage } from './product-images';
import { generateProductInfo } from './product-info';
import { generateAddToCart } from './product-actions';
import { generateVariableAddToCart } from './product-actions-variable';
import { generateGroupedAddToCart } from './product-actions-grouped';
import { generateExternalAddToCart } from './product-actions-external';
import { generateProductTabs } from './product-tabs';
import { generateRelatedProducts } from './product-related';
import { generateCategories } from './product-categories';
import { generateBreadcrumb } from './product-breadcrumb';

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
  const headerHtml = header({
    siteName: 'Woo',
    homeUrl: home_url,
  });

  // Generate footer
  const footerHtml = footer({
    siteName: 'Woo',
  });

  // Generate mobile bottom nav
  const mobileNavHtml = mobileBottomNav({
    homeUrl: home_url,
  });

  // Generate breadcrumb
  const breadcrumbHtml = generateBreadcrumb({
    homeUrl: home_url,
    categories: product.categories,
    productName: product.name,
  });

  // Generate product image section (with thumbnail gallery)
  const imageHtml = generateProductImage({
    image: product.image,
    galleryImages: product.gallery_images,
    productName: product.name,
  });

  // Generate product info section
  const infoHtml = generateProductInfo({
    name: product.name,
    priceFormatted: product.price_formatted,
    shortDescription: product.short_description,
  });

  // Generate add-to-cart section (branching by product type)
  let addToCartHtml: string;
  if (product.type === 'variable') {
    addToCartHtml = generateVariableAddToCart({
      productId: product.id,
      homeUrl: home_url,
      attributes: product.attributes,
      variations: product.variations,
      purchasable: product.purchasable,
      stockStatus: product.stock_status,
    });
  } else if (product.type === 'grouped') {
    addToCartHtml = generateGroupedAddToCart({
      productId: product.id,
      homeUrl: home_url,
      groupedProducts: product.grouped_products ?? [],
      purchasable: product.purchasable,
      stockStatus: product.stock_status,
    });
  } else if (product.type === 'external') {
    addToCartHtml = generateExternalAddToCart({
      productUrl: product.product_url ?? '#',
      buttonText: product.button_text ?? 'Buy product',
    });
  } else {
    addToCartHtml = generateAddToCart({
      productId: product.id,
      homeUrl: home_url,
      purchasable: product.purchasable,
      stockStatus: product.stock_status,
    });
  }

  // Generate SKU
  const skuHtml = product.sku
    ? `<p>SKU: <span class="text-gray-600">${escapeHtml(product.sku)}</span></p>`
    : '';

  // Generate categories
  const categoriesHtml = generateCategories(product.categories);

  // Generate description tabs
  const tabsHtml = generateProductTabs({
    description: product.description,
    reviewCount: product.review_count,
    productUrl: product.permalink,
    hasAdditionalInfo:
      product.type === 'variable' && product.attributes.some((attr) => attr.visible),
  });

  // Generate related products
  const relatedHtml = generateRelatedProducts(product.related_products);

  // Compose the complete HTML document
  const html = `<!DOCTYPE html>
<html lang="en">
${headHtml}
<body class="bg-white text-gray-600 text-sm leading-relaxed pb-14 md:pb-0">
  ${headerHtml}
  <main class="px-5 md:px-6 lg:px-12 max-w-5xl md:max-w-none lg:max-w-6xl mx-auto">
    ${breadcrumbHtml}
    <section class="flex flex-col md:flex-row md:gap-10 lg:gap-14 py-6 md:py-8">
      ${imageHtml}
      <div class="md:w-7/12 lg:w-[55%] md:pt-2">
        ${infoHtml}
        ${addToCartHtml}
        <div class="text-xs text-gray-500 space-y-1 pt-2">
          ${skuHtml}
          ${categoriesHtml}
        </div>
      </div>
    </section>
    ${tabsHtml}
    ${relatedHtml}
  </main>
  ${footerHtml}
  ${mobileNavHtml}
  <script>
  document.addEventListener('click',function(e){
    var btn=e.target.closest('[data-qty-action]');
    if(!btn)return;
    var group=btn.closest('[role="group"]');
    if(!group)return;
    var input=group.querySelector('input[type="number"]');
    if(!input)return;
    var min=parseInt(input.min,10)||0;
    var cur=parseInt(input.value,10)||min;
    if(btn.dataset.qtyAction==='increase'){input.value=cur+1;}
    else if(btn.dataset.qtyAction==='decrease'&&cur>min){input.value=cur-1;}
  });
  </script>
</body>
</html>`;

  return cleanHtml(html);
}

// Re-export sub-modules for direct access if needed
export { generateProductImage } from './product-images';
export { generateProductInfo } from './product-info';
export { generateAddToCart } from './product-actions';
export { generateVariableAddToCart } from './product-actions-variable';
export { generateGroupedAddToCart } from './product-actions-grouped';
export { generateExternalAddToCart } from './product-actions-external';
export { generateProductTabs } from './product-tabs';
export { generateRelatedProducts } from './product-related';
export { generateCategories } from './product-categories';
export { generateBreadcrumb } from './product-breadcrumb';
