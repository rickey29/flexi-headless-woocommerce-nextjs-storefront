/**
 * Account page template.
 * Generates My Account page HTML matching canonical output.
 * Supports login (guest) and dashboard (logged-in) page types.
 */

import type { AccountRenderRequest, LoginForm, DashboardData } from '@/core/schemas';
import { escapeHtml, sanitizeUrl, cleanHtml } from '@/core/utils/html';

/**
 * Generate the account page head section.
 */
function accountHead(): string {
  return `<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My account – Woo</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            'woo-purple': '#7f54b3',
            'storefront-text': '#43454b',
            'storefront-text-light': '#6b6b6b',
            'storefront-link': '#2c2d33',
            'storefront-error': '#e2401c',
            'storefront-bg': '#f5f5f5',
          },
          fontFamily: {
            'sans': ['Source Sans Pro', 'sans-serif'],
          }
        }
      }
    }
  </script>
</head>`;
}

/**
 * Generate the account page header.
 */
function accountHeader(homeUrl: string): string {
  const safeHomeUrl = sanitizeUrl(homeUrl);

  return `<!-- HEADER - Mobile -->
  <header class="md:hidden px-4 py-4">
    <div class="flex justify-between items-center">
      <div class="text-2xl font-bold text-black">Woo</div>
      <button class="border border-black px-4 py-2 flex items-center gap-2 text-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
        Menu
      </button>
    </div>
  </header>

  <!-- HEADER - Desktop -->
  <header class="hidden md:block">
    <div class="flex justify-between items-center px-8 py-6">
      <div class="text-2xl font-bold text-black">Woo</div>
      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-storefront-text-light" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="M21 21l-4.35-4.35"></path>
        </svg>
        <input type="search" placeholder="Search products…" class="bg-gray-100 pl-10 pr-4 py-3 w-64 text-sm border-0 outline-none">
      </div>
    </div>
    <nav class="flex justify-between items-center px-8 py-4 border-b border-gray-200">
      <ul class="flex gap-8 text-sm">
        <li><a href="${safeHomeUrl}" class="text-storefront-text">Home</a></li>
        <li><a href="${safeHomeUrl}/cart/" class="text-storefront-text">Cart</a></li>
        <li><a href="${safeHomeUrl}/checkout/" class="text-storefront-text">Checkout</a></li>
        <li><a href="${safeHomeUrl}/my-account/" class="text-storefront-text">My account</a></li>
        <li><a href="${safeHomeUrl}/sample-page/" class="text-storefront-text">Sample Page</a></li>
        <li><a href="${safeHomeUrl}/shop/" class="text-storefront-text">Shop</a></li>
      </ul>
      <a href="${safeHomeUrl}/cart/" class="flex items-center gap-2 text-sm text-storefront-text">
        <span>$0.00 0 items</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
      </a>
    </nav>
  </header>`;
}

/**
 * Generate the account page breadcrumb.
 */
function accountBreadcrumb(homeUrl: string): string {
  const safeHomeUrl = sanitizeUrl(homeUrl);

  return `<!-- BREADCRUMB -->
  <nav class="px-4 md:px-8 py-3 text-sm">
    <div class="flex items-center gap-1">
      <svg class="w-4 h-4 text-storefront-text-light" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
      </svg>
      <a href="${safeHomeUrl}" class="text-woo-purple underline">Home</a>
      <span class="text-storefront-text-light">›</span>
      <span class="text-storefront-text-light">My account</span>
    </div>
  </nav>`;
}

/**
 * Generate the login form.
 */
