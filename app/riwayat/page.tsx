"use client";

import { TransactionHistory } from "@/components/transaction-history";
import { CategoryVisualization } from "@/components/category-visualization";
import { FileText } from "lucide-react";
import { exportTransactionsToPDF } from "@/lib/export-pdf";
import { useCallback, useEffect, useState } from "react";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import type { Database } from "@/types/database.types";

type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];

export default function RiwayatPage() {
  const supabase = getBrowserSupabaseClient();
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const loadTransactions = useCallback(async () => {
    if (!supabase) return;

    const { data } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setTransactions(data as TransactionRow[]);
    }
  }, [supabase]);

  useEffect(() => {
    if (supabase) {
      requestAnimationFrame(() => {
        void loadTransactions();
      });
    }
  }, [supabase, loadTransactions]);

  const handleExportPDF = async () => {
    if (transactions.length === 0) {
      alert("Tidak ada transaksi untuk diekspor");
      return;
    }

    setIsExporting(true);

    try {
      const totalIncome = transactions
        .filter((t) => t.tipe_transaksi === "pemasukan")
        .reduce((sum, t) => sum + t.nominal, 0);

      const totalExpense = transactions
        .filter((t) => t.tipe_transaksi === "pengeluaran")
        .reduce((sum, t) => sum + t.nominal, 0);

      exportTransactionsToPDF(transactions, {
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
        transactionCount: transactions.length,
      });
    } catch (error) {
      console.error("Export error:", error);
      alert("Gagal mengekspor PDF");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            <FileText className="h-3.5 w-3.5" />
            Laporan & Riwayat
          </span>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Riwayat Transaksi
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Lihat, filter, dan export semua transaksi keuangan usaha Anda.
          </p>
        </div>

        <button
          onClick={() => void handleExportPDF()}
          disabled={isExporting || transactions.length === 0}
          className="inline-flex h-12 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-500 transition dark:shadow-none disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-indigo-600 cursor-pointer"
        >
          <FileText className="h-4 w-4" />
          {isExporting ? "Mengekspor..." : "Export PDF"}
        </button>
      </header>

      {/* Transaction History */}
      <TransactionHistory />

      {/* Category Visualization */}
      <CategoryVisualization />
    </main>
  );
}
