"use client";

import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ExpenseWithDetails } from "@/entities/Expense";
import { getShortMonthLabels, parseLocalDate } from "@/lib/dateUtils";
import { formatCurrency, formatCurrencyCompact, getCategoryColor } from "@/lib/utils";

interface CategoryByMonthChartProps {
  expenses: ExpenseWithDetails[];
  year: number;
}

const CategoryByMonthChart = ({ expenses }: CategoryByMonthChartProps) => {
  const { chartData, chartConfig } = useMemo(() => {
    const months = getShortMonthLabels();

    // Get unique categories
    const categories = Array.from(
      new Set(expenses.map((e) => e.categoryName || "Uncategorized")),
    ).sort();

    // Initialize data structure
    const monthlyData = months.map((month) => {
      const data: Record<string, number | string> = { month };
      categories.forEach((cat) => {
        data[cat] = 0;
      });
      return data;
    });

    // Fill in the data
    expenses.forEach((expense) => {
      const month = parseLocalDate(expense.date as unknown as string).getMonth();
      const category = expense.categoryName || "Uncategorized";

      monthlyData[month][category] =
        ((monthlyData[month][category] as number) || 0) + expense.amount;
    });

    // Generate chart config with colors
    const config: ChartConfig = {};
    categories.forEach((category) => {
      config[category] = {
        color: getCategoryColor(category),
        label: category,
      };
    });

    return { categories, chartConfig: config, chartData: monthlyData };
  }, [expenses]);

  const categories = Object.keys(chartConfig);

  return (
    <div>
      <h2 className="mb-6 text-lg font-medium">
        Category Trends Over The Year
      </h2>
      <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
        <LineChart accessibilityLayer data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <YAxis
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) =>
              formatCurrencyCompact(value)
            }
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                indicator="dot"
                formatter={(value, name) => (
                  <>
                    <div
                      className="bg-[--color-bg] h-2.5 w-2.5 shrink-0 rounded-[2px]"
                      style={
                        {
                          "--color-bg": chartConfig[name as string]?.color,
                        } as React.CSSProperties
                      }
                    />
                    <span className="text-muted-foreground">{name}</span>
                    <span className="ml-auto font-mono font-medium">
                      {formatCurrency(value as number, {
                        minimumFractionDigits: 0,
                      })}
                    </span>
                  </>
                )}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          {categories.map((category) => (
            <Line
              key={category}
              type="monotone"
              dataKey={category}
              stroke={chartConfig[category]?.color}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ChartContainer>
    </div>
  );
};

export default CategoryByMonthChart;
