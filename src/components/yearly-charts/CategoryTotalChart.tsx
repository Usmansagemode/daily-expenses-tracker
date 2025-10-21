"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ExpenseWithDetails } from "@/entities/Expense";
import { formatCurrency, getCategoryColor } from "@/lib/utils";

interface CategoryTotalChartProps {
  expenses: ExpenseWithDetails[];
}

const chartConfig = {
  amount: {
    color: "hsl(var(--chart-2))",
    label: "Total Spending",
  },
} satisfies ChartConfig;

const CategoryTotalChart = ({ expenses }: CategoryTotalChartProps) => {
  const categoryData = useMemo(() => {
    const totals: Record<string, number> = {};

    expenses.forEach((expense) => {
      const category = expense.categoryName || "Uncategorized";
      totals[category] = (totals[category] || 0) + expense.amount;
    });

    return Object.entries(totals)
      .map(([category, amount]) => ({ amount, category }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  return (
    <div>
      <h2 className="mb-6 text-lg font-medium">Total Spending by Category</h2>
      <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
        <BarChart accessibilityLayer data={categoryData} layout="vertical">
          <CartesianGrid horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={(value) =>
              formatCurrency(value, { minimumFractionDigits: 0 })
            }
          />
          <YAxis
            dataKey="category"
            type="category"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            width={100}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => formatCurrency(value as number)}
              />
            }
          />

          <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
            {categoryData.map((entry, index) => {
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
    </div>
  );
};

export default CategoryTotalChart;
