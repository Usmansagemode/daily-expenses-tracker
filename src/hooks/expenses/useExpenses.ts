import { useQuery } from "@tanstack/react-query";

import { expensesData } from "@/components/expenses/data/expenseData";
import { Expense, ExpenseWithDetails } from "@/entities/Expense";
import {
  DEFAULT_CATEGORIES,
  DEFAULT_MEMBERS,
  DEFAULT_TAGS,
} from "@/lib/config";
import { supabase } from "@/lib/supabase";
import { transformToExpenseWithDetails } from "@/lib/utils";

// Demo data fetcher
const fetchDemoExpenses = async (
  year: number,
  month: number,
): Promise<ExpenseWithDetails[]> => {
  // Simulate API delay for realism
  await new Promise((resolve) => setTimeout(resolve, 500));

  const filteredExpenses = expensesData.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return (
      expenseDate.getFullYear() === year && expenseDate.getMonth() === month
    );
  });

  return transformToExpenseWithDetails(filteredExpenses);
};

// Real API fetcher
const fetchApiExpenses = async (
  year: number,
  month: number,
): Promise<ExpenseWithDetails[]> => {
  // Check if supabase is available
  if (!supabase) {
    console.warn("Supabase not available, returning empty expenses");
    return [];
  }

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .gte("date", new Date(year, month, 1).toISOString())
    .lt("date", new Date(year, month + 1, 1).toISOString())
    .order("date", { ascending: false });

  if (error) throw error;

  const expenses = data || [];
  return transformToExpenseWithDetails(expenses);
};

export const useExpenses = (year: number, month: number) => {
  const isDemo = process.env.NEXT_PUBLIC_ENVIRONMENT === "demo";

  return useQuery({
    queryFn: () =>
      isDemo ? fetchDemoExpenses(year, month) : fetchApiExpenses(year, month),
    queryKey: ["expenses", year, month],
    staleTime: isDemo ? Infinity : 5 * 60 * 1000, // Demo data never stale
  });
};

// // src/hooks/useExpenses.ts
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { supabase } from "@/lib/supabase";
// import {
//   Expense,
//   ExpenseWithDetails,
//   DEFAULT_CATEGORIES,
//   DEFAULT_TAGS,
// } from "@/entities/Expense";

// export const useExpenses = (year: number, month: number) => {
//   return useQuery({
//     queryKey: ["expenses", year, month],
//     queryFn: async () => {
//       const startDate = new Date(year, month, 1);
//       const endDate = new Date(year, month + 1, 0); // Last day of month

//       const { data, error } = await supabase
//         .from("expenses")
//         .select("*")
//         .gte("date", startDate.toISOString())
//         .lte("date", endDate.toISOString())
//         .order("date", { ascending: false });

//       if (error) throw error;

//       // Transform to ExpenseWithDetails
//       const expensesWithDetails: ExpenseWithDetails[] = (data || []).map(
//         (expense: Expense) => {
//           const category = DEFAULT_CATEGORIES.find(
//             (c) => c.id === expense.categoryId
//           );
//           const tag = DEFAULT_TAGS.find((t) => t.id === expense.tagId);
//           return {
//             ...expense,
//             categoryName: category?.name || null,
//             tagName: tag?.name || null,
//           };
//         }
//       );

//       return expensesWithDetails;
//     },
//     staleTime: 1000 * 60 * 5, // 5 minutes
//   });
// };
