/**
 * Storefront Theme Exports
 *
 * The Theme layer contains presentation-only HTML skeletons:
 * - Shared components (head, header, footer)
 * - Page templates (product, account)
 *
 * Layer Rules:
 * - Theme must NOT import Adapter
 * - Theme must NOT make network calls
 * - Theme may only import from Core for pure utilities
 * - All templates return "HTML strings only" (no JSX/React)
 */

// Shared components
export { head, type HeadOptions } from './components/head';
export { header, type HeaderOptions } from './components/header';
export { footer, mobileBottomNav, type FooterOptions, type MobileBottomNavOptions } from './components/footer';

// Product page templates
export {
  generateProductHtml,
  generateProductImage,
  generateProductInfo,
  generateAddToCart,
  generateVariableAddToCart,
  generateGroupedAddToCart,
  generateExternalAddToCart,
  generateProductTabs,
  generateRelatedProducts,
  generateCategories,
  generateBreadcrumb,
} from './product';

// Account page template
export { generateAccountHtml } from './account';
