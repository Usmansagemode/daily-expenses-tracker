"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { parseLocalDate } from "@/lib/dateUtils";
import { ExpenseWithDetails } from "@/entities/Expense";
import { formatCurrency, formatCurrencyCompact } from "@/lib/utils";
import { getCategoryColor } from "@/lib/utils";

interface TopExpensesChartProps {
  expenses: ExpenseWithDetails[];
  limit?: number;
}

const chartConfig = {
  amount: {
    color: "hsl(var(--chart-2))",
    label: "Amount",
  },
} satisfies ChartConfig;

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-popover border-border min-w-[200px] rounded-lg border p-3 shadow-lg">
        <p className="mb-2 text-sm font-semibold">{data.description}</p>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-semibold">{formatCurrency(data.amount)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Category:</span>
            <span>{data.category}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Date:</span>
            <span>{format(parseLocalDate(data.date as string), "MMM d, yyyy")}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Paid by:</span>
            <span>{data.member}</span>
          </div>
          {data.location !== "Unknown" && (
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Location:</span>
              <span>{data.location}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const TopExpensesChart = ({ expenses, limit = 10 }: TopExpensesChartProps) => {
  const topExpenses = useMemo(() => {
    return expenses
      .sort((a, b) => b.amount - a.amount)
      .slice(0, limit)
      .map((expense) => ({
        amount: expense.amount,
        category: expense.categoryName || "Uncategorized",
        date: expense.date,
        description: expense.description || "No description",
        id: expense.id,
        location: expense.tagName || "Unknown",
        member: expense.memberName || "Unknown",
      }));
  }, [expenses, limit]);

  if (topExpenses.length === 0) {
    return (
      <div>
        <h2 className="mb-6 text-lg font-medium">Top {limit} Expenses</h2>
        <div className="flex h-[300px] flex-col items-center justify-center">
          <p className="text-muted-foreground">No expenses available</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-6 text-lg font-medium">
        Top {topExpenses.length} Individual Expenses
      </h2>
      <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
        <BarChart accessibilityLayer data={topExpenses} layout="vertical">
          <CartesianGrid horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={(value) =>
              formatCurrencyCompact(value)
            }
          />
          <YAxis
            dataKey="description"
            type="category"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            width={120}
            tickFormatter={(value) => {
              // Truncate long descriptions
              return value.length > 15 ? value.substring(0, 15) + "..." : value;
            }}
          />
          <ChartTooltip content={<CustomTooltip />} />

          <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
            {topExpenses.map((entry, index) => {
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={getCategoryColor(entry.category)}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ChartContainer>

      {/* Detailed list */}
      {/* <div className="mt-6 space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Expense Details
        </h3>
        {topExpenses.map((expense, index) => (
          <div
            key={expense.id}
            className="flex items-start justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-muted-foreground">
                  #{index + 1}
                </span>
                <span className="font-medium text-sm truncate">
                  {expense.description}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="px-2 py-0.5 rounded bg-background">
                  {expense.category}
                </span>
                <span>{format(parseLocalDate(expense.date as unknown as string), "MMM d, yyyy")}</span>
                <span>•</span>
                <span>{expense.member}</span>
                {expense.location !== "Unknown" && (
                  <>
                    <span>•</span>
                    <span>{expense.location}</span>
                  </>
                )}
              </div>
            </div>
            <div className="text-right ml-4">
              <div className="font-semibold text-lg">
                {formatCurrency(expense.amount)}
              </div>
            </div>
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default TopExpensesChart;
