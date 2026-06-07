"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Target,
  Plus,
  Edit3,
  Trash2,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
} from "lucide-react";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import type { Database } from "@/types/database.types";

type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];

type Budget = {
  id: string;
  kategori: string;
  tipe_transaksi: "pemasukan" | "pengeluaran";
  target_nominal: number;
  periode_bulan: string; // e.g., "2026-06"
  created_at: string;
};

type BudgetFormData = {
  kategori: string;
  tipe_transaksi: "pemasukan" | "pengeluaran";
  target_nominal: number;
  periode_bulan: string;
};

const DEFAULT_CATEGORIES = [
  "Penjualan",
  "Jasa",
  "Modal",
  "Gaji",
  "Bahan Baku",
  "Listrik",
  "Air",
  "Internet",
  "Sewa",
  "Transportasi",
  "Marketing",
  "perlengkapan",
  "Restock",
  "Lainnya",
];

export function BudgetTarget() {
  const supabase = getBrowserSupabaseClient();
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(supabase));
  const [error, setError] = useState<string | null>(supabase ? null : "Supabase tidak terkonfigurasi");
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState<BudgetFormData>({
    kategori: "",
    tipe_transaksi: "pengeluaran",
    target_nominal: 0,
    periode_bulan: format(new Date(), "yyyy-MM"),
  });

  // Get unique categories from transactions
  const transactionCategories = Array.from(
    new Set(transactions.map((t) => t.kategori)),
  ).sort();

  const allCategories = Array.from(
    new Set([...DEFAULT_CATEGORIES, ...transactionCategories]),
  ).sort();

  const loadTransactions = useCallback(async () => {
    if (!supabase) return;

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setTransactions((data as TransactionRow[]) ?? []);
    }
  }, [supabase]);

  const loadBudgets = useCallback(async () => {
    if (!supabase) return;

    const { data, error } = await supabase
      .from("budgets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      // Table might not exist yet
      console.log("Budgets table error:", error);
      setBudgets([]);
    } else {
      setBudgets((data as Budget[]) ?? []);
    }
  }, [supabase]);

  useEffect(() => {
    if (supabase) {
      requestAnimationFrame(() => {
        setIsLoading(true);
        void Promise.all([loadTransactions(), loadBudgets()]).finally(() => {
          setIsLoading(false);
        });
      });
    }
  }, [supabase, loadTransactions, loadBudgets]);

  const saveBudget = async () => {
    if (!supabase || !formData.kategori || formData.target_nominal <= 0) {
      alert("Mohon lengkapi semua field dengan benar");
      return;
    }

    const payload = {
      kategori: formData.kategori,
      tipe_transaksi: formData.tipe_transaksi,
      target_nominal: formData.target_nominal,
      periode_bulan: formData.periode_bulan,
    };

    let result;
    if (editingBudget) {
      result = await supabase
        .from("budgets")
        .update(payload)
        .eq("id", editingBudget.id);
    } else {
      result = await supabase.from("budgets").insert(payload);
    }

    if (result.error) {
      alert(`Gagal menyimpan budget: ${result.error.message}`);
    } else {
      void loadBudgets();
      resetForm();
    }
  };

  const deleteBudget = async (id: string) => {
    if (!supabase) return;
    if (!confirm("Apakah Anda yakin ingin menghapus target budget ini?"))
      return;

    const { error } = await supabase.from("budgets").delete().eq("id", id);

    if (error) {
      alert(`Gagal menghapus budget: ${error.message}`);
    } else {
      setBudgets((prev) => prev.filter((b) => b.id !== id));
    }
  };

  const startEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      kategori: budget.kategori,
      tipe_transaksi: budget.tipe_transaksi,
      target_nominal: budget.target_nominal,
      periode_bulan: budget.periode_bulan,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingBudget(null);
    setFormData({
      kategori: "",
      tipe_transaksi: "pengeluaran",
      target_nominal: 0,
      periode_bulan: format(new Date(), "yyyy-MM"),
    });
  };

  // Calculate actual spending for a budget
  const getActualSpent = (budget: Budget): number => {
    const [year, month] = budget.periode_bulan.split("-");
    return transactions
      .filter(
        (t) =>
          t.kategori === budget.kategori &&
          t.tipe_transaksi === budget.tipe_transaksi &&
          format(new Date(t.created_at), "yyyy-MM") === `${year}-${month}`,
      )
      .reduce((sum, t) => sum + t.nominal, 0);
  };

  // Get budget progress
  const getBudgetProgress = (budget: Budget) => {
    const actual = getActualSpent(budget);
    const percentage = (actual / budget.target_nominal) * 100;
    return {
      actual,
      percentage: Math.min(percentage, 100),
      isOverBudget: actual > budget.target_nominal,
    };
  };

  // Current month budgets
  const currentMonthBudgets = budgets.filter(
    (b) => b.periode_bulan === format(new Date(), "yyyy-MM"),
  );

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-slate-200/50 bg-white dark:border-slate-800/50 dark:bg-slate-900 p-6 shadow-sm transition-colors duration-300">
        <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/20 p-10">
          <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
          <span className="ml-3 text-sm text-slate-500 dark:text-slate-400">
            Memuat budget...
          </span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-3xl border border-red-200/50 bg-red-50/40 dark:border-red-950/50 dark:bg-red-950/10 p-4 text-sm text-red-900 dark:text-red-400">
        {error}
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200/50 bg-white dark:border-slate-800/50 dark:bg-slate-900 p-6 shadow-sm transition-colors duration-300">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
              Budget & Target
            </span>
            <h2 className="mt-1 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Rencana Budget Bulanan
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Tetapkan target pengeluaran dan pemasukan per kategori per bulan.
            </p>
          </div>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-500 transition dark:shadow-none cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Tambah Budget
          </button>
        )}
      </div>

      {/* Budget Form */}
      {showForm && (
        <div className="mb-6 rounded-2xl border border-indigo-200/50 bg-indigo-50/50 dark:border-indigo-900/50 dark:bg-indigo-950/20 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {editingBudget ? "Edit Budget" : "Budget Baru"}
            </h3>
            <button
              onClick={resetForm}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                Tipe Transaksi
              </label>
              <select
                value={formData.tipe_transaksi}
                onChange={(e) =>
                  setFormData((f) => ({
                    ...f,
                    tipe_transaksi: e.target.value as
                      | "pemasukan"
                      | "pengeluaran",
                  }))
                }
                className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white outline-none transition focus:border-indigo-500 cursor-pointer"
              >
                <option value="pengeluaran">Pengeluaran</option>
                <option value="pemasukan">Pemasukan</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                Kategori
              </label>
              <select
                value={formData.kategori}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, kategori: e.target.value }))
                }
                className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white outline-none transition focus:border-indigo-500 cursor-pointer"
              >
                <option value="">Pilih Kategori</option>
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                Target Nominal (Rp)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.target_nominal || ""}
                onChange={(e) =>
                  setFormData((f) => ({
                    ...f,
                    target_nominal: parseInt(e.target.value) || 0,
                  }))
                }
                placeholder="1000000"
                className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white outline-none transition focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                Periode Bulan
              </label>
              <input
                type="month"
                value={formData.periode_bulan}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, periode_bulan: e.target.value }))
                }
                className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white outline-none transition focus:border-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={saveBudget}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-500 transition cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              {editingBudget ? "Simpan Perubahan" : "Simpan Budget"}
            </button>
            <button
              onClick={resetForm}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 text-sm font-semibold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Budget List */}
      {currentMonthBudgets.length === 0 && !showForm ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/20 p-10 text-center">
          <Target className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-600" />
          <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-400">
            Belum Ada Budget untuk Bulan Ini
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
            Tambahkan target budget untuk mulai perencanaan keuangan
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentMonthBudgets.map((budget) => {
            const progress = getBudgetProgress(budget);
            const isIncome = budget.tipe_transaksi === "pemasukan";

            return (
              <div
                key={budget.id}
                className="group relative rounded-2xl border border-slate-200/50 bg-white p-4 transition-colors duration-300 hover:border-slate-300 dark:border-slate-800/50 dark:bg-slate-900/50 dark:hover:border-slate-700"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      isIncome
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                    }`}
                  >
                    {isIncome ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : (
                      <TrendingDown className="h-5 w-5" />
                    )}
                  </div>

                  {/* Main Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                          isIncome
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                        }`}
                      >
                        {budget.tipe_transaksi}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {format(
                          new Date(budget.periode_bulan + "-01"),
                          "MMMM yyyy",
                          {
                            locale: id,
                          },
                        )}
                      </span>
                    </div>

                    <p className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                      {budget.kategori}
                    </p>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-500 dark:text-slate-400">
                          Rp{progress.actual.toLocaleString("id-ID")} dari Rp
                          {budget.target_nominal.toLocaleString("id-ID")}
                        </span>
                        <span
                          className={`font-semibold ${progress.isOverBudget ? "text-rose-600 dark:text-rose-400" : "text-slate-600 dark:text-slate-400"}`}
                        >
                          {progress.percentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            progress.isOverBudget
                              ? "bg-rose-500"
                              : progress.percentage >= 80
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                          }`}
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Status Message */}
                    <div className="mt-2 flex items-center gap-1.5 text-xs">
                      {progress.isOverBudget ? (
                        <>
                          <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                          <span className="text-rose-600 dark:text-rose-400">
                            Melebihi target{" "}
                            {isIncome
                              ? "(+Rp" +
                                (
                                  progress.actual - budget.target_nominal
                                ).toLocaleString("id-ID") +
                                ")"
                              : "(+Rp" +
                                (
                                  progress.actual - budget.target_nominal
                                ).toLocaleString("id-ID") +
                                ")"}
                          </span>
                        </>
                      ) : progress.percentage >= 80 ? (
                        <>
                          <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                          <span className="text-amber-600 dark:text-amber-400">
                            Hampir mencapai target
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">
                            On track
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => startEdit(budget)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-slate-400 opacity-0 transition hover:border-slate-200 hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300 cursor-pointer"
                      aria-label="Edit budget"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => void deleteBudget(budget.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-slate-400 opacity-0 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 dark:hover:border-red-900 dark:hover:bg-red-950/20 dark:hover:text-red-400 cursor-pointer"
                      aria-label="Delete budget"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Box */}
      {currentMonthBudgets.length > 0 && (
        <div className="mt-6 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/40 px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
          <strong>Tips:</strong> Budget membantu Anda merencanakan dan
          mengontrol keuangan usaha. Target yang terlalu ketat dapat sulit
          dicapai, sementara target yang terlalu longgar tidak memberikan
          tantangan. Sesuaikan dengan kondisi bisnis Anda.
        </div>
      )}
    </section>
  );
}
