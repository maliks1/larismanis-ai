"use client";

import { useEffect, useState } from "react";
import { Activity, RefreshCw, WifiOff } from "lucide-react";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import {
  calculateFinancialMetrics,
  formatMetricValue,
} from "@/lib/financial-metrics";
import type { Database } from "@/types/database.types";

type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];

type MetricCardProps = {
  label: string;
  value: string;
  hint: string;
};

function MetricCard({ label, value, hint }: MetricCardProps) {
  return (
    <article className="rounded-2xl border border-slate-250/50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-5 transition-colors duration-300">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        {value}
      </p>
      <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        {hint}
      </p>
    </article>
  );
}

export function DashboardStats() {
  const supabase = getBrowserSupabaseClient();
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(supabase));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const configError = supabase
    ? null
    : "Supabase belum dikonfigurasi. Silakan lengkapi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di .env.local.";

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let active = true;

    const loadTransactions = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      const { data, error } = await supabase
        .from("transactions")
        .select("id, nominal, kelompok_keuangan, created_at")
        .order("created_at", { ascending: false })
        .limit(200);

      if (!active) {
        return;
      }

      if (error) {
        setErrorMessage(error.message);
        setTransactions([]);
      } else {
        setTransactions((data ?? []) as TransactionRow[]);
        setLastUpdated(new Date().toLocaleTimeString("id-ID"));
      }

      setIsLoading(false);
    };

    void loadTransactions();

    const channel = supabase
      .channel("transactions-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        () => {
          void loadTransactions();
        },
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [supabase]);

  const metrics = calculateFinancialMetrics(transactions);

  const liquidityHint =
    metrics.currentRatio === null
      ? "Belum ada aset lancar dan kewajiban jangka pendek yang terbaca."
      : metrics.currentRatio === Number.POSITIVE_INFINITY
        ? "Tidak ada kewajiban jangka pendek yang terdeteksi."
        : "Dihitung dari aset lancar dibanding kewajiban jangka pendek.";

  const marginValue =
    metrics.netProfitMargin === null
      ? "--"
      : `${formatMetricValue(metrics.netProfitMargin)}%`;

  const riskActive = metrics.liquidityAlert || metrics.marginAlert;

  return (
    <section className="rounded-3xl border border-slate-200/50 bg-white dark:border-slate-800/50 dark:bg-slate-900 p-6 shadow-sm transition-colors duration-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
            Realtime Dashboard
          </span>
          <h2 className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Analisis Likuiditas & Margin Laba
          </h2>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400 max-w-2xl">
            Nilai ini dikalkulasi secara realtime dari tabel transaksi Supabase saat terjadi penambahan data keuangan baru.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-4 py-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
          {lastUpdated ? `Tersinkron ${lastUpdated}` : "Menunggu Data"}
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <MetricCard
          label="Current Ratio (Rasio Lancar)"
          value={formatMetricValue(metrics.currentRatio)}
          hint={liquidityHint}
        />
        <MetricCard
          label="Net Profit Margin (Margin Laba Bersih)"
          value={marginValue}
          hint="Dihitung dari (Pendapatan - Beban Operasional) dibagi total Pendapatan."
        />
      </div>

      {/* Secondary Metrics Grid */}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-250/50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-5 transition-colors duration-300">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Transaksi Terbaca
          </p>
          <p className="mt-2.5 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {transactions.length}
          </p>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {isLoading
              ? "Menyegarkan data dari database..."
              : "Jumlah transaksi terdaftar yang terintegrasi di sistem Supabase."}
          </p>
        </div>

        <div
          className={`rounded-2xl border p-5 transition-colors duration-300 ${
            riskActive
              ? "border-amber-200 dark:border-amber-950 bg-amber-50/30 dark:bg-amber-950/10 text-amber-900 dark:text-amber-300"
              : "border-emerald-200 dark:border-emerald-950 bg-emerald-50/30 dark:bg-emerald-950/10 text-emerald-900 dark:text-emerald-350"
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${riskActive ? "bg-amber-500 animate-ping" : "bg-emerald-500"}`} />
            {riskActive ? "Siaga Risiko Keuangan" : "Kondisi Aman"}
          </p>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed">
            {metrics.liquidityAlert
              ? "Rasio lancar berada di bawah ambang sehat (1.0). Pastikan likuiditas modal lancar Anda terjaga."
              : metrics.marginAlert
                ? "Margin laba bersih bernilai negatif karena biaya operasional lebih tinggi dari pemasukan."
                : "Rasio dan margin saat ini berada pada tingkatan sehat berdasarkan kalkulasi transaksi terakhir."}
          </p>
        </div>
      </div>

      {configError ? (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-amber-200/50 bg-amber-50/40 dark:border-amber-950/50 dark:bg-amber-950/10 p-4 text-xs sm:text-sm text-amber-900 dark:text-amber-400">
          <WifiOff className="h-4 w-4 shrink-0 text-amber-500" />
          <span>{configError}</span>
        </div>
      ) : errorMessage ? (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-red-200/50 bg-red-50/40 dark:border-red-950/50 dark:bg-red-950/10 p-4 text-xs sm:text-sm text-red-900 dark:text-red-400">
          <WifiOff className="h-4 w-4 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      {isLoading ? (
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-slate-200/50 bg-slate-50/40 dark:border-slate-800/50 dark:bg-slate-950/20 p-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin text-indigo-500" />
          <span>Menyinkronkan data database Supabase...</span>
        </div>
      ) : null}

      {/* Detailed Table Grid */}
      <div className="mt-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 p-5 transition-colors duration-300">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Rincian Nominal Kas Usaha
        </p>
        <div className="mt-4 grid gap-4 text-xs sm:text-sm text-slate-600 dark:text-slate-350 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white dark:bg-slate-900 p-3.5 border border-slate-200/30 dark:border-slate-800/30">
            <p className="text-slate-400 font-medium">Aset Lancar</p>
            <p className="mt-1 text-sm sm:text-base font-extrabold text-slate-950 dark:text-white">
              Rp{metrics.assetTotal.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-900 p-3.5 border border-slate-200/30 dark:border-slate-800/30">
            <p className="text-slate-400 font-medium">Kewajiban Jangka Pendek</p>
            <p className="mt-1 text-sm sm:text-base font-extrabold text-slate-950 dark:text-white">
              Rp{metrics.liabilityTotal.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-900 p-3.5 border border-slate-200/30 dark:border-slate-800/30">
            <p className="text-slate-400 font-medium">Total Pendapatan</p>
            <p className="mt-1 text-sm sm:text-base font-extrabold text-slate-950 dark:text-white">
              Rp{metrics.revenueTotal.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-900 p-3.5 border border-slate-200/30 dark:border-slate-800/30">
            <p className="text-slate-400 font-medium">Beban Operasional</p>
            <p className="mt-1 text-sm sm:text-base font-extrabold text-slate-950 dark:text-white">
              Rp{metrics.expenseTotal.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

