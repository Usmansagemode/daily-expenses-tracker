// src/lib/supabase.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Get credentials - handle both undefined and empty string cases
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";

// Check if we have valid credentials
// Must be non-empty strings AND valid URL format
const isValidUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const hasValidCredentials =
  supabaseUrl.length > 0 &&
  supabaseAnonKey.length > 0 &&
  isValidUrl(supabaseUrl);

// Create Supabase client only if we have valid credentials
let supabaseInstance: SupabaseClient | null = null;

if (hasValidCredentials) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.warn(
      "Failed to create Supabase client, falling back to demo mode:",
      error,
    );
    supabaseInstance = null;
  }
}

export const supabase = supabaseInstance;

// Helper function to check if Supabase is available (not in demo mode)
export const isSupabaseAvailable = (): boolean => {
  return supabase !== null;
};

// Helper to get demo mode status - demo mode is when Supabase is NOT available
export const getIsDemoMode = (): boolean => {
  return !isSupabaseAvailable();
};

// Log the mode on initialization (helpful for debugging)
if (typeof window !== "undefined") {
  console.log(`Running in ${getIsDemoMode() ? "DEMO" : "PRODUCTION"} mode`);
}
