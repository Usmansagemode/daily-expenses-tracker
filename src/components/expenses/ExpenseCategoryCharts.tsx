import { Car, ChevronDown, ChevronUp, CircleHelp, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { CATEGORY_ICONS_BY_NAME, ExpenseWithDetails } from "@/entities/Expense";
import { useMemo, useState } from "react";
import MonthYearSelector from "./MonthYearSelector";
import { formatCurrency } from "@/lib/utils";

interface ExpenseCategoryChartsProps {
  data: ExpenseWithDetails[];
  formattedTotal: string | number;
  currentMonth: number;
  currentYear: number;
  onMonthYearChange: (month: number, year: number) => void;
}

const ExpenseCategoryCharts = ({
  data,

  formattedTotal,
  currentMonth,
  currentYear,
  onMonthYearChange,
}: ExpenseCategoryChartsProps) => {
  const [showCharts, setShowCharts] = useState(true);

  // Calculate totals per category
  const categoryTotals = useMemo(() => {
    const totals: Record<
      string,
      { name: string; amount: number; count: number }
    > = {};

    data.forEach((expense) => {
      const categoryName = expense.categoryName || "Uncategorized";
      if (!totals[categoryName]) {
        totals[categoryName] = { name: categoryName, amount: 0, count: 0 };
      }
      totals[categoryName].amount += expense.amount;
      totals[categoryName].count += 1;
    });

    // Convert to array and sort by amount descending
    return Object.values(totals).sort((a, b) => b.amount - a.amount);
  }, [data]);

  // Calculate max amount for relative bar sizing
  const maxAmount = useMemo(
    () => Math.max(...categoryTotals.map((c) => c.amount), 0),
    [categoryTotals]
  );

  return (
    <div className="flex flex-col w-full">
      <div className="mb-8 px-4 py-2 bg-secondary rounded-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          <MonthYearSelector
            currentMonth={currentMonth}
            currentYear={currentYear}
            onMonthYearChange={onMonthYearChange}
          />
          <div>
            <p className="text-sm text-muted-foreground">
              {data.length} {data.length === 1 ? "expense" : "expenses"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center text-right">
            <p className="text-sm text-muted-foreground mr-2">Total </p>
            <p className="text-2xl font-bold">{formattedTotal}</p>
          </div>
          <Button
            onClick={() => setShowCharts(!showCharts)}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            {showCharts ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            {showCharts ? "Hide" : "Show"} Charts
          </Button>
        </div>
      </div>

      {/* Category Cards Grid */}
      {showCharts && categoryTotals.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
          {categoryTotals.map((category) => {
            const percentage =
              maxAmount > 0 ? (category.amount / maxAmount) * 100 : 0;
            const IconComponent = category
              ? CATEGORY_ICONS_BY_NAME[category.name]
              : CircleHelp;

            return (
              <Card key={category.name}>
                <CardHeader className="pb-1">
                  <CardTitle className="flex items-center text-sm font-medium text-muted-foreground">
                    {IconComponent && (
                      <IconComponent className="h-4 w-4 mr-2" />
                    )}
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-bold">
                        {formatCurrency(category.amount)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {category.count}{" "}
                        {category.count === 1 ? "item" : "items"}
                      </span>
                    </div>

                    {/* Simple bar chart */}
                    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {maxAmount > 0 ? Math.round(percentage) : 0}% of highest
                      category
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Empty state */}
          {categoryTotals.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="py-8 text-center text-muted-foreground">
                No expenses yet. Add your first expense to see category
                breakdowns!
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Empty state when charts are shown */}
      {showCharts && categoryTotals.length === 0 && (
        <Card className="mb-8">
          <CardContent className="py-8 text-center text-muted-foreground">
            No expenses yet. Add your first expense to see category breakdowns!
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExpenseCategoryCharts;
