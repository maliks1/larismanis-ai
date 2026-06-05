import type { Database } from "@/types/database.types";

type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];

export type FinancialMetrics = {
  assetTotal: number;
  liabilityTotal: number;
  revenueTotal: number;
  expenseTotal: number;
  currentRatio: number | null;
  netProfitMargin: number | null;
  liquidityAlert: boolean;
  marginAlert: boolean;
};

export function calculateFinancialMetrics(
  transactions: TransactionRow[],
): FinancialMetrics {
  const assetTotal = sumByGroup(transactions, "aset_lancar");
  const liabilityTotal = sumByGroup(transactions, "kewajiban_jangka_pendek");
  const revenueTotal = sumByGroup(transactions, "pendapatan");
  const expenseTotal = sumByGroup(transactions, "beban_operasional");

  const currentRatio =
    liabilityTotal > 0
      ? assetTotal / liabilityTotal
      : assetTotal > 0
        ? Number.POSITIVE_INFINITY
        : null;

  const netProfitMargin =
    revenueTotal > 0 ? ((revenueTotal - expenseTotal) / revenueTotal) * 100 : null;

  return {
    assetTotal,
    liabilityTotal,
    revenueTotal,
    expenseTotal,
    currentRatio,
    netProfitMargin,
    liquidityAlert: currentRatio !== null && currentRatio < 1,
    marginAlert: netProfitMargin !== null && netProfitMargin < 0,
  };
}

function sumByGroup(
  transactions: TransactionRow[],
  group: TransactionRow["kelompok_keuangan"],
) {
  return transactions
    .filter((transaction) => transaction.kelompok_keuangan === group)
    .reduce((total, transaction) => total + transaction.nominal, 0);
}

export function formatMetricValue(value: number | null, fractionDigits = 2) {
  if (value === null) {
    return "--";
  }

  if (!Number.isFinite(value)) {
    return "∞";
  }

  return value.toLocaleString("id-ID", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}