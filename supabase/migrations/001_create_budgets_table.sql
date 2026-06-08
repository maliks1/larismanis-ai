-- =============================================
-- LarisManis AI - Budget Table Migration
-- Run this in Supabase Dashboard > SQL Editor
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing table if exists (to ensure clean migration)
DROP TABLE IF EXISTS public.budgets CASCADE;

-- Create budgets table WITH user_id for authenticated users
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    kategori TEXT NOT NULL,
    tipe_transaksi TEXT NOT NULL CHECK (tipe_transaksi IN ('pemasukan', 'pengeluaran')),
    target_nominal NUMERIC(15, 2) NOT NULL CHECK (target_nominal >= 0),
    periode_bulan TEXT NOT NULL, -- Format: 'YYYY-MM'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_periode_bulan ON public.budgets(periode_bulan);
CREATE INDEX IF NOT EXISTS idx_budgets_kategori ON public.budgets(kategori);

-- =============================================
-- RLS (Row Level Security) Setup
-- =============================================

-- Enable RLS
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own budgets
DROP POLICY IF EXISTS "Users can view their own budgets" ON public.budgets;
CREATE POLICY "Users can view their own budgets"
    ON public.budgets
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own budgets
DROP POLICY IF EXISTS "Users can insert their own budgets" ON public.budgets;
CREATE POLICY "Users can insert their own budgets"
    ON public.budgets
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own budgets
DROP POLICY IF EXISTS "Users can update their own budgets" ON public.budgets;
CREATE POLICY "Users can update their own budgets"
    ON public.budgets
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own budgets
DROP POLICY IF EXISTS "Users can delete their own budgets" ON public.budgets;
CREATE POLICY "Users can delete their own budgets"
    ON public.budgets
    FOR DELETE
    USING (auth.uid() = user_id);

-- =============================================
-- Verify table creation
-- =============================================
-- SELECT * FROM public.budgets LIMIT 1;
