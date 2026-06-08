-- =============================================
-- LarisManis AI - Budget Table Migration
-- Run this in Supabase Dashboard > SQL Editor
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create budgets table (matching current database.types.ts)
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kategori TEXT NOT NULL,
    tipe_transaksi TEXT NOT NULL CHECK (tipe_transaksi IN ('pemasukan', 'pengeluaran')),
    target_nominal NUMERIC(15, 2) NOT NULL CHECK (target_nominal >= 0),
    periode_bulan TEXT NOT NULL, -- Format: 'YYYY-MM'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_budgets_periode_bulan ON public.budgets(periode_bulan);
CREATE INDEX IF NOT EXISTS idx_budgets_kategori ON public.budgets(kategori);

-- =============================================
-- RLS (Row Level Security) Setup
-- Note: For MVP without auth, we keep RLS disabled or use permissive policies
-- When auth is ready, uncomment the RLS section below
-- =============================================

-- Enable RLS (uncomment when auth is implemented)
-- ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- For MVP without user authentication, use this permissive policy:
-- (Remove when switching to authenticated users)

-- Policy: Allow all operations (for development/MVP)
CREATE POLICY "Allow all operations on budgets"
    ON public.budgets
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- =============================================
-- When ready for multi-user, run this additional migration:
-- =============================================
-- 1. Add user_id column:
--    ALTER TABLE public.budgets ADD COLUMN user_id UUID REFERENCES auth.users(id);
--
-- 2. Update policies:
--    DROP POLICY "Allow all operations on budgets" ON public.budgets;
--
--    CREATE POLICY "Users can view their own budgets"
--        ON public.budgets FOR SELECT USING (auth.uid() = user_id);
--
--    CREATE POLICY "Users can insert their own budgets"
--        ON public.budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
--
--    CREATE POLICY "Users can update their own budgets"
--        ON public.budgets FOR UPDATE USING (auth.uid() = user_id);
--
--    CREATE POLICY "Users can delete their own budgets"
--        ON public.budgets FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- Verify table creation
-- =============================================
-- SELECT * FROM public.budgets LIMIT 1;
