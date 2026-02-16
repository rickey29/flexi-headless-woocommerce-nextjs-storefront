/**
 * Zero-decimal currencies per ISO 4217.
 * These currencies have no minor units (cents/pence).
 */
const ZERO_DECIMAL_CURRENCIES = ['JPY', 'KRW', 'VND', 'CLP', 'ISK', 'HUF', 'TWD'] as const;

/**
 * Three-decimal currencies per ISO 4217.
 * These currencies use 3 decimal places.
 */
const THREE_DECIMAL_CURRENCIES = ['BHD', 'KWD', 'OMR', 'TND'] as const;

/**
 * Get default decimal places for a currency per ISO 4217.
 * @param currency - ISO 4217 currency code
 * @returns Number of decimal places (0, 2, or 3)
 */
function getDefaultDecimals(currency: string): number {
  const upper = currency.toUpperCase();
  if ((ZERO_DECIMAL_CURRENCIES as readonly string[]).includes(upper)) return 0;
  if ((THREE_DECIMAL_CURRENCIES as readonly string[]).includes(upper)) return 3;
  return 2;
}

/**
 * Format a numeric amount as currency using Intl.NumberFormat with sensible fallbacks.
 * Automatically determines the correct decimal places based on ISO 4217 standards.
 *
 * @param amount - The numeric amount to format
 * @param currency - ISO 4217 currency code (e.g., 'USD', 'JPY', 'EUR')
 * @param locale - Optional locale string (e.g., 'en-US', 'ja-JP')
 * @param fallbackSymbol - Optional symbol to use if Intl fails
 * @param decimalPlaces - Optional override for decimal places (defaults to ISO 4217 standard)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string,
  locale?: string,
  fallbackSymbol?: string,
  decimalPlaces?: number,
): string {
  const normalizedLocale = locale ? locale.replace('_', '-') : undefined;
  const decimals = decimalPlaces ?? getDefaultDecimals(currency);

  try {
    return new Intl.NumberFormat(normalizedLocale, {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount);
  } catch {
    // Fallback if Intl does not support the provided currency/locale combination
    const formatted = amount.toFixed(decimals);
    return fallbackSymbol ? `${fallbackSymbol}${formatted}` : `${currency} ${formatted}`;
  }
}
