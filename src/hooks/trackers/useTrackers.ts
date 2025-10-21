import { useQuery } from "@tanstack/react-query";

import { Tracker, TrackerEntry } from "@/entities/Tracker";
import { getDemoTrackers } from "@/lib/demoStorage/trackers";
import { getIsDemoMode, supabase } from "@/lib/supabase";

const isDemoMode = getIsDemoMode();

export const useTrackers = () => {
  return useQuery<Tracker[]>({
    queryFn: async (): Promise<Tracker[]> => {
      if (isDemoMode) {
        // Demo mode - return shared demo storage
        await new Promise((r) => setTimeout(r, 300));
        return getDemoTrackers();
      }

      // Production mode - fetch from Supabase
      if (!supabase) {
        console.warn("Supabase not available");
        return [];
      }

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
        const tid = (entry as { trackerId: string }).trackerId;
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
    queryKey: ["trackers"],
  });
};
