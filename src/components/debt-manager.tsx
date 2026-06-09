"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Save, X } from "lucide-react";

type Debt = {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  type: "piutang" | "hutang";
  status: "belum-lunas" | "lunas";
  notes: string;
};

export function DebtManager() {
const [debts, setDebts] = useState<Debt[]>(() => {
  if (typeof window !== "undefined") { // Jaga-jaga jika menggunakan Next.js / SSR
    const savedDebts = localStorage.getItem("debts");
    return savedDebts ? JSON.parse(savedDebts) : []; // Berikan default array kosong [] jika data tidak ada
  }
  return [];
});
  const [newDebt, setNewDebt] = useState<Omit<Debt, "id">>({
    name: "",
    amount: 0,
    dueDate: "",
    type: "hutang",
    status: "belum-lunas",
    notes: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


useEffect(() => {
  // Save debts to localStorage whenever they change
  localStorage.setItem("debts", JSON.stringify(debts));
}, [debts]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewDebt((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) || 0 : value,
    }));
  };

  const addDebt = () => {
    if (!newDebt.name.trim() || newDebt.amount <= 0) {
      setErrorMessage("Nama dan jumlah harus diisi dengan benar.");
      return;
    }

    setErrorMessage(null);
    const debtToAdd: Debt = {
      ...newDebt,
      id: Math.random().toString(36).substring(2, 9),
    };
    setDebts((prev) => [...prev, debtToAdd]);
    setNewDebt({
      name: "",
      amount: 0,
      dueDate: "",
      type: "hutang",
      status: "belum-lunas",
      notes: "",
    });
  };

  const deleteDebt = (id: string) => {
    setDebts((prev) => prev.filter((debt) => debt.id !== id));
  };

  const startEditing = (debt: Debt) => {
    setEditingId(debt.id);
    setNewDebt({
      name: debt.name,
      amount: debt.amount,
      dueDate: debt.dueDate,
      type: debt.type,
      status: debt.status,
      notes: debt.notes,
    });
  };

  const saveEdit = () => {
    if (!newDebt.name.trim() || newDebt.amount <= 0) {
      setErrorMessage("Nama dan jumlah harus diisi dengan benar.");
      return;
    }

    setErrorMessage(null);
    setDebts((prev) =>
      prev.map((debt) =>
        debt.id === editingId ? { ...debt, ...newDebt } : debt
      )
    );
    setEditingId(null);
    setNewDebt({
      name: "",
      amount: 0,
      dueDate: "",
      type: "hutang",
      status: "belum-lunas",
      notes: "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewDebt({
      name: "",
      amount: 0,
      dueDate: "",
      type: "hutang",
      status: "belum-lunas",
      notes: "",
    });
  };

  const toggleStatus = (id: string) => {
    setDebts((prev) =>
      prev.map((debt) =>
        debt.id === id
          ? { ...debt, status: debt.status === "belum-lunas" ? "lunas" : "belum-lunas" }
          : debt
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Manajemen Piutang & Hutang</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Nama
            </label>
            <input
              type="text"
              name="name"
              value={newDebt.name}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 px-4 py-3 text-base text-slate-900 dark:text-white placeholder-slate-400 outline-none transition duration-300 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Jumlah
            </label>
            <input
              type="number"
              name="amount"
              value={newDebt.amount}
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
              value={newDebt.dueDate}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 px-4 py-3 text-base text-slate-900 dark:text-white placeholder-slate-400 outline-none transition duration-300 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tipe
            </label>
            <select
              name="type"
              value={newDebt.type}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 px-4 py-3 text-base text-slate-900 dark:text-white placeholder-slate-400 outline-none transition duration-300 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10"
            >
              <option value="hutang">Hutang</option>
              <option value="piutang">Piutang</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Catatan
            </label>
            <textarea
              name="notes"
              value={newDebt.notes}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 px-4 py-3 text-base text-slate-900 dark:text-white placeholder-slate-400 outline-none transition duration-300 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10"
              rows={3}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          {editingId ? (
            <>
              <button
                type="button"
                onClick={saveEdit}
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-green-600 text-white px-6 text-sm font-semibold hover:bg-green-500 transition duration-300 hover:scale-102 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                Simpan Perubahan
              </button>

              <button
                type="button"
                onClick={cancelEdit}
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 text-sm font-semibold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 transition duration-300 hover:scale-102 cursor-pointer"
              >
                <X className="h-4 w-4" />
                Batal
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={addDebt}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-indigo-600 text-white px-6 text-sm font-semibold hover:bg-indigo-500 transition duration-300 hover:scale-102 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Tambah {newDebt.type === "hutang" ? "Hutang" : "Piutang"}
            </button>
          )}
        </div>

        {errorMessage && (
          <p className="rounded-xl border border-red-200 bg-red-50 dark:border-red-950/30 dark:bg-red-950/20 px-4 py-3 text-sm text-red-900 dark:text-red-400">
            {errorMessage}
          </p>
        )}

        <div className="space-y-4">
          {debts.map((debt) => (
            <div
              key={debt.id}
              className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4 ${
                debt.status === "lunas" ? "opacity-70" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                    {debt.name}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                    debt.type === "hutang"
                      ? "bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-300"
                      : "bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-300"
                  }`}>
                    {debt.type === "hutang" ? "Hutang" : "Piutang"}
                  </span>

                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                    debt.status === "belum-lunas"
                      ? "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-300"
                      : "bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300"
                  }`}>
                    {debt.status === "belum-lunas" ? "Belum Lunas" : "Lunas"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Jumlah: {debt.amount.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Jatuh Tempo: {debt.dueDate ? new Date(debt.dueDate).toLocaleDateString("id-ID") : "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Catatan: {debt.notes || "-"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => toggleStatus(debt.id)}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium ${
                    debt.status === "belum-lunas"
                      ? "bg-blue-600 text-white hover:bg-blue-500"
                      : "bg-yellow-600 text-white hover:bg-yellow-500"
                  } transition duration-300 hover:scale-102 cursor-pointer`}
                >
                  {debt.status === "belum-lunas" ? "Tandai Lunas" : "Tandai Belum Lunas"}
                </button>

                <button
                  type="button"
                  onClick={() => startEditing(debt)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs font-medium text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 transition duration-300 hover:scale-102 cursor-pointer"
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => deleteDebt(debt.id)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-200 dark:border-red-950/30 bg-red-50 dark:bg-red-950/20 px-3 text-xs font-medium text-red-900 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/30 transition duration-300 hover:scale-102 cursor-pointer"
                >
                  <Trash2 className="h-3 w-3" />
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}