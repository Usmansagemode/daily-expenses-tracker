"use client";

import { ExpenseWithDetails } from "@/entities/Expense";
import { useMemo, useState, useEffect } from "react";
import MonthlySpendingChart from "@/components/yearly-charts/MonthlySpendingChart";
import CategoryTotalChart from "@/components/yearly-charts/CategoryTotalChart";
import CategoryAverageChart from "@/components/yearly-charts/CategoryAverageChart";
import CategoryByMonthChart from "@/components/yearly-charts/CategoryByMonthChart";
import { expensesData } from "@/components/expenses/data/expenseData";
import { transformToExpenseWithDetails } from "@/lib/utils";
import { getIsDemoMode, isSupabaseAvailable, supabase } from "@/lib/supabase";
import MemberSpendingChart from "@/components/yearly-charts/MemberSpendingChart";

const isDemoMode = getIsDemoMode();

const YearlyChartsPage = () => {
  const [expenses, setExpenses] = useState<ExpenseWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchExpenses = async () => {
      if (isDemoMode) {
        // Use dummy data
        const transformedExpenses = transformToExpenseWithDetails(expensesData);
        setExpenses(transformedExpenses);
        setIsLoading(false);
      } else {
        // Fetch from Supabase
        try {
          const startDate = new Date(currentYear, 0, 1); // Jan 1
          const endDate = new Date(currentYear, 11, 31); // Dec 31

          if (isSupabaseAvailable() && supabase) {
            const { data, error } = await supabase
              .from("expenses")
              .select("*")
              .gte("date", startDate.toISOString())
              .lte("date", endDate.toISOString())
              .order("date", { ascending: false });
            if (error) throw error;

            const transformedExpenses = transformToExpenseWithDetails(
              data || []
            );
            setExpenses(transformedExpenses);
          }
        } catch (error) {
          console.error("Error fetching expenses:", error);
          // Fallback to demo data on error
          const transformedExpenses =
            transformToExpenseWithDetails(expensesData);
          setExpenses(transformedExpenses);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchExpenses();
  }, [currentYear]);

  // Filter expenses for current year
  const yearExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const expenseYear = new Date(expense.date).getFullYear();
      return expenseYear === currentYear;
    });
  }, [expenses, currentYear]);

  const totalYearSpending = useMemo(() => {
    return yearExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [yearExpenses]);

  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalYearSpending);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-secondary p-4 rounded-lg flex items-center justify-between">
        <div className="flex items-center">
          <div>
            <h1 className="text-2xl font-bold">
              {currentYear} Expense Analytics
            </h1>
            {isDemoMode && (
              <p className="text-xs text-muted-foreground mt-1">
                Demo Mode - Using sample data
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-baseline gap-2">
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground mr-4">
              Total Spending:
            </span>
            <span className="text-3xl font-bold">{formattedTotal}</span>
          </div>
          <p className="text-sm text-muted-foreground self-end">
            {yearExpenses.length} transactions this year
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6"> */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {/* Monthly Spending - Takes 2 columns */}
        <div className="bg-primary-foreground p-6 rounded-lg lg:col-span-2 xl:col-span-2">
          <MonthlySpendingChart expenses={yearExpenses} year={currentYear} />
        </div>

        {/* Total Spending by Category - Takes 2 columns */}
        <div className="bg-primary-foreground p-6 rounded-lg lg:col-span-2 xl:col-span-2">
          <CategoryTotalChart expenses={yearExpenses} />
        </div>

        {/* Average Spending by Category */}
        <div className="bg-primary-foreground p-6 rounded-lg lg:col-span-2">
          <CategoryAverageChart expenses={yearExpenses} />
        </div>
        {/* Member Spending - Takes 1 column */}
        <div className="bg-primary-foreground p-6 rounded-lg lg:col-span-2">
          <MemberSpendingChart expenses={yearExpenses} />
        </div>
        {/* Category by Month - Takes 3 columns */}
        <div className="bg-primary-foreground p-6 rounded-lg lg:col-span-3 xl:col-span-3">
          <CategoryByMonthChart expenses={yearExpenses} year={currentYear} />
        </div>
      </div>
    </div>
  );
};

export default YearlyChartsPage;
