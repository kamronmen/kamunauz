"use client";

import { useEffect, useState } from "react";
import { formatMoney } from "@/lib/utils";
import { X, Printer, Send, Banknote, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { sound } from "@/lib/sound";

interface ShiftCloseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShiftCloseModal({ isOpen, onClose }: ShiftCloseModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actualCash, setActualCash] = useState("");
  const [sendingTelegram, setSendingTelegram] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchShiftData();
    }
  }, [isOpen]);

  const fetchShiftData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/shift");
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setActualCash(json.expectedCashInDrawer.toString());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const numActualCash = parseFloat(actualCash) || 0;
  const difference = numActualCash - (data?.expectedCashInDrawer || 0);

  const handlePrintZReport = () => {
    sound.playBeep();
    window.print();
  };

  const handleSendTelegramZReport = async () => {
    try {
      setSendingTelegram(true);
      const reportText = `🧾 <b>SMENA YOPISH (Z-HISOBOT) — ${data.shiftDate}</b>\n\n` +
        `💰 <b>Jami Savdo:</b> ${formatMoney(data.totalSales)} (${data.salesCount} ta chek)\n` +
        `💵 Naqd Savdo: ${formatMoney(data.cashSales)}\n` +
        `💳 Plastik Karta: ${formatMoney(data.cardSales)}\n` +
        `📒 Nasiya (Qarz): ${formatMoney(data.debtSales)}\n\n` +
        `📥 Nasiya To'lovlari: +${formatMoney(data.debtPaymentsTotal)}\n` +
        `💸 Chiqim Xarajatlar: -${formatMoney(data.expensesTotal)}\n\n` +
        `🔑 <b>Kassada Bo'lishi Kerak Naqd Pul:</b> <u>${formatMoney(data.expectedCashInDrawer)}</u>\n` +
        `✋ <b>Sanalgan Naqd Pul:</b> ${formatMoney(numActualCash)}\n` +
        `⚖️ <b>Farq (Kamchilik / Ortiqcha):</b> ${formatMoney(difference)}\n\n` +
        `🤖 <i>DOKONPRO AI Shift Control</i>`;

      const res = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: reportText }),
      });

      if (res.ok) {
        sound.playSuccess();
        alert("Smena yopilish Z-Hisoboti Telegramga yuborildi!");
      }
    } catch (err) {
      sound.playError();
      console.error(err);
    } finally {
      setSendingTelegram(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Smenani Yopish (Z-Hisobot)</h3>
              <p className="text-xs text-slate-400">Kunlik kassa va naqd pul hisob-kitobi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs font-sans" id="printable-receipt">
          {loading || !data ? (
            <div className="py-8 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
              <p>Smena hisob-kitobi qilinmoqda...</p>
            </div>
          ) : (
            <>
              {/* Expected Cash Card */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Kassada bo'lishi kerak bo'lgan naqd pul:
                </span>
                <span className="text-2xl font-black text-emerald-900 tracking-tight block">
                  {formatMoney(data.expectedCashInDrawer)}
                </span>
                <p className="text-[10px] text-emerald-700">
                  Naqd savdo + Nasiya yig'ilgan to'lovlar - Kassadan chiqimlar
                </p>
              </div>

              {/* Cashier Actual Cash Input */}
              <div className="space-y-1.5 no-print">
                <label className="text-xs font-bold text-slate-700 block">
                  Kassada haqiqiy sanalgan naqd pul (so'm):
                </label>
                <input
                  type="number"
                  value={actualCash}
                  onChange={(e) => setActualCash(e.target.value)}
                  className="w-full text-lg font-extrabold text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Discrepancy Alert */}
              {difference !== 0 && (
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between font-bold text-xs ${
                    difference < 0 ? "bg-rose-50 border-rose-200 text-rose-800" : "bg-blue-50 border-blue-200 text-blue-800"
                  }`}
                >
                  <span>{difference < 0 ? "Kamchilik (Kassa kam):" : "Ortiqcha (Kassa ko'p):"}</span>
                  <span className="text-sm font-extrabold">{formatMoney(difference)}</span>
                </div>
              )}

              {/* Detailed Breakdown Table */}
              <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50/70 space-y-2 text-slate-700">
                <div className="flex justify-between border-b pb-1 border-slate-200">
                  <span>Jami Tushum ({data.salesCount} ta chek):</span>
                  <span className="font-bold text-slate-900">{formatMoney(data.totalSales)}</span>
                </div>
                <div className="flex justify-between text-slate-600 pl-2">
                  <span>💵 Naqd Savdo:</span>
                  <span>{formatMoney(data.cashSales)}</span>
                </div>
                <div className="flex justify-between text-slate-600 pl-2">
                  <span>💳 Plastik / Click:</span>
                  <span>{formatMoney(data.cardSales)}</span>
                </div>
                <div className="flex justify-between text-slate-600 pl-2">
                  <span>📒 Nasiyaga Berilgan:</span>
                  <span>{formatMoney(data.debtSales)}</span>
                </div>
                <div className="flex justify-between border-t pt-1 border-slate-200 text-emerald-800 font-semibold">
                  <span>📥 Qarzlardan Qaytarilgan Naqd:</span>
                  <span>+{formatMoney(data.debtPaymentsTotal)}</span>
                </div>
                <div className="flex justify-between text-rose-700 font-semibold">
                  <span>💸 Kassadan Chiqimlar:</span>
                  <span>-{formatMoney(data.expensesTotal)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-2 no-print">
          <button
            onClick={handlePrintZReport}
            className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 flex items-center justify-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Z-Chek Chop Etish</span>
          </button>

          <button
            onClick={handleSendTelegramZReport}
            disabled={sendingTelegram}
            className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/20 disabled:opacity-50"
          >
            {sendingTelegram ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Telegram Z-Hisobot</span>
          </button>
        </div>
      </div>
    </div>
  );
}
