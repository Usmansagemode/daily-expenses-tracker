"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { DataTable } from "@/app/expenses/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CategoryFilter from "@/components/yearly-charts/CategoryFilter";
import MonthFilter from "@/components/yearly-charts/MonthFilter";
import YearlyChartsGrid from "@/components/yearly-charts/YearlyChartsGrid";
import YearSelector from "@/components/YearSelector";
import { useYearlyExpenses } from "@/hooks/yearly-expenses/useYearlyExpenses";
import { parseLocalDate } from "@/lib/dateUtils";
import { getYearOptions } from "@/lib/dateUtils";
import { getIsDemoMode } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";

import { createReadOnlyColumns } from "./columns";

const isDemoMode = getIsDemoMode();

const YearlyChartsPage = () => {
  const currentDate = new Date();
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const { data: expenses = [], isLoading } = useYearlyExpenses(currentYear);

  // Add month filter state
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);

  // Collapsible section states
  const [showCharts, setShowCharts] = useState(true);
  const [showTable, setShowTable] = useState(false);

  // Get all unique categories from expenses
  const allCategories = useMemo(() => {
    const categories = Array.from(
      new Set(expenses.map((e) => e.categoryName || "Uncategorized")),
    ).sort();
    return categories;
  }, [expenses]);

  // Add category filter state
  // Initialize with empty array, will be updated when data loads
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Use a derived state that prefers selectedCategories, falls back to allCategories
  const effectiveCategories = useMemo(() => {
    return selectedCategories.length > 0 ? selectedCategories : allCategories;
  }, [selectedCategories, allCategories]);

  // Initialize selected categories when data loads
  // useEffect(() => {
  //   if (allCategories.length > 0 && selectedCategories.length === 0) {
  //     setSelectedCategories(allCategories);
  //   }
  // }, [allCategories, selectedCategories.length]);

  // Filter expenses by selected categories and months
  const filteredYearExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const category = expense.categoryName || "Uncategorized";
      const month = parseLocalDate(expense.date as unknown as string).getMonth();

      // Category filter: if none selected, show all; otherwise filter
      const categoryMatch =
        effectiveCategories.length === 0 ||
        effectiveCategories.includes(category);

      // Month filter: if none selected, show all; otherwise filter
      const monthMatch =
        selectedMonths.length === 0 || selectedMonths.includes(month);

      return categoryMatch && monthMatch;
    });
  }, [expenses, effectiveCategories, selectedMonths]);

  const columns = useMemo(() => createReadOnlyColumns(), []);

  const years = useMemo(() => getYearOptions(10), []);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-secondary mb-6 flex items-center justify-between rounded-lg p-4">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-4">
            <YearSelector
              value={currentYear}
              onValueChange={setCurrentYear}
              range={10}
              triggerClassName="h-8 w-24"
            />
            <h1 className="text-2xl font-bold">Expense Analytics</h1>
            {/* Year Selector */}

            {isDemoMode && (
              <p className="text-muted-foreground mt-1 text-xs">
                Demo Mode - Using sample data
              </p>
            )}
          </div>
          <div className="flex items-center gap-4 self-start">
            <span className="text-muted-foreground self-end text-sm">
              Total Spending:
            </span>
            <span className="text-3xl font-bold">
              {formatCurrency(
                filteredYearExpenses.reduce((sum, e) => sum + e.amount, 0),
              )}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-baseline items-end gap-2">
          <p className="text-muted-foreground self-end text-sm">
            {filteredYearExpenses.length} transactions
          </p>
          {/* Filters */}
          <div className="flex gap-2 self-end">
            <MonthFilter
              selectedMonths={selectedMonths}
              onSelectionChange={setSelectedMonths}
            />
            <CategoryFilter
              categories={allCategories}
              selectedCategories={effectiveCategories}
              onSelectionChange={setSelectedCategories}
            />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="bg-secondary rounded-lg">
        <button
          onClick={() => setShowCharts(!showCharts)}
          className="flex w-full items-center justify-between p-4 transition-colors"
        >
          <h2 className="text-xl font-semibold">Charts</h2>
          {showCharts ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>

        {showCharts && (
          <div className="p-4 pt-0">
            <YearlyChartsGrid
              filteredExpenses={filteredYearExpenses}
              currentYear={currentYear}
            />
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="bg-secondary rounded-lg">
        <button
          onClick={() => setShowTable(!showTable)}
          className="flex w-full items-center justify-between p-4 transition-colors"
        >
          <h2 className="text-xl font-semibold">Expenses Table</h2>
          {showTable ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>

        {showTable && (
          <div className="p-4 pt-0">
            <div className="bg-primary-foreground text-muted-foreground rounded-lg p-8 text-center">
              <DataTable
                columns={columns}
                data={filteredYearExpenses}
                isReadOnly={true}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YearlyChartsPage;
