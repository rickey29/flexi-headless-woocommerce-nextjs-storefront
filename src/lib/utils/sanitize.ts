/**
 * PII Sanitization utilities for headless-woocommerce-nextjs-storefront
 *
 * Prevents sensitive customer data from being exposed in logs.
 * Designed for WooCommerce data structures (products, orders, customers).
 *
 * @since 1.0.0
 */

/**
 * Masks an email address for logging
 * Example: john.doe@example.com -> j***e@e***.com
 */
function maskEmail(email: string): string {
  if (!email || typeof email !== 'string') return '[invalid-email]';

  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return '[invalid-email]';

  const maskedLocal =
    localPart.length > 2 ? `${localPart[0]}***${localPart[localPart.length - 1]}` : '***';

  const domainParts = domain.split('.');
  const maskedDomain =
    domainParts.length > 1
      ? `${domainParts[0][0]}***.${domainParts[domainParts.length - 1]}`
      : '***';

  return `${maskedLocal}@${maskedDomain}`;
}

/**
 * Masks a phone number for logging
 * Example: +1-555-123-4567 -> ***-***-4567
 */
function maskPhone(phone: string): string {
  if (!phone || typeof phone !== 'string') return '[redacted]';

  const digits = phone.replace(/\D/g, '');
  const lastFour = digits.slice(-4);
  return `***-***-${lastFour}`;
}

/**
 * Masks a name for logging
 * Example: John Smith -> J*** S***
 */
function maskName(name: string): string {
  if (!name || typeof name !== 'string') return '[redacted]';

  return name
    .split(' ')
    .map((part) => (part.length > 0 ? `${part[0]}***` : ''))
    .join(' ');
}

/**
 * Masks address information for logging
 */
function maskAddress(address: string): string {
  if (!address || typeof address !== 'string') return '[redacted]';
  return address.length > 3 ? `${address.slice(0, 3)}***` : '***';
}

/**
 * Sanitizes an address object for logging
 */
export function sanitizeAddress(
  address: Record<string, unknown> | null | undefined,
): Record<string, unknown> | null {
  if (!address) return null;

  return {
    first_name: maskName(String(address.first_name || '')),
    last_name: maskName(String(address.last_name || '')),
    company: address.company ? '[redacted]' : '',
    address_1: maskAddress(String(address.address_1 || '')),
    address_2: maskAddress(String(address.address_2 || '')),
    city: address.city ? `${String(address.city).slice(0, 2)}***` : '',
    state: address.state || '',
    postcode: address.postcode ? '***' : '',
    country: address.country || '',
    email: address.email ? maskEmail(String(address.email)) : undefined,
    phone: address.phone ? maskPhone(String(address.phone)) : undefined,
  };
}

/**
 * Sanitizes product data for logging
 * Preserves product info (not PII) but redacts any customer-related fields
 */
export function sanitizeProductData(
  productData: Record<string, unknown> | null | undefined,
): Record<string, unknown> | null {
  if (!productData) return null;

  return {
    id: productData.id,
    name: productData.name,
    slug: productData.slug,
    type: productData.type,
    status: productData.status,
    sku: productData.sku,
    price: productData.price,
    regular_price: productData.regular_price,
    sale_price: productData.sale_price,
    on_sale: productData.on_sale,
    stock_status: productData.stock_status,
    categories_count: Array.isArray(productData.categories) ? productData.categories.length : 0,
    images_count: Array.isArray(productData.images) ? productData.images.length : 0,
    variations_count: Array.isArray(productData.variations) ? productData.variations.length : 0,
    has_attributes: Array.isArray(productData.attributes) && productData.attributes.length > 0,
  };
}

/**
 * Sanitizes cart data for logging
 */
export function sanitizeCartData(
  cartData: Record<string, unknown> | null | undefined,
): Record<string, unknown> | null {
  if (!cartData) return null;

  const items = Array.isArray(cartData.items)
    ? (cartData.items as Array<Record<string, unknown>>)
    : [];

  const coupons = Array.isArray(cartData.coupons) ? (cartData.coupons as Array<unknown>) : [];

  return {
    items_count: items.length,
    items: items.map((item) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      // Price is not PII
      price_formatted: item.price_formatted,
    })),
    subtotal_formatted: cartData.subtotal_formatted,
    total_formatted: cartData.total_formatted,
    // Coupon codes could be personal/promotional - redact
    coupons_count: coupons.length,
  };
}

/**
 * Sanitizes checkout data for logging
 */
