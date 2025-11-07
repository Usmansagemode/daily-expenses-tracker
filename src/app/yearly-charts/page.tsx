"use client";

import { useEffect, useMemo, useState } from "react";
// DND Kit imports
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { expensesData } from "@/components/expenses/data/expenseData";
import CategoryAverageChart from "@/components/yearly-charts/CategoryAverageChart";
import CategoryByMonthChart from "@/components/yearly-charts/CategoryByMonthChart";
import CategoryFilter from "@/components/yearly-charts/CategoryFilter";
import CategoryMemberBreakdownChart from "@/components/yearly-charts/CategoryMemberBreakdownChart";
import CategoryTotalChart from "@/components/yearly-charts/CategoryTotalChart";
import LocationSpendingChart from "@/components/yearly-charts/LocationSpendingChart";
import MemberCategoryHeatmap from "@/components/yearly-charts/MemberCategoryHeatmap";
import MemberSpendingChart from "@/components/yearly-charts/MemberSpendingChart";
import MonthFilter from "@/components/yearly-charts/MonthFilter";
import MonthlySpendingChart from "@/components/yearly-charts/MonthlySpendingChart";
import TopExpensesChart from "@/components/yearly-charts/TopExpensesChart";
import { ExpenseWithDetails } from "@/entities/Expense";
import { getIsDemoMode, isSupabaseAvailable, supabase } from "@/lib/supabase";
import { formatCurrency, transformToExpenseWithDetails } from "@/lib/utils";

const isDemoMode = getIsDemoMode();

