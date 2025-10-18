// src/lib/supabase.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const isDemoMode = process.env.NEXT_PUBLIC_ENVIRONMENT === "demo";

// Get credentials with fallback empty strings
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Only create Supabase client if NOT in demo mode AND credentials exist
let supabaseInstance: SupabaseClient | null = null;

if (!isDemoMode && supabaseUrl && supabaseAnonKey) {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = supabaseInstance;

// Helper function to check if Supabase is available
export const isSupabaseAvailable = (): boolean => {
  return supabase !== null;
};

// Helper to get demo mode status
export const getIsDemoMode = (): boolean => {
  return isDemoMode;
};

// // src/lib/supabase.ts
// import { createClient } from "@supabase/supabase-js";

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);
