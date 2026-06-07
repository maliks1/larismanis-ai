"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  Trash2,
} from "lucide-react";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import type { Database } from "@/types/database.types";

type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];

type FilterState = {
  search: string;
  type: "all" | "pemasukan" | "pengeluaran";
  category: string;
  urgency: "all" | "rendah" | "sedang" | "tinggi";
  dateRange: "all" | "7days" | "30days" | "90days";
};

const urgencyColors = {
  rendah:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  sedang: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  tinggi: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
};

const typeColors = {
  pemasukan:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  pengeluaran:
    "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400",
};

const kelompokLabels: Record<string, string> = {
  aset_lancar: "Aset Lancar",
  kewajiban_jangka_pendek: "Kewajiban Jangka Pendek",
  pendapatan: "Pendapatan",
  beban_operasional: "Beban Operasional",
};

export function TransactionHistory() {
  const supabase = getBrowserSupabaseClient();
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    TransactionRow[]
  >([]);
  const [isLoading, setIsLoading] = useState(Boolean(supabase));
  const [error, setError] = useState<string | null>(
    supabase ? null : "Supabase tidak terkonfigurasi"
  );
  const [showFilters, setShowFilters] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    type: "all",
    category: "all",
    urgency: "all",
    dateRange: "all",
  });

  // Get unique categories from transactions
  const categories = Array.from(
    new Set(transactions.map((t) => t.kategori)),
  ).sort();

  const loadTransactions = useCallback(async () => {
    if (!supabase) return;

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
  }, [supabase]);

  const applyFilters = useCallback(() => {
    let result = [...transactions];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.deskripsi.toLowerCase().includes(searchLower) ||
          t.kategori.toLowerCase().includes(searchLower) ||
          t.nominal.toString().includes(searchLower),
      );
    }

    // Type filter
    if (filters.type !== "all") {
      result = result.filter((t) => t.tipe_transaksi === filters.type);
    }

    // Category filter
    if (filters.category !== "all") {
      result = result.filter((t) => t.kategori === filters.category);
    }

    // Urgency filter
    if (filters.urgency !== "all") {
      result = result.filter((t) => t.tingkat_urgensi === filters.urgency);
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      const daysMap = { "7days": 7, "30days": 30, "90days": 90 };
      const days = daysMap[filters.dateRange as keyof typeof daysMap];
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      result = result.filter((t) => new Date(t.created_at) >= cutoff);
    }

    setFilteredTransactions(result);
  }, [filters, transactions]);

  useEffect(() => {
    if (supabase) {
      requestAnimationFrame(() => {
        void loadTransactions();
      });
    }
  }, [supabase, loadTransactions]);

  useEffect(() => {
    requestAnimationFrame(() => {
      applyFilters();
    });
  }, [filters, transactions, applyFilters]);

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    if (!confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) return;

    setDeletingId(id);

    const { error } = await supabase.from("transactions").delete().eq("id", id);

    if (error) {
      alert(`Gagal menghapus: ${error.message}`);
    } else {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }

    setDeletingId(null);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      type: "all",
      category: "all",
      urgency: "all",
      dateRange: "all",
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.type !== "all" ||
    filters.category !== "all" ||
    filters.urgency !== "all" ||
    filters.dateRange !== "all";

  return (
    <section className="rounded-3xl border border-slate-200/50 bg-white dark:border-slate-800/50 dark:bg-slate-900 p-6 shadow-sm transition-colors duration-300">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
            Riwayat Transaksi
          </span>
          <h2 className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Semua Transaksi
          </h2>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Lacak dan lihat semua transaksi keuangan usaha Anda.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition cursor-pointer ${
              showFilters || hasActiveFilters
                ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800"
            }`}
          >
            <Filter className="h-4 w-4" />
            Filter
            {hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white text-xs">
                !
              </span>
            )}
          </button>
          <button
            onClick={() => void loadTransactions()}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Refresh data"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6 rounded-2xl border border-slate-200/50 bg-slate-50/50 dark:border-slate-800/50 dark:bg-slate-950/40 p-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, search: e.target.value }))
                }
                className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
              />
            </div>

            {/* Type */}
            <select
              value={filters.type}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  type: e.target.value as FilterState["type"],
                }))
              }
              className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white outline-none transition focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">Semua Tipe</option>
              <option value="pemasukan">Pemasukan</option>
              <option value="pengeluaran">Pengeluaran</option>
            </select>

            {/* Category */}
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters((f) => ({ ...f, category: e.target.value }))
              }
              className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white outline-none transition focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Date Range */}
            <select
              value={filters.dateRange}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  dateRange: e.target.value as FilterState["dateRange"],
                }))
              }
              className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white outline-none transition focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">Semua Waktu</option>
              <option value="7days">7 Hari Terakhir</option>
              <option value="30days">30 Hari Terakhir</option>
              <option value="90days">90 Hari Terakhir</option>
            </select>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Menampilkan {filteredTransactions.length} dari{" "}
                {transactions.length} transaksi
              </p>
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/20 p-10">
          <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
          <span className="ml-3 text-sm text-slate-500 dark:text-slate-400">
            Memuat transaksi...
          </span>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="rounded-2xl border border-red-200/50 bg-red-50/40 dark:border-red-950/50 dark:bg-red-950/10 p-4 text-sm text-red-900 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredTransactions.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/20 p-10 text-center">
          <Calendar className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-600" />
          <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-400">
            {hasActiveFilters
              ? "Tidak ada transaksi yang cocok dengan filter"
              : "Belum ada transaksi"}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
            {hasActiveFilters
              ? "Coba ubah atau hapus filter Anda"
              : "Catat transaksi pertama Anda menggunakan Voice Ledger"}
          </p>
        </div>
      )}

      {/* Transaction List */}
      {!isLoading && !error && filteredTransactions.length > 0 && (
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="group relative rounded-2xl border border-slate-200/50 bg-white p-4 transition-colors duration-300 hover:border-slate-300 dark:border-slate-800/50 dark:bg-slate-900/50 dark:hover:border-slate-700"
            >
              <div className="flex items-start gap-4">
                {/* Type Icon */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    transaction.tipe_transaksi === "pemasukan"
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                  }`}
                >
                  {transaction.tipe_transaksi === "pemasukan" ? (
                    <ArrowUpCircle className="h-5 w-5" />
                  ) : (
                    <ArrowDownCircle className="h-5 w-5" />
                  )}
                </div>

                {/* Main Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                        typeColors[transaction.tipe_transaksi]
                      }`}
                    >
                      {transaction.tipe_transaksi}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                        urgencyColors[transaction.tingkat_urgensi]
                      }`}
                    >
                      {transaction.tingkat_urgensi}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {kelompokLabels[transaction.kelompok_keuangan]}
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                    {transaction.deskripsi || "Tanpa deskripsi"}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-indigo-600 dark:text-indigo-400">
                      {transaction.kategori}
                    </span>
                    <span>
                      {format(
                        new Date(transaction.created_at),
                        "dd MMM yyyy, HH:mm",
                        {
                          locale: id,
                        },
                      )}
                    </span>
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`text-base font-bold ${
                      transaction.tipe_transaksi === "pemasukan"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {transaction.tipe_transaksi === "pemasukan" ? "+" : "-"}
                    Rp{transaction.nominal.toLocaleString("id-ID")}
                  </span>

                  <button
                    onClick={() => void handleDelete(transaction.id)}
                    disabled={deletingId === transaction.id}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-slate-400 opacity-0 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 dark:hover:border-red-900 dark:hover:bg-red-950/20 dark:hover:text-red-400 disabled:opacity-50"
                    aria-label="Delete transaction"
                  >
                    {deletingId === transaction.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Footer */}
      {!isLoading && !error && filteredTransactions.length > 0 && (
        <div className="mt-6 rounded-2xl border border-slate-200/50 bg-slate-50/50 dark:border-slate-800/50 dark:bg-slate-950/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              Total {filteredTransactions.length} transaksi
            </span>
            <div className="flex gap-6">
              <div>
                <span className="text-slate-500 dark:text-slate-400">
                  Total Pemasukan:{" "}
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Rp
                  {filteredTransactions
                    .filter((t) => t.tipe_transaksi === "pemasukan")
                    .reduce((sum, t) => sum + t.nominal, 0)
                    .toLocaleString("id-ID")}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">
                  Total Pengeluaran:{" "}
                </span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  Rp
                  {filteredTransactions
                    .filter((t) => t.tipe_transaksi === "pengeluaran")
                    .reduce((sum, t) => sum + t.nominal, 0)
                    .toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
