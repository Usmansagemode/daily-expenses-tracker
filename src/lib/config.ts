import {
  Car,
  CircleHelp,
  Fuel,
  Gift,
  LucideIcon,
  Plane,
  Shirt,
  ShoppingCart,
  Utensils,
  Zap,
} from "lucide-react";

import { Category, Member, Tag } from "@/entities/Expense";

export const GREEN = "oklch(0.70 0.15 145)";
export const ORANGE = "oklch(0.75 0.18 75)";
export const RED = "oklch(0.65 0.20 25)";

// src/lib/utils.ts
export const CATEGORY_COLORS_BY_NAME = {
  // Cyan (water/electricity)
  Car: "oklch(0.50 0.14 260)",

  // Blue (sky/ocean)
  Gifts: "oklch(0.72 0.20 15)",

  Grocery: "oklch(0.65 0.20 145)",

  // Orange (food/warmth)
  Misc: "oklch(0.60 0.15 280)",

  // Red-Orange (celebration)
  Petrol: "oklch(0.55 0.18 80)",

  // Purple (miscellaneous)
  Shopping: "oklch(0.68 0.24 340)",

  // Green (fresh produce)
  Takeout: "oklch(0.70 0.22 35)",

  // Pink/Magenta (retail/fashion)
  Travel: "oklch(0.62 0.20 240)",
  // Yellow-Green (fuel/energy)
  Utilities: "oklch(0.58 0.16 200)", // Dark Blue (automotive)
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
  currency: "USD",
  locale: "en-US",
  style: "currency" as const,
  symbol: "$",
} as const;

// Map by category name
export const CATEGORY_ICONS_BY_NAME: Record<string, LucideIcon> = {
  Car: Car,
  Gifts: Gift,
  Grocery: ShoppingCart,
  Misc: CircleHelp,
  Petrol: Fuel,
  Shopping: Shirt,
  Takeout: Utensils,
  Travel: Plane,
  Utilities: Zap,
};

// Default categories to seed your app
export const DEFAULT_CATEGORIES: Category[] = [
  { createdAt: new Date("2025-01-01"), id: "1", name: "Grocery" },
  { createdAt: new Date("2025-01-01"), id: "2", name: "Takeout" },
  { createdAt: new Date("2025-01-01"), id: "3", name: "Misc" },
  { createdAt: new Date("2025-01-01"), id: "4", name: "Shopping" },
  { createdAt: new Date("2025-01-01"), id: "5", name: "Travel" },
  { createdAt: new Date("2025-01-01"), id: "6", name: "Gifts" },
  { createdAt: new Date("2025-01-01"), id: "7", name: "Petrol" },
  { createdAt: new Date("2025-01-01"), id: "8", name: "Utilities" },
  { createdAt: new Date("2025-01-01"), id: "9", name: "Car" },
];

// Default tags to seed your app
export const DEFAULT_TAGS: Tag[] = [
  { createdAt: new Date("2025-01-01"), id: "costco", name: "Costco" },
  { createdAt: new Date("2025-01-01"), id: "aldi", name: "Aldi" },
  { createdAt: new Date("2025-01-01"), id: "tire-shop", name: "Tire Shop" },
  { createdAt: new Date("2025-01-01"), id: "walmart", name: "Walmart" },
  { createdAt: new Date("2025-01-01"), id: "giant-eagle", name: "Giant Eagle" },
  { createdAt: new Date("2025-01-01"), id: "sams-club", name: "Sams Club" },
  { createdAt: new Date("2025-01-01"), id: "amazon", name: "Amazon" },
  { createdAt: new Date("2025-01-01"), id: "shein", name: "Shein" },
  {
    createdAt: new Date("2025-01-01"),
    id: "pitts-halal-brothers",
    name: "Pitts Halal Brothers",
  },
  { createdAt: new Date("2025-01-01"), id: "joe-and-pie", name: "Joe & Pie" },
  { createdAt: new Date("2025-01-01"), id: "98k", name: "98K" },
  { createdAt: new Date("2025-01-01"), id: "others", name: "Others" },
];

// Default members to choose who paid
export const DEFAULT_MEMBERS: Member[] = [
  {
    createdAt: new Date("2025-01-01"),
    fullName: "Usman Khalid Mian",
    id: "1",
    name: "Usman",
  },
  {
    createdAt: new Date("2025-01-01"),
    fullName: "Anoosha Fayyaz",
    id: "2",
    name: "Anoosha",
  },
];

export const GEMINI_PDF_RULES = `Rules:
1. Use default amounts for expenses/debits (withdrawals)
2. Use negative amounts for refunds ONLY (as it is the opposite of an expense) Do not record income.
3. Parse dates to ISO format (YYYY-MM-DD)
4. Match each transaction to the BEST category and tag from the list above
5. If no good match, use categoryId: "3" (Misc)
6. Clean up merchant names (remove extra info - keep only the name). This will be the description field.
7. Skip these transactions:
   - Any transaction that is NOT a direct purchase from a merchant/store/restaurant
   - Any transaction containing: "credit card", "bill pay", "payment", "transfer", "fee", "interest"
   - Payments to credit card companies (Chase, Discover, Capital One, Amex, etc.)
   - Transfers between my accounts
   - Bank fees and service charges
   - Any transaction that looks like it's moving money between accounts rather than spending money
8. Return ONLY the JSON array, nothing else
9. Do not record credit card payments as expenses.`;
