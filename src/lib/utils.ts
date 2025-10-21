import {
  DEFAULT_CATEGORIES,
  DEFAULT_MEMBERS,
  DEFAULT_TAGS,
  Expense,
  ExpenseWithDetails,
} from "@/entities/Expense";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CATEGORY_COLORS_BY_NAME, LOCALE_CONFIG } from "./config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to transform expenses to ExpenseWithDetails
export const transformToExpenseWithDetails = (
  expenses: Expense[]
): ExpenseWithDetails[] => {
  return expenses.map((expense) => {
    const category = DEFAULT_CATEGORIES.find(
      (c) => c.id === expense.categoryId
    );
    const tag = DEFAULT_TAGS.find((t) => t.id === expense.tagId);
    const member = DEFAULT_MEMBERS.find((m) => m.id === expense.memberId);
    return {
      ...expense,
      categoryName: category?.name || null,
      tagName: tag?.name || null,
      memberName: member?.fullName || null,
    };
  });
};

export const getCategoryColor = (categoryName: string): string => {
  return (
    CATEGORY_COLORS_BY_NAME[
      categoryName as keyof typeof CATEGORY_COLORS_BY_NAME
    ] || "oklch(0.646 0.222 41.116)" // default to chart-1
  );
};

export const formatCurrency = (
  amount: number,
  options?: Intl.NumberFormatOptions
) => {
  return new Intl.NumberFormat(LOCALE_CONFIG.locale, {
    style: LOCALE_CONFIG.style,
    currency: LOCALE_CONFIG.currency,
    ...options, // Allow overrides
  }).format(amount);
};
