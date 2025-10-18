"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ExpenseWithDetails } from "@/entities/Expense";
import { getCategoryColor } from "@/lib/utils";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

interface CategoryTotalChartProps {
  expenses: ExpenseWithDetails[];
}

const chartConfig = {
  amount: {
    label: "Total Spending",
    color: "hsl(var(--chart-2))",
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
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div>
      <h2 className="text-lg font-medium mb-6">Total Spending by Category</h2>
      <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
        <BarChart accessibilityLayer data={categoryData} layout="vertical">
          <CartesianGrid horizontal={false} />
          <XAxis type="number" tickFormatter={formatCurrency} />
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
