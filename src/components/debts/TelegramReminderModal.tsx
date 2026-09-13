"use client";

import { useState } from "react";
import { Customer } from "@/types";
import { formatMoney } from "@/lib/utils";
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  MessageSquare, 
  Sparkles, 
  Smile, 
  Briefcase, 
  AlertTriangle 
} from "lucide-react";
import { sound } from "@/lib/sound";

interface TelegramReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

export function TelegramReminderModal({
  isOpen,
  onClose,
  customer,
}: TelegramReminderModalProps) {
  const [templateType, setTemplateType] = useState<"FRIENDLY" | "OFFICIAL" | "FIRM">("FRIENDLY");
  const [copied, setCopied] = useState(false);

  if (!isOpen || !customer) return null;

  const formattedDebt = formatMoney(customer.totalDebt);

  const templates = {
    FRIENDLY: `Assalomu alaykum, ${customer.name}! Ishlar yaxshimi?\n\n"Baraka Savdo" do'konidagi hisob-kitobingiz bo'yicha kichik eslatma: joriy qarz miqdori ${formattedDebt}.\n\nBo'sh vaqtingizda to'lab qo'ysangiz juda xursand bo'lardik. Rahmat! 😊`,
    OFFICIAL: `Hurmatli ${customer.name}!\n\nSizning "Baraka Savdo" do'koni oldidagi qarzdorligingiz ${formattedDebt} tashkil etmoqda.\n\nOylik hisob-kitoblar va do'kon auditi munosabati bilan ushbu summani to'lashingizni so'raymiz.\nTo'lovni Click / Payme orqali ham amalga oshirishingiz mumkin: +998 90 123 45 67\n\nSavdo OS DOKONPRO`,
    FIRM: `Hurmatli ${customer.name}!\n\nDo'konimizdagi ${formattedDebt} miqdoridagi qarzingiz to'lov muddati o'tib ketgan.\n\nDo'konimizdan keyingi xaridlarni nasiyaga davom ettirish uchun iltimos, bugun kun davomida to'lovni to'liq yopishingizni so'raymiz.`,
  };

  const currentMessage = templates[templateType];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMessage);
    sound.playBeep();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenTelegram = () => {
    sound.playBeep();
    const encodedText = encodeURIComponent(currentMessage);
    window.open(`https://t.me/share/url?text=${encodedText}`, "_blank");
  };

  const handleOpenSms = () => {
    sound.playBeep();
    const cleanPhone = customer.phone.replace(/[^\d\+]/g, "");
    const encodedText = encodeURIComponent(currentMessage);
    window.open(`sms:${cleanPhone}?body=${encodedText}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span>"Yuzxotirchiliksiz" Nasiya Eslatmasi</span>
              </h3>
              <p className="text-xs text-slate-600">
                {customer.name} &bull; <span className="font-bold text-rose-600">{formattedDebt}</span>
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

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Template Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
              Xabar ohangini tanlang:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTemplateType("FRIENDLY")}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all ${
                  templateType === "FRIENDLY"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-bold"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <Smile className="w-5 h-5 text-emerald-600" />
                <span className="text-xs">Do'stona</span>
              </button>

              <button
                type="button"
                onClick={() => setTemplateType("OFFICIAL")}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all ${
                  templateType === "OFFICIAL"
                    ? "border-blue-600 bg-blue-50 text-blue-900 font-bold"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <Briefcase className="w-5 h-5 text-blue-600" />
                <span className="text-xs">Rasmiy</span>
              </button>

              <button
                type="button"
                onClick={() => setTemplateType("FIRM")}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all ${
                  templateType === "FIRM"
                    ? "border-rose-600 bg-rose-50 text-rose-900 font-bold"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span className="text-xs">Qat'iy</span>
              </button>
            </div>
          </div>

          {/* Message Preview */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 block">
              Xabar matni (avtomatik shakllantirildi):
            </label>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-medium whitespace-pre-wrap leading-relaxed shadow-inner">
              {currentMessage}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/80 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Nusxalandi!" : "Nusxa olish"}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenSms}
            className="flex-1 py-2.5 px-3 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <MessageSquare className="w-4 h-4" />
            <span>SMS yuborish</span>
          </button>

          <button
            type="button"
            onClick={handleOpenTelegram}
            className="flex-1 py-2.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-sky-500/20"
          >
            <Send className="w-4 h-4" />
            <span>Telegram</span>
          </button>
        </div>
      </div>
    </div>
  );
}
