"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ExpenseWithDetails } from "@/entities/Expense";
import { useMemo } from "react";
import { Pie, PieChart, Cell, Legend } from "recharts";

interface MemberSpendingChartProps {
  expenses: ExpenseWithDetails[];
}

// Color palette for members
const MEMBER_COLORS = [
  "#ec4899", // pink
  "#8b5cf6", // violet
];

const chartConfig = {
  amount: {
    label: "Spending",
  },
} satisfies ChartConfig;

const MemberSpendingChart = ({ expenses }: MemberSpendingChartProps) => {
  const memberData = useMemo(() => {
    const memberTotals = expenses.reduce((acc, expense) => {
      const memberName = expense.memberName || "Unassigned";
      acc[memberName] = (acc[memberName] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(memberTotals).reduce(
      (sum, val) => sum + val,
      0
    );

    return Object.entries(memberTotals)
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? (value / total) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const total = useMemo(
    () => memberData.reduce((sum, item) => sum + item.value, 0),
    [memberData]
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const CustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
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

  if (memberData.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-medium mb-6">Spending by Member</h2>
        <div className="flex flex-col items-center justify-center h-[300px]">
          <p className="text-muted-foreground">
            No member spending data available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-medium mb-6">Spending by Member</h2>

      <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
        <PieChart>
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => (
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold">{name}</span>
                    <span>{formatCurrency(value as number)}</span>
                    <span className="text-xs text-muted-foreground">
                      {(((value as number) / total) * 100).toFixed(1)}% of total
                    </span>
                  </div>
                )}
              />
            }
          />
          <Pie
            data={memberData}
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
            {memberData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={MEMBER_COLORS[index % MEMBER_COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>

      {/* Summary Table */}
      <div className="space-y-2 mt-6">
        {memberData.map((member, index) => (
          <div
            key={member.name}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: MEMBER_COLORS[index % MEMBER_COLORS.length],
                }}
              />
              <span className="font-medium">{member.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground">
                {member.percentage.toFixed(1)}%
              </span>
              <span className="font-semibold min-w-[80px] text-right">
                {formatCurrency(member.value)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberSpendingChart;
