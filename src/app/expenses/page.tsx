"use client";

import {
  ExpenseWithDetails,
  DEFAULT_CATEGORIES,
  DEFAULT_TAGS,
  Expense,
} from "@/entities/Expense";
import { createColumns } from "./columns";
import { DataTable } from "./data-table";
import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Save, Loader2, Minus } from "lucide-react";
import ExpenseCategoryCharts from "@/components/expenses/ExpenseCategoryCharts";
import { useExpenseMutations } from "@/hooks/expenses/useExpenseMutations";
import { useExpenses } from "@/hooks/expenses/useExpenses";
import { useArrowKeyNavigation } from "@/hooks/useArrowKeyNavigation";

import { toast } from "sonner";

const ExpensesPage = () => {
  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());

  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  // Fetch data from API/demo
  const { data: fetchedData = [], isLoading } = useExpenses(
    currentYear,
    currentMonth
  );

  // Local state for editing
  const [localExpenses, setLocalExpenses] = useState<ExpenseWithDetails[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Sync fetched data to local state
  // useEffect(() => {
  //   setLocalExpenses(fetchedData);
  //   setHasUnsavedChanges(false);
  // }, [fetchedData]);

  useEffect(() => {
    setLocalExpenses(fetchedData);
    setHasUnsavedChanges(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedData.length, currentMonth, currentYear]);

  const {
    create,
    saveAll,
    saveAllAsync,
    bulkDelete,
    bulkDeleteAsync,
    delete: deleteExpense,
    isSaving,
    isDeleting,
  } = useExpenseMutations(currentYear, currentMonth);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleMonthYearChange = (month: number, year: number) => {
    if (hasUnsavedChanges) {
      if (
        !confirm(
          "You have unsaved changes. Do you want to discard them and switch months?"
        )
      ) {
        return;
      }
    }
    setCurrentMonth(month);
    setCurrentYear(year);
  };

  const handleUpdate = (
    id: string,
    field: keyof ExpenseWithDetails,
    value: any
  ) => {
    // Update local state immediately
    setLocalExpenses((prev) =>
      prev.map((expense) =>
        expense.id === id ? { ...expense, [field]: value } : expense
      )
    );
    setHasUnsavedChanges(true);
  };

  const handleDelete = (id: string) => {
    setLocalExpenses((prev) => prev.filter((expense) => expense.id !== id));
    setHasUnsavedChanges(true);

    deleteExpense(id);

    toast.success("Expense deleted", {
      description: "",
    });
  };

  const handleAddNew = () => {
    let newExpense: ExpenseWithDetails = {
      id: crypto.randomUUID(),
      amount: 0,
      categoryId: null,
      tagId: null,
      categoryName: null,
      tagName: null,
      date: new Date(),
      description: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add to local state
    setLocalExpenses((prev) => [...prev, newExpense]);
    setHasUnsavedChanges(true);

    // Create in backend
    create(newExpense);
  };

  const handleSaveAll = async () => {
    try {
      const expensesToSave: Expense[] = localExpenses.map(
        ({ categoryName, tagName, ...expense }) => expense
      );

      await saveAllAsync(expensesToSave); // Use async version
      setHasUnsavedChanges(false);

      // Success toast
      toast.success("Changes saved successfully!", {
        description: `${expensesToSave.length} ${
          expensesToSave.length === 1 ? "expense" : "expenses"
        } updated`,
      });
    } catch (error) {
      console.error("Error saving expenses:", error);

      // Error toast
      toast.error("Failed to save changes", {
        description: "Please try again or check your connection",
        action: {
          label: "Retry",
          onClick: () => handleSaveAll(),
        },
      });
    }
  };

  const selectedIds = useMemo(
    () => Object.keys(rowSelection).filter((id) => rowSelection[id]),
    [rowSelection]
  );

  console.log(selectedIds);

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error("No expenses selected");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${selectedIds.length} ${
          selectedIds.length === 1 ? "expense" : "expenses"
        }?`
      )
    ) {
      return;
    }

    try {
      // Remove from local state immediately (optimistic update)
      setLocalExpenses((prev) =>
        prev.filter((expense) => !selectedIds.includes(expense.id))
      );

      // Delete from backend
      await bulkDeleteAsync(selectedIds);

      toast.success("Expenses deleted", {
        description: `${selectedIds.length} ${
          selectedIds.length === 1 ? "expense" : "expenses"
        } removed successfully`,
      });

      // Clear selection
      setRowSelection({});
      setHasUnsavedChanges(false); // Already deleted, no need to save
    } catch (error) {
      console.error("Error deleting expenses:", error);

      // Revert optimistic update on error
      // You might want to refetch instead
      toast.error("Failed to delete expenses", {
        description: "Please try again",
      });
    }
  };

  useArrowKeyNavigation(handleAddNew);

  // Calculate total for the current view
  const total = useMemo(
    () => localExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    [localExpenses]
  );

  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(total);

  const columns = useMemo(
    () =>
      createColumns({
        categories: DEFAULT_CATEGORIES,
        tags: DEFAULT_TAGS,
        onUpdate: handleUpdate,
        onDelete: handleDelete,
      }),
    []
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mt-2">
      <ExpenseCategoryCharts
        data={localExpenses}
        formattedTotal={formattedTotal}
        currentMonth={currentMonth}
        currentYear={currentYear}
        onMonthYearChange={handleMonthYearChange}
      />

      {/* Unsaved changes indicator */}
      {hasUnsavedChanges && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-600 dark:text-yellow-500">
              You have unsaved changes
            </p>
            <p className="text-xs text-muted-foreground">
              Click "Save Changes" to persist your edits
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}

      <div className="mb-2">
        <DataTable
          columns={columns}
          data={localExpenses}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
        />
      </div>

      {/* Action buttons */}
      <div className="flex justify-between items-center p-4 border-t">
        <div className="text-sm text-muted-foreground">
          {localExpenses.length}{" "}
          {localExpenses.length === 1 ? "expense" : "expenses"}
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <Button
              onClick={handleBulkDelete}
              size="sm"
              variant="destructive"
              className="gap-2"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Minus className="h-4 w-4" />
                  Delete {selectedIds.length}
                </>
              )}
            </Button>
          )}
          <Button
            onClick={handleSaveAll}
            variant="default"
            size="sm"
            disabled={!hasUnsavedChanges || isSaving}
            className="gap-2 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
          <Button
            onClick={handleAddNew}
            size="sm"
            className="gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExpensesPage;
