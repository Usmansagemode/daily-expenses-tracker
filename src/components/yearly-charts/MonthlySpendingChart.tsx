"use client";

import { useMemo, useState } from "react";
import { BarChart3, LineChart as LineChartIcon } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ExpenseWithDetails } from "@/entities/Expense";
import { GREEN, ORANGE, RED } from "@/lib/config";
import { formatCurrency } from "@/lib/utils";

interface MonthlySpendingChartProps {
  expenses: ExpenseWithDetails[];
  year: number;
}

const chartConfig = {
  amount: {
    color: "hsl(var(--chart-1))",
    label: "Spending",
  },
} satisfies ChartConfig;

const MonthlySpendingChart = ({
  expenses,
  year,
}: MonthlySpendingChartProps) => {
  const [chartType, setChartType] = useState<"area" | "bar">("area");

  const { monthlyData, maxAmount } = useMemo(() => {
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

    const monthlyTotals = new Array(12).fill(0);

    expenses.forEach((expense) => {
      const month = new Date(expense.date).getMonth();
      monthlyTotals[month] += expense.amount;
    });

    const max = Math.max(...monthlyTotals);

    return {
      maxAmount: max,
      monthlyData: months.map((month, index) => ({
        amount: monthlyTotals[index],
        month,
      })),
    };
  }, [expenses]);

  const getColorByIntensity = (amount: number): string => {
    if (maxAmount === 0) return GREEN;

    const ratio = amount / maxAmount;

    if (ratio < 0.33) {
      return GREEN; // Softer green - good
    } else if (ratio < 0.66) {
      return ORANGE; // True orange - medium
    } else {
      return RED; // Proper red - high expenses
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-medium">Monthly Spending Trend</h2>
        <div
          className="bg-secondary flex gap-1 rounded-md p-1"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant={chartType === "area" ? "default" : "ghost"}
            size="sm"
            onClick={() => setChartType("area")}
            className="h-8 cursor-pointer px-3 hover:scale-105"
          >
            <LineChartIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={chartType === "bar" ? "default" : "ghost"}
            size="sm"
            onClick={() => setChartType("bar")}
            className="h-8 cursor-pointer px-3 hover:scale-105"
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
        {chartType === "area" ? (
          <AreaChart accessibilityLayer data={monthlyData}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={RED} stopOpacity={0.8} />
                <stop offset="50%" stopColor={ORANGE} stopOpacity={0.3} />
                <stop offset="95%" stopColor={GREEN} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
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
                formatCurrency(value, { minimumFractionDigits: 0 })
              }
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatCurrency(value as number)}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="oklch(0.72 0.20 15)"
              fill="url(#colorAmount)"
              strokeWidth={2}
            />
          </AreaChart>
        ) : (
          <BarChart accessibilityLayer data={monthlyData}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
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
                formatCurrency(value, { minimumFractionDigits: 0 })
              }
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatCurrency(value as number)}
                />
              }
            />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
              {monthlyData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getColorByIntensity(entry.amount)}
                />
              ))}
            </Bar>
          </BarChart>
        )}
      </ChartContainer>
    </div>
  );
};

export default MonthlySpendingChart;
