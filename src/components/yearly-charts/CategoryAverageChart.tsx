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

interface CategoryAverageChartProps {
  expenses: ExpenseWithDetails[];
}

const chartConfig = {
  average: {
    color: "hsl(var(--chart-3))",
    label: "Average per Transaction",
  },
} satisfies ChartConfig;

const CategoryAverageChart = ({ expenses }: CategoryAverageChartProps) => {
  const categoryData = useMemo(() => {
    const stats: Record<string, { total: number; count: number }> = {};

    expenses.forEach((expense) => {
      const category = expense.categoryName || "Uncategorized";
      if (!stats[category]) {
        stats[category] = { count: 0, total: 0 };
      }
      stats[category].total += expense.amount;
      stats[category].count += 1;
    });

    return Object.entries(stats)
      .map(([category, { total, count }]) => ({
        average: total / count,
        category,
        count,
      }))
      .sort((a, b) => b.average - a.average);
  }, [expenses]);

  return (
    <div>
      <h2 className="mb-6 text-lg font-medium">Average Spending by Category</h2>
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
                formatter={(value) =>
                  formatCurrency(value as number, { minimumFractionDigits: 0 })
                }
              />
            }
          />

          <Bar dataKey="average" radius={[0, 4, 4, 0]}>
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

export default CategoryAverageChart;
