import type { Metadata } from "next";
import { DashboardStats } from "@/components/dashboard-stats";

export const metadata: Metadata = {
  title: "Analisis Likuiditas & Margin Laba - LarisManis AI",
  description:
    "Analisis rasio lancar dan margin laba bersih realtime dari transaksi UMKM Anda.",
};

export default function AnalisisPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <DashboardStats />
    </main>
  );
}
