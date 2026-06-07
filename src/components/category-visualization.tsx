"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, PieChart as PieChartIcon, BarChart3, RefreshCw } from "lucide-react";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import type { Database } from "@/types/database.types";

type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];

// Color palette for charts - using indigo/violet theme
const CHART_COLORS = [
  "#4f46e5", // Indigo 600
  "#6366f1", // Indigo 500
  "#818cf8", // Indigo 400
  "#a5b4fc", // Indigo 300
  "#7c3aed", // Violet 600
  "#8b5cf6", // Violet 500
  "#a78bfa", // Violet 400
  "#c4b5fd", // Violet 300
  "#0ea5e9", // Sky 500
  "#38bdf8", // Sky 400
  "#22d3ee", // Cyan 400
  "#06b6d4", // Cyan 500
];

const TYPE_COLORS = {
  pemasukan: "#10b981", // Emerald 500
  pengeluaran: "#f43f5e", // Rose 500
};

type ChartData = {
  name: string;
  value: number;
  color: string;
};

// Custom tooltip for charts
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }> }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-lg dark:border-slate-800 dark:bg-slate-900/95">
        <p className="text-xs font-semibold text-slate-900 dark:text-white">{payload[0].name}</p>
        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
          Rp{payload[0].value.toLocaleString("id-ID")}
        </p>
      </div>
    );
  }
  return null;
};

