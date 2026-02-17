import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { Expense, ExpenseWithDetails } from "@/entities/Expense";

import {
  CATEGORY_COLORS_BY_NAME,
  DEFAULT_CATEGORIES,
  DEFAULT_MEMBERS,
  DEFAULT_TAGS,
  LOCALE_CONFIG,
} from "./config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const stripExpenseDetails = (expense: ExpenseWithDetails): Expense => ({
  amount: expense.amount,
  categoryId: expense.categoryId,
  createdAt: expense.createdAt,
  date: expense.date,
  description: expense.description,
  id: expense.id,
  memberId: expense.memberId,
  tagId: expense.tagId,
  updatedAt: expense.updatedAt,
});

// Helper function to transform expenses to ExpenseWithDetails
export const transformToExpenseWithDetails = (
  expenses: Expense[],
): ExpenseWithDetails[] => {
  return expenses.map((expense) => {
    const category = DEFAULT_CATEGORIES.find(
      (c) => c.id === expense.categoryId,
    );
    const tag = DEFAULT_TAGS.find((t) => t.id === expense.tagId);
    const member = DEFAULT_MEMBERS.find((m) => m.id === expense.memberId);
    return {
      ...expense,
      categoryName: category?.name || null,
      memberName: member?.fullName || null,
      tagName: tag?.name || null,
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
  options?: Intl.NumberFormatOptions,
) => {
  return new Intl.NumberFormat(LOCALE_CONFIG.locale, {
    currency: LOCALE_CONFIG.currency,
    style: LOCALE_CONFIG.style,
    ...options, // Allow overrides
  }).format(amount);
};

export const formatCurrencyCompact = (amount: number) => {
  return new Intl.NumberFormat(LOCALE_CONFIG.locale, {
    currency: LOCALE_CONFIG.currency,
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
    notation: "compact",
    style: LOCALE_CONFIG.style,
  }).format(amount);
};
