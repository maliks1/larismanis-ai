"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Camera, Hash, ImagePlus, Loader2, Sparkles } from "lucide-react";

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
    note: "Singkat, personal, dan kuat untuk chat langsung.",
  },
  {
    value: "instagram",
    title: "Instagram",
    note: "Lebih visual dan cocok untuk hook yang engaging.",
  },
  {
    value: "tiktok",
    title: "TikTok",
    note: "Enerjik, cepat, dan mendorong rasa penasaran.",
  },
] as const;

const styleOptions = [
  {
    value: "formal",
    title: "Formal",
    note: "Bahasa rapi, profesional, dan kredibel.",
  },
  {
    value: "santai",
    title: "Santai",
    note: "Bahasa akrab seperti obrolan sehari-hari.",
  },
  {
    value: "persuasif",
    title: "Persuasif",
    note: "Fokus pada manfaat, urgensi, dan CTA.",
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

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSubmit = async () => {
    if (!selectedFile) {
      setErrorMessage("Pilih gambar produk terlebih dahulu.");
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
        throw new Error(payload.error ?? "Gagal membuat copy.");
      }

      setResult(payload.data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Terjadi kesalahan.");
      setResult(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPlatform = platformOptions.find((option) => option.value === platform);
  const selectedStyle = styleOptions.find((option) => option.value === style);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff0d9_0%,#fff9ee_36%,#fffdf9_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="overflow-hidden rounded-[2rem] border border-amber-200 bg-slate-950 p-6 text-white shadow-[0_20px_80px_rgba(15,23,42,0.22)] sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">
                Visual Marketing Generator
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
                Upload gambar produk, lalu dapatkan caption yang siap jual.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Halaman ini mengunggah gambar ke Supabase Storage, mengirim visual ke
                Gemini multimodal, lalu mengembalikan caption dan hashtag yang sesuai
                dengan platform serta gaya bahasa pilihan.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke dashboard
            </Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <ImagePlus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Unggah produk</h2>
                <p className="text-sm text-slate-600">
                  Pakai kamera HP atau file dari galeri.
                </p>
              </div>
            </div>

            <label className="mt-5 flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center transition hover:border-amber-300 hover:bg-amber-50/60">
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
                <div className="flex flex-col items-center gap-4">
                  <Image
                    src={previewUrl}
                    alt="Preview produk"
                    width={1200}
                    height={900}
                    unoptimized
                    className="max-h-72 w-full rounded-[1.5rem] object-cover shadow-[0_18px_60px_rgba(15,23,42,0.15)]"
                  />
                  <p className="text-sm font-medium text-slate-700">
                    {selectedFile?.name}
                  </p>
                </div>
              ) : (
                <div className="max-w-sm">
                  <Camera className="mx-auto h-10 w-10 text-amber-700" />
                  <p className="mt-4 text-base font-semibold text-slate-950">
                    Klik untuk pilih gambar produk
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Format JPEG, PNG, atau WebP. Cocok untuk foto makanan, minuman,
                    fashion, kosmetik, dan katalog UMKM.
                  </p>
                </div>
              )}
            </label>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-slate-950">Platform tujuan</p>
                <div className="mt-3 grid gap-2">
                  {platformOptions.map((option) => {
                    const active = option.value === platform;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setPlatform(option.value)}
                        className={`rounded-2xl border px-4 py-3 text-left transition ${active ? "border-amber-400 bg-amber-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
                      >
                        <div className="text-sm font-semibold text-slate-950">
                          {option.title}
                        </div>
                        <div className="mt-1 text-sm leading-6 text-slate-600">
                          {option.note}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-950">Gaya bahasa</p>
                <div className="mt-3 grid gap-2">
                  {styleOptions.map((option) => {
                    const active = option.value === style;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setStyle(option.value)}
                        className={`rounded-2xl border px-4 py-3 text-left transition ${active ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white hover:border-slate-300"}`}
                      >
                        <div className="text-sm font-semibold">{option.title}</div>
                        <div
                          className={`mt-1 text-sm leading-6 ${active ? "text-slate-300" : "text-slate-600"}`}
                        >
                          {option.note}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="mt-6 inline-flex h-14 items-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isSubmitting ? "Mengunggah dan membuat copy..." : "Generate copy"}
            </button>

            {errorMessage ? (
              <div className="mt-4 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-900">
                {errorMessage}
              </div>
            ) : null}
          </div>

          <aside className="flex flex-col gap-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Hash className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">Output promosi</h2>
                  <p className="text-sm text-slate-600">
                    Hasil caption, angle, dan hashtag akan tampil di sini.
                  </p>
                </div>
              </div>

              {result ? (
                <div className="mt-5 space-y-4">
                  <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                      Produk terdeteksi
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">
                      {result.productName}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-700">
                      {result.productType}
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Caption
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-800">
                      {result.caption}
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Angle jualan
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-700">
                      {result.angle}
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Hashtag
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {result.hashtags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50">
                    <Image
                      src={result.imageUrl}
                      alt="Gambar yang diunggah ke Supabase Storage"
                      width={1200}
                      height={800}
                      unoptimized
                      className="h-56 w-full object-cover"
                    />
                    <div className="border-t border-slate-200 p-4 text-sm text-slate-600">
                      Uploaded ke Supabase Storage untuk dipakai ulang di pipeline konten.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                  Pilih gambar, lalu tekan generate. Hasil akan berisi caption, hashtag,
                  dan visual yang sudah tersimpan di Supabase Storage.
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_18px_60px_rgba(15,23,42,0.12)] sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">
                Status pilihan
              </p>
              <dl className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-slate-400">Platform</dt>
                  <dd className="text-right font-medium">{selectedPlatform?.title}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-slate-400">Gaya</dt>
                  <dd className="text-right font-medium">{selectedStyle?.title}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-slate-400">File</dt>
                  <dd className="text-right font-medium">
                    {selectedFile ? selectedFile.name : "Belum dipilih"}
                  </dd>
                </div>
              </dl>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
