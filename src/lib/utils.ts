import {
  DEFAULT_CATEGORIES,
  DEFAULT_TAGS,
  Expense,
  ExpenseWithDetails,
} from "@/entities/Expense";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to transform expenses to ExpenseWithDetails
export const transformExpenses = (
  expenses: Expense[]
): ExpenseWithDetails[] => {
  return expenses.map((expense) => {
    const category = DEFAULT_CATEGORIES.find(
      (c) => c.id === expense.categoryId
    );
    const tag = DEFAULT_TAGS.find((t) => t.id === expense.tagId);

    return {
      ...expense,
      categoryName: category?.name || null,
      tagName: tag?.name || null,
    };
  });
};

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

export const getCategoryColor = (categoryName: string): string => {
  return (
    CATEGORY_COLORS_BY_NAME[
      categoryName as keyof typeof CATEGORY_COLORS_BY_NAME
    ] || "oklch(0.646 0.222 41.116)" // default to chart-1
  );
};
