// src/lib/supabase.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Get credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Check if we have valid credentials (not empty strings)
const hasValidCredentials = supabaseUrl && supabaseAnonKey;

// Create Supabase client only if we have valid credentials
let supabaseInstance: SupabaseClient | null = null;

if (hasValidCredentials) {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
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
