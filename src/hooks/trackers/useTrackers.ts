import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Tracker, TrackerEntry } from "@/entities/Tracker";
import { mockTrackers } from "@/components/trackers/data/trackerData";

const isDemoMode = process.env.NEXT_PUBLIC_ENVIRONMENT === "demo";

/**
 * Fetch all trackers and their entries.
 */
export const useTrackers = () => {
  return useQuery<Tracker[]>({
    queryKey: ["trackers"],
    queryFn: async () => {
      if (isDemoMode) {
        // Demo data for offline/demo mode
        await new Promise((r) => setTimeout(r, 300));
        return mockTrackers;
      }

      // Fetch trackers
      const { data: trackers, error: trackersError } = await supabase
        .from("trackers")
        .select("*")
        .order("createdAt", { ascending: true });

      if (trackersError) throw trackersError;
      if (!trackers || trackers.length === 0) return [];

      // Fetch all entries
      const { data: entries, error: entriesError } = await supabase
        .from("trackerEntries")
        .select("*")
        .order("date", { ascending: true });

      if (entriesError) throw entriesError;

      // Group entries by tracker_id
      const entriesByTracker: Record<string, TrackerEntry[]> = {};
      for (const entry of entries ?? []) {
        const tid = (entry as any).trackerId;
        if (!entriesByTracker[tid]) entriesByTracker[tid] = [];
        entriesByTracker[tid].push(entry as TrackerEntry);
      }

      // Combine trackers with their entries
      const combined = trackers.map((t) => ({
        ...t,
        entries: entriesByTracker[t.id] ?? [],
      }));

      return combined as Tracker[];
    },
  });
};
