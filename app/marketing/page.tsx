"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Camera, Hash, ImagePlus, Loader2, Sparkles, Copy, Check } from "lucide-react";

type CopyResponse = {
  success?: boolean;
  data?: {
    productName: string;
    productType: string;
    caption: string;
    hashtags: string[];
    angle: string;
    platform: "whatsapp" | "instagram" | "tiktok";
    style: "formal" | "santai" | "persuasif";
    imageUrl: string;
  };
  error?: string;
  details?: string;
};

const platformOptions = [
  {
    value: "whatsapp",
    title: "WhatsApp Status",
    note: "Singkat, personal, langsung ke intinya.",
  },
  {
    value: "instagram",
    title: "Instagram Feed/Caption",
    note: "Menarik, visual, cocok dengan hook interaktif.",
  },
  {
    value: "tiktok",
    title: "TikTok Script/Caption",
    note: "Enerjik, trendi, memicu rasa penasaran.",
  },
] as const;

const styleOptions = [
  {
    value: "formal",
    title: "Profesional/Formal",
    note: "Bahasa terstruktur, elegan, dan terpercaya.",
  },
  {
    value: "santai",
    title: "Santai/Kasual",
    note: "Akrab, seperti bercakap dengan sahabat.",
  },
  {
    value: "persuasif",
    title: "Persuasif (Soft-Sell)",
    note: "Menonjolkan keuntungan produk dan call-to-action.",
  },
] as const;

type PlatformValue = (typeof platformOptions)[number]["value"];
type StyleValue = (typeof styleOptions)[number]["value"];