export function sanitizeCheckoutData(
  checkoutData: Record<string, unknown> | null | undefined,
): Record<string, unknown> | null {
  if (!checkoutData) return null;

  const paymentGateways = Array.isArray(checkoutData.payment_gateways)
    ? (checkoutData.payment_gateways as Array<Record<string, unknown>>)
    : [];

  const shippingMethods = Array.isArray(checkoutData.shipping_methods)
    ? (checkoutData.shipping_methods as Array<Record<string, unknown>>)
    : [];

  return {
    customer_email: checkoutData.customer_email
      ? maskEmail(String(checkoutData.customer_email))
      : '',
    customer_note: checkoutData.customer_note ? '[redacted]' : '',
    billing_address: sanitizeAddress(checkoutData.billing_address as Record<string, unknown>),
    shipping_address: sanitizeAddress(checkoutData.shipping_address as Record<string, unknown>),
    ship_to_different_address: checkoutData.ship_to_different_address,
    payment_gateways: paymentGateways.map((gw) => ({
      id: gw.id,
      title: gw.title,
    })),
    selected_payment_method: checkoutData.selected_payment_method,
    shipping_methods: shippingMethods.map((sm) => ({
      id: sm.id,
      label: sm.label,
      cost_formatted: sm.cost_formatted,
    })),
    selected_shipping_method: checkoutData.selected_shipping_method,
    needs_shipping: checkoutData.needs_shipping,
    order_total_formatted: checkoutData.order_total_formatted,
  };
}

/**
 * Sanitizes order data for logging
 */
export function sanitizeOrderData(
  orderData: Record<string, unknown> | null | undefined,
): Record<string, unknown> | null {
  if (!orderData) return null;

  const items = Array.isArray(orderData.items)
    ? (orderData.items as Array<Record<string, unknown>>)
    : [];

  return {
    order_id: orderData.order_id,
    order_number: orderData.order_number,
    order_key: '[redacted]',
    status: orderData.status,
    date_created: orderData.date_created,
    customer_note: orderData.customer_note ? '[redacted]' : '',
    billing_address: sanitizeAddress(orderData.billing_address as Record<string, unknown>),
    shipping_address: sanitizeAddress(orderData.shipping_address as Record<string, unknown>),
    payment_method: orderData.payment_method,
    payment_method_title: orderData.payment_method_title,
    shipping_method: orderData.shipping_method,
    shipping_method_title: orderData.shipping_method_title,
    items_count: items.length,
    items: items.map((item) => ({
      product_id: item.product_id,
      name: item.name,
      quantity: item.quantity,
      total_formatted: item.total_formatted,
    })),
    subtotal_formatted: orderData.subtotal_formatted,
    shipping_total_formatted: orderData.shipping_total_formatted,
    tax_total_formatted: orderData.tax_total_formatted,
    total_formatted: orderData.total_formatted,
  };
}

/**
 * Sanitizes a complete render request for logging
 * Handles the standard request structure
 */
export function sanitizeRenderRequest(
  data: Record<string, unknown> | null | undefined,
): Record<string, unknown> | null {
  if (!data) return null;

  const result: Record<string, unknown> = {
    home_url: data.home_url,
  };

  // Sanitize based on what data is present
  if (data.product_data) {
    result.product_data = sanitizeProductData(data.product_data as Record<string, unknown>);
  }

  if (data.cart_data) {
    result.cart_data = sanitizeCartData(data.cart_data as Record<string, unknown>);
  }

  if (data.checkout_data) {
    result.checkout_data = sanitizeCheckoutData(data.checkout_data as Record<string, unknown>);
  }

  if (data.order_data) {
    result.order_data = sanitizeOrderData(data.order_data as Record<string, unknown>);
  }

  // Pass through non-sensitive fields
  if (data.site_info) {
    result.site_info = data.site_info;
  }

  return result;
}

/**
 * Sanitizes arbitrary text by masking potential PII patterns
 * Useful for error messages that might contain customer data
 */
export function sanitizePII(text: string): string {
  if (!text || typeof text !== 'string') return '[invalid-input]';

  let sanitized = text;

  // Mask email addresses
  sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, (match) =>
    maskEmail(match),
  );

  // Mask phone numbers (various formats)
  sanitized = sanitized.replace(
    /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    (match) => maskPhone(match),
  );

  // Mask credit card numbers (13-19 digits)
  sanitized = sanitized.replace(
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4,7}\b/g,
    '****-****-****-****',
  );

  // Mask potential IP addresses
  sanitized = sanitized.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '***.***.***.***');

  return sanitized;
}
