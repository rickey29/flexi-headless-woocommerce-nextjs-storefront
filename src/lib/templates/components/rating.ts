/**
 * Rating component.
 * Displays star ratings with review count.
 */

export interface RatingData {
  /** Average rating (0-5) */
  averageRating: number;
  /** Number of reviews */
  reviewCount: number;
}

/**
 * Generate star rating HTML.
 * Returns empty string if no reviews.
 */
export function rating(data: RatingData): string {
  if (data.reviewCount === 0) return '';

  const stars = '★'.repeat(Math.round(data.averageRating));

  return `<div class="flex items-center gap-2">
  <span class="text-yellow-500">${stars}</span>
  <span class="text-sm text-storefront-text-light">(${data.reviewCount} reviews)</span>
</div>`;
}
