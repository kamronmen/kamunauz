"use client";

import { Sale } from "@/types";
import { formatMoney, formatDateUz, getPaymentTypeLabel } from "@/lib/utils";
import { X, Printer, CheckCircle, Store, Phone, MapPin } from "lucide-react";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

export function ReceiptModal({ isOpen, onClose, sale }: ReceiptModalProps) {
  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Action Header (Excluded from print) */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 no-print">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-sm">Savdo muvaffaqiyatli!</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thermal Receipt Content Container */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs bg-white text-slate-900" id="printable-receipt">
          {/* Store Header */}
          <div className="text-center pb-4 border-b border-dashed border-slate-400 space-y-1">
            <div className="flex justify-center mb-1">
              <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center">
                <Store className="w-5 h-5" />
              </div>
            </div>
            <h2 className="font-extrabold text-base tracking-tight uppercase">"BARAKA SAVDO"</h2>
            <p className="text-[11px] text-slate-600 flex items-center justify-center gap-1">
              <MapPin className="w-3 h-3" /> Toshkent sh., Chilonzor 19-mavze
            </p>
            <p className="text-[11px] text-slate-600 flex items-center justify-center gap-1">
              <Phone className="w-3 h-3" /> +998 90 123 45 67
            </p>
          </div>

          {/* Sale Metadata */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Chek №:</span>
              <span className="font-bold">#{sale.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Sana & Vaqt:</span>
              <span>{formatDateUz(sale.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">To'lov turi:</span>
              <span className="font-bold uppercase">{getPaymentTypeLabel(sale.paymentType)}</span>
            </div>
            {sale.customer && (
              <div className="flex justify-between pt-1 border-t border-slate-200 text-amber-900">
                <span className="font-semibold">Xaridor (Nasiya):</span>
                <span className="font-bold">{sale.customer.name}</span>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="py-3 border-b border-dashed border-slate-400 space-y-2">
            <div className="flex justify-between font-bold text-[11px] text-slate-700 pb-1 border-b border-slate-200">
              <span>Mahsulot</span>
              <span>Jami</span>
            </div>
            {sale.items?.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="truncate pr-2">{item.product?.name || "Mahsulot"}</span>
                  <span>{formatMoney(item.subtotal)}</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  {item.quantity} × {formatMoney(item.sellingPrice)}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="py-3 border-b border-dashed border-slate-400 space-y-1.5">
            <div className="flex justify-between text-sm font-extrabold">
              <span>JAMI TO'LOV:</span>
              <span className="text-base">{formatMoney(sale.totalAmount)}</span>
            </div>
            {sale.paymentType === "DEBT" && sale.customer && (
              <div className="flex justify-between text-[11px] text-rose-700 pt-1 border-t border-slate-200">
                <span>Joriy umumiy qarz:</span>
                <span className="font-bold">{formatMoney(sale.customer.totalDebt)}</span>
              </div>
            )}
          </div>

          {/* Receipt Footer */}
          <div className="pt-4 text-center space-y-1 text-[11px] text-slate-600">
            <p className="font-bold uppercase">Xaridingiz uchun rahmat!</p>
            <p className="text-[10px] text-slate-400">DOKONPRO orqali chop etildi</p>
            <div className="font-mono text-[10px] text-slate-400 tracking-widest pt-2">
              *** BARAKA VA RIZQ TIZIMI ***
            </div>
          </div>
        </div>

        {/* Footer Buttons (Excluded from print) */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-2 no-print">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
          >
            Yopish
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Chop etish</span>
          </button>
        </div>
      </div>
    </div>
  );
}
