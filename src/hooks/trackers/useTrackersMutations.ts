import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Tracker, TrackerEntry } from "@/entities/Tracker";
import {
  createTracker,
  updateTracker,
  deleteTracker,
  cleanupTrackerEntries,
  createTrackerEntry,
} from "@/lib/supabase/trackers";
import { toast } from "sonner";
import { getIsDemoMode } from "@/lib/supabase";
import { getDemoTrackersRef } from "@/lib/demoStorage/trackers";

const isDemoMode = getIsDemoMode();

export const useTrackerMutations = () => {
  const queryClient = useQueryClient();

  // Create tracker
  const createMutation = useMutation({
    mutationFn: async (
      tracker: Omit<Tracker, "id" | "createdAt" | "updatedAt">
    ) => {
      await new Promise((r) => setTimeout(r, 300));

      if (isDemoMode) {
        const demoTrackers = getDemoTrackersRef();
        const newTracker: Tracker = {
          ...tracker,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        demoTrackers.push(newTracker);
        return newTracker;
      }
      return await createTracker(tracker);
    },
    onSuccess: (newTracker) => {
      queryClient.invalidateQueries({ queryKey: ["trackers"] });
    },
  });

  // Update tracker
  const updateMutation = useMutation({
    mutationFn: async (tracker: Partial<Tracker> & { id: string }) => {
      await new Promise((r) => setTimeout(r, 300));

      if (isDemoMode) {
        const demoTrackers = getDemoTrackersRef();
        const index = demoTrackers.findIndex((t) => t.id === tracker.id);
        if (index === -1) throw new Error("Tracker not found");

        demoTrackers[index] = {
          ...demoTrackers[index],
          ...tracker,
          updatedAt: new Date(),
        };
        return JSON.parse(JSON.stringify(demoTrackers[index]));
      }
      return await updateTracker(tracker.id, tracker);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trackers"] });
    },
  });

  // Delete tracker
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await new Promise((r) => setTimeout(r, 300));

      if (isDemoMode) {
        const demoTrackers = getDemoTrackersRef();
        const index = demoTrackers.findIndex((t) => t.id === id);
        if (index !== -1) {
          demoTrackers.splice(index, 1);
        }
        return id;
      }
      await deleteTracker(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trackers"] });
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
      await new Promise((r) => setTimeout(r, 300));

      if (isDemoMode) {
        const demoTrackers = getDemoTrackersRef();
        const tracker = demoTrackers.find((t) => t.id === trackerId);
        if (!tracker) throw new Error("Tracker not found");

        const newBalance =
          tracker.currentBalance + entryData.debit - entryData.credit;

        const newEntry: TrackerEntry = {
          ...entryData,
          id: crypto.randomUUID(),
          balance: newBalance,
          createdAt: new Date(),
        };

        tracker.entries.push(newEntry);
        tracker.currentBalance = newBalance;
        tracker.updatedAt = new Date();

        return { trackerId, newEntry, newBalance };
      }

      // Production mode
      const tracker = queryClient
        .getQueryData<Tracker[]>(["trackers"])
        ?.find((t) => t.id === trackerId);

      if (!tracker) throw new Error("Tracker not found");

      const newBalance =
        tracker.currentBalance + entryData.debit - entryData.credit;

      const entry = await createTrackerEntry(trackerId, {
        ...entryData,
        balance: newBalance,
        createdAt: new Date(),
      });

      return { trackerId, newEntry: entry, newBalance };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trackers"] });
      toast.success("Entry added!", {
        description: "Transaction has been recorded",
      });
    },
  });

  // Cleanup entries
  const cleanupMutation = useMutation({
    mutationFn: async (trackerId: string) => {
      await new Promise((r) => setTimeout(r, 300));

      if (isDemoMode) {
        const demoTrackers = getDemoTrackersRef();
        const tracker = demoTrackers.find((t) => t.id === trackerId);
        if (!tracker) throw new Error("Tracker not found");

        // Get the latest balance
        const latestBalance =
          tracker.entries.length > 0
            ? tracker.entries[tracker.entries.length - 1].balance
            : tracker.initialBalance;

        // Clear all entries
        tracker.entries = [];

        // Add carry-over entry
        const carryOverEntry: TrackerEntry = {
          id: crypto.randomUUID(),
          date: new Date(),
          description: "Balance carry-over (cleanup)",
          debit: latestBalance,
          credit: 0,
          balance: latestBalance,
          createdAt: new Date(),
        };

        tracker.entries.push(carryOverEntry);
        tracker.currentBalance = latestBalance;
        tracker.updatedAt = new Date();

        return { trackerId, balance: latestBalance };
      }

      // Production mode
      const result = await cleanupTrackerEntries(trackerId);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trackers"] });
      toast.success("Entries cleaned up!", {
        description: "All entries replaced with carry-over balance",
      });
    },
    onError: (error) => {
      console.error("Cleanup error:", error);
      toast.error("Failed to cleanup entries", {
        description: "Please try again",
      });
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
