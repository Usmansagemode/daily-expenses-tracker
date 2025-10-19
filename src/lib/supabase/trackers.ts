import { supabase } from "@/lib/supabase";
import type { Tracker, TrackerEntry } from "@/entities/Tracker";

// Helper to throw if supabase is not available
function ensureSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase client not available. Check your environment configuration."
    );
  }
  return supabase;
}

//
// ---------- FETCH ALL TRACKERS WITH ENTRIES ----------
//
export async function fetchTrackers(): Promise<Tracker[]> {
  if (!supabase) throw new Error("Supabase not initialized");
  const { data, error } = await supabase
    .from("trackers")
    .select("*, trackerEntries(*)")
    .order("createdAt", { ascending: false });

  if (error) throw error;
  return data || [];
}

//
// ---------- CREATE TRACKER ----------
//
export async function createTracker(
  tracker: Omit<Tracker, "id" | "createdAt" | "updatedAt">
) {
  if (!supabase) throw new Error("Supabase not initialized");
  const { data, error } = await supabase
    .from("trackers")
    .insert([
      {
        title: tracker.title,
        description: tracker.description,
        initialBalance: tracker.initialBalance,
        currentBalance: tracker.currentBalance ?? tracker.initialBalance,
        color: tracker.color,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

//
// ---------- UPDATE TRACKER ----------
//
export async function updateTracker(id: string, updates: Partial<Tracker>) {
  if (!supabase) throw new Error("Supabase not initialized");
  const { data, error } = await supabase
    .from("trackers")
    .update({
      title: updates.title,
      description: updates.description,
      currentBalance: updates.currentBalance,
      color: updates.color,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

//
// ---------- DELETE TRACKER ----------
//
export async function deleteTracker(id: string) {
  if (!supabase) throw new Error("Supabase not initialized");
  const { error } = await supabase.from("trackers").delete().eq("id", id);
  if (error) throw error;
}

//
// ---------- ADD ENTRY TO TRACKER ----------
//
export async function addTrackerEntry(
  trackerId: string,
  entry: Omit<TrackerEntry, "id" | "createdAt">
) {
  if (!supabase) throw new Error("Supabase not initialized");
  const { data, error } = await supabase
    .from("trackerEntries")
    .insert([
      {
        trackerId: trackerId,
        date: entry.date,
        description: entry.description,
        debit: entry.debit,
        credit: entry.credit,
        balance: entry.balance,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createTrackerEntry(
  trackerId: string,
  entry: Omit<TrackerEntry, "id">
) {
  if (!supabase) throw new Error("Supabase not initialized");
  const { data, error } = await supabase
    .from("trackerEntries")
    .insert([{ ...entry, trackerId: trackerId }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

//
// ---------- FETCH ENTRIES FOR A SPECIFIC TRACKER ----------
//
export async function fetchTrackerEntries(
  trackerId: string
): Promise<TrackerEntry[]> {
  if (!supabase) throw new Error("Supabase not initialized");
  const { data, error } = await supabase
    .from("trackerEntries")
    .select("*")
    .eq("trackerId", trackerId)
    .order("date", { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Deletes all entries for a given tracker,
 * then adds a single carry-over entry with the last known balance.
 */
// export async function cleanupTrackerEntries(trackerId: string) {
//   if (!supabase) throw new Error("Supabase not initialized");
//   // Step 1: Get all existing entries
//   const { data: entries, error: fetchError } = await supabase
//     .from("trackerEntries")
//     .select("*")
//     .eq("trackerId", trackerId)
//     .order("date", { ascending: false })
//     .limit(1);

//   if (fetchError) throw fetchError;

//   const latestBalance = entries?.[0]?.balance ?? 0;

//   // Step 2: Delete all existing entries
//   const { error: deleteError } = await supabase
//     .from("trackerEntries")
//     .delete()
//     .eq("trackerId", trackerId);

//   if (deleteError) throw deleteError;

//   // Step 3: Add a single carry-over entry
//   const newEntry: Omit<TrackerEntry, "id" | "createdAt"> = {
//     date: new Date(),
//     description: "Balance carry-over (cleanup)",
//     debit: latestBalance,
//     credit: 0,
//     balance: latestBalance,
//   };

//   const { error: insertError } = await supabase.from("trackerEntries").insert({
//     ...newEntry,
//     trackerId: trackerId,
//     createdAt: new Date().toISOString(),
//   });

//   if (insertError) throw insertError;

//   return { trackerId, balance: latestBalance };
// }

export async function cleanupTrackerEntries(trackerId: string) {
  if (!supabase) throw new Error("Supabase not initialized");

  // Step 1: Get current balance from tracker
  const { data: tracker, error: trackerError } = await supabase
    .from("trackers")
    .select("currentBalance")
    .eq("id", trackerId)
    .single();

  if (trackerError) throw trackerError;

  const currentBalance = tracker.currentBalance;

  // Step 2: Delete all entries
  const { error: deleteError } = await supabase
    .from("trackerEntries")
    .delete()
    .eq("trackerId", trackerId);

  if (deleteError) throw deleteError;

  // Step 3: Add carry-over entry
  const newEntry = {
    date: new Date().toISOString(),
    description: `Balance carry-over: ${
      currentBalance >= 0 ? "$" : "-$"
    }${Math.abs(currentBalance).toFixed(2)}`,
    debit: 0,
    credit: 0,
    balance: currentBalance,
    trackerId: trackerId,
    createdAt: new Date().toISOString(),
  };

  const { error: insertError } = await supabase
    .from("trackerEntries")
    .insert(newEntry);

  if (insertError) throw insertError;

  return { trackerId, balance: currentBalance };
}
