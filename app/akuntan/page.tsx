"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";
import { exportAccountantReportToPDF, generateAccountantSummary } from "@/lib/export-accountant-pdf";
import { FileText, Loader2 } from "lucide-react";
import { AccountantFinancialSummary, AccountantReportFilter } from "@/types/accountant.types";
import { AccountantReportDialog } from "@/components/accountant-report-dialog";

type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];

export default function AkuntanPage() {
  const supabase = createClient();
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [summary, setSummary] = useState<AccountantFinancialSummary | null>(null);
  const [filter, setFilter] = useState<AccountantReportFilter>({
    startDate: "",
    endDate: "",
    includeCategories: true,
    includeFinancialGrouping: true,
    includeUrgencyLevel: true,
  });
  // Initial load - direct implementation in useEffect
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from("transactions")
          .select("*")
          .order("created_at", { ascending: false });

        // Apply date filtering if startDate and endDate are set
        if (filter.startDate && filter.endDate) {
          query = query
            .gte("created_at", filter.startDate)
            .lte("created_at", filter.endDate);
        }

        const { data } = await query;

        if (data) {
          setTransactions(data as TransactionRow[]);
          const newSummary = generateAccountantSummary(data as TransactionRow[], filter);
          setSummary(newSummary);
        }
      } catch (error) {
        console.error("Error loading transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadInitialData();
  }, [supabase, filter]);

  // Load transactions function for manual refresh
  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      // Apply date filtering if startDate and endDate are set
      if (filter.startDate && filter.endDate) {
        query = query
          .gte("created_at", filter.startDate)
          .lte("created_at", filter.endDate);
      }

      const { data } = await query;

      if (data) {
        setTransactions(data as TransactionRow[]);
        const newSummary = generateAccountantSummary(data as TransactionRow[], filter);
        setSummary(newSummary);
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, filter]);


  const handleExportPDF = async () => {
    if (transactions.length === 0) {
      alert("Tidak ada transaksi untuk diekspor");
      return;
    }

    setIsExporting(true);

    try {
      exportAccountantReportToPDF(transactions, filter);
    } catch (error) {
      console.error("Export error:", error);
      alert("Gagal mengekspor PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Handle export from dialog
  const handleDialogExport = (newFilter: AccountantReportFilter) => {
    setFilter(newFilter);
    void handleExportPDF();
  };

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            <FileText className="h-3.5 w-3.5" />
            Laporan Akuntan
          </span>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Preview Laporan Akuntan
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Preview laporan keuangan yang akan diekspor untuk akuntan
          </p>
        </div>

        <div className="flex gap-2">
           <button
             onClick={() => void loadTransactions()}
             className="inline-flex h-12 items-center gap-2 rounded-xl bg-slate-100 px-5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-200 transition dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
           >
             Muat Ulang Data
           </button>

           <AccountantReportDialog
             onExport={handleDialogExport}
             triggerButton={
               <button
                 className="inline-flex h-12 items-center gap-2 rounded-xl bg-indigo-100 px-5 text-sm font-semibold text-indigo-700 shadow-sm hover:bg-indigo-200 transition dark:bg-indigo-900/30 dark:text-indigo-200 dark:hover:bg-indigo-800 cursor-pointer"
               >
                 Filter Laporan
               </button>
             }
           />

          <button
            onClick={() => void handleExportPDF()}
            disabled={isExporting || transactions.length === 0}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-500 transition dark:shadow-none disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-indigo-600 cursor-pointer"
          >
            <FileText className="h-4 w-4" />
            {isExporting ? "Mengekspor..." : "Export PDF"}
          </button>
        </div>
      </header>

      {/* Filter Dialog - menggunakan triggerButton sebagai gantinya */}

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-1 items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && transactions.length === 0 && (
        <div className="flex flex-1 items-center justify-center py-12">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">Tidak ada transaksi</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Tidak ada transaksi yang sesuai dengan filter yang dipilih
            </p>
          </div>
        </div>
      )}

      {/* Preview Content */}
      {!isLoading && transactions.length > 0 && summary && (
        <div className="space-y-6">
          {/* Summary Section */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Ringkasan Keuangan</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Periode: {formatDate(filter.startDate)} - {formatDate(filter.endDate)}
            </p>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-indigo-50 p-4 dark:bg-indigo-900/30">
                <p className="text-sm font-medium text-indigo-600 dark:text-indigo-300">Total Pemasukan</p>
                <p className="mt-1 text-xl font-bold text-indigo-800 dark:text-indigo-100">
                  {formatCurrency(summary.totalIncome)}
                </p>
              </div>

              <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/30">
                <p className="text-sm font-medium text-red-600 dark:text-red-300">Total Pengeluaran</p>
                <p className="mt-1 text-xl font-bold text-red-800 dark:text-red-100">
                  {formatCurrency(summary.totalExpense)}
                </p>
              </div>

              <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/30">
                <p className="text-sm font-medium text-green-600 dark:text-green-300">Saldo Bersih</p>
                <p className="mt-1 text-xl font-bold text-green-800 dark:text-green-100">
                  {formatCurrency(summary.netBalance)}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-700">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Jumlah Transaksi</p>
                <p className="mt-1 text-xl font-bold text-slate-800 dark:text-slate-100">
                  {summary.transactionCount}
                </p>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Daftar Transaksi</h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {transactions.length} transaksi
              </span>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">
                      Tanggal
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">
                      Deskripsi
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">
                      Kategori
                    </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">
                        Kelompok Keuangan
                      </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">
                      Tingkat Urgensi
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">
                      Jumlah
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-800">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {formatDate(transaction.created_at)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                        {transaction.deskripsi}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {transaction.kategori}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {transaction.kelompok_keuangan}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${
                          transaction.tingkat_urgensi === "tinggi"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
                            : transaction.tingkat_urgensi === "sedang"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
                            : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                        }`}>
                          {transaction.tingkat_urgensi}
                        </span>
                      </td>
                      <td className={`whitespace-nowrap px-6 py-4 text-right text-sm font-medium ${
                        transaction.tipe_transaksi === "pemasukan"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}>
                        {transaction.tipe_transaksi === "pemasukan" ? "+" : "-"}
                        {formatCurrency(transaction.nominal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}