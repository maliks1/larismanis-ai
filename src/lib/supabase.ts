import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export function hasSupabaseConfig() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function ensureSupabaseServerEnv() {
  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
  }
  if (!supabaseServiceRoleKey && !supabaseAnonKey) {
    throw new Error(
      "Missing both SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.",
    );
  }
}

export function createSupabaseClient() {
  if (!hasSupabaseConfig()) {
    return null;
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}

export function createSupabaseServerClient() {
  // server client uses service role key if available, otherwise falls back to anon key
  ensureSupabaseServerEnv();
  return createClient<Database>(
    supabaseUrl,
    supabaseServiceRoleKey || supabaseAnonKey,
  );
}

let browserClientInstance: SupabaseClient<Database> | null = null;

/**
 * Returns a singleton Supabase client for browser/client-side usage.
 * This ensures only one GoTrueClient instance is created, preventing
 * the "Multiple GoTrueClient instances detected" warning.
 */
export function getBrowserSupabaseClient() {
  if (!hasSupabaseConfig()) {
    return null;
  }

  if (!browserClientInstance) {
    browserClientInstance = createClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
    );
  }

  return browserClientInstance;
}
