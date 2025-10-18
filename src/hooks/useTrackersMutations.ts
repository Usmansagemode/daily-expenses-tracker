import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Tracker, TrackerEntry } from "@/entities/Tracker";
import {
  createTracker,
  updateTracker,
  deleteTracker,
  addTrackerEntry,
  cleanupTrackerEntries,
  createTrackerEntry,
} from "@/lib/supabase/trackers";
import { toast } from "sonner";

const isDemoMode = process.env.NEXT_PUBLIC_ENVIRONMENT === "demo";

export const useTrackerMutations = () => {
  const queryClient = useQueryClient();

  // Create tracker
  const createMutation = useMutation({
    mutationFn: async (
      tracker: Omit<Tracker, "id" | "createdAt" | "updatedAt">
    ) => {
      if (isDemoMode) {
        await new Promise((r) => setTimeout(r, 300));
        return {
          ...tracker,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Tracker;
      }
      return await createTracker(tracker);
    },
    onSuccess: (newTracker) => {
      queryClient.setQueryData<Tracker[]>(["trackers"], (old = []) => [
        ...old,
        newTracker,
      ]);
    },
  });

  // Update tracker (title, description, etc.)
  const updateMutation = useMutation({
    mutationFn: async (tracker: Partial<Tracker> & { id: string }) => {
      if (isDemoMode) {
        await new Promise((r) => setTimeout(r, 300));
        return tracker;
      }
      return await updateTracker(tracker.id, tracker);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<Tracker[]>(["trackers"], (old = []) =>
        old.map((t) => (t.id === updated.id ? { ...t, ...updated } : t))
      );
    },
  });

  // Delete tracker
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (isDemoMode) {
        await new Promise((r) => setTimeout(r, 300));
        return id;
      }
      await deleteTracker(id);
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<Tracker[]>(["trackers"], (old = []) =>
        old.filter((t) => t.id !== id)
      );
    },
  });

  // Add entry to a tracker
  const addEntryMutation = useMutation({
    mutationFn: async ({
      trackerId,
      entryData,
    }: {
      trackerId: string;
      entryData: Omit<TrackerEntry, "id" | "balance" | "createdAt">;
    }) => {
      // Get tracker to compute new balance
      const tracker = queryClient
        .getQueryData<Tracker[]>(["trackers"])
        ?.find((t) => t.id === trackerId);

      if (!tracker) throw new Error("Tracker not found");

      const newBalance =
        tracker.currentBalance + entryData.debit - entryData.credit;

      const newEntry: Omit<TrackerEntry, "id"> = {
        ...entryData,
        balance: newBalance,
        createdAt: new Date(),
      };

      if (isDemoMode) {
        await new Promise((r) => setTimeout(r, 300));
        return { trackerId, newEntry, newBalance };
      }

      const entry = await createTrackerEntry(trackerId, newEntry);
      //   await updateTracker(trackerId, { currentBalance: newBalance });

      return { trackerId, newEntry: entry, newBalance };
    },
    onSuccess: ({ trackerId, newEntry, newBalance }) => {
      // Update cached tracker
      queryClient.setQueryData<Tracker[]>(["trackers"], (old = []) =>
        old.map((t) =>
          t.id === trackerId
            ? {
                ...t,
                entries: [...t.entries, newEntry],
                currentBalance: newBalance,
                updatedAt: new Date(),
              }
            : t
        )
      );

      toast.success("Entry added!", {
        description: "Transaction has been recorded",
      });
    },
  });
  //   const addEntryMutation = useMutation({
  //     mutationFn: async ({
  //       trackerId,
  //       entry,
  //     }: {
  //       trackerId: string;
  //       entry: Omit<TrackerEntry, "id" | "createdAt">;
  //     }) => {
  //       if (isDemoMode) {
  //         await new Promise((r) => setTimeout(r, 300));
  //         return {
  //           ...entry,
  //           id: crypto.randomUUID(),
  //           createdAt: new Date(),
  //         } as TrackerEntry;
  //       }
  //       return await addTrackerEntry(trackerId, entry);
  //     },
  //     onSuccess: (_, { trackerId }) => {
  //       queryClient.invalidateQueries({
  //         queryKey: ["tracker-entries", trackerId],
  //       });
  //       queryClient.invalidateQueries({ queryKey: ["trackers"] });
  //     },
  //   });

  // Cleanup entries (delete all and add carry-over)
  const cleanupMutation = useMutation({
    mutationFn: async (trackerId: string) => {
      if (isDemoMode) {
        await new Promise((r) => setTimeout(r, 300));
        return trackerId;
      }
      await cleanupTrackerEntries(trackerId);
      return trackerId;
    },
    onSuccess: (trackerId) => {
      queryClient.invalidateQueries({
        queryKey: ["tracker-entries", trackerId],
      });
      queryClient.invalidateQueries({ queryKey: ["trackers"] });
    },
  });

  return {
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    addEntry: addEntryMutation.mutate,
    cleanup: cleanupMutation.mutate,
    isPending:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      addEntryMutation.isPending ||
      cleanupMutation.isPending,
  };
};
