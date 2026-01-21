/**
 * Template exports.
 * Re-exports all template modules for easy importing.
 */

// Global templates
export { head, type HeadOptions } from './head';
export { header, type HeaderOptions } from './header';
export { footer, type FooterOptions } from './footer';

// Reusable UI components
export {
  productCard,
  productCardsGrid,
  type ProductCardData,
  rating,
  type RatingData,
  price,
  type PriceData,
} from './components';

// Product page template
export { generateProductHtml } from './product';
