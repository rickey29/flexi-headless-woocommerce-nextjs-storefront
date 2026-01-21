/**
 * Schema exports for validation.
 */

// Shared schemas
export { SiteInfoSchema, type SiteInfo } from './shared';

// Product schemas
export {
  ProductImageSchema,
  ProductAttributeSchema,
  ProductVariationSchema,
  ProductCategorySchema,
  ProductTagSchema,
  RelatedProductSchema,
  ProductDimensionsSchema,
  ProductDataSchema,
  ProductRenderRequestSchema,
  type ProductImage,
  type ProductAttribute,
  type ProductVariation,
  type ProductCategory,
  type ProductTag,
  type RelatedProduct,
  type ProductDimensions,
  type ProductData,
  type ProductRenderRequest,
} from './product';

// Validation utilities
export {
  validateRequest,
  validateFlexiRequest,
  type ValidationResult,
  type ValidationOptions,
} from './validation';
