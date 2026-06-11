"use client";

import { useState } from 'react';
import { format } from 'date-fns';

export type AccountantReportFilter = {
  startDate: string;
  endDate: string;
  includeCategories: boolean;
  includeFinancialGrouping: boolean;
  includeUrgencyLevel: boolean;
};

export function AccountantReportDialog({
  onExport,
  triggerButton
}: {
  onExport: (filter: AccountantReportFilter) => void;
  triggerButton?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [includeCategories, setIncludeCategories] = useState(true);
  const [includeFinancialGrouping, setIncludeFinancialGrouping] = useState(true);
  const [includeUrgencyLevel, setIncludeUrgencyLevel] = useState(false);

  const handleExport = () => {
    if (!startDate || !endDate) {
      alert('Silakan pilih tanggal mulai dan akhir');
      return;
    }

    const filter: AccountantReportFilter = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      includeCategories,
      includeFinancialGrouping,
      includeUrgencyLevel
    };

    onExport(filter);
    setIsOpen(false);
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 border rounded hover:bg-gray-100"
      >
        {triggerButton || 'Export untuk Akuntan'}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Filter Laporan Akuntan</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : undefined)}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tanggal Akhir</label>
                <input
                  type="date"
                  value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : undefined)}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Opsi Laporan</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={includeCategories}
                      onChange={(e) => setIncludeCategories(e.target.checked)}
                      className="mr-2"
                    />
                    Sertakan Kategori
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={includeFinancialGrouping}
                      onChange={(e) => setIncludeFinancialGrouping(e.target.checked)}
                      className="mr-2"
                    />
                    Sertakan Grup Keuangan
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={includeUrgencyLevel}
                      onChange={(e) => setIncludeUrgencyLevel(e.target.checked)}
                      className="mr-2"
                    />
                    Sertakan Tingkat Urgensi
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Batal
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Export PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}