function accountLoginForm(loginForm: LoginForm): string {
  const actionUrl = sanitizeUrl(loginForm.action_url);
  const nonce = escapeHtml(loginForm.nonce);
  const redirectUrl = sanitizeUrl(loginForm.redirect_url);
  const lostPasswordUrl = sanitizeUrl(loginForm.lost_password_url);

  return `<!-- Login Form Section -->
      <div class="md:max-w-2xl">
        <h2 class="text-2xl font-light text-woo-purple mb-6">Login</h2>

        <form method="post" action="${actionUrl}">
          <!-- Username / Email -->
          <div class="mb-5">
            <label for="username" class="block text-sm mb-2">
              Username or email address <span class="text-storefront-error">*</span>
            </label>
            <input type="text" name="username" id="username" autocomplete="username" class="w-full bg-gray-100 px-4 py-3 text-sm border-0 outline-none">
          </div>

          <!-- Password -->
          <div class="mb-5">
            <label for="password" class="block text-sm mb-2">
              Password <span class="text-storefront-error">*</span>
            </label>
            <div class="relative">
              <input type="password" name="password" id="password" autocomplete="current-password" class="w-full bg-gray-100 px-4 py-3 text-sm pr-12 border-0 outline-none">
              <span class="absolute right-4 top-1/2 -translate-y-1/2">
                <svg class="w-5 h-5 text-storefront-text-light" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              </span>
            </div>
          </div>

          <!-- Remember Me -->
          <div class="mb-4">
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" name="rememberme" id="rememberme" value="forever" class="w-4 h-4">
              Remember me
            </label>
          </div>

          <!-- Hidden fields for WooCommerce -->
          <input type="hidden" name="woocommerce-login-nonce" value="${nonce}">
          <input type="hidden" name="_wp_http_referer" value="${redirectUrl}">
          <input type="hidden" name="redirect" value="${redirectUrl}">

          <!-- Login Button -->
          <div class="mb-4">
            <button type="submit" name="login" value="Log in" class="bg-gray-200 text-storefront-text px-6 py-3 text-sm font-semibold rounded-none">Log in</button>
          </div>

          <!-- Lost Password Link -->
          <div>
            <a href="${lostPasswordUrl}" class="text-woo-purple underline text-sm">Lost your password?</a>
          </div>
        </form>
      </div>`;
}

/**
 * Generate the account navigation sidebar.
 */
function accountNavigation(dashboardData: DashboardData): string {
  const dashboardUrl = sanitizeUrl(dashboardData.dashboard_url);
  const ordersUrl = sanitizeUrl(dashboardData.orders_url);
  const downloadsUrl = sanitizeUrl(dashboardData.downloads_url);
  const addressesUrl = sanitizeUrl(dashboardData.addresses_url);
  const paymentMethodsUrl = sanitizeUrl(dashboardData.payment_methods_url);
  const accountDetailsUrl = sanitizeUrl(dashboardData.account_details_url);
  const logoutUrl = sanitizeUrl(dashboardData.logout_url);

  return `<!-- Account Navigation -->
      <nav class="md:w-48 md:flex-shrink-0">
        <ul class="border-t border-gray-200">
          <li class="border-b border-gray-200">
            <a href="${dashboardUrl}" class="flex items-center justify-between py-3 text-purple-700 md:border-l-2 md:border-gray-200 md:pl-3">
              <span>Dashboard</span>
              <svg class="w-5 h-5 text-purple-200" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
                <path d="M9 12l2 2 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
          </li>
          <li class="border-b border-gray-200">
            <a href="${ordersUrl}" class="flex items-center justify-between py-3 text-purple-700 md:border-l-2 md:border-gray-200 md:pl-3">
              <span>Orders</span>
              <svg class="w-5 h-5 text-purple-200" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
            </a>
          </li>
          <li class="border-b border-gray-200">
            <a href="${downloadsUrl}" class="flex items-center justify-between py-3 text-purple-700 md:border-l-2 md:border-gray-200 md:pl-3">
              <span>Downloads</span>
              <svg class="w-5 h-5 text-purple-200" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </a>
          </li>
          <li class="border-b border-gray-200">
            <a href="${addressesUrl}" class="flex items-center justify-between py-3 text-purple-700 md:border-l-2 md:border-gray-200 md:pl-3">
              <span>Addresses</span>
              <svg class="w-5 h-5 text-purple-200" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            </a>
          </li>
          <li class="border-b border-gray-200">
            <a href="${paymentMethodsUrl}" class="flex items-center justify-between py-3 text-purple-700 md:border-l-2 md:border-gray-200 md:pl-3">
              <span>Payment methods</span>
              <svg class="w-5 h-5 text-purple-200" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
              </svg>
            </a>
          </li>
          <li class="border-b border-gray-200">
            <a href="${accountDetailsUrl}" class="flex items-center justify-between py-3 text-purple-700 md:border-l-2 md:border-gray-200 md:pl-3">
              <span>Account details</span>
              <svg class="w-5 h-5 text-purple-200" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </a>
          </li>
          <li class="border-b border-gray-200">
            <a href="${logoutUrl}" class="flex items-center justify-between py-3 text-purple-700 md:border-l-2 md:border-gray-200 md:pl-3">
              <span>Log out</span>
              <svg class="w-5 h-5 text-purple-200" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
            </a>
          </li>
        </ul>
      </nav>`;
}