export default function MarketingPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [platform, setPlatform] = useState<PlatformValue>("instagram");
  const [style, setStyle] = useState<StyleValue>("persuasif");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<CopyResponse["data"] | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSubmit = async () => {
    if (!selectedFile) {
      setErrorMessage("Pilih atau ambil foto produk terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("platform", platform);
      formData.append("style", style);

      const response = await fetch("/api/generate-copy", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as CopyResponse;

      if (!response.ok || !payload.data) {
        throw new Error(payload.error ?? "Gagal membuat materi promosi.");
      }

      setResult(payload.data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Terjadi kesalahan sistem.");
      setResult(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCaption = () => {
    if (!result) return;
    const textToCopy = `${result.caption}\n\n${result.hashtags.join(" ")}`;
    void navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedPlatform = platformOptions.find((option) => option.value === platform);
  const selectedStyle = styleOptions.find((option) => option.value === style);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Title Header Card */}
      <header className="relative overflow-hidden rounded-3xl border border-slate-200/50 bg-white/60 dark:border-slate-800/60 dark:bg-slate-900/40 p-6 sm:p-8 shadow-sm backdrop-blur-md transition-colors duration-300">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" />
            Gemini Multimodal Copywriting
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Visual Marketing Generator
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-350 max-w-3xl">
            Unggah foto produk usaha Anda, lalu biarkan AI menganalisis isi visual dan menghasilkan rancangan promosi tertulis yang disesuaikan untuk berbagai kanal media sosial.
          </p>
        </div>
      </header>

      {/* Grid Content */}
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left Column: Form Controls */}
        <div className="rounded-3xl border border-slate-200/50 bg-white dark:border-slate-800/50 dark:bg-slate-900 p-6 shadow-sm transition-colors duration-300 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <ImagePlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Input Gambar & Detail</h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Unggah foto dari perangkat atau gunakan kamera.</p>
            </div>
          </div>

          {/* Upload Box */}
          <label className="relative flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 px-4 py-8 text-center transition duration-300 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-950/40 overflow-hidden">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setSelectedFile(file);
                setPreviewUrl((currentPreviewUrl) => {
                  if (currentPreviewUrl) {
                    URL.revokeObjectURL(currentPreviewUrl);
                  }
                  return file ? URL.createObjectURL(file) : null;
                });
                setResult(null);
                setErrorMessage(null);
              }}
            />
            {previewUrl ? (
              <div className="flex flex-col items-center gap-4 w-full">
                <Image
                  src={previewUrl}
                  alt="Preview produk"
                  width={1200}
                  height={900}
                  unoptimized
                  className="max-h-64 w-full rounded-xl object-contain shadow-sm border border-slate-200/50 dark:border-slate-800/60"
                />
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate max-w-xs">
                  {selectedFile?.name}
                </div>
              </div>
            ) : (
              <div className="max-w-sm flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 mb-4">
                  <Camera className="h-6 w-6" />
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Pilih foto produk Anda
                </p>
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 px-4">
                  Mendukung format JPEG, PNG, atau WebP. Gambar dianalisis otomatis untuk mendeteksi nama produk dan kategori.
                </p>
              </div>
            )}
          </label>

          {/* Selection Panels */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Platform Selection */}
            <div>
              <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Platform Tujuan</label>
              <div className="mt-2.5 space-y-2.5">
                {platformOptions.map((option) => {
                  const active = option.value === platform;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPlatform(option.value)}
                      className={`w-full rounded-xl border px-4 py-3 text-left transition duration-300 cursor-pointer ${
                        active
                          ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-300"
                          : "border-slate-200 dark:border-slate-800 bg-transparent text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-950/50"
                      }`}
                    >
                      <div className="text-xs sm:text-sm font-bold">{option.title}</div>
                      <div className="mt-1 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                        {option.note}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Language Style Selection */}
            <div>
              <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Gaya Bahasa</label>
              <div className="mt-2.5 space-y-2.5">
                {styleOptions.map((option) => {
                  const active = option.value === style;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setStyle(option.value)}
                      className={`w-full rounded-xl border px-4 py-3 text-left transition duration-300 cursor-pointer ${
                        active
                          ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-300"
                          : "border-slate-200 dark:border-slate-800 bg-transparent text-slate-700 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-950/50"
                      }`}
                    >
                      <div className="text-xs sm:text-sm font-bold">{option.title}</div>
                      <div className="mt-1 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                        {option.note}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500 transition duration-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isSubmitting ? "Menganalisis & Membuat Copy..." : "Buat Tulisan Jualan"}
          </button>

          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-950/30 dark:bg-red-950/20 p-4 text-xs sm:text-sm text-red-900 dark:text-red-400 leading-relaxed">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Right Column: Output Showcase */}
        <aside className="flex flex-col gap-6">
          <div className="rounded-3xl border border-slate-200/50 bg-white dark:border-slate-800/50 dark:bg-slate-900 p-6 shadow-sm transition-colors duration-300 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                <Hash className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Hasil Kreasi Promosi</h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Salin copy promosi dan siapkan jualan Anda.</p>
              </div>
            </div>

            {result ? (
              <div className="space-y-4">
                {/* Meta details */}
                <div className="rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Analisis Visual Produk
                  </span>
                  <div className="mt-1 text-sm font-extrabold text-slate-900 dark:text-white">
                    {result.productName}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 capitalize">
                    Jenis: {result.productType}
                  </div>
                </div>

                {/* Caption Card with Copy Button */}
                <div className="rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 p-4 flex flex-col gap-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Teks Keterangan (Caption)
                    </span>
                    <button
                      onClick={handleCopyCaption}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition"
                      title="Salin ke clipboard"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="text-emerald-500">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {result.caption}
                  </p>
                </div>

                {/* Selling Angle */}
                <div className="rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Sudut Penjualan (Marketing Angle)
                  </span>
                  <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-350">
                    {result.angle}
                  </p>
                </div>

                {/* Hashtags */}
                <div className="rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Hashtag Terkait
                  </span>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {result.hashtags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-2.5 py-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stored Image Preview */}
                <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20">
                  <Image
                    src={result.imageUrl}
                    alt="Uploaded product visual"
                    width={1200}
                    height={800}
                    unoptimized
                    className="h-48 w-full object-cover"
                  />
                  <div className="border-t border-slate-200/60 dark:border-slate-800 p-3 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 bg-slate-100/40 dark:bg-slate-950/40">
                    Foto produk ini disimpan di Supabase Storage untuk penggunaan konten lebih lanjut.
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/20 p-6 text-center">
                <Camera className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-650" />
                <p className="mt-3.5 text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  Belum ada hasil promosi. Pilih gambar produk Anda di sebelah kiri, atur platform serta gaya bahasa, lalu klik &quot;Buat Tulisan Jualan&quot;.
                </p>
              </div>
            )}
          </div>

          {/* Current state snapshot */}
          <div className="rounded-3xl border border-slate-200/50 bg-white dark:border-slate-800/50 dark:bg-slate-900 p-6 shadow-sm transition-colors duration-300">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Konfigurasi Generator
            </span>
            <div className="mt-3.5 space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-450">
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-850">
                <span>Platform Media</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedPlatform?.title}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-850">
                <span>Gaya Komunikasi</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedStyle?.title}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>Status Berkas</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedFile ? "Foto Siap" : "Belum Ada"}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

