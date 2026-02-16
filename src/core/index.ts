/**
 * Core Layer Exports
 *
 * The Core layer contains site-agnostic stable primitives and contracts:
 * - Configuration (env.ts)
 * - Pure TypeScript types
 * - Zod schemas and types
 * - Pure utility functions (no side effects)
 *
 * Layer Rules:
 * - Core must NOT import Adapter or Theme
 * - All functions are pure (no side effects, no external dependencies)
 */

// Types (pure TypeScript types)
export type {
  LogLevel,
  LogContext,
} from './types';

// Config
export { config, shouldLog } from './config';

// Schemas (Zod)
export {
  // Shared
  siteInfoSchema,
  SiteInfoSchema,
  // Product
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
  // Account
  accountPageTypeEnum,
  loginFormSchema,
  dashboardDataSchema,
  accountRenderRequestSchema,
  // Deprecated PascalCase aliases
  AccountPageTypeEnum,
  LoginFormSchema,
  DashboardDataSchema,
  AccountRenderRequestSchema,
  // Validation
  validateRequest,
} from './schemas';

// Types (inferred from schemas)
export type {
  SiteInfo,
  ProductImage,
  ProductAttribute,
  ProductVariation,
  ProductCategory,
  ProductTag,
  RelatedProduct,
  GroupedProduct,
  ProductDimensions,
  ProductData,
  ProductRenderRequest,
  AccountPageType,
  LoginForm,
  DashboardData,
  AccountRenderRequest,
  ValidationResult,
  ValidationOptions,
} from './schemas';

// Pure Utils
export { escapeHtml, stripHtml, sanitizeUrl, cleanHtml } from './utils/html';
export { formatCurrency } from './utils/currency';
