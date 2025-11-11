import { useQuery } from "@tanstack/react-query";

import { expensesData } from "@/components/expenses/data/expenseData";
import { ExpenseWithDetails } from "@/entities/Expense";
import { getIsDemoMode, supabase } from "@/lib/supabase";
import { transformToExpenseWithDetails } from "@/lib/utils";

const isDemoMode = getIsDemoMode();

// Demo data fetcher for full year
const fetchDemoYearlyExpenses = async (
  year: number,
): Promise<ExpenseWithDetails[]> => {
  // Simulate API delay for realism
  await new Promise((resolve) => setTimeout(resolve, 500));

  const filteredExpenses = expensesData.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getFullYear() === year;
  });

  return transformToExpenseWithDetails(filteredExpenses);
};

// Real API fetcher for full year
const fetchApiYearlyExpenses = async (
  year: number,
): Promise<ExpenseWithDetails[]> => {
  // Check if supabase is available
  if (!supabase) {
    console.warn("Supabase not available, returning empty expenses");
    return [];
  }

  const startDate = new Date(year, 0, 1); // Jan 1
  const endDate = new Date(year, 11, 31, 23, 59, 59); // Dec 31

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .gte("date", startDate.toISOString())
    .lte("date", endDate.toISOString())
    .order("date", { ascending: false });

  if (error) throw error;

  const expenses = data || [];
  return transformToExpenseWithDetails(expenses);
};

export const useYearlyExpenses = (year: number) => {
  return useQuery({
    queryFn: () =>
      isDemoMode ? fetchDemoYearlyExpenses(year) : fetchApiYearlyExpenses(year),
    queryKey: ["yearly-expenses", year],
    staleTime: isDemoMode ? Infinity : 5 * 60 * 1000, // Demo data never stale, API data stale after 5 minutes
  });
};
