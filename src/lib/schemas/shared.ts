import { z } from 'zod';

/**
 * Site configuration info schema.
 * Used by all render routes to understand currency/locale settings.
 */
export const SiteInfoSchema = z.object({
  currency: z.string().max(10),
  currency_symbol: z.string().max(10),
  currency_position: z.enum(['left', 'right', 'left_space', 'right_space']),
  thousand_separator: z.string().max(5),
  decimal_separator: z.string().max(5),
  price_decimals: z.number().int().nonnegative().max(10),
});

export type SiteInfo = z.infer<typeof SiteInfoSchema>;
