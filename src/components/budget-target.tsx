"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import {
  PieChart as PieChartIcon,
  BarChart3,
  RefreshCw,
  Target as TargetIcon,
  Plus,
  Minus,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];

type BudgetTarget = {
  id: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  period: "monthly" | "quarterly" | "yearly";
  startDate: string;
  createdAt: string;
};

export function BudgetTarget() {
  const supabase = createClient();
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [budgetTargets, setBudgetTargets] = useState<BudgetTarget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTarget, setNewTarget] = useState({
    category: "",
    targetAmount: 0,
    period: "monthly" as "monthly" | "quarterly" | "yearly",
  });
  const [isAdding, setIsAdding] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      // Load transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (transactionsError) throw transactionsError;

      // Load budget targets
      const { data: targetsData, error: targetsError } = await supabase
        .from("budget_targets")
        .select("*")
        .order("created_at", { ascending: false });

      if (targetsError) throw targetsError;

      return {
        transactions: (transactionsData as TransactionRow[]) ?? [],
        budgetTargets: (targetsData as BudgetTarget[]) ?? []
      };
    } catch (err) {
      throw err instanceof Error ? err : new Error("Gagal memuat data");
    }
  }, [supabase]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { transactions, budgetTargets } = await fetchData();
        setTransactions(transactions);
        setBudgetTargets(budgetTargets);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat data");
      } finally {
        setIsLoading(false);
      }
    };

    void loadData();
  }, [fetchData]);

  const calculateCurrentAmount = useCallback((category: string, period: "monthly" | "quarterly" | "yearly") => {
    const now = new Date();
    const periodStart = new Date(now);

    // Calculate start date based on period
    if (period === "monthly") {
      periodStart.setDate(1);
    } else if (period === "quarterly") {
      const quarter = Math.floor(now.getMonth() / 3);
      periodStart.setMonth(quarter * 3);
      periodStart.setDate(1);
    } else if (period === "yearly") {
      periodStart.setMonth(0);
      periodStart.setDate(1);
    }

    // Calculate current amount for the given category and period
    const transactionsInPeriod = transactions.filter((t) => {
      const transactionDate = new Date(t.created_at);
      return (
        t.kategori === category &&
        t.tipe_transaksi === "pengeluaran" &&
        transactionDate >= periodStart &&
        transactionDate <= now
      );
    });

    return transactionsInPeriod.reduce((sum, t) => sum + t.nominal, 0);
  }, [transactions]);

  const currentAmount = useMemo(() => {
    return newTarget.category ? calculateCurrentAmount(newTarget.category, newTarget.period) : 0;
  }, [newTarget.category, newTarget.period, calculateCurrentAmount]);

  const handleAddTarget = async () => {
    if (!newTarget.category || newTarget.targetAmount <= 0) return;

    setIsAdding(true);
    try {
      const now = new Date();
      const periodStart = new Date(now);

      // Calculate start date based on period
      if (newTarget.period === "monthly") {
        periodStart.setDate(1);
      } else if (newTarget.period === "quarterly") {
        const quarter = Math.floor(now.getMonth() / 3);
        periodStart.setMonth(quarter * 3);
        periodStart.setDate(1);
      } else if (newTarget.period === "yearly") {
        periodStart.setMonth(0);
        periodStart.setDate(1);
      }

      const { error } = await supabase.from("budget_targets").insert({
        category: newTarget.category,
        target_amount: newTarget.targetAmount,
        current_amount: currentAmount,
        period: newTarget.period,
        start_date: periodStart.toISOString(),
      });

      if (error) throw error;

      // Reset form
      setNewTarget({
        category: "",
        targetAmount: 0,
        period: "monthly",
      });

      // Reload data
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambahkan target");
    } finally {
      setIsAdding(false);
    }
  };

  const getUniqueCategories = () => {
    return Array.from(
      new Set(transactions.filter((t) => t.tipe_transaksi === "pengeluaran").map((t) => t.kategori)),
    ).sort();
  };

  const categories = getUniqueCategories();

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 80) return "bg-amber-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-emerald-500";
  };

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/20 p-10 text-center">
        <RefreshCw className="mx-auto h-6 w-6 animate-spin text-indigo-500" />
        <span className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Memuat data budget...
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
              Budget & Target
            </span>
            <h2 className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Pengelolaan Budget
            </h2>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Tetapkan dan pantau target pengeluaran untuk setiap kategori.
            </p>
          </div>
        </div>

        {/* Add New Target Form */}
        <div className="mt-6 rounded-2xl border border-slate-200/50 bg-slate-50/50 dark:border-slate-800/50 dark:bg-slate-950/40 p-5">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Tambah Target Budget
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                Kategori
              </label>
              <select
                value={newTarget.category}
                onChange={(e) => setNewTarget({ ...newTarget, category: e.target.value })}
                className="mt-1 block h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white outline-none transition focus:border-indigo-500 cursor-pointer"
              >
                <option value="">Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Amount */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                Target (Rp)
              </label>
              <input
                type="number"
                value={newTarget.targetAmount}
                onChange={(e) => setNewTarget({ ...newTarget, targetAmount: Number(e.target.value) })}
                className="mt-1 block h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white outline-none transition focus:border-indigo-500"
                placeholder="0"
              />
            </div>

            {/* Period */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                Periode
              </label>
              <select
                value={newTarget.period}
                onChange={(e) => setNewTarget({ ...newTarget, period: e.target.value as "monthly" | "quarterly" | "yearly" })}
                className="mt-1 block h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white outline-none transition focus:border-indigo-500 cursor-pointer"
              >
                <option value="monthly">Bulanan</option>
                <option value="quarterly">Triwulanan</option>
                <option value="yearly">Tahunan</option>
              </select>
            </div>

            {/* Current Amount */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                Saat Ini (Rp)
              </label>
              <div className="mt-1 flex h-10 w-full items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white">
                Rp{currentAmount.toLocaleString("id-ID")}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              onClick={handleAddTarget}
              disabled={!newTarget.category || newTarget.targetAmount <= 0 || isAdding}
              className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition cursor-pointer ${
                !newTarget.category || newTarget.targetAmount <= 0 || isAdding
                  ? "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {isAdding ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Tambah Target
            </button>
          </div>
        </div>
      </div>

      {/* Budget Targets List */}
      {budgetTargets.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/20 p-10 text-center">
          <TargetIcon className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-600" />
          <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-400">
            Belum ada target budget
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
            Tambahkan target budget untuk memulai pemantauan
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgetTargets.map((target) => {
            const currentAmount = calculateCurrentAmount(target.category, target.period);
            const percentage = (currentAmount / target.targetAmount) * 100;
            const progressColor = getProgressColor(percentage);
            const isOverBudget = percentage >= 100;

            return (
              <div
                key={target.id}
                className="rounded-2xl border border-slate-200/50 bg-white p-5 dark:border-slate-800/50 dark:bg-slate-900 transition-colors duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                      {target.category}
                    </p>
                    <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                      Rp{currentAmount.toLocaleString("id-ID")}
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {" / Rp"}
                        {target.targetAmount.toLocaleString("id-ID")}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {target.period === "monthly" && "Target Bulanan"}
                      {target.period === "quarterly" && "Target Triwulanan"}
                      {target.period === "yearly" && "Target Tahunan"}
                    </p>
                  </div>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      isOverBudget
                        ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                        : "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                    }`}
                  >
                    <TargetIcon className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      {percentage.toFixed(1)}%
                    </span>
                    {isOverBudget && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400">
                        <AlertCircle className="h-3 w-3" />
                        Melebihi Budget
                      </span>
                    )}
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      className={`h-2 rounded-full ${progressColor}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    {new Date(target.startDate).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span
                    className={`font-semibold ${
                      isOverBudget
                        ? "text-red-600 dark:text-red-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {isOverBudget ? (
                      <>
                        <Minus className="inline h-3 w-3" /> Rp
                        {(currentAmount - target.targetAmount).toLocaleString("id-ID")}{" "}
                        melebihi
                      </>
                    ) : (
                      <>
                        <Plus className="inline h-3 w-3" /> Rp
                        {(target.targetAmount - currentAmount).toLocaleString("id-ID")}{" "}
                        tersisa
                      </>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Visualizations */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Budget Distribution */}
        <div className="rounded-3xl border border-slate-200/50 bg-white dark:border-slate-800/50 dark:bg-slate-900 p-6 shadow-sm transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                Distribusi Budget
              </span>
              <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                Proporsi Budget per Kategori
              </h3>
            </div>
            <PieChartIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>

          {budgetTargets.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/20 p-6 text-center">
              <PieChartIcon className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-600" />
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Tidak ada data budget untuk ditampilkan
              </p>
            </div>
          ) : (
            <div className="mt-6 h-64">
              {/* Pie chart placeholder */}
              <div className="flex h-full items-center justify-center">
                <div className="relative h-48 w-48">
                  {budgetTargets.map((target, index) => {
                    const percentage = (target.targetAmount / budgetTargets.reduce((sum, t) => sum + t.targetAmount, 0)) * 100;
                    return (
                      <div
                        key={target.id}
                        className="absolute h-24 w-24 origin-center rounded-full"
                        style={{
                          transform: `rotate(${index * (360 / budgetTargets.length)}deg)`,
                        }}
                      >
                        <div
                          className="h-full w-12 origin-right rounded-full"
                          style={{
                            backgroundColor: `hsl(${index * (360 / budgetTargets.length)}, 70%, 60%)`,
                            transform: `rotate(${percentage * 3.6}deg)`,
                          }}
                        />
                      </div>
                    );
                  })}
                  <div className="absolute inset-12 flex items-center justify-center rounded-full bg-white dark:bg-slate-900">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Total: Rp{budgetTargets.reduce((sum, t) => sum + t.targetAmount, 0).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Budget Progress */}
        <div className="rounded-3xl border border-slate-200/50 bg-white dark:border-slate-800/50 dark:bg-slate-900 p-6 shadow-sm transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                Progress Budget
              </span>
              <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                Perbandingan Budget vs Realisasi
              </h3>
            </div>
            <BarChart3 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>

          {budgetTargets.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/20 p-6 text-center">
              <BarChart3 className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-600" />
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Tidak ada data budget untuk ditampilkan
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {budgetTargets.map((target) => {
                const currentAmount = calculateCurrentAmount(target.category, target.period);
                const percentage = (currentAmount / target.targetAmount) * 100;
                const progressColor = getProgressColor(percentage);

                return (
                  <div key={target.id} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-600 dark:text-slate-400">
                        {target.category}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-4 w-full rounded-full bg-slate-200 dark:bg-slate-800">
                      <div
                        className={`h-4 rounded-full ${progressColor}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">
                        Rp{currentAmount.toLocaleString("id-ID")}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        Rp{target.targetAmount.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}