"use client";

import { ExpenseWithDetails } from "@/entities/Expense";
import { useMemo } from "react";
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

interface MemberCategoryHeatmapProps {
  expenses: ExpenseWithDetails[];
}

const MemberCategoryHeatmap = ({ expenses }: MemberCategoryHeatmapProps) => {
  const { heatmapData, members, categories, maxValue } = useMemo(() => {
    // Build a map of member -> category -> total
    const dataMap: Record<string, Record<string, number>> = {};

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

    // Find max value for color intensity scaling
    let max = 0;
    Object.values(dataMap).forEach((categories) => {
      Object.values(categories).forEach((amount) => {
        if (amount > max) max = amount;
      });
    });

    return {
      heatmapData: dataMap,
      members: uniqueMembers,
      categories: uniqueCategories,
      maxValue: max,
    };
  }, [expenses]);

  // Calculate color intensity based on value
  const getColorClass = (value: number) => {
    if (value === 0) return "bg-muted/30";
    const intensity = (value / maxValue) * 100;

    if (intensity > 75) return "bg-chart-1/90";
    if (intensity > 50) return "bg-chart-2/80";
    if (intensity > 25) return "bg-chart-3/70";
    return "bg-chart-4/60";
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

  return (
    <div>
      <h2 className="text-lg font-medium mb-6">Member × Category Heatmap</h2>

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
                <TableCell className="font-medium">{member}</TableCell>
                {categories.map((category) => {
                  const value = heatmapData[member]?.[category] || 0;
                  const colorClass = getColorClass(value);

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
                                cursor-pointer
                              `}
                            >
                              <span className="text-xs font-semibold">
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

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span>Low</span>
        <div className="flex gap-1">
          <div className="w-8 h-8 rounded bg-chart-4/60 border" />
          <div className="w-8 h-8 rounded bg-chart-3/70 border" />
          <div className="w-8 h-8 rounded bg-chart-2/80 border" />
          <div className="w-8 h-8 rounded bg-chart-1/90 border" />
        </div>
        <span>High</span>
      </div>

      {/* Summary stats */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 rounded-lg bg-muted">
          <p className="text-xs text-muted-foreground">Members</p>
          <p className="text-lg font-semibold">{members.length}</p>
        </div>
        <div className="p-3 rounded-lg bg-muted">
          <p className="text-xs text-muted-foreground">Categories</p>
          <p className="text-lg font-semibold">{categories.length}</p>
        </div>
        <div className="p-3 rounded-lg bg-muted">
          <p className="text-xs text-muted-foreground">Highest</p>
          <p className="text-lg font-semibold">
            {formatCurrency(maxValue, { minimumFractionDigits: 0 })}
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

// "use client";

// import { ExpenseWithDetails } from "@/entities/Expense";
// import { useMemo } from "react";
// import { formatCurrency } from "@/lib/utils";

// interface MemberCategoryHeatmapProps {
//   expenses: ExpenseWithDetails[];
// }

// const MemberCategoryHeatmap = ({ expenses }: MemberCategoryHeatmapProps) => {
//   const { heatmapData, members, categories, maxValue } = useMemo(() => {
//     // Build a map of member -> category -> total
//     const dataMap: Record<string, Record<string, number>> = {};

//     expenses.forEach((expense) => {
//       const member = expense.memberName || "Unassigned";
//       const category = expense.categoryName || "Uncategorized";

//       if (!dataMap[member]) {
//         dataMap[member] = {};
//       }
//       dataMap[member][category] =
//         (dataMap[member][category] || 0) + expense.amount;
//     });

//     // Get unique members and categories, sorted
//     const uniqueMembers = Object.keys(dataMap).sort();
//     const uniqueCategories = Array.from(
//       new Set(expenses.map((e) => e.categoryName || "Uncategorized"))
//     ).sort();

//     // Find max value for color intensity scaling
//     let max = 0;
//     Object.values(dataMap).forEach((categories) => {
//       Object.values(categories).forEach((amount) => {
//         if (amount > max) max = amount;
//       });
//     });

//     return {
//       heatmapData: dataMap,
//       members: uniqueMembers,
//       categories: uniqueCategories,
//       maxValue: max,
//     };
//   }, [expenses]);

//   // Calculate color intensity based on value
//   const getColorIntensity = (value: number) => {
//     if (value === 0) return "bg-muted";
//     const intensity = Math.min((value / maxValue) * 100, 100);

//     // Use chart colors with opacity based on intensity
//     if (intensity > 75) return "bg-chart-1 dark:bg-chart-1";
//     if (intensity > 50) return "bg-chart-2 dark:bg-chart-2";
//     if (intensity > 25) return "bg-chart-3 dark:bg-chart-3";
//     return "bg-chart-4 dark:bg-chart-4";
//   };

//   // Get cell opacity based on value
//   const getOpacity = (value: number) => {
//     if (value === 0) return "opacity-10";
//     const intensity = (value / maxValue) * 100;
//     if (intensity > 75) return "opacity-100";
//     if (intensity > 50) return "opacity-75";
//     if (intensity > 25) return "opacity-50";
//     return "opacity-30";
//   };

//   if (members.length === 0 || categories.length === 0) {
//     return (
//       <div>
//         <h2 className="text-lg font-medium mb-6">Member × Category Heatmap</h2>
//         <div className="flex flex-col items-center justify-center h-[300px]">
//           <p className="text-muted-foreground">No data available</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div>
//       <h2 className="text-lg font-medium mb-6">Member × Category Heatmap</h2>

//       <div className="overflow-x-auto">
//         <div className="min-w-max">
//           {/* Header row with category names */}
//           <div className="flex mb-2">
//             <div className="w-32 flex-shrink-0" />{" "}
//             {/* Empty space for member names column */}
//             {categories.map((category) => (
//               <div
//                 key={category}
//                 className="w-24 px-2 text-xs font-medium text-muted-foreground text-center"
//               >
//                 <div className="truncate" title={category}>
//                   {category}
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Data rows */}
//           {members.map((member) => (
//             <div key={member} className="flex items-center mb-2">
//               {/* Member name */}
//               <div className="w-32 flex-shrink-0 pr-4">
//                 <div className="text-sm font-medium truncate" title={member}>
//                   {member}
//                 </div>
//               </div>

//               {/* Category cells */}
//               {categories.map((category) => {
//                 const value = heatmapData[member]?.[category] || 0;
//                 const colorClass = getColorIntensity(value);
//                 const opacityClass = getOpacity(value);

//                 return (
//                   <div key={`${member}-${category}`} className="w-24 px-1">
//                     <div
//                       className={`
//                         h-16 rounded-md flex items-center justify-center
//                         ${colorClass} ${opacityClass}
//                         transition-all duration-200 hover:scale-105 hover:opacity-100
//                         cursor-pointer border border-border/50
//                       `}
//                       title={`${member} - ${category}: ${formatCurrency(
//                         value
//                       )}`}
//                     >
//                       <span className="text-xs font-semibold text-foreground">
//                         {value > 0
//                           ? formatCurrency(value, { minimumFractionDigits: 0 })
//                           : "-"}
//                       </span>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Legend */}
//       <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
//         <span>Low</span>
//         <div className="flex gap-1">
//           <div className="w-6 h-6 rounded bg-chart-4 opacity-30" />
//           <div className="w-6 h-6 rounded bg-chart-3 opacity-50" />
//           <div className="w-6 h-6 rounded bg-chart-2 opacity-75" />
//           <div className="w-6 h-6 rounded bg-chart-1 opacity-100" />
//         </div>
//         <span>High</span>
//       </div>

//       {/* Summary stats */}
//       <div className="mt-4 p-4 bg-muted rounded-lg">
//         <div className="grid grid-cols-2 gap-4 text-sm">
//           <div>
//             <span className="text-muted-foreground">Total Members:</span>
//             <span className="ml-2 font-semibold">{members.length}</span>
//           </div>
//           <div>
//             <span className="text-muted-foreground">Total Categories:</span>
//             <span className="ml-2 font-semibold">{categories.length}</span>
//           </div>
//           <div>
//             <span className="text-muted-foreground">Highest Spending:</span>
//             <span className="ml-2 font-semibold">
//               {formatCurrency(maxValue)}
//             </span>
//           </div>
//           <div>
//             <span className="text-muted-foreground">Data Points:</span>
//             <span className="ml-2 font-semibold">
//               {members.length * categories.length}
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MemberCategoryHeatmap;
