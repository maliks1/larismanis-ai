import { createBrowserClient } from '@supabase/ssr'
import { initDB, saveTransaction, getAllTransactions, clearTransactions } from '../indexedDB'

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

export const syncWithSupabase = async () => {
  const transactions = await getAllTransactions();
  if (transactions.length > 0) {
    const { data, error } = await createClient()
      .from('transactions')
      .insert(transactions);

    if (!error) {
      await clearTransactions();
    }
  }
};