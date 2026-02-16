import { z } from 'zod';
import { siteInfoSchema } from './shared';

/**
 * Account page type enum.
 * Supports 'login' (guest users) and 'dashboard' (logged-in users).
 */
export const accountPageTypeEnum = z.enum(['login', 'dashboard']);

/**
 * Login form data schema.
 * Contains URLs and nonce needed for WooCommerce login form.
 */
export const loginFormSchema = z.object({
  /** Form action URL (my-account page) */
  action_url: z.string().url(),
  /** WooCommerce login nonce */
  nonce: z.string().min(1).max(64),
  /** Redirect URL after login */
  redirect_url: z.string().url(),
  /** Lost password page URL */
  lost_password_url: z.string().url(),
});

/**
 * Dashboard data schema.
 * Contains user info and navigation URLs for My Account dashboard.
 */
export const dashboardDataSchema = z.object({
  /** Display name of the logged-in user */
  user_name: z.string().min(1),
  /** URL to the dashboard page */
  dashboard_url: z.string().url(),
  /** URL to the orders page */
  orders_url: z.string().url(),
  /** URL to the downloads page */
  downloads_url: z.string().url(),
  /** URL to the addresses page */
  addresses_url: z.string().url(),
  /** URL to the payment methods page */
  payment_methods_url: z.string().url(),
  /** URL to the account details page */
  account_details_url: z.string().url(),
  /** URL to log out */
  logout_url: z.string().url(),
});

/**
 * Account page render request schema.
 */
export const accountRenderRequestSchema = z.object({
  /** WordPress site URL from get_home_url() */
  home_url: z.string().url({ message: 'Invalid URL format for home_url' }),
  /** Account page type */
  page_type: accountPageTypeEnum,
  /** Site configuration (currency, locale settings) */
  site_info: siteInfoSchema,
  /** Login form data (for login page type) */
  login_form: loginFormSchema.optional(),
  /** Dashboard data (for dashboard page type) */
  dashboard_data: dashboardDataSchema.optional(),
});

export type AccountPageType = z.infer<typeof accountPageTypeEnum>;
export type LoginForm = z.infer<typeof loginFormSchema>;
export type DashboardData = z.infer<typeof dashboardDataSchema>;
export type AccountRenderRequest = z.infer<typeof accountRenderRequestSchema>;

// Deprecated PascalCase aliases — remove after downstream imports are updated.
/** @deprecated Use accountPageTypeEnum */
export const AccountPageTypeEnum = accountPageTypeEnum;
/** @deprecated Use loginFormSchema */
export const LoginFormSchema = loginFormSchema;
/** @deprecated Use dashboardDataSchema */
export const DashboardDataSchema = dashboardDataSchema;
/** @deprecated Use accountRenderRequestSchema */
export const AccountRenderRequestSchema = accountRenderRequestSchema;
