/**
 * HTML document head generator.
 * Creates the <head> section with meta tags, title, and Tailwind CSS.
 * Uses Tailwind utilities only - no custom <style> blocks.
 */

import { escapeHtml } from '@/core/utils/html';

export interface HeadOptions {
  /** Page title */
  title: string;
  /** Meta description */
  description?: string;
  /** Canonical URL */
  canonicalUrl?: string;
}

/**
 * Generate the HTML <head> section.
 * Uses Tailwind CSS v4 browser runtime via CDN.
 * All styling uses Tailwind utilities with arbitrary values where needed.
 */
export function head(options: HeadOptions): string {
  const { title, description, canonicalUrl } = options;

  return `<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  ${description ? `<meta name="description" content="${escapeHtml(description)}">` : ''}
  ${canonicalUrl ? `<link rel="canonical" href="${escapeHtml(canonicalUrl)}">` : ''}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
</head>`;
}
