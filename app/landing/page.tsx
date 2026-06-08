"use client";

import Link from "next/link";
import { ArrowRight, Mic, ShieldCheck, Sparkles, Wallet } from "lucide-react";

const highlights = [
  {
    icon: Mic,
    title: "Catat Dengan Suara",
    description: "Ucapkan transaksi Anda dalam Bahasa Indonesia kasual, lalu simpan instan.",
    color: "from-blue-500/10 to-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  },
  {
    icon: Wallet,
    title: "Klasifikasi Otomatis",
    description: "Nominal, kategori, urgensi, dan kelompok keuangan terpetakan secara pintar.",
    color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: ShieldCheck,
    title: "Analisis Risiko Realtime",
    description: "Dasbor otomatis menghitung rasio lancar dan margin laba bersih UMKM Anda.",
    color: "from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400",
  },
];

export default function LandingPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Header */}
      <header className="relative overflow-hidden rounded-3xl border border-slate-200/50 bg-white/60 dark:border-slate-800/60 dark:bg-slate-900/40 p-6 sm:p-8 shadow-sm backdrop-blur-md transition-colors duration-300">
        {/* Glow Effects */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              Asisten Cerdas UMKM Indonesia
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
              Asisten Keuangan Suara & Pemasaran Visual
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-350 sm:text-lg">
              Ubah rekaman suara kasual menjadi pembukuan rapi, pantau kesehatan keuangan usaha secara langsung, dan buat materi promosi instan.
            </p>
          </div>
          <div className="shrink-0">
            <Link
              href="/marketing"
              style={{ color: 'white !important' }}
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-500 transition cursor-pointer"
            >
              <span style={{ color: 'white' }}>Buka Generator Pemasaran</span>
              <ArrowRight className="h-4 w-4 text-white" />
            </Link>
          </div>
        </div>

        {/* Highlights Grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((item) => (
            <article
              key={item.title}
              className="relative rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/20 p-5 hover:border-slate-300 dark:hover:border-slate-700 transition duration-300"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr ${item.color}`}>
                <item.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
                {item.title}
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {item.description}
              </p>
            </article>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-500 transition cursor-pointer"
          >
            Mulai Gratis Sekarang
            <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tidak perlu kartu kredit. Daftar dalam 30 detik.
          </p>
        </div>
      </header>

      {/* Features Detail Section */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200/50 bg-white dark:border-slate-800/50 dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mb-4">
            <Mic className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Voice Ledger</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Rekam transaksi dengan suara Anda. AI akan mem-parsing dan mengklasifikasikan secara otomatis ke kategori yang tepat.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/50 bg-white dark:border-slate-800/50 dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mb-4">
            <Wallet className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Smart Budgeting</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Atur budget dan target keuangan usaha Anda dengan bantuan AI yang memberikan rekomendasi realistis.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/50 bg-white dark:border-slate-800/50 dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 mb-4">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Analisis Likuiditas</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Pantau rasio likuiditas dan margin laba usaha Anda secara realtime dengan dasbor yang mudah dipahami.
          </p>
        </div>
      </section>
    </main>
  );
}