// Sortable chart wrapper component
const SortableChart = ({
  id,
  children,
  colSpan,
}: {
  id: string;
  children: React.ReactNode;
  colSpan: string;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-primary-foreground rounded-lg p-6 ${colSpan} ${isDragging ? "z-50 opacity-50" : "opacity-100"} hover:border-primary/30 cursor-grab border-2 border-transparent transition-all duration-200 active:cursor-grabbing`}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
};

const YearlyChartsPage = () => {
  const [expenses, setExpenses] = useState<ExpenseWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentYear = new Date().getFullYear();

  // Add category and month filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  // Chart order state
  const [chartOrder, setChartOrder] = useState<string[]>([]);

  // Initialize chart order
  const initializeChartOrder = () => [
    "monthly-spending",
    "category-total",
    "category-average",
    "member-spending",
    "category-member-breakdown",
    "location-spending",
    "top-expenses",
    "member-heatmap",
    "category-by-month",
  ];

  // Load chart order from localStorage on component mount
  useEffect(() => {
    const savedOrder = localStorage.getItem("chart-order");
    if (savedOrder) {
      setChartOrder(JSON.parse(savedOrder));
    } else {
      setChartOrder(initializeChartOrder());
    }
  }, []);

  // Get all unique categories from expenses
  const allCategories = useMemo(() => {
    const categories = Array.from(
      new Set(expenses.map((e) => e.categoryName || "Uncategorized")),
    ).sort();
    return categories;
  }, [expenses]);

  // Initialize selected categories when data loads
  useEffect(() => {
    if (allCategories.length > 0 && selectedCategories.length === 0) {
      setSelectedCategories(allCategories);
    }
  }, [allCategories, selectedCategories.length]);

  useEffect(() => {
    const fetchExpenses = async () => {
      if (isDemoMode) {
        // Use dummy data
        const transformedExpenses = transformToExpenseWithDetails(expensesData);
        // Filter demo data to current year immediately
        const currentYearExpenses = transformedExpenses.filter((expense) => {
          const expenseYear = new Date(expense.date).getFullYear();
          return expenseYear === currentYear;
        });
        setExpenses(currentYearExpenses);
        setIsLoading(false);
      } else {
        // Fetch from Supabase
        try {
          const startDate = new Date(currentYear, 0, 1); // Jan 1
          const endDate = new Date(currentYear, 11, 31); // Dec 31

          if (isSupabaseAvailable() && supabase) {
            const { data, error } = await supabase
              .from("expenses")
              .select("*")
              .gte("date", startDate.toISOString())
              .lte("date", endDate.toISOString())
              .order("date", { ascending: false });
            if (error) throw error;

            const transformedExpenses = transformToExpenseWithDetails(
              data || [],
            );
            setExpenses(transformedExpenses);
          }
        } catch (error) {
          console.error("Error fetching expenses:", error);
          // Fallback to demo data on error
          const transformedExpenses =
            transformToExpenseWithDetails(expensesData);
          setExpenses(transformedExpenses);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchExpenses();
  }, [currentYear]);

  // Filter expenses by selected categories
  // const filteredYearExpenses = useMemo(() => {
  //   return expenses.filter((expense) => {
  //     const category = expense.categoryName || "Uncategorized";
  //     return selectedCategories.includes(category);
  //   });
  // }, [expenses, selectedCategories]);
  // Filter expenses by selected categories and months
  const filteredYearExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const category = expense.categoryName || "Uncategorized";
      const month = new Date(expense.date).getMonth();

      // Category filter: if none selected, show all; otherwise filter
      const categoryMatch =
        selectedCategories.length === 0 ||
        selectedCategories.includes(category);

      // Month filter: if none selected, show all; otherwise filter
      const monthMatch =
        selectedMonths.length === 0 || selectedMonths.includes(month);

      return categoryMatch && monthMatch;
    });
  }, [expenses, selectedCategories, selectedMonths]);

  // DND Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setChartOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over?.id as string);

        const newOrder = arrayMove(items, oldIndex, newIndex);

        // Save to localStorage
        localStorage.setItem("chart-order", JSON.stringify(newOrder));

        return newOrder;
      });
    }
  };

  // Reset chart order
  const resetChartOrder = () => {
    const defaultOrder = initializeChartOrder();
    setChartOrder(defaultOrder);
    localStorage.setItem("chart-order", JSON.stringify(defaultOrder));
  };

  // Chart configurations
  const chartConfigs: Record<
    string,
    { component: React.ReactNode; colSpan: string }
  > = {
    "category-average": {
      colSpan: "lg:col-span-2",
      component: <CategoryAverageChart expenses={filteredYearExpenses} />,
    },
    "category-by-month": {
      colSpan: "lg:col-span-3 xl:col-span-3",
      component: (
        <CategoryByMonthChart
          expenses={filteredYearExpenses}
          year={currentYear}
        />
      ),
    },
    "category-member-breakdown": {
      colSpan: "lg:col-span-2 xl:col-span-2",
      component: (
        <CategoryMemberBreakdownChart expenses={filteredYearExpenses} />
      ),
    },
    "category-total": {
      colSpan: "lg:col-span-2 xl:col-span-2",
      component: <CategoryTotalChart expenses={filteredYearExpenses} />,
    },
    "location-spending": {
      colSpan: "lg:col-span-2",
      component: <LocationSpendingChart expenses={filteredYearExpenses} />,
    },
    "member-heatmap": {
      colSpan: "lg:col-span-3 xl:col-span-4 2xl:col-span-5",
      component: <MemberCategoryHeatmap expenses={filteredYearExpenses} />,
    },
    "member-spending": {
      colSpan: "lg:col-span-2",
      component: <MemberSpendingChart expenses={filteredYearExpenses} />,
    },
    "monthly-spending": {
      colSpan: "lg:col-span-2 xl:col-span-2",
      component: (
        <MonthlySpendingChart
          expenses={filteredYearExpenses}
          year={currentYear}
        />
      ),
    },
    "top-expenses": {
      colSpan: "lg:col-span-2 xl:col-span-2",
      component: (
        <TopExpensesChart expenses={filteredYearExpenses} limit={10} />
      ),
    },
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-secondary mb-2 flex items-center justify-between rounded-lg p-4">
        <div className="flex items-center">
          <div>
            <h1 className="text-2xl font-bold">
              {currentYear} Expense Analytics
            </h1>
            {isDemoMode && (
              <p className="text-muted-foreground mt-1 text-xs">
                Demo Mode - Using sample data
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-baseline items-end gap-2">
          <div className="flex items-center">
            <span className="text-muted-foreground mr-4 text-sm">
              Total Spending:
            </span>
            <span className="text-3xl font-bold">
              {formatCurrency(
                filteredYearExpenses.reduce((sum, e) => sum + e.amount, 0),
              )}
            </span>
          </div>
          <p className="text-muted-foreground self-end text-sm">
            {expenses.length} transactions this year
          </p>
          {/* Category Filter */}
          <div className="flex gap-2 self-end">
            <MonthFilter
              selectedMonths={selectedMonths}
              onSelectionChange={setSelectedMonths}
            />
            <CategoryFilter
              categories={allCategories}
              selectedCategories={selectedCategories}
              onSelectionChange={setSelectedCategories}
            />
          </div>
        </div>
      </div>

      {/* Drag and Drop Instructions */}
      <div className="mb-2 text-right">
        <p className="text-muted-foreground inline-flex items-center gap-1 text-xs">
          <span>Drag to rearrange •</span>
          <button
            onClick={resetChartOrder}
            className="hover:text-foreground underline transition-colors"
          >
            Reset
          </button>
        </p>
      </div>

      {/* Charts Grid with DND */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={chartOrder} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {chartOrder.map((chartId) => {
              const config = chartConfigs[chartId];
              if (!config) return null;

              return (
                <SortableChart
                  key={chartId}
                  id={chartId}
                  colSpan={config.colSpan}
                >
                  {config.component}
                </SortableChart>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default YearlyChartsPage;
