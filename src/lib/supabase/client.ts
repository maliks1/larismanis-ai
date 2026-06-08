import { createBrowserClient } from '@supabase/ssr'

/**
 * Singleton browser client for Supabase.
 * Prevents "Multiple GoTrueClient instances detected" warning.
 */
let browserClientInstance: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (!browserClientInstance) {
    browserClientInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return browserClientInstance
}
