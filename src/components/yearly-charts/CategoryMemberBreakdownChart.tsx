"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ExpenseWithDetails } from "@/entities/Expense";
import { formatCurrency } from "@/lib/utils";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface CategoryMemberBreakdownChartProps {
  expenses: ExpenseWithDetails[];
}

// Color palette for members (matching MemberSpendingChart)
const MEMBER_COLORS = ["#8b5cf6", "#ec4899"];

const CategoryMemberBreakdownChart = ({
  expenses,
}: CategoryMemberBreakdownChartProps) => {
  const { chartData, members, chartConfig } = useMemo(() => {
    // Group expenses by category and member
    const categoryMemberTotals: Record<string, Record<string, number>> = {};

    expenses.forEach((expense) => {
      const category = expense.categoryName || "Uncategorized";
      const member = expense.memberName || "Unassigned";

      if (!categoryMemberTotals[category]) {
        categoryMemberTotals[category] = {};
      }

      categoryMemberTotals[category][member] =
        (categoryMemberTotals[category][member] || 0) + expense.amount;
    });

    // Get unique members
    const uniqueMembers = Array.from(
      new Set(expenses.map((e) => e.memberName || "Unassigned"))
    ).sort();

    // Transform into chart data format
    const data = Object.entries(categoryMemberTotals)
      .map(([category, memberTotals]) => {
        const row: any = { category };
        uniqueMembers.forEach((member) => {
          row[member] = memberTotals[member] || 0;
        });
        // Calculate total for sorting
        row._total = Object.values(memberTotals).reduce(
          (sum: number, val) => sum + (val as number),
          0
        );
        return row;
      })
      .sort((a, b) => b._total - a._total); // Sort by total spending

    // Create chart config dynamically
    const config: ChartConfig = {};
    uniqueMembers.forEach((member, index) => {
      config[member] = {
        label: member,
        color: MEMBER_COLORS[index % MEMBER_COLORS.length],
      };
    });

    return {
      chartData: data,
      members: uniqueMembers,
      chartConfig: config,
    };
  }, [expenses]);

  if (chartData.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-medium mb-6">
          Category Spending by Member
        </h2>
        <div className="flex flex-col items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-medium mb-6">Category Spending by Member</h2>
      <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
        <BarChart accessibilityLayer data={chartData} layout="vertical">
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
            width={120}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{name}:</span>
                    <span>{formatCurrency(value as number)}</span>
                  </div>
                )}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          {members.map((member) => (
            <Bar
              key={member}
              dataKey={member}
              stackId="a"
              fill={chartConfig[member].color}
              radius={[0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      </ChartContainer>
    </div>
  );
};

export default CategoryMemberBreakdownChart;
