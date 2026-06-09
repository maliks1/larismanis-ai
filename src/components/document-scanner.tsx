"use client";

import { useState, useRef } from "react";
import { Camera, Upload, FileText, Download } from "lucide-react";

type ScannedDocument = {
  id: string;
  name: string;
  type: "kuitansi" | "faktur";
  content: string;
  createdAt: string;
};

export function DocumentScanner() {
  const [scannedDocuments, setScannedDocuments] = useState<ScannedDocument[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsScanning(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("document", files[0]);

      const response = await fetch("/api/scan-document", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to scan document");
      }

      const result = (await response.json()) as ScannedDocument;

      setScannedDocuments((prev) => [...prev, result]);
    } catch (error) {
      console.error("Error scanning document:", error);
      setErrorMessage("Gagal memindai dokumen. Silakan coba lagi.");
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCameraScan = async () => {
    setIsScanning(true);
    setErrorMessage(null);

    try {
      // In a real implementation, this would use the device camera
      // For this example, we'll simulate a scan
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockResult: ScannedDocument = {
        id: Math.random().toString(36).substring(2, 9),
        name: `Scanned Document ${scannedDocuments.length + 1}`,
        type: Math.random() > 0.5 ? "kuitansi" : "faktur",
        content: "Contoh konten dokumen yang dipindai. Ini adalah teks yang diekstrak dari dokumen yang dipindai.",
        createdAt: new Date().toISOString(),
      };

      setScannedDocuments((prev) => [...prev, mockResult]);
    } catch (error) {
      console.error("Error scanning with camera:", error);
      setErrorMessage("Gagal memindai dokumen dengan kamera. Silakan coba lagi.");
    } finally {
      setIsScanning(false);
    }
  };

const downloadDocument = (document: ScannedDocument) => {
  const blob = new Blob([document.content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
const a = window.document.createElement("a");
a.href = url;
a.download = `${document.name}.txt`;
window.document.body.appendChild(a);
setTimeout(() => {
  a.click();
  window.document.body.removeChild(a);
}, 0);
  URL.revokeObjectURL(url);
};

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Pemindai Dokumen</h2>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-indigo-600 text-white px-6 text-sm font-semibold hover:bg-indigo-500 transition duration-300 hover:scale-102 cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            Unggah Dokumen
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,application/pdf"
            className="hidden"
          />

          <button
            type="button"
            onClick={handleCameraScan}
            disabled={isScanning}
            className="inline-flex h-12 items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 text-sm font-semibold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 transition duration-300 hover:scale-102 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            <Camera className="h-4 w-4" />
            {isScanning ? "Memindai..." : "Pindai dengan Kamera"}
          </button>
        </div>

        {errorMessage && (
          <p className="rounded-xl border border-red-200 bg-red-50 dark:border-red-950/30 dark:bg-red-950/20 px-4 py-3 text-sm text-red-900 dark:text-red-400">
            {errorMessage}
          </p>
        )}

        <div className="space-y-4">
          {scannedDocuments.map((document) => (
            <div
              key={document.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                    {document.name}
                  </h3>
                </div>

                <span className="inline-flex items-center rounded-full bg-indigo-100 dark:bg-indigo-950/30 px-3 py-1 text-xs font-medium text-indigo-800 dark:text-indigo-300">
                  {document.type === "kuitansi" ? "Kuitansi" : "Faktur"}
                </span>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                {document.content.substring(0, 150)}...
              </p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-500">
                  Dipindai pada: {new Date(document.createdAt).toLocaleString("id-ID")}
                </span>

                <button
                  type="button"
                  onClick={() => downloadDocument(document)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs font-medium text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 transition duration-300 hover:scale-102 cursor-pointer"
                >
                  <Download className="h-3 w-3" />
                  Unduh
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}