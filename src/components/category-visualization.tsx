"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  BarChart3,
  RefreshCw,
  ArrowUpCircle,
  ArrowDownCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];

export function CategoryVisualization() {
  const supabase = createClient();
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "90days" | "all">("30days");
  const [activeTab, setActiveTab] = useState<"pemasukan" | "pengeluaran">("pengeluaran");

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

  const filterTransactionsByTimeRange = () => {
    if (timeRange === "all") return transactions;

    const now = new Date();
    const daysMap = { "7days": 7, "30days": 30, "90days": 90 };
    const days = daysMap[timeRange];
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return transactions.filter((t) => new Date(t.created_at) >= cutoff);
  };

  const filteredTransactions = filterTransactionsByTimeRange();

  const getCategoryData = () => {
    const data = filteredTransactions
      .filter((t) => t.tipe_transaksi === activeTab)
      .reduce((acc, t) => {
        acc[t.kategori] = (acc[t.kategori] || 0) + t.nominal;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(data)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  };

  const categoryData = getCategoryData();

  const getTopCategories = () => {
    return categoryData.slice(0, 5);
  };

  const topCategories = getTopCategories();

  const getTotalAmount = () => {
    return categoryData.reduce((sum, item) => sum + item.amount, 0);
  };

  const totalAmount = getTotalAmount();

  const getCategoryPercentage = (amount: number) => {
    return totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
  };

  const getColor = (index: number) => {
    const colors = [
      "bg-indigo-500",
      "bg-emerald-500",
      "bg-amber-500",
      "bg-rose-500",
      "bg-purple-500",
      "bg-cyan-500",
      "bg-lime-500",
      "bg-sky-500",
    ];
    return colors[index % colors.length];
  };

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/20 p-10 text-center">
        <RefreshCw className="mx-auto h-6 w-6 animate-spin text-indigo-500" />
        <span className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Memuat data kategori...
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
      {/* Header */}
      <div className="rounded-3xl border border-slate-200/50 bg-white dark:border-slate-800/50 dark:bg-slate-900 p-6 shadow-sm transition-colors duration-300">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
              Visualisasi Kategori
            </span>
            <h2 className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Analisis Pengeluaran & Pemasukan
            </h2>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Lihat distribusi transaksi berdasarkan kategori.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as "7days" | "30days" | "90days" | "all")}
              className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white outline-none transition focus:border-indigo-500 cursor-pointer"
            >
              <option value="7days">7 Hari Terakhir</option>
              <option value="30days">30 Hari Terakhir</option>
              <option value="90days">90 Hari Terakhir</option>
              <option value="all">Semua Waktu</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-1 rounded-xl bg-slate-50/50 p-1 dark:bg-slate-950/40">
          <button
            onClick={() => setActiveTab("pengeluaran")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === "pengeluaran"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Pengeluaran
          </button>
          <button
            onClick={() => setActiveTab("pemasukan")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === "pemasukan"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Pemasukan
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Amount */}
        <div className="rounded-2xl border border-slate-200/50 bg-white p-5 dark:border-slate-800/50 dark:bg-slate-900 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                Total {activeTab === "pengeluaran" ? "Pengeluaran" : "Pemasukan"}
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                Rp{totalAmount.toLocaleString("id-ID")}
              </p>
            </div>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                activeTab === "pengeluaran"
                  ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                  : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
              }`}
            >
              {activeTab === "pengeluaran" ? (
                <ArrowDownCircle className="h-6 w-6" />
              ) : (
                <ArrowUpCircle className="h-6 w-6" />
              )}
            </div>
          </div>
        </div>

        {/* Top Category */}
        <div className="rounded-2xl border border-slate-200/50 bg-white p-5 dark:border-slate-800/50 dark:bg-slate-900 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                Kategori Teratas
              </p>
              <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                {topCategories[0]?.category || "-"}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Rp{topCategories[0]?.amount.toLocaleString("id-ID") || "0"}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Category Count */}
        <div className="rounded-2xl border border-slate-200/50 bg-white p-5 dark:border-slate-800/50 dark:bg-slate-900 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                Jumlah Kategori
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {categoryData.length}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Average Amount */}
        <div className="rounded-2xl border border-slate-200/50 bg-white p-5 dark:border-slate-800/50 dark:bg-slate-900 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                Rata-rata per Kategori
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                Rp{categoryData.length > 0 ? Math.round(totalAmount / categoryData.length).toLocaleString("id-ID") : "0"}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              {totalAmount >= 0 ? (
                <TrendingUp className="h-6 w-6" />
              ) : (
                <TrendingDown className="h-6 w-6" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Visualizations */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Pie Chart */}
        <div className="rounded-3xl border border-slate-200/50 bg-white dark:border-slate-800/50 dark:bg-slate-900 p-6 shadow-sm transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                Distribusi Kategori
              </span>
              <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                Proporsi {activeTab === "pengeluaran" ? "Pengeluaran" : "Pemasukan"} per Kategori
              </h3>
            </div>
            <PieChart className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>

          {categoryData.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/20 p-6 text-center">
              <PieChart className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-600" />
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Tidak ada data untuk ditampilkan
              </p>
            </div>
          ) : (
            <div className="mt-6 h-64">
              <div className="flex h-full items-center justify-center">
                <div className="relative h-48 w-48">
                  {categoryData.map((item, index) => {
                    const percentage = getCategoryPercentage(item.amount);
                    return (
                      <div
                        key={item.category}
                        className="absolute h-24 w-24 origin-center rounded-full"
                        style={{
                          transform: `rotate(${index * (360 / categoryData.length)}deg)`,
                        }}
                      >
                        <div
                          className={`h-full w-12 origin-right rounded-full ${getColor(index)}`}
                          style={{
                            transform: `rotate(${percentage * 3.6}deg)`,
                          }}
                        />
                      </div>
                    );
                  })}
                  <div className="absolute inset-12 flex flex-col items-center justify-center rounded-full bg-white dark:bg-slate-900">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Total
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      Rp{totalAmount.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bar Chart */}
        <div className="rounded-3xl border border-slate-200/50 bg-white dark:border-slate-800/50 dark:bg-slate-900 p-6 shadow-sm transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                Perbandingan Kategori
              </span>
              <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                5 Kategori Teratas
              </h3>
            </div>
            <BarChart3 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>

          {topCategories.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/20 p-6 text-center">
              <BarChart3 className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-600" />
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Tidak ada data untuk ditampilkan
              </p>
            </div>
          ) : (
            <div className="mt-6 h-64">
              <div className="flex h-full flex-col justify-end gap-4">
                {topCategories.map((item, index) => {
                  const percentage = getCategoryPercentage(item.amount);
                  return (
                    <div key={item.category} className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-600 dark:text-slate-400">
                          {item.category}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-4 w-full rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                          className={`h-4 rounded-full ${getColor(index)}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                        Rp{item.amount.toLocaleString("id-ID")}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Details */}
      {categoryData.length > 0 && (
        <div className="rounded-3xl border border-slate-200/50 bg-white dark:border-slate-800/50 dark:bg-slate-900 p-6 shadow-sm transition-colors duration-300">
          <div className="mb-4">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
              Detail Kategori
            </span>
            <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
              Semua Kategori {activeTab === "pengeluaran" ? "Pengeluaran" : "Pemasukan"}
            </h3>
          </div>

          <div className="space-y-3">
            {categoryData.map((item, index) => {
              const percentage = getCategoryPercentage(item.amount);
              return (
                <div
                  key={item.category}
                  className="flex items-center justify-between rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${getColor(index)}`} />
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-500 dark:text-slate-400">
                      {percentage.toFixed(1)}%
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Rp{item.amount.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}