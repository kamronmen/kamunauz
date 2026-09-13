"use client";

import { useState } from "react";
import { Product } from "@/types";
import { formatMoney } from "@/lib/utils";
import { X, Printer, Barcode, Check } from "lucide-react";
import { sound } from "@/lib/sound";

interface BarcodeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

export function BarcodeGeneratorModal({
  isOpen,
  onClose,
  products,
}: BarcodeGeneratorModalProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || "");
  const [labelCount, setLabelCount] = useState<number>(12);

  if (!isOpen) return null;

  const product = products.find((p) => p.id === selectedProductId) || products[0];

  const handlePrint = () => {
    sound.playBeep();
    window.print();
  };

  const barcodeCode = product?.barcode || `2000${product?.id.slice(0, 6).toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 no-print">
          <div className="flex items-center gap-2">
            <Barcode className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-sm">Shtrix-kod & Narx Yorlig'i Chop Etish</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Controls (Excluded from print) */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 space-y-3 no-print">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Mahsulotni tanlang:
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({formatMoney(p.sellingPrice)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Chop etish soni (dona):
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={labelCount}
                onChange={(e) => setLabelCount(parseInt(e.target.value) || 1)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
              />
            </div>
          </div>
        </div>

        {/* Printable Labels Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100/50" id="printable-receipt">
          {product && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[...Array(labelCount)].map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white border-2 border-slate-900 rounded-xl p-2.5 text-center font-sans space-y-1 shadow-xs flex flex-col justify-between"
                >
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500 block">
                    BARAKA SAVDO
                  </span>
                  <h5 className="font-extrabold text-xs text-slate-900 line-clamp-1 leading-tight">
                    {product.name}
                  </h5>

                  {/* Visual Barcode Graphic */}
                  <div className="py-1">
                    <div className="font-mono text-[10px] font-bold text-slate-800 tracking-widest bg-slate-100 py-1 px-2 rounded border border-slate-300 inline-block">
                      ||| | |||| | ||| {barcodeCode}
                    </div>
                  </div>

                  <div className="pt-0.5 border-t border-slate-200">
                    <span className="text-sm font-black text-slate-900 block">
                      {formatMoney(product.sellingPrice)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 no-print">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100"
          >
            Yopish
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-extrabold text-xs flex items-center gap-2 shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>Yorliqlarni chop etish ({labelCount} ta)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
