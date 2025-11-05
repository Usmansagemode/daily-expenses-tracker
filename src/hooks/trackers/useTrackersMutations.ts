import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Tracker, TrackerEntry } from "@/entities/Tracker";
import { getDemoTrackersRef } from "@/lib/demoStorage/trackers";
import { getIsDemoMode } from "@/lib/supabase";
import {
  cleanupTrackerEntries,
  createTracker,
  createTrackerEntry,
  deleteTracker,
  updateTracker,
} from "@/lib/supabase/trackers";

const isDemoMode = getIsDemoMode();

export const useTrackerMutations = () => {
  const queryClient = useQueryClient();

  // Create tracker
  const createMutation = useMutation({
    mutationFn: async (
      tracker: Omit<Tracker, "id" | "createdAt" | "updatedAt">,
    ) => {
      await new Promise((r) => setTimeout(r, 300));

      if (isDemoMode) {
        const demoTrackers = getDemoTrackersRef();
        const newTracker: Tracker = {
          ...tracker,
          createdAt: new Date(),
          id: crypto.randomUUID(),
          updatedAt: new Date(),
        };
        demoTrackers.push(newTracker);
        return newTracker;
      }
      return await createTracker(tracker);
    },
    onSuccess: () => {
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
          balance: newBalance,
          createdAt: new Date(),
          id: crypto.randomUUID(),
        };

        tracker.entries.push(newEntry);
        tracker.currentBalance = newBalance;
        tracker.updatedAt = new Date();

        return { newBalance, newEntry, trackerId };
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

      // Update the tracker's current balance
      await updateTracker(trackerId, { currentBalance: newBalance });

      return { newBalance, newEntry: entry, trackerId };
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
          balance: latestBalance,
          createdAt: new Date(),
          credit: 0,
          date: new Date(),
          debit: latestBalance,
          description: "Balance carry-over (cleanup)",
          id: crypto.randomUUID(),
        };

        tracker.entries.push(carryOverEntry);
        tracker.currentBalance = latestBalance;
        tracker.updatedAt = new Date();

        return { balance: latestBalance, trackerId };
      }

      // Production mode
      const result = await cleanupTrackerEntries(trackerId);
      return result;
    },
    onError: (error) => {
      console.error("Cleanup error:", error);
      toast.error("Failed to cleanup entries", {
        description: "Please try again",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trackers"] });
      toast.success("Entries cleaned up!", {
        description: "All entries replaced with carry-over balance",
      });
    },
  });

  return {
    addEntry: addEntryMutation.mutate,
    cleanup: cleanupMutation.mutate,
    create: createMutation.mutate,
    delete: deleteMutation.mutate,
    isPending:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      addEntryMutation.isPending ||
      cleanupMutation.isPending,
    update: updateMutation.mutate,
  };
};
