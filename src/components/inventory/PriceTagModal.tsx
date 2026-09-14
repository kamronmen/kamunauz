"use client";

import { useState } from "react";
import { Product } from "@/types";
import { formatMoney } from "@/lib/utils";
import { X, Printer, CheckSquare, Square, Tag } from "lucide-react";

interface PriceTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

export function PriceTagModal({ isOpen, onClose, products }: PriceTagModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(products.map((p) => p.id));
  const [tagSize, setTagSize] = useState<"small" | "medium" | "large">("medium");

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedIds(products.map((p) => p.id));
  const clearSelection = () => setSelectedIds([]);

  const handlePrint = () => {
    window.print();
  };

  const selectedProducts = products.filter((p) => selectedIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header - Screen only */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-slate-900 text-base sm:text-lg">
                Tovar Narx Yorliqlari (Cennik) Generatori
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Do'kon javonlari va vitrina uchun narx yorliqlarini chop etish
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar & Product Selector - Screen only */}
        <div className="p-4 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={selectAll}
              className="text-xs font-bold text-emerald-700 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200"
            >
              Hammasini tanlash ({products.length})
            </button>
            <button
              onClick={clearSelection}
              className="text-xs font-bold text-slate-600 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200"
            >
              Tozalash
            </button>
            <span className="text-xs font-bold text-slate-500 ml-2">
              Tanlandi: <strong className="text-slate-900">{selectedIds.length}</strong> ta
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">O'lcham:</span>
            <select
              value={tagSize}
              onChange={(e) => setTagSize(e.target.value as any)}
              className="text-xs font-bold border border-slate-300 rounded-xl px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="small">Kichik (3x5 cm)</option>
              <option value="medium">O'rtacha (5x7 cm)</option>
              <option value="large">Katta Vitrina (7x10 cm)</option>
            </select>

            <button
              onClick={handlePrint}
              disabled={selectedProducts.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Chop Etish (Print)</span>
            </button>
          </div>
        </div>

        {/* Product selection chips - Screen only */}
        <div className="p-3 bg-slate-50/50 border-b border-slate-100 max-h-32 overflow-y-auto flex flex-wrap gap-1.5 print:hidden">
          {products.map((p) => {
            const isSelected = selectedIds.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => toggleSelect(p.id)}
                className={`text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {isSelected ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3 text-slate-400" />}
                <span className="truncate max-w-[140px]">{p.name}</span>
              </button>
            );
          })}
        </div>

        {/* Printable Preview Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-100/60 print:bg-white print:p-0">
          {selectedProducts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-bold text-sm">
              Hech qanday tovar tanlanmagan. Chop etish uchun tovarlarni belgilang.
            </div>
          ) : (
            <div
              className={`grid gap-3 print:gap-2 ${
                tagSize === "small"
                  ? "grid-cols-2 sm:grid-cols-4 md:grid-cols-6 print:grid-cols-4"
                  : tagSize === "medium"
                  ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 print:grid-cols-3"
                  : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 print:grid-cols-2"
              }`}
            >
              {selectedProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-white border-2 border-dashed border-slate-400 p-3 rounded-xl flex flex-col justify-between text-center relative break-inside-avoid print:border-solid print:border-slate-800"
                >
                  <div className="border-b border-slate-200 pb-1 mb-1">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-800 block">
                      Baraka Savdo
                    </span>
                    <h3 className="font-black text-slate-900 text-xs sm:text-sm line-clamp-2 leading-tight">
                      {p.name}
                    </h3>
                  </div>

                  <div className="py-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">
                      Narxi (1 dona/kg):
                    </span>
                    <span className="text-base sm:text-lg font-black text-emerald-700 block">
                      {formatMoney(p.sellingPrice)}
                    </span>
                  </div>

                  {p.barcode && (
                    <div className="pt-1 border-t border-slate-200 mt-auto flex flex-col items-center">
                      <div className="font-mono text-[10px] tracking-widest text-slate-600 font-black">
                        ||| | || ||| || |||
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 font-bold">
                        {p.barcode}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
