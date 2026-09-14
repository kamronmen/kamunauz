"use client";

import { useEffect, useState } from "react";
import { Expense } from "@/types";
import { formatMoney, formatDateUz, EXPENSE_CATEGORIES, getExpenseCategoryLabel } from "@/lib/utils";
import { ExpenseFormModal } from "@/components/expenses/ExpenseFormModal";
import { Receipt, Plus, Trash2, Wallet, Calendar, Lock, Unlock } from "lucide-react";
import { sound } from "@/lib/sound";
import { useAuthStore } from "@/store/useAuthStore";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [isFormOpen, setIsFormOpen] = useState(false);

  // PIN unlock state
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  const { isOwner, loginDirector } = useAuthStore();

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginDirector(pinInput)) {
      sound.playSuccess();
      setPinInput("");
      setPinError(false);
    } else {
      sound.playError();
      setPinError(true);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedCategory]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== "ALL") {
        params.append("category", selectedCategory);
      }
      const res = await fetch(`/api/expenses?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" xarajatini o'chirishni tasdiqlaysizmi?`)) return;
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      if (res.ok) {
        sound.playBeep();
        fetchExpenses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalExpenseSum = expenses.reduce((sum, e) => sum + e.amount, 0);

  if (!isOwner) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-md mx-auto my-12 text-center shadow-xl space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto text-2xl shadow-inner">
          👑
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Do'kon Xarajatlari (Direktor Bo'limi)</h3>
          <p className="text-xs text-slate-500 mt-1">
            Ushbu bo'lim faqat do'kon egasi uchun mo'ljallangan. Ko'rish uchun PIN kodni kiriting (Standart PIN: 7777).
          </p>
        </div>

        {pinError && <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-xl">PIN kod noto'g'ri!</p>}

        <form onSubmit={handleUnlock} className="space-y-3 pt-2">
          <input
            type="password"
            maxLength={4}
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            placeholder="****"
            className="w-full text-center text-2xl font-mono tracking-widest py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
          />
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            Direktor Rejimiga Kirish
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Banner Metric */}
      <div className="bg-gradient-to-br from-rose-600 via-rose-700 to-slate-900 rounded-3xl p-5 md:p-6 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <Receipt className="w-4 h-4 text-rose-200" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-200">
              Do'kon Xarajatlari & Chiqimlar
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {formatMoney(totalExpenseSum)}
          </h2>
          <p className="text-xs text-rose-100 font-medium">
            Ijara, svet, oyliklar va kassadan olingan shaxsiy pullar
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 flex items-center gap-1.5 shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 text-rose-600" />
          <span>Xarajat qo'shish</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedCategory("ALL")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            selectedCategory === "ALL"
              ? "bg-rose-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          Barchasi
        </button>
        {EXPENSE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Expenses Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Xarajat Nomi</th>
                <th className="p-3.5">Toifa (Kategoriya)</th>
                <th className="p-3.5">Sana</th>
                <th className="p-3.5 text-right">Summasi</th>
                <th className="p-3.5 text-center">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Xarajatlar topilmadi
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => {
                  const catObj = EXPENSE_CATEGORIES.find((c) => c.id === exp.category);
                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">
                        {exp.title}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-md font-semibold text-[11px] ${catObj?.color || "bg-gray-100 text-gray-800"}`}>
                          {getExpenseCategoryLabel(exp.category)}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {formatDateUz(exp.date)}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-extrabold text-rose-600">
                        {formatMoney(exp.amount)}
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleDelete(exp.id, exp.title)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="O'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ExpenseFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => fetchExpenses()}
      />
    </div>
  );
}
