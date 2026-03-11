"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { ExpenseWithDetails } from "@/entities/Expense";
import { DEFAULT_MEMBERS, LOCALE_CONFIG } from "@/lib/config";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { NumberTicker } from "../ui/number-ticker";

import CategoryCard from "./CategoryCard";
import MemberCard from "./MemberCard";
import MonthYearSelector from "./MonthYearSelector";

interface ExpenseHeaderProps {
  data: ExpenseWithDetails[];
  total: number;
  deltaPercent?: number | null;
  currentMonth: number;
  currentYear: number;
  onMonthYearChange: (month: number, year: number) => void;
}

const ExpenseHeader = ({
  data,
  total,
  deltaPercent,
  currentMonth,
  currentYear,
  onMonthYearChange,
}: ExpenseHeaderProps) => {
  const [showCharts, setShowCharts] = useState(true);

  // Calculate totals per category
  const categoryTotals = useMemo(() => {
    const totals: Record<
      string,
      { name: string; amount: number; count: number }
    > = {};

    data.forEach((expense) => {
      const categoryName = expense.categoryName || "Uncategorized";
      if (!totals[categoryName]) {
        totals[categoryName] = { amount: 0, count: 0, name: categoryName };
      }
      totals[categoryName].amount += expense.amount;
      totals[categoryName].count += 1;
    });

    return Object.values(totals).sort((a, b) => b.amount - a.amount);
  }, [data]);

  // Calculate totals per member
  const memberTotals = useMemo(() => {
    const totals: Record<
      string,
      { id: string; name: string; amount: number; count: number }
    > = {};

    // Initialize all members with 0
    DEFAULT_MEMBERS.forEach((member) => {
      totals[member.id] = {
        amount: 0,
        count: 0,
        id: member.id,
        name: member.name,
      };
    });

    // Add "Unassigned" for expenses without a member
    totals["unassigned"] = {
      amount: 0,
      count: 0,
      id: "unassigned",
      name: "Unassigned",
    };

    // Calculate actual totals
    data.forEach((expense) => {
      const memberId = expense.memberId || "unassigned";
      if (!totals[memberId]) {
        const member = DEFAULT_MEMBERS.find((m) => m.id === memberId);
        totals[memberId] = {
          amount: 0,
          count: 0,
          id: memberId,
          name: member?.name || "Unknown",
        };
      }
      totals[memberId].amount += expense.amount;
      totals[memberId].count += 1;
    });

    return Object.values(totals)
      .filter((member) => member.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [data]);

  // Calculate max amount for relative bar sizing
  const maxAmount = useMemo(
    () => Math.max(...categoryTotals.map((c) => c.amount), 0),
    [categoryTotals],
  );

  return (
    <div className="flex w-full flex-col">
      {/* Header Section */}
      <div className="bg-secondary mb-8 rounded-md px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <MonthYearSelector
              currentMonth={currentMonth}
              currentYear={currentYear}
              onMonthYearChange={onMonthYearChange}
            />
            <div>
              <p className="text-muted-foreground text-sm">
                {data.length} {data.length === 1 ? "expense" : "expenses"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-right">
              <p className="text-muted-foreground text-sm">Total</p>
              <p className="text-2xl font-bold">
                <span>{LOCALE_CONFIG.symbol}</span>
                <NumberTicker value={total} decimalPlaces={2} />
              </p>
              {deltaPercent != null && (
                <Badge
                  variant="secondary"
                  className={
                    deltaPercent >= 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-green-600 dark:text-green-400"
                  }
                  title="vs last month"
                >
                  {deltaPercent >= 0 ? "↑" : "↓"}{" "}
                  {Math.abs(deltaPercent).toFixed(1)}%
                </Badge>
              )}
            </div>
            <Button
              onClick={() => setShowCharts(!showCharts)}
              size="sm"
              variant="outline"
              className="w-[8vw] gap-2"
            >
              {showCharts ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              {showCharts ? "Hide" : "Show"} Charts
            </Button>
          </div>
        </div>
        {/* Charts Grid */}
        {showCharts && (
          <div className="my-8">
            {categoryTotals.length > 0 || memberTotals.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {/* Category Cards */}
                {categoryTotals.map((category) => {
                  const percentage =
                    maxAmount > 0 ? (category.amount / maxAmount) * 100 : 0;

                  return (
                    <CategoryCard
                      key={category.name}
                      categoryName={category.name}
                      amount={category.amount}
                      count={category.count}
                      percentage={percentage}
                    />
                  );
                })}

                {/* Member Pie Chart */}
                <MemberCard memberTotals={memberTotals} />
              </div>
            ) : (
              <Card>
                <CardContent className="text-muted-foreground py-8 text-center">
                  No expenses yet. Add your first expense to see breakdowns!
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseHeader;
