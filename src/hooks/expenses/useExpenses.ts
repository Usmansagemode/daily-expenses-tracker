import { useQuery } from "@tanstack/react-query";

import { expensesData } from "@/components/expenses/data/expenseData";
import { ExpenseWithDetails } from "@/entities/Expense";
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
  const isDemo = !supabase;

  return useQuery({
    queryFn: () =>
      isDemo ? fetchDemoExpenses(year, month) : fetchApiExpenses(year, month),
    queryKey: ["expenses", year, month],
    staleTime: isDemo ? Infinity : 5 * 60 * 1000, // Demo data never stale
  });
};
