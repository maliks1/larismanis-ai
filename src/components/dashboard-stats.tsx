"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Wallet,
  PiggyBank,
  CreditCard,
  DollarSign,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];

export function DashboardStats() {
  const supabase = createClient();
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTransactions = async () => {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setTransactions((data as TransactionRow[]) ?? []);
      }

      setIsLoading(false);
    };

    void loadTransactions();
  }, [supabase]);

  // Calculate stats
  const totalPemasukan = transactions
    .filter((t) => t.tipe_transaksi === "pemasukan")
    .reduce((sum, t) => sum + t.nominal, 0);

  const totalPengeluaran = transactions
    .filter((t) => t.tipe_transaksi === "pengeluaran")
    .reduce((sum, t) => sum + t.nominal, 0);

  const netIncome = totalPemasukan - totalPengeluaran;
  const netIncomePercentage = totalPemasukan > 0
    ? (netIncome / totalPemasukan) * 100
    : 0;

  const pemasukanByCategory = transactions
    .filter((t) => t.tipe_transaksi === "pemasukan")
    .reduce((acc, t) => {
      acc[t.kategori] = (acc[t.kategori] || 0) + t.nominal;
      return acc;
    }, {} as Record<string, number>);

  const pengeluaranByCategory = transactions
    .filter((t) => t.tipe_transaksi === "pengeluaran")
    .reduce((acc, t) => {
      acc[t.kategori] = (acc[t.kategori] || 0) + t.nominal;
      return acc;
    }, {} as Record<string, number>);

  const topPemasukanCategory = Object.entries(pemasukanByCategory)
    .sort((a, b) => b[1] - a[1])[0] || ["-", 0];

  const topPengeluaranCategory = Object.entries(pengeluaranByCategory)
    .sort((a, b) => b[1] - a[1])[0] || ["-", 0];

  const recentTransactions = transactions.slice(0, 5);

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/20 p-10 text-center">
        <RefreshCw className="mx-auto h-6 w-6 animate-spin text-indigo-500" />
        <span className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Memuat data keuangan...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200/50 bg-red-50/40 dark:border-red-950/50 dark:bg-red-950/10 p-4 text-sm text-red-900 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Pemasukan */}
        <div className="rounded-2xl border border-slate-200/50 bg-white p-5 dark:border-slate-800/50 dark:bg-slate-900 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                Pemasukan
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                Rp{totalPemasukan.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <ArrowUpCircle className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Total Pengeluaran */}
        <div className="rounded-2xl border border-slate-200/50 bg-white p-5 dark:border-slate-800/50 dark:bg-slate-900 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">
                Pengeluaran
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                Rp{totalPengeluaran.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <ArrowDownCircle className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Net Income */}
        <div className="rounded-2xl border border-slate-200/50 bg-white p-5 dark:border-slate-800/50 dark:bg-slate-900 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                Pendapatan Bersih
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                Rp{netIncome.toLocaleString("id-ID")}
              </p>
              <p
                className={`mt-1 text-xs font-semibold ${
                  netIncome >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {netIncomePercentage.toFixed(1)}% dari pemasukan
              </p>
            </div>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                netIncome >= 0
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
              }`}
            >
              {netIncome >= 0 ? (
                <TrendingUp className="h-6 w-6" />
              ) : (
                <TrendingDown className="h-6 w-6" />
              )}
            </div>
          </div>
        </div>

        {/* Cash Flow */}
        <div className="rounded-2xl border border-slate-200/50 bg-white p-5 dark:border-slate-800/50 dark:bg-slate-900 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                Arus Kas
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {netIncome >= 0 ? "+" : "-"}Rp{Math.abs(netIncome).toLocaleString("id-ID")}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Category Insights */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Top Pemasukan Category */}
        <div className="rounded-2xl border border-slate-200/50 bg-white p-5 dark:border-slate-800/50 dark:bg-slate-900 transition-colors duration-300">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <PiggyBank className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                Kategori Pemasukan Teratas
              </p>
              <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                {topPemasukanCategory[0]}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Rp{topPemasukanCategory[1].toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>

        {/* Top Pengeluaran Category */}
        <div className="rounded-2xl border border-slate-200/50 bg-white p-5 dark:border-slate-800/50 dark:bg-slate-900 transition-colors duration-300">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">
                Kategori Pengeluaran Teratas
              </p>
              <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                {topPengeluaranCategory[0]}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Rp{topPengeluaranCategory[1].toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-3xl border border-slate-200/50 bg-white dark:border-slate-800/50 dark:bg-slate-900 p-6 shadow-sm transition-colors duration-300">
        <div className="mb-4">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
            Transaksi Terbaru
          </span>
          <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
            5 Transaksi Terakhir
          </h3>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/20 p-6 text-center">
            <DollarSign className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-600" />
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Belum ada transaksi
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      transaction.tipe_transaksi === "pemasukan"
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                    }`}
                  >
                    {transaction.tipe_transaksi === "pemasukan" ? (
                      <ArrowUpCircle className="h-4 w-4" />
                    ) : (
                      <ArrowDownCircle className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {transaction.deskripsi || "Tanpa deskripsi"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {transaction.kategori}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-medium ${
                      transaction.tipe_transaksi === "pemasukan"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {transaction.tipe_transaksi === "pemasukan" ? "+" : "-"}
                    Rp{transaction.nominal.toLocaleString("id-ID")}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(transaction.created_at).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}