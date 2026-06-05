"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, RefreshCw, WifiOff } from "lucide-react";
import { createSupabaseClient } from "@/lib/supabase";
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
    <article className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-sm leading-6 text-slate-600">{hint}</p>
    </article>
  );
}

export function DashboardStats() {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(supabase));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const configError = supabase
    ? null
    : "Supabase belum dikonfigurasi. Lengkapi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY.";

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
        ? "Tidak ada kewajiban jangka pendek yang terbaca."
        : "Dihitung dari aset lancar dibanding kewajiban jangka pendek.";

  const marginValue =
    metrics.netProfitMargin === null
      ? "--"
      : `${formatMetricValue(metrics.netProfitMargin)}%`;

  const riskActive = metrics.liquidityAlert || metrics.marginAlert;

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">
            Realtime dashboard
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            Rasio lancar dan margin laba bersih
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Nilai dihitung dari transaksi Supabase dan akan diperbarui saat ada insert,
            update, atau delete di tabel transactions.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
          <Activity className="h-4 w-4 text-emerald-600" />
          {lastUpdated ? `Sinkron ${lastUpdated}` : "Menunggu sinkronisasi"}
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <MetricCard
          label="Current Ratio"
          value={formatMetricValue(metrics.currentRatio)}
          hint={liquidityHint}
        />
        <MetricCard
          label="Net Profit Margin"
          value={marginValue}
          hint="Dihitung dari pendapatan dikurangi beban operasional, lalu dibagi pendapatan."
        />
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Total transaksi terbaca
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {transactions.length}
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {isLoading
              ? "Menyegarkan data dari Supabase..."
              : "Data ini menjadi basis kalkulasi dashboard realtime."}
          </p>
        </div>

        <div
          className={`rounded-3xl border p-4 ${riskActive ? "border-amber-300 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}
        >
          <p
            className={`text-sm font-semibold ${riskActive ? "text-amber-900" : "text-emerald-900"}`}
          >
            {riskActive ? "Siaga Dampak Ekonomi" : "Kondisi aman"}
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-700">
            {metrics.liquidityAlert
              ? "Rasio lancar berada di bawah 1.0, jadi likuiditas perlu dipantau."
              : metrics.marginAlert
                ? "Margin laba bersih negatif, artinya beban operasional melebihi pendapatan."
                : "Rasio dan margin masih berada pada zona yang lebih sehat berdasarkan data terakhir."}
          </p>
        </div>
      </div>

      {configError ? (
        <div className="mt-3 flex items-center gap-3 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>{configError}</span>
        </div>
      ) : errorMessage ? (
        <div className="mt-3 flex items-center gap-3 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      {isLoading ? (
        <div className="mt-3 flex items-center gap-2 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Memuat data realtime dari Supabase...
        </div>
      ) : null}

      <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Detail ringkas
        </p>
        <div className="mt-3 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
          <div>
            <p className="text-slate-500">Aset lancar</p>
            <p className="mt-1 font-semibold text-slate-950">
              Rp{metrics.assetTotal.toLocaleString("id-ID")}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Kewajiban jangka pendek</p>
            <p className="mt-1 font-semibold text-slate-950">
              Rp{metrics.liabilityTotal.toLocaleString("id-ID")}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Pendapatan</p>
            <p className="mt-1 font-semibold text-slate-950">
              Rp{metrics.revenueTotal.toLocaleString("id-ID")}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Beban operasional</p>
            <p className="mt-1 font-semibold text-slate-950">
              Rp{metrics.expenseTotal.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
