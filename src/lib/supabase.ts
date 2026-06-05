import { createClient } from "@supabase/supabase-js";

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
  if (!supabaseServiceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable (server-only).");
  }
}

export function createSupabaseClient() {
  if (!hasSupabaseConfig()) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

export function createSupabaseServerClient() {
  // server client requires service role key — throw early if missing
  ensureSupabaseServerEnv();
  return createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey);
}

let browserClientInstance: ReturnType<typeof createClient> | null = null;

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
    browserClientInstance = createClient(supabaseUrl, supabaseAnonKey);
  }

  return browserClientInstance;
}
