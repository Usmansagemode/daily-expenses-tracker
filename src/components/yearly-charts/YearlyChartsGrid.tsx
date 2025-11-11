"use client";

import { useEffect, useState } from "react";
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

import CategoryAverageChart from "@/components/yearly-charts/CategoryAverageChart";
import CategoryByMonthChart from "@/components/yearly-charts/CategoryByMonthChart";
import CategoryMemberBreakdownChart from "@/components/yearly-charts/CategoryMemberBreakdownChart";
import CategoryTotalChart from "@/components/yearly-charts/CategoryTotalChart";
import LocationSpendingChart from "@/components/yearly-charts/LocationSpendingChart";
import MemberCategoryHeatmap from "@/components/yearly-charts/MemberCategoryHeatmap";
import MemberSpendingChart from "@/components/yearly-charts/MemberSpendingChart";
import MonthlySpendingChart from "@/components/yearly-charts/MonthlySpendingChart";
import TopExpensesChart from "@/components/yearly-charts/TopExpensesChart";
import { ExpenseWithDetails } from "@/entities/Expense";

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
      className={`bg-primary-foreground rounded-lg p-6 ${colSpan} ${
        isDragging ? "z-50 opacity-50" : "opacity-100"
      } hover:border-primary/30 cursor-grab border-2 border-transparent transition-all duration-200 active:cursor-grabbing`}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
};

interface YearlyChartsGridProps {
  filteredExpenses: ExpenseWithDetails[];
  currentYear: number;
}

const YearlyChartsGrid = ({
  filteredExpenses,
  currentYear,
}: YearlyChartsGridProps) => {
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

  // Chart order state with lazy initialization from localStorage
  const [chartOrder, setChartOrder] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const savedOrder = localStorage.getItem("chart-order");
      return savedOrder ? JSON.parse(savedOrder) : initializeChartOrder();
    }
    return initializeChartOrder();
  });

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
        if (typeof window !== "undefined") {
          localStorage.setItem("chart-order", JSON.stringify(newOrder));
        }

        return newOrder;
      });
    }
  };

  // Reset chart order
  const resetChartOrder = () => {
    const defaultOrder = initializeChartOrder();
    setChartOrder(defaultOrder);
    if (typeof window !== "undefined") {
      localStorage.setItem("chart-order", JSON.stringify(defaultOrder));
    }
  };

  // Chart configurations
  const chartConfigs: Record<
    string,
    { component: React.ReactNode; colSpan: string }
  > = {
    "category-average": {
      colSpan: "lg:col-span-2",
      component: <CategoryAverageChart expenses={filteredExpenses} />,
    },
    "category-by-month": {
      colSpan: "lg:col-span-3 xl:col-span-3",
      component: (
        <CategoryByMonthChart expenses={filteredExpenses} year={currentYear} />
      ),
    },
    "category-member-breakdown": {
      colSpan: "lg:col-span-2 xl:col-span-2",
      component: <CategoryMemberBreakdownChart expenses={filteredExpenses} />,
    },
    "category-total": {
      colSpan: "lg:col-span-2 xl:col-span-2",
      component: <CategoryTotalChart expenses={filteredExpenses} />,
    },
    "location-spending": {
      colSpan: "lg:col-span-2",
      component: <LocationSpendingChart expenses={filteredExpenses} />,
    },
    "member-heatmap": {
      colSpan: "lg:col-span-3 xl:col-span-4 2xl:col-span-5",
      component: <MemberCategoryHeatmap expenses={filteredExpenses} />,
    },
    "member-spending": {
      colSpan: "lg:col-span-2",
      component: <MemberSpendingChart expenses={filteredExpenses} />,
    },
    "monthly-spending": {
      colSpan: "lg:col-span-2 xl:col-span-2",
      component: (
        <MonthlySpendingChart expenses={filteredExpenses} year={currentYear} />
      ),
    },
    "top-expenses": {
      colSpan: "lg:col-span-2 xl:col-span-2",
      component: <TopExpensesChart expenses={filteredExpenses} limit={10} />,
    },
  };

  return (
    <div className="space-y-4">
      {/* Drag and Drop Instructions */}
      <div className="text-right">
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

export default YearlyChartsGrid;
