import Link from "next/link";

export default function MarketingPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">
          Visual Marketing Generator
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          Halaman generator promosi sedang disiapkan.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700 sm:text-lg">
          Berikutnya saya akan menambahkan unggah gambar produk, pilihan platform,
          dan output caption + hashtag berbasis Gemini multimodal.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Kembali ke dashboard
        </Link>
      </section>
    </main>
  );
}
