"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

type SpeechRecognitionResultLike = {
  transcript?: string;
};

type SpeechRecognitionResultEventLike = {
  resultIndex: number;
  results: Array<Array<SpeechRecognitionResultLike>>;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
    SpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const emptyTranscript =
  "Contoh: pemasukan dari penjualan 3 goceng, biaya listrik 50 rebu, beli stok 2 juta.";

export function VoiceLedgerInput({ onProcessingComplete }: VoiceLedgerInputProps) {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [statusMessage, setStatusMessage] = useState("Siap mendengarkan transaksi.");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const speechRecognition = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
  }, []);

  // Defer interactive UI rendering until after hydration completes
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!speechRecognition) {
      return;
    }

    const recognition = new speechRecognition();
    recognition.lang = "id-ID";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let nextTranscript = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        nextTranscript += result[0]?.transcript ?? "";
      }

      setTranscript(nextTranscript.trim());
      setStatusMessage("Transkrip diperbarui secara real-time.");
    };

    recognition.onerror = (event) => {
      console.error("SpeechRecognition error:", event.error);
      
      // 1. Auto-reconnect jika error network atau aborted (hang)
      if (event.error === 'network' || event.error === 'aborted') {
        console.warn("⚠️ Network error/aborted. Attempting to auto-restart in 1 second...");
        setTimeout(() => {
          try {
            // Coba start ulang
            recognition.start();
          } catch (e) {
            console.log("Recognition is already running or failed to restart.");
          }
        }, 1000); // Tunda 1 detik agar tidak kena rate-limit Google
      } 
      
      // 2. Handle jika user menolak permission mikrofon
      else if (event.error === 'not-allowed') {
        alert("Akses mikrofon ditolak. Mohon izinkan di pengaturan browser/HP Anda.");
        setIsListening(false); // Update state UI
      }
      
      // 3. Handle jika tidak ada suara (no-speech) - biarkan saja atau restart
      else if (event.error === 'no-speech') {
        console.log("No speech detected. Keeping mic alive...");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setStatusMessage("Mic berhenti merekam.");
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
      recognitionRef.current = null;
    };
  }, [speechRecognition]);

  const supported = Boolean(speechRecognition);

  const toggleListening = () => {
    if (!supported) {
      alert("SpeechRecognition belum didukung. Gunakan Chrome atau Safari versi terbaru.");
      return;
    }

    const recognition = recognitionRef.current;
    if (!recognition) {
      return;
    }

    setErrorMessage(null);

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      setStatusMessage("Merekam dihentikan.");
      return;
    }

    recognition.start();
    setIsListening(true);
    setStatusMessage("Mendengarkan transaksi...");
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
        <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          Web Speech API tidak tersedia. Gunakan Chrome atau Safari versi terbaru.
        </div>
      ) : null}

      {isMounted && (
        <>
          <textarea
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
            placeholder={emptyTranscript}
            className="min-h-52 w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 text-base leading-7 text-slate-950 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
          />

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={toggleListening}
              className={`inline-flex h-14 w-14 items-center justify-center rounded-full transition ${isListening ? "bg-red-600 text-white shadow-lg shadow-red-200" : "bg-slate-950 text-white hover:bg-slate-800"}`}
              aria-label={isListening ? "Stop microphone" : "Start microphone"}
            >
              {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </button>

            <button
              type="button"
              onClick={resetTranscript}
              className="inline-flex h-14 items-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" />
              Reset transcript
            </button>

            <button
              type="button"
              onClick={submitTranscript}
              disabled={isSubmitting}
              className="inline-flex h-14 items-center gap-2 rounded-full bg-amber-500 px-5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Memproses..." : "Submit transcript"}
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
            <span>{statusMessage}</span>
            <span>{isListening ? "Mikrofon aktif" : "Mikrofon nonaktif"}</span>
          </div>

          {errorMessage ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
              {errorMessage}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
