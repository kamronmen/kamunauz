"use client";

import { useState } from "react";
import { Customer } from "@/types";
import { formatMoney } from "@/lib/utils";
import { X, Send, MessageSquare, Copy, Check } from "lucide-react";

interface DebtReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

export function DebtReminderModal({
  isOpen,
  onClose,
  customer,
}: DebtReminderModalProps) {
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);

  if (!isOpen || !customer) return null;

  // Personalized debt reminder message
  const reminderMessage = `Assalomu alaykum, hurmatli ${customer.name}!\n\n"Baraka Savdo" do'konidan xaridingiz uchun rahmat. Eslatib o'tamiz, sizning hisobingizda ${formatMoney(customer.totalDebt)} miqdorida nasiya qoldig'i mavjud.\n\nIltimos, imkon qadar to'lovni amalga oshirishingizni so'raymiz.\nSavollar bo'yicha: +998 90 123 45 67\n\nKuningiz xayrli o'tsin!`;

  const handleCopy = () => {
    navigator.clipboard.writeText(reminderMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendTelegram = () => {
    // Open Telegram web or app with pre-filled message if phone exists
    const cleanPhone = customer.phone.replace(/[^0-9]/g, "");
    const encodedText = encodeURIComponent(reminderMessage);
    window.open(`https://t.me/share/url?url=&text=${encodedText}`, "_blank");
  };

  const handleSendSMS = () => {
    const cleanPhone = customer.phone.replace(/[^0-9]/g, "");
    const encodedText = encodeURIComponent(reminderMessage);
    window.open(`sms:${cleanPhone}?body=${encodedText}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-slate-900 text-base">
                Nasiya Eslatmasi (SMS & Telegram)
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {customer.name} ({customer.phone})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-amber-800 block uppercase">
                Mavjud Qarz Summasi:
              </span>
              <span className="text-xl font-black text-amber-950">
                {formatMoney(customer.totalDebt)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-amber-800 bg-amber-200/80 px-2.5 py-1 rounded-full">
                {customer.phone}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5">
              Tayyorlangan Eslatma Matni:
            </label>
            <textarea
              value={reminderMessage}
              readOnly
              rows={6}
              className="w-full text-xs font-medium p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Nusxalandi!" : "Nusxa olish"}</span>
            </button>

            <button
              onClick={handleSendTelegram}
              className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Telegram orqali</span>
            </button>

            <button
              onClick={handleSendSMS}
              className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              <span>SMS orqali</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
