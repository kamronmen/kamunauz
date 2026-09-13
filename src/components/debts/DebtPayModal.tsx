"use client";

import { useState, useEffect } from "react";
import { Customer } from "@/types";
import { formatMoney } from "@/lib/utils";
import { X, CheckCircle, Banknote, Loader2, AlertCircle } from "lucide-react";
import { sound } from "@/lib/sound";
import confetti from "canvas-confetti";

interface DebtPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onSuccess: () => void;
}

export function DebtPayModal({
  isOpen,
  onClose,
  customer,
  onSuccess,
}: DebtPayModalProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("Qarz to'lovi");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && customer) {
      setAmount(customer.totalDebt.toString());
      setDescription("Qarz to'lovi");
      setError(null);
    }
  }, [isOpen, customer]);

  if (!isOpen || !customer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError("Iltimos, to'lov summasini kiriting!");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/debts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.id,
          type: "PAYMENT",
          amount: numAmount,
          description: description || "Qarz to'landi",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "To'lovni saqlashda xatolik yuz berdi");

      sound.playSuccess();
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
      });

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
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Qarz to'lovini qabul qilish</h3>
              <p className="text-xs text-slate-600">{customer.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Current Debt Card */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Joriy umumiy qarzi:</span>
            <span className="text-base font-extrabold text-rose-600">
              {formatMoney(customer.totalDebt)}
            </span>
          </div>

          {/* Amount input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              To'lanayotgan summa (so'm) *:
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full text-xl font-extrabold text-slate-900 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
            {/* Quick buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setAmount(customer.totalDebt.toString())}
                className="px-2.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100"
              >
                To'liq to'lash ({formatMoney(customer.totalDebt)})
              </button>
              <button
                type="button"
                onClick={() => setAmount("50000")}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                50 000
              </button>
              <button
                type="button"
                onClick={() => setAmount("100000")}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                100 000
              </button>
              <button
                type="button"
                onClick={() => setAmount("200000")}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                200 000
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Izoh / To'lov usuli:
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Masalan: Naqd pul berdi, yoki Click orqali o'tkazdi"
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Actions */}
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
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saqlanmoqda...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>To'lovni tasdiqlash</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
