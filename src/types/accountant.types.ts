// Tipe data untuk fitur laporan akuntan
import { Database } from './database.types';

// Tipe untuk filter laporan akuntan
export type AccountantReportFilter = {
  startDate: string; // Format ISO date
  endDate: string;   // Format ISO date
  includeCategories: boolean;
  includeFinancialGrouping: boolean;
  includeUrgencyLevel: boolean;
};

// Tipe untuk ringkasan akuntansi
export type AccountantFinancialSummary = {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactionCount: number;
  incomeByCategory: Record<string, number>;
  expenseByCategory: Record<string, number>;
  incomeByFinancialGroup: Record<string, number>;
  expenseByFinancialGroup: Record<string, number>;
  startDate: string;
  endDate: string;
};

// Ekspor tipe TransactionRow untuk digunakan di modul lain
export type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];