/**
 * Generate the dashboard content section.
 */
function accountDashboardContent(dashboardData: DashboardData): string {
  const userName = escapeHtml(dashboardData.user_name);
  const ordersUrl = sanitizeUrl(dashboardData.orders_url);
  const addressesUrl = sanitizeUrl(dashboardData.addresses_url);
  const accountDetailsUrl = sanitizeUrl(dashboardData.account_details_url);
  const logoutUrl = sanitizeUrl(dashboardData.logout_url);

  return `<!-- Account Content -->
      <div class="mt-6 md:mt-0 md:flex-1">
        <p class="text-gray-700">
          Hello <strong class="font-semibold text-gray-800">${userName}</strong> (not <strong class="font-semibold text-gray-800">${userName}</strong>? <a href="${logoutUrl}" class="text-purple-700 underline">Log out</a>)
        </p>
        <p class="mt-4 text-gray-700 leading-relaxed">
          From your account dashboard you can view your <a href="${ordersUrl}" class="text-purple-700 underline">recent orders</a>, manage your <a href="${addressesUrl}" class="text-purple-700 underline">shipping and billing addresses</a>, and <a href="${accountDetailsUrl}" class="text-purple-700 underline">edit your password and account details</a>.
        </p>
      </div>`;
}

/**
 * Generate the account page footer.
 */
function accountFooter(): string {
  const year = new Date().getFullYear();

  return `<!-- FOOTER -->
  <footer class="bg-storefront-bg px-4 md:px-8 py-10 mt-auto">
    <div class="text-sm text-storefront-text-light">
      <p class="mb-1">© Woo ${year}</p>
      <p><a href="#" class="text-storefront-text underline">Built with WooCommerce</a>.</p>
    </div>
  </footer>`;
}

/**
 * Generate the mobile bottom navigation.
 */
function accountMobileBottomNav(): string {
  return `<!-- MOBILE BOTTOM NAV -->
  <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-3">
    <a href="#" class="text-storefront-text">
      <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
      </svg>
    </a>
    <a href="#" class="text-storefront-text">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="M21 21l-4.35-4.35"></path>
      </svg>
    </a>
    <a href="#" class="text-storefront-text relative">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
      </svg>
      <span class="absolute -top-1 -right-1 bg-storefront-text text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">0</span>
    </a>
  </nav>`;
}

/**
 * Generate dashboard page content (two-column layout with nav and content).
 */
function accountDashboardPage(dashboardData: DashboardData): string {
  return `<!-- Account Container -->
      <div class="flex flex-col md:flex-row md:gap-8">
        ${accountNavigation(dashboardData)}
        ${accountDashboardContent(dashboardData)}
      </div>`;
}

/**
 * Generate the complete account page HTML.
 */
export function generateAccountHtml(request: AccountRenderRequest): string {
  const { home_url, page_type, login_form, dashboard_data } = request;

  // Determine content based on page type
  let mainContent: string;
  if (page_type === 'dashboard' && dashboard_data) {
    mainContent = accountDashboardPage(dashboard_data);
  } else if (page_type === 'login' && login_form) {
    mainContent = accountLoginForm(login_form);
  } else {
    // Fallback - should not happen with valid schema data
    mainContent = '<p class="text-storefront-error">Invalid account page configuration.</p>';
  }

  const html = `<!DOCTYPE html>
<html lang="en">
${accountHead()}
<body class="font-sans text-storefront-text bg-white min-h-screen flex flex-col">

  ${accountHeader(home_url)}

  ${accountBreadcrumb(home_url)}

  <!-- MAIN CONTENT -->
  <main class="px-4 md:px-8 pb-24 md:pb-16 flex-1">
    <div class="md:max-w-4xl md:mx-auto">
      <!-- Page Title -->
      <h1 class="text-3xl md:text-4xl font-light text-storefront-text mb-6 md:text-center md:py-8">My account</h1>

      ${mainContent}
    </div>
  </main>

  ${accountFooter()}

  ${accountMobileBottomNav()}

</body>
</html>`;

  return cleanHtml(html);
}