export function CategoryVisualization() {
  const supabase = getBrowserSupabaseClient();
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(supabase));
  const [error, setError] = useState<string | null>(supabase ? null : "Supabase tidak terkonfigurasi");

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

  useEffect(() => {
    if (supabase) {
      requestAnimationFrame(() => {
        void loadTransactions();
      });
    }
  }, [supabase, loadTransactions]);

  // Calculate category breakdown for income
  const getCategoryIncomeData = (): ChartData[] => {
    const incomeByCategory = transactions
      .filter((t) => t.tipe_transaksi === "pemasukan")
      .reduce((acc, t) => {
        acc[t.kategori] = (acc[t.kategori] || 0) + t.nominal;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(incomeByCategory)
      .map(([name, value], index) => ({
        name,
        value,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  };

  // Calculate category breakdown for expense
  const getCategoryExpenseData = (): ChartData[] => {
    const expenseByCategory = transactions
      .filter((t) => t.tipe_transaksi === "pengeluaran")
      .reduce((acc, t) => {
        acc[t.kategori] = (acc[t.kategori] || 0) + t.nominal;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(expenseByCategory)
      .map(([name, value], index) => ({
        name,
        value,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  };

  // Get monthly trend data
  const getMonthlyTrendData = () => {
    const monthlyData: Record<string, { bulan: string; pemasukan: number; pengeluaran: number }> = {};

    transactions.forEach((t) => {
      const date = new Date(t.created_at);
      const monthKey = format(date, "yyyy-MM");
      const monthLabel = format(date, "MMM yyyy", { locale: id });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { bulan: monthLabel, pemasukan: 0, pengeluaran: 0 };
      }

      if (t.tipe_transaksi === "pemasukan") {
        monthlyData[monthKey].pemasukan += t.nominal;
      } else {
        monthlyData[monthKey].pengeluaran += t.nominal;
      }
    });

    return Object.values(monthlyData).slice(-6); // Last 6 months
  };

  // Combined totals for summary
  const totalIncome = transactions
    .filter((t) => t.tipe_transaksi === "pemasukan")
    .reduce((sum, t) => sum + t.nominal, 0);

  const totalExpense = transactions
    .filter((t) => t.tipe_transaksi === "pengeluaran")
    .reduce((sum, t) => sum + t.nominal, 0);

  const netBalance = totalIncome - totalExpense;



  if (isLoading) {
    return (
      <section className="rounded-3xl border border-slate-200/50 bg-white dark:border-slate-800/50 dark:bg-slate-900 p-6 shadow-sm transition-colors duration-300">
        <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/20 p-10">
          <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
          <span className="ml-3 text-sm text-slate-500 dark:text-slate-400">
            Memuat visualisasi...
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

  if (transactions.length === 0) {
    return (
      <section className="rounded-3xl border border-slate-200/50 bg-white dark:border-slate-800/50 dark:bg-slate-900 p-6 shadow-sm transition-colors duration-300">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/20 p-10 text-center">
          <PieChartIcon className="h-12 w-12 text-slate-400 dark:text-slate-600" />
          <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-400">
            Belum Ada Data untuk Divisualisasikan
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
            Catat transaksi menggunakan Voice Ledger untuk melihat grafik kategori
          </p>
        </div>
      </section>
    );
  }

  const incomeData = getCategoryIncomeData();
  const expenseData = getCategoryExpenseData();
  const trendData = getMonthlyTrendData();

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Visualisasi Kategori
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Analisis breakdown transaksi berdasarkan kategori dan tren waktu.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-200/50 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Total Pemasukan
          </p>
          <p className="mt-2 text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            Rp{totalIncome.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="rounded-2xl border border-rose-200/50 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/20 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Total Pengeluaran
          </p>
          <p className="mt-2 text-xl sm:text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            Rp{totalExpense.toLocaleString("id-ID")}
          </p>
        </div>
        <div className={`rounded-2xl border p-5 ${netBalance >= 0 ? "border-emerald-200/50 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20" : "border-rose-200/50 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/20"}`}>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Saldo Bersih
          </p>
          <p className={`mt-2 text-xl sm:text-2xl font-extrabold ${netBalance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
            {netBalance >= 0 ? "+" : "-"}Rp{Math.abs(netBalance).toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Income Pie Chart */}
        <div className="rounded-3xl border border-slate-200/50 bg-white dark:border-slate-800/50 dark:bg-slate-900 p-6 shadow-sm transition-colors duration-300">
          <div className="mb-4 flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Breakdown Pemasukan per Kategori
            </h3>
          </div>
          {incomeData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {incomeData.map((entry, index) => (
                      <Cell key={`income-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: "12px" }}
                    formatter={(value) => (
                      <span className="text-slate-600 dark:text-slate-400">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
              Tidak ada data pemasukan
            </div>
          )}
        </div>

        {/* Expense Pie Chart */}
        <div className="rounded-3xl border border-slate-200/50 bg-white dark:border-slate-800/50 dark:bg-slate-900 p-6 shadow-sm transition-colors duration-300">
          <div className="mb-4 flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Breakdown Pengeluaran per Kategori
            </h3>
          </div>
          {expenseData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`expense-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: "12px" }}
                    formatter={(value) => (
                      <span className="text-slate-600 dark:text-slate-400">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
              Tidak ada data pengeluaran
            </div>
          )}
        </div>

        {/* Monthly Trend Bar Chart */}
        <div className="rounded-3xl border border-slate-200/50 bg-white dark:border-slate-800/50 dark:bg-slate-900 p-6 shadow-sm transition-colors duration-300 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Tren Pemasukan vs Pengeluaran (6 Bulan Terakhir)
            </h3>
          </div>
          {trendData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} barGap={8}>
                  <XAxis
                    dataKey="bulan"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: "#e2e8f0" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickFormatter={(value) =>
                      value >= 1000000
                        ? `${(value / 1000000).toFixed(1)}jt`
                        : value >= 1000
                          ? `${(value / 1000).toFixed(0)}rb`
                          : value.toString()
                    }
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: "12px" }}
                    formatter={(value) => (
                      <span className="text-slate-600 dark:text-slate-400">{value}</span>
                    )}
                  />
                  <Bar
                    dataKey="pemasukan"
                    name="Pemasukan"
                    fill={TYPE_COLORS.pemasukan}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="pengeluaran"
                    name="Pengeluaran"
                    fill={TYPE_COLORS.pengeluaran}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
              Tidak ada data tren
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
