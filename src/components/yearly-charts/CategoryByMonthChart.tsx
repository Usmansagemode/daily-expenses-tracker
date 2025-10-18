"use client";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ExpenseWithDetails } from "@/entities/Expense";
import { getCategoryColor } from "@/lib/utils";
import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

interface CategoryByMonthChartProps {
  expenses: ExpenseWithDetails[];
  year: number;
}

const CategoryByMonthChart = ({
  expenses,
  year,
}: CategoryByMonthChartProps) => {
  const { chartData, chartConfig } = useMemo(() => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Get unique categories
    const categories = Array.from(
      new Set(expenses.map((e) => e.categoryName || "Uncategorized"))
    ).sort();

    // Initialize data structure
    const monthlyData = months.map((month) => {
      const data: any = { month };
      categories.forEach((cat) => {
        data[cat] = 0;
      });
      return data;
    });

    // Fill in the data
    expenses.forEach((expense) => {
      const month = new Date(expense.date).getMonth();
      const category = expense.categoryName || "Uncategorized";
      monthlyData[month][category] += expense.amount;
    });

    // Generate chart config with colors
    const config: ChartConfig = {};
    categories.forEach((category) => {
      config[category] = {
        label: category,
        color: getCategoryColor(category),
      };
    });

    return { chartData: monthlyData, chartConfig: config, categories };
  }, [expenses]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const categories = Object.keys(chartConfig);

  return (
    <div>
      <h2 className="text-lg font-medium mb-6">
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
            tickFormatter={formatCurrency}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => formatCurrency(value as number)}
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
