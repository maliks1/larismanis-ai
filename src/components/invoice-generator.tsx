"use client";

import { useState } from "react";
import { Download, Printer } from "lucide-react";

type InvoiceData = {
  customerName: string;
  customerAddress: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  paymentTerms: string;
};

export function InvoiceGenerator() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    customerName: "",
    customerAddress: "",
    invoiceNumber: "",
    invoiceDate: "",
    dueDate: "",
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    paymentTerms: "Net 30",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInvoiceData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...invoiceData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    // Recalculate amounts
    newItems[index].amount = newItems[index].quantity * newItems[index].unitPrice;

    // Recalculate totals
    const subtotal = newItems.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * 0.1; // Assuming 10% tax
    const total = subtotal + tax;

    setInvoiceData((prev) => ({
      ...prev,
      items: newItems,
      subtotal,
      tax,
      total,
    }));
  };

  const addItem = () => {
    setInvoiceData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          description: "",
          quantity: 1,
          unitPrice: 0,
          amount: 0,
        },
      ],
    }));
  };

  const removeItem = (index: number) => {
    const newItems = [...invoiceData.items];
    newItems.splice(index, 1);

    // Recalculate totals
    const subtotal = newItems.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * 0.1; // Assuming 10% tax
    const total = subtotal + tax;

    setInvoiceData((prev) => ({
      ...prev,
      items: newItems,
      subtotal,
      tax,
      total,
    }));
  };

  const generateInvoice = async () => {
    try {
      const response = await fetch("/api/generate-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        throw new Error("Failed to generate invoice");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoiceData.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error("Error generating invoice:", error);
      alert("Gagal membuat invoice. Silakan coba lagi.");
    }
  };

  const printInvoice = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Buat Invoice</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Nama Pelanggan
            </label>
            <input
              type="text"
              name="customerName"
              value={invoiceData.customerName}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 px-4 py-3 text-base text-slate-900 dark:text-white placeholder-slate-400 outline-none transition duration-300 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Alamat Pelanggan
            </label>
            <input
              type="text"
              name="customerAddress"
              value={invoiceData.customerAddress}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 px-4 py-3 text-base text-slate-900 dark:text-white placeholder-slate-400 outline-none transition duration-300 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Nomor Invoice
            </label>
            <input
              type="text"
              name="invoiceNumber"
              value={invoiceData.invoiceNumber}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 px-4 py-3 text-base text-slate-900 dark:text-white placeholder-slate-400 outline-none transition duration-300 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tanggal Invoice
            </label>
            <input
              type="date"
              name="invoiceDate"
              value={invoiceData.invoiceDate}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 px-4 py-3 text-base text-slate-900 dark:text-white placeholder-slate-400 outline-none transition duration-300 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tanggal Jatuh Tempo
            </label>
            <input
              type="date"
              name="dueDate"
              value={invoiceData.dueDate}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 px-4 py-3 text-base text-slate-900 dark:text-white placeholder-slate-400 outline-none transition duration-300 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Syarat Pembayaran
            </label>
            <input
              type="text"
              name="paymentTerms"
              value={invoiceData.paymentTerms}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 px-4 py-3 text-base text-slate-900 dark:text-white placeholder-slate-400 outline-none transition duration-300 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">Item Invoice</h3>

          {invoiceData.items.map((item, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi
                </label>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, "description", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 px-4 py-3 text-base text-slate-900 dark:text-white placeholder-slate-400 outline-none transition duration-300 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Kuantitas
                </label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 px-4 py-3 text-base text-slate-900 dark:text-white placeholder-slate-400 outline-none transition duration-300 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Harga Satuan
                </label>
                <input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(index, "unitPrice", parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 px-4 py-3 text-base text-slate-900 dark:text-white placeholder-slate-400 outline-none transition duration-300 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="inline-flex h-12 items-center gap-2 rounded-xl border border-red-200 dark:border-red-950/30 bg-red-50 dark:bg-red-950/20 px-4 text-sm font-semibold text-red-900 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/30 transition duration-300 hover:scale-102 cursor-pointer"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className="inline-flex h-12 items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 text-sm font-semibold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 transition duration-300 hover:scale-102 cursor-pointer"
          >
            Tambah Item
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Subtotal
            </label>
            <div className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 px-4 py-3 text-base text-slate-900 dark:text-white">
              {invoiceData.subtotal.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Pajak (10%)
            </label>
            <div className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 px-4 py-3 text-base text-slate-900 dark:text-white">
              {invoiceData.tax.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Total
            </label>
            <div className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 px-4 py-3 text-base text-slate-900 dark:text-white">
              {invoiceData.total.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={generateInvoice}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-indigo-600 text-white px-6 text-sm font-semibold hover:bg-indigo-500 transition duration-300 hover:scale-102 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Buat Invoice
          </button>

          <button
            type="button"
            onClick={printInvoice}
            className="inline-flex h-12 items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 text-sm font-semibold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 transition duration-300 hover:scale-102 cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            Cetak Invoice
          </button>
        </div>
      </div>
    </div>
  );
}