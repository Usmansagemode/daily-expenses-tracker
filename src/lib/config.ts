export const GREEN = "oklch(0.70 0.15 145)";
export const ORANGE = "oklch(0.75 0.18 75)";
export const RED = "oklch(0.65 0.20 25)";

// src/lib/utils.ts
export const CATEGORY_COLORS_BY_NAME = {
  Grocery: "oklch(0.65 0.20 145)", // Green (fresh produce)
  Takeout: "oklch(0.70 0.22 35)", // Orange (food/warmth)
  Misc: "oklch(0.60 0.15 280)", // Purple (miscellaneous)
  Shopping: "oklch(0.68 0.24 340)", // Pink/Magenta (retail/fashion)
  Travel: "oklch(0.62 0.20 240)", // Blue (sky/ocean)
  Gifts: "oklch(0.72 0.20 15)", // Red-Orange (celebration)
  Petrol: "oklch(0.55 0.18 80)", // Yellow-Green (fuel/energy)
  Utilities: "oklch(0.58 0.16 200)", // Cyan (water/electricity)
  Car: "oklch(0.50 0.14 260)", // Dark Blue (automotive)
} as const;

type CurrencyCode = "USD" | "PKR" | "EUR" | "GBP" | "INR";
type Symbol = "$" | "Rs." | "€" | "£" | "₹";

interface LocaleConfig {
  locale: string;
  currency: CurrencyCode;
  style: "currency" | "decimal" | "percent";
  symbol: Symbol;
}

// Change these values to configure locale and currency
export const LOCALE_CONFIG: LocaleConfig = {
  locale: "en-PK",
  currency: "PKR",
  style: "currency" as const,
  symbol: "Rs.",
} as const;
