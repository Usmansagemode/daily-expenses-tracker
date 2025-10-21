"use client";

import { ExpenseWithDetails } from "@/entities/Expense";
import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MemberCategoryHeatmapProps {
  expenses: ExpenseWithDetails[];
}

type ColorScheme = "classic" | "blue" | "green" | "purple" | "warm";

const MemberCategoryHeatmap = ({ expenses }: MemberCategoryHeatmapProps) => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>("classic");

  const { heatmapData, members, categories, memberMaxValues } = useMemo(() => {
    // Build a map of member -> category -> total
    const dataMap: Record<string, Record<string, number>> = {};
    const memberMaxMap: Record<string, number> = {};

    expenses.forEach((expense) => {
      const member = expense.memberName || "Unassigned";
      const category = expense.categoryName || "Uncategorized";

      if (!dataMap[member]) {
        dataMap[member] = {};
      }
      dataMap[member][category] =
        (dataMap[member][category] || 0) + expense.amount;
    });

    // Get unique members and categories, sorted
    const uniqueMembers = Object.keys(dataMap).sort();
    const uniqueCategories = Array.from(
      new Set(expenses.map((e) => e.categoryName || "Uncategorized"))
    ).sort();

    // Find max value for EACH member for relative scaling
    uniqueMembers.forEach((member) => {
      const memberCategories = dataMap[member];
      let memberMax = 0;
      Object.values(memberCategories).forEach((amount) => {
        if (amount > memberMax) memberMax = amount;
      });
      memberMaxMap[member] = memberMax;
    });

    return {
      heatmapData: dataMap,
      members: uniqueMembers,
      categories: uniqueCategories,
      memberMaxValues: memberMaxMap,
    };
  }, [expenses]);

  // Color scheme functions
  const getClassicHeatmapColor = (member: string, value: number) => {
    if (value === 0) return "bg-gray-100 dark:bg-gray-800 text-gray-500";

    const memberMax = memberMaxValues[member];
    if (memberMax === 0) return "bg-gray-100 dark:bg-gray-800 text-gray-500";

    const intensity = (value / memberMax) * 100;

    if (intensity > 80) return "bg-red-500 text-white";
    if (intensity > 60) return "bg-orange-400 text-white";
    if (intensity > 40) return "bg-yellow-400 text-gray-900";
    if (intensity > 20) return "bg-green-400 text-gray-900";
    return "bg-blue-400 text-white";
  };

  const getBlueHeatmapColor = (member: string, value: number) => {
    if (value === 0) return "bg-gray-100 dark:bg-gray-800 text-gray-500";

    const memberMax = memberMaxValues[member];
    if (memberMax === 0) return "bg-gray-100 dark:bg-gray-800 text-gray-500";

    const intensity = (value / memberMax) * 100;

    if (intensity > 80) return "bg-blue-800 text-white";
    if (intensity > 60) return "bg-blue-600 text-white";
    if (intensity > 40) return "bg-blue-400 text-white";
    if (intensity > 20) return "bg-blue-300 text-gray-900";
    return "bg-blue-100 text-gray-900";
  };

  const getGreenHeatmapColor = (member: string, value: number) => {
    if (value === 0) return "bg-gray-100 dark:bg-gray-800 text-gray-500";

    const memberMax = memberMaxValues[member];
    if (memberMax === 0) return "bg-gray-100 dark:bg-gray-800 text-gray-500";

    const intensity = (value / memberMax) * 100;

    if (intensity > 80) return "bg-green-700 text-white";
    if (intensity > 60) return "bg-green-600 text-white";
    if (intensity > 40) return "bg-green-500 text-white";
    if (intensity > 20) return "bg-green-300 text-gray-900";
    return "bg-green-100 text-gray-900";
  };

  const getPurpleHeatmapColor = (member: string, value: number) => {
    if (value === 0) return "bg-gray-100 dark:bg-gray-800 text-gray-500";

    const memberMax = memberMaxValues[member];
    if (memberMax === 0) return "bg-gray-100 dark:bg-gray-800 text-gray-500";

    const intensity = (value / memberMax) * 100;

    if (intensity > 80) return "bg-purple-700 text-white";
    if (intensity > 60) return "bg-purple-600 text-white";
    if (intensity > 40) return "bg-purple-500 text-white";
    if (intensity > 20) return "bg-purple-300 text-gray-900";
    return "bg-purple-100 text-gray-900";
  };

  const getWarmHeatmapColor = (member: string, value: number) => {
    if (value === 0) return "bg-gray-100 dark:bg-gray-800 text-gray-500";

    const memberMax = memberMaxValues[member];
    if (memberMax === 0) return "bg-gray-100 dark:bg-gray-800 text-gray-500";

    const intensity = (value / memberMax) * 100;

    if (intensity > 80) return "bg-red-600 text-white";
    if (intensity > 60) return "bg-orange-500 text-white";
    if (intensity > 40) return "bg-orange-400 text-gray-900";
    if (intensity > 20) return "bg-orange-300 text-gray-900";
    return "bg-orange-100 text-gray-900";
  };

  const getColorClass = (member: string, value: number) => {
    switch (colorScheme) {
      case "classic":
        return getClassicHeatmapColor(member, value);
      case "blue":
        return getBlueHeatmapColor(member, value);
      case "green":
        return getGreenHeatmapColor(member, value);
      case "purple":
        return getPurpleHeatmapColor(member, value);
      case "warm":
        return getWarmHeatmapColor(member, value);
      default:
        return getWarmHeatmapColor(member, value);
    }
  };

  // Get color scheme display name
  const getColorSchemeName = (scheme: ColorScheme) => {
    switch (scheme) {
      case "classic":
        return "Classic (Blue → Red)";
      case "blue":
        return "Blue Scale";
      case "green":
        return "Green Scale";
      case "purple":
        return "Purple Scale";
      case "warm":
        return "Warm (Orange → Red)";
      default:
        return "Warm (Orange → Red)";
    }
  };

  // Get legend colors based on current scheme
  const getLegendColors = () => {
    switch (colorScheme) {
      case "classic":
        return [
          "bg-blue-400",
          "bg-green-400",
          "bg-yellow-400",
          "bg-orange-400",
          "bg-red-500",
        ];
      case "blue":
        return [
          "bg-blue-100",
          "bg-blue-300",
          "bg-blue-400",
          "bg-blue-600",
          "bg-blue-800",
        ];
      case "green":
        return [
          "bg-green-100",
          "bg-green-300",
          "bg-green-500",
          "bg-green-600",
          "bg-green-700",
        ];
      case "purple":
        return [
          "bg-purple-100",
          "bg-purple-300",
          "bg-purple-500",
          "bg-purple-600",
          "bg-purple-700",
        ];
      case "warm":
        return [
          "bg-orange-100",
          "bg-orange-300",
          "bg-orange-400",
          "bg-orange-500",
          "bg-red-600",
        ];
      default:
        return [
          "bg-orange-100",
          "bg-orange-300",
          "bg-orange-400",
          "bg-orange-500",
          "bg-red-600",
        ];
    }
  };

  // Get member's total spending for tooltip
  const getMemberTotal = (member: string) => {
    const memberCategories = heatmapData[member] || {};
    return Object.values(memberCategories).reduce(
      (sum, amount) => sum + amount,
      0
    );
  };

  if (members.length === 0 || categories.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-medium mb-6">Member × Category Heatmap</h2>
        <div className="flex flex-col items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No data available</p>
        </div>
      </div>
    );
  }

  const legendColors = getLegendColors();

  return (
    <div>
      {/* Header with title and color scheme selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-medium">Member × Category Heatmap</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Colors show relative spending for each member (dark = highest
            spending category)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Color Scheme:
          </span>
          <Select
            value={colorScheme}
            onValueChange={(value: ColorScheme) => setColorScheme(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select color scheme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="warm">Warm (Orange → Red)</SelectItem>
              <SelectItem value="classic">Classic (Blue → Red)</SelectItem>
              <SelectItem value="blue">Blue Scale</SelectItem>
              <SelectItem value="green">Green Scale</SelectItem>
              <SelectItem value="purple">Purple Scale</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px] font-semibold">Member</TableHead>
              {categories.map((category) => (
                <TableHead key={category} className="text-center min-w-[100px]">
                  {category}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member}>
                <TableCell className="font-medium">
                  <div>
                    <div>{member}</div>
                    <div className="text-xs text-muted-foreground">
                      Total: {formatCurrency(getMemberTotal(member))}
                    </div>
                  </div>
                </TableCell>
                {categories.map((category) => {
                  const value = heatmapData[member]?.[category] || 0;
                  const colorClass = getColorClass(member, value);

                  return (
                    <TableCell key={`${member}-${category}`} className="p-1">
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`
                                h-14 rounded flex items-center justify-center
                                ${colorClass}
                                transition-all duration-200 hover:scale-105 hover:brightness-110
                                cursor-pointer border border-gray-200 dark:border-gray-700
                                font-medium
                              `}
                            >
                              <span className="text-xs">
                                {value > 0
                                  ? formatCurrency(value, {
                                      minimumFractionDigits: 0,
                                    })
                                  : "—"}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-xs">
                              <p className="font-semibold">{member}</p>
                              <p className="text-muted-foreground">
                                {category}
                              </p>
                              <p className="font-semibold mt-1">
                                {formatCurrency(value)}
                              </p>
                              <p className="text-muted-foreground mt-1">
                                {memberMaxValues[member] > 0 &&
                                  `${Math.round(
                                    (value / memberMaxValues[member]) * 100
                                  )}% of ${member}'s highest category`}
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dynamic Legend */}
      <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span>Low</span>
        <div className="flex gap-1">
          {legendColors.map((color, index) => (
            <div
              key={index}
              className={`w-8 h-8 rounded border border-gray-300 ${color} ${
                color.includes("yellow") ||
                color.includes("orange-100") ||
                color.includes("green-100") ||
                color.includes("blue-100") ||
                color.includes("purple-100")
                  ? "text-gray-900"
                  : "text-white"
              } flex items-center justify-center text-xs font-medium`}
            >
              {index + 1}
            </div>
          ))}
        </div>
        <span>High</span>
      </div>

      {/* Color scheme info */}
      <div className="mt-2 text-center">
        <p className="text-xs text-muted-foreground">
          Using:{" "}
          <span className="font-medium">{getColorSchemeName(colorScheme)}</span>
        </p>
      </div>

      {/* Summary stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 rounded-lg bg-muted">
          <p className="text-xs text-muted-foreground">Members</p>
          <p className="text-lg font-semibold">{members.length}</p>
        </div>
        <div className="p-3 rounded-lg bg-muted">
          <p className="text-xs text-muted-foreground">Categories</p>
          <p className="text-lg font-semibold">{categories.length}</p>
        </div>
        <div className="p-3 rounded-lg bg-muted">
          <p className="text-xs text-muted-foreground">Highest Overall</p>
          <p className="text-lg font-semibold">
            {formatCurrency(Math.max(...Object.values(memberMaxValues)), {
              minimumFractionDigits: 0,
            })}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-muted">
          <p className="text-xs text-muted-foreground">Data Points</p>
          <p className="text-lg font-semibold">
            {members.length * categories.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MemberCategoryHeatmap;
