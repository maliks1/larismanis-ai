"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, RotateCcw, Send } from "lucide-react";

type ParsedTransaction = {
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

type VoiceLedgerInputProps = {
  onProcessingComplete: (parsedData: ParsedTransaction) => void;
};

const emptyTranscript =
  "Contoh: pemasukan dari penjualan 3 goceng, biaya listrik 50 rebu, beli stok 2 juta.";

export function VoiceLedgerInput({ onProcessingComplete }: VoiceLedgerInputProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mountedRef = useRef(true);

  const [isMounted, setIsMounted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [statusMessage, setStatusMessage] = useState("Siap mendengarkan transaksi.");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);

  // Set mounted status, verify MediaRecorder support and clean up on unmount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    mountedRef.current = true;
    
    setSupported(
      typeof window !== "undefined" &&
      !!navigator.mediaDevices &&
      typeof MediaRecorder !== "undefined"
    );

    return () => {
      mountedRef.current = false;
      // Stop recording if active when component is unmounting
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch (error) {
          console.log("Failed to stop media recorder on unmount:", error);
        }
      }
    };
  }, []);

  const handleAudioTranscribe = async (blob: Blob) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setStatusMessage("Menerjemahkan suara ke teks...");

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            resolve(reader.result.split(",")[1]);
          } else {
            reject(new Error("Failed to read audio blob"));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });

      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audio: base64,
          mimeType: blob.type,
        }),
      });

      const payload = (await response.json()) as {
        text?: string;
        error?: string;
      };

      if (!response.ok || !payload.text) {
        throw new Error(payload.error ?? "Gagal menerjemahkan suara ke teks.");
      }

      if (mountedRef.current) {
        setTranscript((prev) => {
          const spacing = prev.trim() ? " " : "";
          return prev + spacing + (payload.text ?? "");
        });
        setStatusMessage("Suara berhasil diubah ke teks.");
      }
    } catch (error) {
      console.error("Transcription error:", error);
      if (mountedRef.current) {
        const message = error instanceof Error ? error.message : "Gagal mentranskripsi audio.";
        setErrorMessage(message);
        setStatusMessage("Penerjemahan gagal.");
      }
    } finally {
      if (mountedRef.current) {
        setIsSubmitting(false);
      }
    }
  };

  const startRecording = async () => {
    if (!supported) {
      alert("Perekaman audio tidak didukung pada browser Anda.");
      return;
    }

    setErrorMessage(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks on the stream to release the mic
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
        if (mountedRef.current) {
          await handleAudioTranscribe(audioBlob);
        }
      };

      mediaRecorder.start();
      setIsListening(true);
      setStatusMessage("Mendengarkan transaksi... Klik kembali untuk selesai.");
    } catch (error) {
      console.error("Failed to start recording:", error);
      setErrorMessage("Gagal mengakses mikrofon. Pastikan Anda mengizinkan akses mikrofon.");
      setIsListening(false);
    }
  };

  const stopRecording = () => {
    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      setIsListening(false);
      setStatusMessage("Memproses rekaman...");
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopRecording();
    } else {
      void startRecording();
    }
  };

  const resetTranscript = () => {
    setTranscript("");
    setErrorMessage(null);
    setStatusMessage("Transkrip dibersihkan.");
  };

  const submitTranscript = async () => {
    if (!transcript.trim()) {
      setErrorMessage("Tulis atau ucapkan transaksi terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/parse-ledger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: transcript }),
      });

      const payload = (await response.json()) as {
        data?: ParsedTransaction;
        error?: string;
      };

      if (!response.ok || !payload.data) {
        throw new Error(payload?.error ?? "Gagal mem-parsing transaksi.");
      }

      onProcessingComplete(payload.data);
      setStatusMessage("Transaksi berhasil diparsing dan disimpan.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal mengirim transkrip.";
      setErrorMessage(message);
      setStatusMessage("Submit gagal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {!supported ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 dark:border-red-950/20 dark:bg-red-950/10 px-4 py-3 text-sm text-red-900 dark:text-red-400">
          Perekaman audio tidak didukung pada browser Anda. Silakan gunakan browser Google Chrome, Safari, atau Firefox versi terbaru.
        </div>
      ) : null}

      {isMounted && (
        <>
          <textarea
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
            placeholder={emptyTranscript}
            className="min-h-48 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 px-4 py-4 text-base leading-relaxed text-slate-900 dark:text-white placeholder-slate-400 outline-none transition duration-300 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10"
          />

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={toggleListening}
              className={`inline-flex h-12 w-12 items-center justify-center rounded-xl transition duration-300 cursor-pointer ${
                isListening
                  ? "bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-lg shadow-red-500/20"
                  : "bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white hover:scale-105"
              }`}
              aria-label={isListening ? "Stop microphone" : "Start microphone"}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            <button
              type="button"
              onClick={resetTranscript}
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 text-sm font-semibold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 transition duration-300 hover:scale-102 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>

            <button
              type="button"
              onClick={submitTranscript}
              disabled={isSubmitting}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-indigo-600 text-white px-6 text-sm font-semibold hover:bg-indigo-500 transition duration-300 hover:scale-102 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Memproses..." : "Submit Transaksi"}
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/40 px-4 py-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            <span>{statusMessage}</span>
            <span className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${isListening ? "bg-red-500 animate-ping" : "bg-slate-400 dark:bg-slate-600"}`} />
              {isListening ? "Perekam Aktif" : "Perekam Nonaktif"}
            </span>
          </div>

          {errorMessage ? (
            <p className="rounded-xl border border-red-200 bg-red-50 dark:border-red-950/30 dark:bg-red-950/20 px-4 py-3 text-sm text-red-900 dark:text-red-400">
              {errorMessage}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
