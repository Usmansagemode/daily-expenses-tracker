"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, FileSpreadsheet, Printer } from "lucide-react";

import { DataTable } from "@/app/expenses/data-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import CategoryFilter from "@/components/yearly-charts/CategoryFilter";
import MonthFilter from "@/components/yearly-charts/MonthFilter";
import YearlyChartsGrid from "@/components/yearly-charts/YearlyChartsGrid";
import YearSelector from "@/components/YearSelector";
import { useYearlyExpenses } from "@/hooks/yearly-expenses/useYearlyExpenses";
import { getYearOptions, parseLocalDate } from "@/lib/dateUtils";
import { exportToExcel } from "@/lib/exportExcel";
import { getIsDemoMode } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";

import { createReadOnlyColumns } from "./columns";

const isDemoMode = getIsDemoMode();

const YearlyChartsPage = () => {
  const currentDate = new Date();
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const { data: expenses = [], isLoading } = useYearlyExpenses(currentYear);

  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  const [showCharts, setShowCharts] = useState(true);
  const [showTable, setShowTable] = useState(false);

  const allCategories = useMemo(() => {
    const categories = Array.from(
      new Set(expenses.map((e) => e.categoryName || "Uncategorized")),
    ).sort();
    return categories;
  }, [expenses]);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const effectiveCategories = useMemo(() => {
    return selectedCategories.length > 0 ? selectedCategories : allCategories;
  }, [selectedCategories, allCategories]);

  const filteredYearExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const category = expense.categoryName || "Uncategorized";
      const month = parseLocalDate(expense.date as unknown as string).getMonth();

      const categoryMatch =
        effectiveCategories.length === 0 ||
        effectiveCategories.includes(category);

      const monthMatch =
        selectedMonths.length === 0 || selectedMonths.includes(month);

      return categoryMatch && monthMatch;
    });
  }, [expenses, effectiveCategories, selectedMonths]);

  const columns = useMemo(() => createReadOnlyColumns(), []);

  const _years = useMemo(() => getYearOptions(10), []);

  const handleExportPdf = () => {
    setShowCharts(true);
    const originalTitle = document.title;
    const html = document.documentElement;
    const originalClass = html.className;
    document.title = `daily-expenses-${currentYear}-report`;
    html.className = originalClass.replace("dark", "").trim();
    setTimeout(() => {
      window.print();
      html.className = originalClass;
      document.title = originalTitle;
    }, 150);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ScrollProgress className="print:hidden" />
      {/* Print-only title */}
      <div className="hidden print:block">
        <h1 className="text-2xl font-bold">
          Expense Analytics — {currentYear}
        </h1>
        <p className="text-muted-foreground text-sm">
          Total:{" "}
          {formatCurrency(
            filteredYearExpenses.reduce((sum, e) => sum + e.amount, 0),
          )}{" "}
          · {filteredYearExpenses.length} transactions
        </p>
      </div>

      {/* Header */}
      <div className="bg-secondary mb-6 flex items-center justify-between rounded-lg p-4 print:hidden">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-4">
            <YearSelector
              value={currentYear}
              onValueChange={setCurrentYear}
              range={10}
              triggerClassName="h-8 w-24"
            />
            <h1 className="text-2xl font-bold">Expense Analytics</h1>
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
        <div className="flex flex-col items-end gap-2">
          <p className="text-muted-foreground self-end text-sm">
            {filteredYearExpenses.length} transactions
          </p>
          {/* Filters + Export */}
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  Export
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportPdf}>
                  <Printer className="mr-2 h-4 w-4" />
                  PDF Report
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    void exportToExcel(filteredYearExpenses, currentYear)
                  }
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel (.xlsx)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="bg-secondary rounded-lg">
        <button
          onClick={() => setShowCharts(!showCharts)}
          className="flex w-full items-center justify-between p-4 transition-colors print:hidden"
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

      {/* Table Section — hidden when printing */}
      <div className="bg-secondary rounded-lg print:hidden">
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
