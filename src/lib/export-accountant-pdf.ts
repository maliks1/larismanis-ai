// Fungsi utilitas untuk mengekspor laporan akuntan ke PDF
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TransactionRow, AccountantReportFilter, AccountantFinancialSummary } from '@/types/accountant.types';

// Perluas interface jsPDF untuk menyertakan properti autotable
// Interface extension AutoTableExtension digunakan untuk TypeScript typing
// dan tidak langsung diimplementasikan dalam kode runtime
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable?: {
      finalY: number;
    };
  }
}

// Fungsi untuk menghasilkan ringkasan akuntansi
export function generateAccountantSummary(
  transactions: TransactionRow[],
  filter: AccountantReportFilter
): AccountantFinancialSummary {
  const summary: AccountantFinancialSummary = {
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    transactionCount: transactions.length,
    incomeByCategory: {},
    expenseByCategory: {},
    incomeByFinancialGroup: {},
    expenseByFinancialGroup: {},
    startDate: filter.startDate,
    endDate: filter.endDate,
  };

  transactions.forEach((transaction) => {
    const amount = transaction.nominal ?? 0;
    const category = transaction.kategori ?? 'Uncategorized';
    const financialGroup = transaction.kelompok_keuangan ?? 'Other';

    if (transaction.tipe_transaksi === 'pemasukan') {
      summary.totalIncome += amount;
      summary.incomeByCategory[category] = (summary.incomeByCategory[category] || 0) + amount;
      summary.incomeByFinancialGroup[financialGroup] = (summary.incomeByFinancialGroup[financialGroup] || 0) + amount;
    } else if (transaction.tipe_transaksi === 'pengeluaran') {
      summary.totalExpense += amount;
      summary.expenseByCategory[category] = (summary.expenseByCategory[category] || 0) + amount;
      summary.expenseByFinancialGroup[financialGroup] = (summary.expenseByFinancialGroup[financialGroup] || 0) + amount;
    }
  });

  summary.netBalance = summary.totalIncome - summary.totalExpense;
  return summary;
}

// Fungsi utama untuk mengekspor laporan akuntan ke PDF
export async function exportAccountantReportToPDF(
  transactions: TransactionRow[],
  filter: AccountantReportFilter
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const summary = generateAccountantSummary(transactions, filter);

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Laporan Keuangan untuk Akuntan', 15, 20);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Periode: ${new Date(filter.startDate).toLocaleDateString()} - ${new Date(filter.endDate).toLocaleDateString()}`, 15, 30);
  doc.text(`Total Transaksi: ${summary.transactionCount}`, 15, 36);

  // Ringkasan keuangan
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Ringkasan Keuangan', 15, 50);

  autoTable(doc, {
    startY: 55,
    head: [['Keterangan', 'Jumlah (Rp)']],
    body: [
      ['Total Pemasukan', summary.totalIncome.toLocaleString('id-ID')],
      ['Total Pengeluaran', summary.totalExpense.toLocaleString('id-ID')],
      ['Saldo Bersih', summary.netBalance.toLocaleString('id-ID')],
    ],
    styles: { fontSize: 10 },
    headStyles: { fillColor: [22, 78, 99] },
  });

  let currentY = (doc.lastAutoTable?.finalY || 55) + 10;

  // Pengelompokan berdasarkan kategori
  if (filter.includeCategories) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Pemasukan Berdasarkan Kategori', 15, currentY);

    const incomeCategories = Object.entries(summary.incomeByCategory).map(([category, amount]) => [
      category,
      amount.toLocaleString('id-ID'),
    ]);

    autoTable(doc, {
      startY: currentY + 5,
      head: [['Kategori', 'Jumlah (Rp)']],
      body: incomeCategories,
      styles: { fontSize: 10 },
    });

    currentY = (doc.lastAutoTable?.finalY || currentY) + 10;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Pengeluaran Berdasarkan Kategori', 15, currentY);

    const expenseCategories = Object.entries(summary.expenseByCategory).map(([category, amount]) => [
      category,
      amount.toLocaleString('id-ID'),
    ]);

    autoTable(doc, {
      startY: currentY + 5,
      head: [['Kategori', 'Jumlah (Rp)']],
      body: expenseCategories,
      styles: { fontSize: 10 },
    });

    currentY = (doc.lastAutoTable?.finalY || currentY) + 10;
  }

  // Pengelompokan berdasarkan grup keuangan
  if (filter.includeFinancialGrouping) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Pemasukan Berdasarkan Grup Keuangan', 15, currentY);

    const incomeGroups = Object.entries(summary.incomeByFinancialGroup).map(([group, amount]) => [
      group,
      amount.toLocaleString('id-ID'),
    ]);

    autoTable(doc, {
      startY: currentY + 5,
      head: [['Grup Keuangan', 'Jumlah (Rp)']],
      body: incomeGroups,
      styles: { fontSize: 10 },
    });

    currentY = (doc.lastAutoTable?.finalY || currentY) + 10;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Pengeluaran Berdasarkan Grup Keuangan', 15, currentY);

    const expenseGroups = Object.entries(summary.expenseByFinancialGroup).map(([group, amount]) => [
      group,
      amount.toLocaleString('id-ID'),
    ]);

    autoTable(doc, {
      startY: currentY + 5,
      head: [['Grup Keuangan', 'Jumlah (Rp)']],
      body: expenseGroups,
      styles: { fontSize: 10 },
    });

    currentY = (doc.lastAutoTable?.finalY || currentY) + 10;
  }

  // Detail transaksi
  if (filter.includeUrgencyLevel) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detail Transaksi', 15, currentY);

    const transactionRows = transactions.map((t) => [
      new Date(t.created_at).toLocaleDateString(),
      t.deskripsi || '',
      t.kategori || 'Uncategorized',
      t.tipe_transaksi === 'pemasukan' ? t.nominal.toLocaleString('id-ID') : '',
      t.tipe_transaksi === 'pengeluaran' ? t.nominal.toLocaleString('id-ID') : '',
      t.kelompok_keuangan || 'Other',
      t.tingkat_urgensi || 'Normal',
    ]);

    autoTable(doc, {
      startY: currentY + 5,
      head: [['Tanggal', 'Deskripsi', 'Kategori', 'Pemasukan (Rp)', 'Pengeluaran (Rp)', 'Grup Keuangan', 'Tingkat Urgensi']],
      body: transactionRows,
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 40 },
        2: { cellWidth: 30 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 30 },
        6: { cellWidth: 25 },
      },
    });
  }

  // Footer
  doc.setFontSize(10);
  doc.text('Dibuat oleh LarisManis AI - ' + new Date().toLocaleString(), 15, doc.internal.pageSize.height - 10);

  // Simpan PDF
  doc.save(`Laporan_Akuntan_${new Date().toISOString().split('T')[0]}.pdf`);
}