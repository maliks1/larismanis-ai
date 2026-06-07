"use client";

import { BudgetTarget } from "@/components/budget-target";
import { FileText } from "lucide-react";
import { exportBudgetReportToPDF } from "@/lib/export-pdf";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import type { Database } from "@/types/database.types";

type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];
type Budget = {
  id: string;
  kategori: string;
  tipe_transaksi: "pemasukan" | "pengeluaran";
  target_nominal: number;
  periode_bulan: string;
  created_at: string;
};

export default function BudgetPage() {
  const supabase = getBrowserSupabaseClient();
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (supabase) {
      void Promise.all([loadTransactions(), loadBudgets()]);
    }
  }, [supabase]);

  const loadTransactions = async () => {
    if (!supabase) return;

    const { data } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setTransactions(data as TransactionRow[]);
    }
  };

  const loadBudgets = async () => {
    if (!supabase) return;

    const { data } = await supabase.from("budgets").select("*").order("created_at", { ascending: false });

    if (data) {
      setBudgets(data as Budget[]);
    }
  };

  const handleExportPDF = () => {
    if (budgets.length === 0) {
      alert("Tidak ada budget untuk diekspor");
      return;
    }

    setIsExporting(true);

    try {
      const currentMonthBudgets = budgets.filter(
        (b) => b.periode_bulan === format(new Date(), "yyyy-MM")
      );

      const budgetData = currentMonthBudgets.map((budget) => {
        const [year, month] = budget.periode_bulan.split("-");
        const actual = transactions
          .filter(
            (t) =>
              t.kategori === budget.kategori &&
              t.tipe_transaksi === budget.tipe_transaksi &&
              format(new Date(t.created_at), "yyyy-MM") === `${year}-${month}`
          )
          .reduce((sum, t) => sum + t.nominal, 0);

        return {
          kategori: budget.kategori,
          tipe_transaksi: budget.tipe_transaksi,
          target_nominal: budget.target_nominal,
          periode_bulan: budget.periode_bulan,
          actual,
        };
      });

      exportBudgetReportToPDF(budgetData);
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
            Perencanaan Keuangan
          </span>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Budget & Target
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Tetapkan dan pantau target budget bulanan untuk keuangan usaha Anda.
          </p>
        </div>

        <button
          onClick={() => void handleExportPDF()}
          disabled={isExporting || budgets.length === 0}
          className="inline-flex h-12 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-500 transition dark:shadow-none disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-indigo-600 cursor-pointer"
        >
          <FileText className="h-4 w-4" />
          {isExporting ? "Mengekspor..." : "Export PDF"}
        </button>
      </header>

      {/* Budget Target Component */}
      <BudgetTarget />
    </main>
  );
}
