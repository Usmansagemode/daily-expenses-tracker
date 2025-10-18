// src/lib/demoStorage/trackers.ts

import { Tracker } from "@/entities/Tracker";
import { mockTrackers } from "@/components/trackers/data/trackerData";

// Shared in-memory storage - this is the single source of truth for demo mode
let demoTrackers: Tracker[] = JSON.parse(JSON.stringify(mockTrackers));

export const getDemoTrackers = (): Tracker[] => {
  return JSON.parse(JSON.stringify(demoTrackers)); // Return a copy
};

export const setDemoTrackers = (trackers: Tracker[]) => {
  demoTrackers = trackers;
};

export const updateDemoTracker = (
  trackerId: string,
  updates: Partial<Tracker>
) => {
  const index = demoTrackers.findIndex((t) => t.id === trackerId);
  if (index !== -1) {
    demoTrackers[index] = { ...demoTrackers[index], ...updates };
  }
};

export const addDemoTracker = (tracker: Tracker) => {
  demoTrackers.push(tracker);
};

export const deleteDemoTracker = (trackerId: string) => {
  demoTrackers = demoTrackers.filter((t) => t.id !== trackerId);
};

export const resetDemoTrackers = () => {
  demoTrackers = JSON.parse(JSON.stringify(mockTrackers));
};

// Get reference to the actual array (for mutations)
export const getDemoTrackersRef = () => demoTrackers;
