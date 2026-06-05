import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export function hasSupabaseConfig() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function createSupabaseClient() {
  if (!hasSupabaseConfig()) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

export function createSupabaseServerClient() {
  if (!hasSupabaseConfig()) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey);
}
