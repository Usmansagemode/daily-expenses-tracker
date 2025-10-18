// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { supabase } from "@/lib/supabase";
// import { Expense } from "@/entities/Expense";
// import { useCallback, useRef } from "react";

// // Demo mutations (local state updates)
// const useDemoMutations = (year: number, month: number) => {
//   const queryClient = useQueryClient();
//   const pendingUpdates = useRef<Map<string, Partial<Expense>>>(new Map());
//   const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

//   // Create expense (demo)
//   const createMutation = useMutation({
//     mutationFn: async (expense: Omit<Expense, "createdAt" | "updatedAt">) => {
//       await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay
//       const newExpense: Expense = {
//         ...expense,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       };
//       return newExpense;
//     },
//     onSuccess: (newExpense) => {
//       queryClient.setQueryData(
//         ["expenses", year, month],
//         (old: Expense[] = []) => [newExpense, ...old]
//       );
//     },
//   });

//   // Update expense (demo)
//   const updateMutation = useMutation({
//     mutationFn: async ({
//       id,
//       updates,
//     }: {
//       id: string;
//       updates: Partial<Expense>;
//     }) => {
//       // await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay
//       return { id, updates: { ...updates, updatedAt: new Date() } };
//     },
//     onSuccess: ({ id, updates }) => {
//       queryClient.setQueryData(
//         ["expenses", year, month],
//         (old: Expense[] = []) =>
//           old.map((expense) =>
//             expense.id === id ? { ...expense, ...updates } : expense
//           )
//       );
//     },
//   });

//   // Delete expense (demo)
//   const deleteMutation = useMutation({
//     mutationFn: async (id: string) => {
//       await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay
//       return id;
//     },
//     onSuccess: (id) => {
//       queryClient.setQueryData(
//         ["expenses", year, month],
//         (old: Expense[] = []) => old.filter((expense) => expense.id !== id)
//       );
//     },
//   });

//   // Debounced update for demo
//   const debouncedUpdate = useCallback(
//     (id: string, field: keyof Expense, value: any) => {
//       const existing = pendingUpdates.current.get(id) || {};
//       pendingUpdates.current.set(id, { ...existing, [field]: value });

//       if (timeoutRef.current) {
//         clearTimeout(timeoutRef.current);
//       }

//       timeoutRef.current = setTimeout(() => {
//         const updates = pendingUpdates.current.get(id);
//         if (updates) {
//           updateMutation.mutate({ id, updates });
//           pendingUpdates.current.delete(id);
//         }
//       }, 2000);
//     },
//     [updateMutation]
//   );

//   const flushPending = useCallback(async () => {
//     if (timeoutRef.current) {
//       clearTimeout(timeoutRef.current);
//     }

//     const promises = Array.from(pendingUpdates.current.entries()).map(
//       ([id, updates]) => updateMutation.mutateAsync({ id, updates })
//     );

//     await Promise.all(promises);
//     pendingUpdates.current.clear();
//   }, [updateMutation]);

//   return {
//     create: createMutation.mutate,
//     update: debouncedUpdate,
//     delete: deleteMutation.mutate,
//     flushPending,
//     isPending:
//       createMutation.isPending ||
//       updateMutation.isPending ||
//       deleteMutation.isPending,
//     hasPendingChanges: pendingUpdates.current.size > 0,
//   };
// };

// // Real API mutations (your existing code)
// const useApiMutations = (year: number, month: number) => {
//   const queryClient = useQueryClient();
//   const pendingUpdates = useRef<Map<string, Partial<Expense>>>(new Map());
//   const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

//   // Create expense
//   const createMutation = useMutation({
//     mutationFn: async (expense: Omit<Expense, "createdAt" | "updatedAt">) => {
//       const { data, error } = await supabase
//         .from("expenses")
//         .insert({
//           ...expense,
//           createdAt: new Date().toISOString(),
//           updatedAt: new Date().toISOString(),
//         })
//         .select()
//         .single();

//       if (error) throw error;
//       return data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["expenses", year, month] });
//     },
//   });

//   // Update expense (debounced)
//   const updateMutation = useMutation({
//     mutationFn: async ({
//       id,
//       updates,
//     }: {
//       id: string;
//       updates: Partial<Expense>;
//     }) => {
//       const { data, error } = await supabase
//         .from("expenses")
//         .update({
//           ...updates,
//           updatedAt: new Date().toISOString(),
//         })
//         .eq("id", id)
//         .select()
//         .single();

//       if (error) throw error;
//       return data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["expenses", year, month] });
//     },
//   });

//   // Delete expense
//   const deleteMutation = useMutation({
//     mutationFn: async (id: string) => {
//       const { error } = await supabase.from("expenses").delete().eq("id", id);

//       if (error) throw error;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["expenses", year, month] });
//     },
//   });

//   // Debounced update (saves after 2 seconds of inactivity)
//   const debouncedUpdate = useCallback(
//     (id: string, field: keyof Expense, value: any) => {
//       // Store pending update
//       const existing = pendingUpdates.current.get(id) || {};
//       pendingUpdates.current.set(id, { ...existing, [field]: value });

//       // Clear existing timeout
//       if (timeoutRef.current) {
//         clearTimeout(timeoutRef.current);
//       }

//       // Set new timeout
//       timeoutRef.current = setTimeout(() => {
//         const updates = pendingUpdates.current.get(id);
//         if (updates) {
//           updateMutation.mutate({ id, updates });
//           pendingUpdates.current.delete(id);
//         }
//       }, 2000); // 2 second debounce
//     },
//     [updateMutation]
//   );

//   // Force save all pending (called when user navigates away or manually)
//   const flushPending = useCallback(async () => {
//     if (timeoutRef.current) {
//       clearTimeout(timeoutRef.current);
//     }

//     const promises = Array.from(pendingUpdates.current.entries()).map(
//       ([id, updates]) => updateMutation.mutateAsync({ id, updates })
//     );

//     await Promise.all(promises);
//     pendingUpdates.current.clear();
//   }, [updateMutation]);

//   return {
//     create: createMutation.mutate,
//     update: debouncedUpdate,
//     delete: deleteMutation.mutate,
//     flushPending,
//     isPending:
//       createMutation.isPending ||
//       updateMutation.isPending ||
//       deleteMutation.isPending,
//     hasPendingChanges: pendingUpdates.current.size > 0,
//   };
// };

// export const useExpenseMutations = (year: number, month: number) => {
//   const isDemo = process.env.NEXT_PUBLIC_ENVIRONMENT === "demo";
//   console.log(isDemo);
//   return isDemo ? useDemoMutations(year, month) : useApiMutations(year, month);
// };
