/**
 * Core schema exports.
 * Zod schemas and their inferred types.
 */

// Shared schemas
export { siteInfoSchema, SiteInfoSchema, type SiteInfo } from './shared';

// Product schemas
export {
  productImageSchema,
  productAttributeSchema,
  productVariationSchema,
  productCategorySchema,
  productTagSchema,
  relatedProductSchema,
  groupedProductSchema,
  productDimensionsSchema,
  productDataSchema,
  productRenderRequestSchema,
  // Deprecated PascalCase aliases
  ProductImageSchema,
  ProductAttributeSchema,
  ProductVariationSchema,
  ProductCategorySchema,
  ProductTagSchema,
  RelatedProductSchema,
  GroupedProductSchema,
  ProductDimensionsSchema,
  ProductDataSchema,
  ProductRenderRequestSchema,
  type ProductImage,
  type ProductAttribute,
  type ProductVariation,
  type ProductCategory,
  type ProductTag,
  type RelatedProduct,
  type GroupedProduct,
  type ProductDimensions,
  type ProductData,
  type ProductRenderRequest,
} from './product';

// Account schemas
export {
  accountPageTypeEnum,
  loginFormSchema,
  dashboardDataSchema,
  accountRenderRequestSchema,
  // Deprecated PascalCase aliases
  AccountPageTypeEnum,
  LoginFormSchema,
  DashboardDataSchema,
  AccountRenderRequestSchema,
  type AccountPageType,
  type LoginForm,
  type DashboardData,
  type AccountRenderRequest,
} from './account';

// Validation utilities
export {
  validateRequest,
  type ValidationResult,
  type ValidationOptions,
} from './validation';
