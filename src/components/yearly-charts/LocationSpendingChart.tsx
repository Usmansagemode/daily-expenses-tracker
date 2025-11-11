"use client";

import { useMemo } from "react";
import { Cell, Pie, PieChart } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LabelProps } from "@/entities/Charts";
import { ExpenseWithDetails } from "@/entities/Expense";
import { formatCurrency } from "@/lib/utils";

interface LocationSpendingChartProps {
  expenses: ExpenseWithDetails[];
}

// Color palette for locations
const LOCATION_COLORS = ["#8b5cf6", "#ec4899", "#06b6d4", "#f97316", "#10b981"];

const chartConfig = {
  amount: {
    label: "Spending",
  },
} satisfies ChartConfig;

const LocationSpendingChart = ({ expenses }: LocationSpendingChartProps) => {
  const locationData = useMemo(() => {
    const locationTotals = expenses.reduce(
      (acc, expense) => {
        const location = expense.tagName || "No Location";
        acc[location] = (acc[location] || 0) + expense.amount;
        return acc;
      },
      {} as Record<string, number>,
    );

    const total = Object.values(locationTotals).reduce(
      (sum, val) => sum + val,
      0,
    );

    return Object.entries(locationTotals)
      .map(([name, value]) => ({
        name,
        percentage: total > 0 ? (value / total) * 100 : 0,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const total = useMemo(
    () => locationData.reduce((sum, item) => sum + item.value, 0),
    [locationData],
  );

  const CustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: LabelProps) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show label if percentage is >= 5%
    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (locationData.length === 0) {
    return (
      <div>
        <h2 className="mb-6 text-lg font-medium">Spending by Location</h2>
        <div className="flex h-[300px] flex-col items-center justify-center">
          <p className="text-muted-foreground">No location data available</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-6 text-lg font-medium">Spending by Location</h2>

      {/* <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
        <PieChart>
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => (
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold">{name}</span>
                    <span>{formatCurrency(value as number)}</span>
                    <span className="text-muted-foreground text-xs">
                      {(((value as number) / total) * 100).toFixed(1)}% of total
                    </span>
                  </div>
                )}
              />
            }
          />
          <Pie
            data={locationData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            labelLine={false}
            label={CustomLabel}
          >
            {locationData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={LOCATION_COLORS[index % LOCATION_COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer> */}

      {/* Summary Table */}
      <div className="mt-6 space-y-2">
        {locationData.map((location, index) => (
          <div
            key={location.name}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor:
                    LOCATION_COLORS[index % LOCATION_COLORS.length],
                }}
              />
              <span className="font-medium">{location.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground">
                {location.percentage.toFixed(1)}%
              </span>
              <span className="min-w-[80px] text-right font-semibold">
                {formatCurrency(location.value)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocationSpendingChart;
