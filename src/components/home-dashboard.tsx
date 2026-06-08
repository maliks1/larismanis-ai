"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Sparkles, HelpCircle } from "lucide-react";

const VoiceLedgerInput = dynamic(
  () => import("@/components/voice-ledger").then((module) => module.VoiceLedgerInput),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50 px-4 py-4 text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        Memuat fitur suara...
      </div>
    ),
  }
);

type ParsedTransaksi = {
  tipeTransaksi: "pemasukan" | "pengeluaran";
  nominal: number;
  kategori: string;
  deskripsi: string;
  tingkatUrgensi: "rendah" | "sedang" | "tinggi";
  kelompokKeuangan:
    | "aset_lancar"
    | "kewajiban_jangka_pendek"
    | "pendapatan"
    | "beban_operasional";
};

export function HomeDashboard() {
  const [parsedData, setParsedData] = useState<ParsedTransaksi | null>(null);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Main Core Section */}
      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        {/* Left Column: Voice Ledger */}
        <div className="rounded-3xl border border-slate-200/50 bg-white dark:border-slate-800/50 dark:bg-slate-900 p-6 shadow-sm transition-colors duration-300">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Voice Ledger
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Gunakan suara Anda untuk mencatatkan pemasukan atau pengeluaran secara alami.
              </p>
            </div>
          </div>

          <VoiceLedgerInput onProcessingComplete={setParsedData} />
        </div>

        {/* Right Column: Snapshot & Progress */}
        <aside className="flex flex-col gap-6">
          {/* Last Transaction Snapshot */}
          <div className="rounded-3xl border border-slate-200/50 bg-white dark:border-slate-800/50 dark:bg-slate-900 p-6 shadow-sm transition-colors duration-300">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
              Snapshot
            </span>
            <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">Transaksi Terakhir</h2>
            
            {parsedData ? (
              <div className="mt-5 space-y-3.5">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-950/40 px-4 py-3 border border-slate-100 dark:border-slate-900/60">
                  <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">Tipe Transaksi</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                    parsedData.tipeTransaksi === "pemasukan"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                  }`}>
                    {parsedData.tipeTransaksi}
                  </span>
                </div>
                
                <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-950/40 px-4 py-3 border border-slate-100 dark:border-slate-900/60">
                  <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">Nominal</span>
                  <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Rp{parsedData.nominal.toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-950/40 px-4 py-3 border border-slate-100 dark:border-slate-900/60">
                  <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">Kelompok Keuangan</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 capitalize">
                    {parsedData.kelompokKeuangan.replace(/_/g, " ")}
                  </span>
                </div>

                {parsedData.deskripsi && (
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-950/40 px-4 py-3 border border-slate-100 dark:border-slate-900/60">
                    <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Deskripsi</span>
                    <span className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                      {parsedData.deskripsi}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/20 p-5 text-center">
                <HelpCircle className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-600" />
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  Belum ada transaksi diparsing. Rekam atau ketik data di Voice Ledger untuk mengisi snapshot ini secara dinamis.
                </p>
              </div>
            )}
          </div>

          {/* Next Steps / Info Card */}
          <div className="rounded-3xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/10 p-6 transition-colors duration-300">
            <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              Info Pengembangan
            </h3>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-indigo-950/80 dark:text-indigo-200/80">
              Setelah voice ledger berhasil diparsing, data otomatis masuk ke tabel database Supabase dan memicu kalkulasi margin laba serta rasio likuiditas UMKM di halaman Analisis Likuiditas.
            </p>
          </div>
        </aside>
      </section>

    </main>
  );
}

