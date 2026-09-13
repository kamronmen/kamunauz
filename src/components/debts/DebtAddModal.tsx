"use client";

import { useState } from "react";
import { Customer } from "@/types";
import { X, PlusCircle, Loader2, AlertCircle } from "lucide-react";
import { sound } from "@/lib/sound";

interface DebtAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  selectedCustomer?: Customer | null;
  onSuccess: () => void;
}

export function DebtAddModal({
  isOpen,
  onClose,
  customers,
  selectedCustomer,
  onSuccess,
}: DebtAddModalProps) {
  const [customerId, setCustomerId] = useState(selectedCustomer?.id || "");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = selectedCustomer ? selectedCustomer.id : customerId;
    if (!targetId) {
      setError("Iltimos, mijozni tanlang!");
      return;
    }
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError("Qarz summasini to'g'ri kiriting!");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/debts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: targetId,
          type: "BORROW",
          amount: numAmount,
          description: description || "Qo'lda kiritilgan qarz",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Qarzni saqlashda xatolik");

      sound.playBeep();
      onSuccess();
      onClose();
    } catch (err: any) {
      sound.playError();
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-amber-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Nasiya (Qarz) yozish</h3>
              <p className="text-xs text-slate-600">
                {selectedCustomer ? selectedCustomer.name : "Mijozga qarz qo'shish"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!selectedCustomer && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Mijozni tanlang *:
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="">-- Mijozni tanlang --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Qarz summasi (so'm) *:
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              required
              className="w-full text-xl font-extrabold text-slate-900 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Sabab / Olingan tovarlar:
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Masalan: 2ta yog', 1ta non, go'sht"
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saqlanmoqda...</span>
                </>
              ) : (
                <span>Qarzni yozish</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
