"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Mic, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { DashboardStats } from "@/components/dashboard-stats";
import { VoiceLedgerInput } from "@/components/voice-ledger";

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

const highlights = [
  {
    icon: Mic,
    title: "Catat dengan suara",
    description: "Ucapkan transaksi dalam Bahasa Indonesia, lalu simpan langsung.",
  },
  {
    icon: Wallet,
    title: "Klasifikasi rapi",
    description: "Nominal, kategori, urgensi, dan kelompok keuangan dipetakan otomatis.",
  },
  {
    icon: ShieldCheck,
    title: "Siaga risiko",
    description: "Dasbor akan menghitung rasio lancar dan margin laba bersih.",
  },
];

export function HomeDashboard() {
  const [parsedData, setParsedData] = useState<ParsedTransaksi | null>(null);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 rounded-[2rem] border border-amber-200/70 bg-white/85 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">
              LarisManis AI
            </p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Asisten keuangan suara dan pemasaran visual untuk UMKM Indonesia.
            </h1>
          </div>
          <Link
            href="/marketing"
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Buka generator pemasaran
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="max-w-3xl text-base leading-7 text-slate-700 sm:text-lg">
          Rekam transaksi dengan suara, ubah bahasa kasual menjadi data keuangan,
          dan siapkan dashboard kesiapsiagaan bisnis yang bisa dipantau langsung.
        </p>

        <div className="grid gap-3 md:grid-cols-3">
          {highlights.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl border border-amber-100 bg-amber-50/70 p-4"
            >
              <item.icon className="h-5 w-5 text-amber-700" />
              <h2 className="mt-3 text-sm font-semibold text-slate-950">
                {item.title}
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-700">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Voice Ledger
              </h2>
              <p className="text-sm text-slate-600">
                Uji catatan suara lokal dengan Web Speech API.
              </p>
            </div>
          </div>

          <VoiceLedgerInput onProcessingComplete={setParsedData} />
        </div>

        <aside className="flex flex-col gap-6">
          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_18px_60px_rgba(15,23,42,0.12)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">
              Snapshot
            </p>
            <h2 className="mt-3 text-2xl font-semibold">Transaksi terakhir</h2>
            {parsedData ? (
              <dl className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-slate-400">Tipe</dt>
                  <dd className="text-right font-medium capitalize">
                    {parsedData.tipeTransaksi}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-slate-400">Nominal</dt>
                  <dd className="text-right font-medium">
                    Rp{parsedData.nominal.toLocaleString("id-ID")}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-slate-400">Kelompok</dt>
                  <dd className="text-right font-medium capitalize">
                    {parsedData.kelompokKeuangan.replace(/_/g, " ")}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
                Belum ada hasil parsing. Rekam atau tempel kalimat transaksi untuk
                mulai mengisi snapshot.
              </p>
            )}
          </div>

          <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
            <p className="text-sm font-semibold text-amber-900">Tahap berikutnya</p>
            <p className="mt-2 text-sm leading-6 text-amber-950/80">
              Setelah voice ledger stabil, saya akan lanjutkan generator caption
              produk dan dashboard risiko realtime.
            </p>
          </div>
        </aside>
      </section>

      <section className="grid gap-4">
        <DashboardStats />
      </section>
    </main>
  );
}
