import { useQuery } from "@tanstack/react-query";

import { expensesData } from "@/components/expenses/data/expenseData";
import { parseLocalDate } from "@/lib/dateUtils";
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
    const expenseDate = parseLocalDate(expense.date as unknown as string);
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

  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate)
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
