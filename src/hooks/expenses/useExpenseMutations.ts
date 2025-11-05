// src/hooks/useExpenseMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Expense } from "@/entities/Expense";
import { getIsDemoMode } from "@/lib/supabase";
import {
  createExpense,
  deleteExpense,
  deleteExpenses,
  saveAll,
} from "@/lib/supabase/expenses";

const isDemoMode = getIsDemoMode();

export const useExpenseMutations = (year: number, month: number) => {
  const queryClient = useQueryClient();

  // Create single expense
  const createMutation = useMutation({
    mutationFn: async (expense: Omit<Expense, "createdAt" | "updatedAt">) => {
      if (isDemoMode) {
        // Demo mode - just return the new expense
        await new Promise((resolve) => setTimeout(resolve, 300));
        return {
          ...expense,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Expense;
      }

      // Production mode - save to Supabase
      const { data, error } = await createExpense(expense);
      // const { data, error } = await supabase
      //   .from("expenses")
      //   .insert({
      //     ...expense,
      //     createdAt: new Date().toISOString(),
      //     updatedAt: new Date().toISOString(),
      //   })
      //   .select()
      //   .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newExpense) => {
      queryClient.setQueryData(
        ["expenses", year, month],
        (old: Expense[] = []) => [...old, newExpense],
      );
    },
  });

  // Save all expenses (bulk update)
  const saveAllMutation = useMutation({
    mutationFn: async (expenses: Expense[]) => {
      if (isDemoMode) {
        // Demo mode - simulate save
        await new Promise((resolve) => setTimeout(resolve, 500));
        return expenses;
      }

      const data = await saveAll(expenses);
      // const { data, error } = await supabase
      //   .from("expenses")
      //   .upsert(expensesToSave, { onConflict: "id" })
      //   .select();

      // if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", year, month] });
    },
  });

  // Delete single expense
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (isDemoMode) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return id;
      }

      // const { error } = await supabase.from("expenses").delete().eq("id", id);
      // if (error) throw error;
      await deleteExpense(id);

      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData(
        ["expenses", year, month],
        (old: Expense[] = []) => old.filter((expense) => expense.id !== id),
      );
    },
  });

  // Bulk delete multiple expenses
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      if (isDemoMode) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return ids;
      }

      // const { error } = await supabase.from("expenses").delete().in("id", ids);

      // if (error) throw error;
      await deleteExpenses(ids);
      return ids;
    },
    onSuccess: (ids) => {
      queryClient.setQueryData<Expense[]>(
        ["expenses", year, month],
        (old = []) => old.filter((expense) => !ids.includes(expense.id)),
      );
    },
  });

  return {
    bulkDelete: bulkDeleteMutation.mutate,
    bulkDeleteAsync: bulkDeleteMutation.mutateAsync,
    create: createMutation.mutate,
    delete: deleteMutation.mutate,
    isDeleting: bulkDeleteMutation.isPending,
    isPending:
      createMutation.isPending ||
      saveAllMutation.isPending ||
      deleteMutation.isPending,
    isSaving: saveAllMutation.isPending,
    saveAll: saveAllMutation.mutate,
    saveAllAsync: saveAllMutation.mutateAsync,
  };
};
