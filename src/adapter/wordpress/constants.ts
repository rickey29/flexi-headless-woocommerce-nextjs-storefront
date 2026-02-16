/**
 * WordPress Integration Constants
 *
 * API paths and configuration for flexi-woo WordPress plugin integration.
 *
 * @module adapter/wordpress/constants
 */

/**
 * Base REST API namespace for flexi-woo plugin
 */
export const FLEXI_WOO_API_NAMESPACE = 'flexi-woo/v1';

/**
 * WordPress REST API endpoints exposed by flexi-woo plugin.
 * @todo Reserved — not yet consumed. Will be used when flexi fetches data from WordPress.
 */
export const WP_API_ENDPOINTS = {
  /** Site information endpoint */
  SITE_INFO: '/site-info',
  /** Product data endpoint */
  PRODUCT: '/product',
  /** Categories endpoint */
  CATEGORIES: '/categories',
} as const;

/**
 * Default timeout for WordPress API requests (ms)
 */
export const WP_API_TIMEOUT = 10000;
