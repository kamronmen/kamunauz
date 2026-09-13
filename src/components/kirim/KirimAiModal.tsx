"use client";

import { useState } from "react";
import { ParsedInvoiceItem } from "@/types";
import { formatMoney } from "@/lib/utils";
import { 
  X, 
  Sparkles, 
  Upload, 
  Check, 
  Trash2, 
  FileText, 
  Loader2, 
  ArrowRight, 
  AlertCircle,
  PackageCheck
} from "lucide-react";
import { sound } from "@/lib/sound";
import confetti from "canvas-confetti";

interface KirimAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SAMPLE_INVOICES = [
  `Optom Ombor "Oziq-ovqat Savdo"
1. Coca-Cola Classic 1.5L - 20 dona x 12000
2. Fanta Orange 1.5L - 15 dona x 12000
3. Shakar Xorazm 1kg - 50 kg x 10500
4. Kungaboqar yog'i Oila tanlovi - 30 dona x 14500
5. Makaron Rollton 400g - 40 dona x 6200
6. Musaffo Sut 3.2% - 25 dona x 10500
7. Snickers Super 80g - 36 dona x 7500`,
  `"Non va qandolat sexi" nakladnoyi:
- Qolipli non (Buxanka) - 60 ta x 2500 so'm
- Samarqand patir non - 25 ta x 5000 so'm
- Shirin kulcha - 40 ta x 3000 so'm`,
];

export function KirimAiModal({ isOpen, onClose, onSuccess }: KirimAiModalProps) {
  const [rawText, setRawText] = useState("");
  const [markupPercent, setMarkupPercent] = useState<number>(20);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [parsedItems, setParsedItems] = useState<ParsedInvoiceItem[]>([]);
  const [step, setStep] = useState<"INPUT" | "PREVIEW">("INPUT");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (!rawText.trim()) {
      setError("Iltimos, nakladnoy matnini kiriting yoki namunalardan birini tanlang!");
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);

      const res = await fetch("/api/kirim-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText, markupPercent }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tahlil qilishda xatolik");

      if (data.items.length === 0) {
        throw new Error("Matndan mahsulotlar topilmadi. Formatni tekshiring.");
      }

      setParsedItems(data.items);
      setStep("PREVIEW");
      sound.playBeep();
    } catch (err: any) {
      sound.playError();
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLoadSample = (sampleText: string) => {
    setRawText(sampleText);
    setError(null);
    sound.playBeep();
  };

  const handleUpdateItem = (index: number, field: keyof ParsedInvoiceItem, value: any) => {
    const updated = [...parsedItems];
    updated[index] = { ...updated[index], [field]: value };
    setParsedItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setParsedItems(parsedItems.filter((_, i) => i !== index));
  };

  const handleBatchImport = async () => {
    if (parsedItems.length === 0) return;

    try {
      setIsImporting(true);
      setError(null);

      const res = await fetch("/api/kirim-ai/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: parsedItems }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Omborga kiritishda xatolik");

      sound.playSuccess();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });

      onSuccess();
      onClose();
      // Reset state
      setStep("INPUT");
      setRawText("");
      setParsedItems([]);
    } catch (err: any) {
      sound.playError();
      setError(err.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Kirim AI &bull; Aqlli Nakladnoy</h3>
                <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-extrabold uppercase">
                  AI Auto-Scan
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Optom qog'oz chek yoki ro'yxatni 1 soniyada omborga kirim qilish
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

        {/* Modal Body */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === "INPUT" ? (
            <div className="space-y-4">
              {/* Markup Selector */}
              <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Avtomatik ustama (Sotish narxi foizi):
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Tannarx ustiga do'kon foydasi qo'shiladi
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[15, 20, 25, 30].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setMarkupPercent(pct)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        markupPercent === pct
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      +{pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Sample Buttons */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Tezkor namunaviy nakladnoy:</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleLoadSample(SAMPLE_INVOICES[0])}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-medium transition-colors"
                  >
                    📄 1-Namuna: Optom Oziq-ovqat va ichimliklar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSample(SAMPLE_INVOICES[1])}
                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-medium transition-colors"
                  >
                    🍞 2-Namuna: Non sexi nakladnoyi
                  </button>
                </div>
              </div>

              {/* Raw Text / Photo Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Nakladnoy matnini kiriting yoki joylashtiring (Paste):
                </label>
                <textarea
                  rows={8}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Masalan:&#10;1. Coca-Cola 1.5L - 20 dona x 12000&#10;2. Shakar 50kg 10500&#10;3. Non buxanka 50 dona 2500"
                  className="w-full font-mono text-xs p-3.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    Tahlil qilingan mahsulotlar ({parsedItems.length} ta)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Narx va miqdorlarni tekshiring yoki o'zgartiring
                  </p>
                </div>
                <button
                  onClick={() => setStep("INPUT")}
                  className="text-xs text-slate-600 font-bold hover:underline"
                >
                  &larr; Matnni tahrirlash
                </button>
              </div>

              {/* Parsed Items Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white max-h-[350px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="p-2.5">Mahsulot nomi</th>
                      <th className="p-2.5 w-20">Miqdor</th>
                      <th className="p-2.5 w-28">Tannarx</th>
                      <th className="p-2.5 w-28">Sotish (+{markupPercent}%)</th>
                      <th className="p-2.5 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleUpdateItem(idx, "name", e.target.value)}
                            className="w-full font-semibold text-xs border border-transparent hover:border-slate-200 focus:border-emerald-500 rounded px-1.5 py-1 focus:outline-none"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(idx, "quantity", parseFloat(e.target.value) || 0)}
                            className="w-full font-mono text-xs border border-transparent hover:border-slate-200 focus:border-emerald-500 rounded px-1.5 py-1 focus:outline-none"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            value={item.costPrice}
                            onChange={(e) => {
                              const cost = parseFloat(e.target.value) || 0;
                              const selling = Math.ceil((cost * (1 + markupPercent / 100)) / 500) * 500;
                              handleUpdateItem(idx, "costPrice", cost);
                              handleUpdateItem(idx, "sellingPrice", selling);
                            }}
                            className="w-full font-mono text-xs border border-transparent hover:border-slate-200 focus:border-emerald-500 rounded px-1.5 py-1 focus:outline-none"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            value={item.sellingPrice}
                            onChange={(e) => handleUpdateItem(idx, "sellingPrice", parseFloat(e.target.value) || 0)}
                            className="w-full font-bold text-emerald-700 text-xs border border-transparent hover:border-slate-200 focus:border-emerald-500 rounded px-1.5 py-1 focus:outline-none"
                          />
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            onClick={() => handleRemoveItem(idx)}
                            className="text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 md:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
          >
            Yopish
          </button>

          {step === "INPUT" ? (
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI tahlil qilmoqda...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>AI orqali tahlil qilish</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleBatchImport}
              disabled={isImporting || parsedItems.length === 0}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Omborga kiritilmoqda...</span>
                </>
              ) : (
                <>
                  <PackageCheck className="w-4 h-4" />
                  <span>Hammasini omborga kiritish ({parsedItems.length} ta)</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
