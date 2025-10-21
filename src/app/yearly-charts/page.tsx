"use client";

import { ExpenseWithDetails } from "@/entities/Expense";
import { useMemo, useState, useEffect } from "react";
import MonthlySpendingChart from "@/components/yearly-charts/MonthlySpendingChart";
import CategoryTotalChart from "@/components/yearly-charts/CategoryTotalChart";
import CategoryAverageChart from "@/components/yearly-charts/CategoryAverageChart";
import CategoryByMonthChart from "@/components/yearly-charts/CategoryByMonthChart";
import { expensesData } from "@/components/expenses/data/expenseData";
import { formatCurrency, transformToExpenseWithDetails } from "@/lib/utils";
import { getIsDemoMode, isSupabaseAvailable, supabase } from "@/lib/supabase";
import MemberSpendingChart from "@/components/yearly-charts/MemberSpendingChart";
import CategoryMemberBreakdownChart from "@/components/yearly-charts/CategoryMemberBreakdownChart";
import CategoryFilter from "@/components/yearly-charts/CategoryFilter";
import MemberCategoryHeatmap from "@/components/yearly-charts/MemberCategoryHeatmap";
import LocationSpendingChart from "@/components/yearly-charts/LocationSpendingChart";
import TopExpensesChart from "@/components/yearly-charts/TopExpensesChart";

// DND Kit imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const isDemoMode = getIsDemoMode();

// Define chart types and their default sizes
type ChartType = {
  id: string;
  component: React.ReactNode;
  defaultColSpan: string;
};

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
      className={`
        bg-primary-foreground p-6 rounded-lg
        ${colSpan}
        ${isDragging ? "opacity-50 z-50" : "opacity-100"}
        cursor-grab active:cursor-grabbing
        transition-all duration-200
        border-2 border-transparent hover:border-primary/30
      `}
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

  // Add category filter state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

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
      new Set(expenses.map((e) => e.categoryName || "Uncategorized"))
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
              data || []
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

  const totalYearSpending = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  // Filter expenses by selected categories
  const filteredYearExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const category = expense.categoryName || "Uncategorized";
      return selectedCategories.includes(category);
    });
  }, [expenses, selectedCategories]);

  // DND Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
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
    "monthly-spending": {
      component: (
        <MonthlySpendingChart
          expenses={filteredYearExpenses}
          year={currentYear}
        />
      ),
      colSpan: "lg:col-span-2 xl:col-span-2",
    },
    "category-total": {
      component: <CategoryTotalChart expenses={filteredYearExpenses} />,
      colSpan: "lg:col-span-2 xl:col-span-2",
    },
    "category-average": {
      component: <CategoryAverageChart expenses={filteredYearExpenses} />,
      colSpan: "lg:col-span-2",
    },
    "member-spending": {
      component: <MemberSpendingChart expenses={filteredYearExpenses} />,
      colSpan: "lg:col-span-2",
    },
    "category-member-breakdown": {
      component: (
        <CategoryMemberBreakdownChart expenses={filteredYearExpenses} />
      ),
      colSpan: "lg:col-span-2 xl:col-span-2",
    },
    "location-spending": {
      component: <LocationSpendingChart expenses={filteredYearExpenses} />,
      colSpan: "lg:col-span-2",
    },
    "top-expenses": {
      component: (
        <TopExpensesChart expenses={filteredYearExpenses} limit={10} />
      ),
      colSpan: "lg:col-span-2 xl:col-span-2",
    },
    "member-heatmap": {
      component: <MemberCategoryHeatmap expenses={filteredYearExpenses} />,
      colSpan: "lg:col-span-3 xl:col-span-4 2xl:col-span-5",
    },
    "category-by-month": {
      component: (
        <CategoryByMonthChart
          expenses={filteredYearExpenses}
          year={currentYear}
        />
      ),
      colSpan: "lg:col-span-3 xl:col-span-3",
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-secondary p-4 rounded-lg flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div>
            <h1 className="text-2xl font-bold">
              {currentYear} Expense Analytics
            </h1>
            {isDemoMode && (
              <p className="text-xs text-muted-foreground mt-1">
                Demo Mode - Using sample data
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-baseline gap-2">
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground mr-4">
              Total Spending:
            </span>
            <span className="text-3xl font-bold">
              {formatCurrency(totalYearSpending)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground self-end">
            {expenses.length} transactions this year
          </p>
          {/* Category Filter */}
          <div className="self-end">
            <CategoryFilter
              categories={allCategories}
              selectedCategories={selectedCategories}
              onSelectionChange={setSelectedCategories}
            />
          </div>
        </div>
      </div>

      {/* Drag and Drop Instructions */}
      <div className="text-right mb-2">
        <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
          <span>Drag to rearrange •</span>
          <button
            onClick={resetChartOrder}
            className="hover:text-foreground transition-colors underline"
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
          <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
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
