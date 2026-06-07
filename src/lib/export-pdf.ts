import { jsPDF } from "jspdf";
import type { Database } from "@/types/database.types";

type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];

type FinancialSummary = {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactionCount: number;
};

const formatCurrency = (amount: number): string => {
  return "Rp" + amount.toLocaleString("id-ID");
};


export const exportTransactionsToPDF = (
  transactions: TransactionRow[],
  summary: FinancialSummary
): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = margin;

  // Colors (matching design system)
  const primaryColor: [number, number, number] = [79, 70, 229]; // Indigo 600
  const textColor: [number, number, number] = [15, 23, 42]; // Slate 900
  const mutedColor: [number, number, number] = [100, 116, 139]; // Slate 500
  const successColor: [number, number, number] = [16, 185, 129]; // Emerald 500
  const dangerColor: [number, number, number] = [244, 63, 94]; // Rose 500

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("LarisManis AI", margin, 25);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Laporan Transaksi Keuangan UMKM", margin, 33);

  doc.setTextColor(255, 255, 255);
  doc.text(
    `Dicetak: ${new Date().toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    pageWidth - margin,
    33,
    { align: "right" }
  );

  yPos = 55;

  // Summary Section
  doc.setTextColor(...textColor);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Ringkasan Keuangan", margin, yPos);
  yPos += 10;

  // Summary Cards
  const cardWidth = (pageWidth - margin * 2 - 20) / 3;
  const cardHeight = 25;

  // Total Income Card
  doc.setFillColor(236, 253, 245); // Emerald 50
  doc.roundedRect(margin, yPos, cardWidth, cardHeight, 3, 3, "F");
  doc.setTextColor(...successColor);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL PEMASUKAN", margin + 5, yPos + 8);
  doc.setFontSize(12);
  doc.text(formatCurrency(summary.totalIncome), margin + 5, yPos + 18);

  // Total Expense Card
  doc.setFillColor(255, 240, 241); // Rose 50
  doc.roundedRect(margin + cardWidth + 10, yPos, cardWidth, cardHeight, 3, 3, "F");
  doc.setTextColor(...dangerColor);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL PENGELUARAN", margin + cardWidth + 15, yPos + 8);
  doc.setFontSize(12);
  doc.text(formatCurrency(summary.totalExpense), margin + cardWidth + 15, yPos + 18);

  // Net Balance Card
  const balanceColor = summary.netBalance >= 0 ? successColor : dangerColor;
  doc.setFillColor(summary.netBalance >= 0 ? 236 : 255, summary.netBalance >= 0 ? 253 : 240, summary.netBalance >= 0 ? 245 : 241);
  doc.roundedRect(margin + (cardWidth + 10) * 2, yPos, cardWidth, cardHeight, 3, 3, "F");
  doc.setTextColor(...balanceColor);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("SALDO BERSIH", margin + (cardWidth + 10) * 2 + 5, yPos + 8);
  doc.setFontSize(12);
  doc.text(
    (summary.netBalance >= 0 ? "+" : "-") + formatCurrency(Math.abs(summary.netBalance)),
    margin + (cardWidth + 10) * 2 + 5,
    yPos + 18
  );

  yPos += cardHeight + 15;

  // Transaction List Header
  doc.setTextColor(...textColor);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`Daftar Transaksi (${transactions.length} transaksi)`, margin, yPos);
  yPos += 10;

  // Table Header
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.rect(margin, yPos, pageWidth - margin * 2, 10, "F");
  doc.setTextColor(...mutedColor);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("TANGGAL", margin + 3, yPos + 7);
  doc.text("TIPE", margin + 45, yPos + 7);
  doc.text("KATEGORI", margin + 75, yPos + 7);
  doc.text("DESKRIPSI", margin + 115, yPos + 7);
  doc.text("NOMINAL", pageWidth - margin - 3, yPos + 7, { align: "right" });

  yPos += 12;

  // Table Rows
  doc.setFont("helvetica", "normal");
  transactions.forEach((transaction, index) => {
    // Check if we need a new page
    if (yPos > 270) {
      doc.addPage();
      yPos = margin;

      // Repeat header on new page
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, yPos, pageWidth - margin * 2, 10, "F");
      doc.setTextColor(...mutedColor);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("TANGGAL", margin + 3, yPos + 7);
      doc.text("TIPE", margin + 45, yPos + 7);
      doc.text("KATEGORI", margin + 75, yPos + 7);
      doc.text("DESKRIPSI", margin + 115, yPos + 7);
      doc.text("NOMINAL", pageWidth - margin - 3, yPos + 7, { align: "right" });
      yPos += 12;
    }

    // Alternate row background
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, yPos - 3, pageWidth - margin * 2, 10, "F");
    }

    // Date
    doc.setTextColor(...mutedColor);
    doc.setFontSize(7);
    doc.text(
      new Date(transaction.created_at).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      margin + 3,
      yPos + 4
    );

    // Type Badge
    const typeColor = transaction.tipe_transaksi === "pemasukan" ? successColor : dangerColor;
    doc.setTextColor(...typeColor);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(
      transaction.tipe_transaksi === "pemasukan" ? "MSK" : "KLR",
      margin + 45,
      yPos + 4
    );

    // Category
    doc.setTextColor(...textColor);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(transaction.kategori, margin + 75, yPos + 4);

    // Description
    doc.setTextColor(...mutedColor);
    doc.setFontSize(7);
    const description = transaction.deskripsi.length > 30
      ? transaction.deskripsi.substring(0, 30) + "..."
      : transaction.deskripsi || "-";
    doc.text(description, margin + 115, yPos + 4);

    // Amount
    doc.setTextColor(...typeColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(
      (transaction.tipe_transaksi === "pemasukan" ? "+" : "-") + formatCurrency(transaction.nominal),
      pageWidth - margin - 3,
      yPos + 4,
      { align: "right" }
    );

    yPos += 10;
  });

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setTextColor(...mutedColor);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    "LarisManis AI - Asisten Keuangan Suara & Pemasaran Visual UMKM",
    margin,
    footerY
  );
  doc.text(
    `Halaman 1 dari ${doc.getNumberOfPages()}`,
    pageWidth - margin,
    footerY,
    { align: "right" }
  );

  // Save the PDF
  doc.save(`LarisManisAI_Transaksi_${new Date().toISOString().split("T")[0]}.pdf`);
};

export const exportBudgetReportToPDF = (
  budgets: Array<{
    kategori: string;
    tipe_transaksi: "pemasukan" | "pengeluaran";
    target_nominal: number;
    periode_bulan: string;
    actual: number;
  }>
): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = margin;

  // Colors
  const primaryColor: [number, number, number] = [79, 70, 229];
  const textColor: [number, number, number] = [15, 23, 42];
  const mutedColor: [number, number, number] = [100, 116, 139];
  const successColor: [number, number, number] = [16, 185, 129];
  const dangerColor: [number, number, number] = [244, 63, 94];
  const warningColor: [number, number, number] = [245, 158, 11];

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("LarisManis AI", margin, 25);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Laporan Budget & Target Bulanan", margin, 33);

  doc.setTextColor(255, 255, 255);
  doc.text(
    `Dicetak: ${new Date().toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })}`,
    pageWidth - margin,
    33,
    { align: "right" }
  );

  yPos = 55;

  // Budget List
  doc.setTextColor(...textColor);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`Daftar Budget (${budgets.length} budget)`, margin, yPos);
  yPos += 10;

  // Table Header
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, yPos, pageWidth - margin * 2, 10, "F");
  doc.setTextColor(...mutedColor);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("KATEGORI", margin + 5, yPos + 7);
  doc.text("TIPE", margin + 55, yPos + 7);
  doc.text("PERIODE", margin + 85, yPos + 7);
  doc.text("TARGET", margin + 125, yPos + 7);
  doc.text("REALISASI", margin + 155, yPos + 7);
  doc.text("STATUS", pageWidth - margin - 5, yPos + 7, { align: "right" });

  yPos += 12;

  doc.setFont("helvetica", "normal");

  budgets.forEach((budget, index) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = margin;
    }

    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, yPos - 3, pageWidth - margin * 2, 10, "F");
    }

    // Category
    doc.setTextColor(...textColor);
    doc.setFontSize(8);
    doc.text(budget.kategori, margin + 5, yPos + 4);

    // Type
    const typeColor = budget.tipe_transaksi === "pemasukan" ? successColor : dangerColor;
    doc.setTextColor(...typeColor);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(
      budget.tipe_transaksi === "pemasukan" ? "Pemasukan" : "Pengeluaran",
      margin + 55,
      yPos + 4
    );

    // Period
    doc.setTextColor(...mutedColor);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const [year, month] = budget.periode_bulan.split("-");
    const periodDate = new Date(parseInt(year), parseInt(month) - 1);
    doc.text(
      periodDate.toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
      margin + 85,
      yPos + 4
    );

    // Target
    doc.setTextColor(...textColor);
    doc.setFontSize(8);
    doc.text(formatCurrency(budget.target_nominal), margin + 125, yPos + 4);

    // Actual
    doc.setTextColor(...textColor);
    doc.setFontSize(8);
    doc.text(formatCurrency(budget.actual), margin + 155, yPos + 4);

    // Status
    const percentage = (budget.actual / budget.target_nominal) * 100;
    const isOverBudget = budget.actual > budget.target_nominal;

    if (isOverBudget) {
      doc.setTextColor(...dangerColor);
      doc.setFont("helvetica", "bold");
      doc.text("Over Budget", pageWidth - margin - 5, yPos + 4, { align: "right" });
    } else if (percentage >= 80) {
      doc.setTextColor(...warningColor);
      doc.setFont("helvetica", "bold");
      doc.text(`${percentage.toFixed(0)}%`, pageWidth - margin - 5, yPos + 4, { align: "right" });
    } else {
      doc.setTextColor(...successColor);
      doc.setFont("helvetica", "bold");
      doc.text("On Track", pageWidth - margin - 5, yPos + 4, { align: "right" });
    }

    yPos += 10;
  });

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setTextColor(...mutedColor);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    "LarisManis AI - Asisten Keuangan Suara & Pemasaran Visual UMKM",
    margin,
    footerY
  );
  doc.text(
    `Halaman 1 dari ${doc.getNumberOfPages()}`,
    pageWidth - margin,
    footerY,
    { align: "right" }
  );

  doc.save(`LarisManisAI_Budget_${new Date().toISOString().split("T")[0]}.pdf`);
};
