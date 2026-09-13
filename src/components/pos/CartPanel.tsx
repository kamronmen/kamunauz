"use client";

import { CartItem } from "@/types";
import { formatMoney } from "@/lib/utils";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { sound } from "@/lib/sound";

interface CartPanelProps {
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onOpenCheckout: () => void;
}

export function CartPanel({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOpenCheckout,
}: CartPanelProps) {
  const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleQtyChange = (productId: string, newQty: number, maxStock: number) => {
    if (newQty <= 0) {
      onRemoveItem(productId);
      return;
    }
    if (newQty > maxStock) {
      sound.playError();
      return;
    }
    onUpdateQuantity(productId, newQty);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Cart Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Savatcha</h3>
            <p className="text-[11px] text-slate-500">{totalItemsCount} dona mahsulot</p>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            onClick={() => {
              if (confirm("Savatchani bo'shatmoqchimisiz?")) {
                onClearCart();
              }
            }}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Tozalash</span>
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-slate-50">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <ShoppingBag className="w-8 h-8 text-slate-300" />
            </div>
            <p className="font-semibold text-slate-600 text-sm">Savatcha bo'sh</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
              Mahsulotlarni tanlang yoki shtrix-kod skaner qiling
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.product.id}
              className="pt-2 flex items-center justify-between gap-3 group animate-in fade-in"
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-xs text-slate-900 truncate">
                  {item.product.name}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {formatMoney(item.product.sellingPrice)}
                  </span>
                  <span className="text-[10px] text-slate-400">×</span>
                  <span className="text-[11px] font-bold text-slate-700">
                    {item.quantity}
                  </span>
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() =>
                    handleQtyChange(
                      item.product.id,
                      item.quantity - 1,
                      item.product.stockQuantity
                    )
                  }
                  className="w-7 h-7 rounded-lg bg-white shadow-2xs hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold transition-colors active:scale-95"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  min="1"
                  max={item.product.stockQuantity}
                  value={item.quantity}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) {
                      handleQtyChange(
                        item.product.id,
                        val,
                        item.product.stockQuantity
                      );
                    }
                  }}
                  className="w-10 text-center font-bold text-xs bg-transparent focus:outline-none"
                />
                <button
                  onClick={() =>
                    handleQtyChange(
                      item.product.id,
                      item.quantity + 1,
                      item.product.stockQuantity
                    )
                  }
                  className="w-7 h-7 rounded-lg bg-white shadow-2xs hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold transition-colors active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Subtotal & Delete */}
              <div className="text-right min-w-[75px]">
                <div className="text-xs font-extrabold text-slate-900">
                  {formatMoney(item.subtotal)}
                </div>
                <button
                  onClick={() => onRemoveItem(item.product.id)}
                  className="text-[10px] text-slate-400 hover:text-rose-600 font-medium transition-colors"
                >
                  O'chirish
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Footer / Checkout Action */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/80 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Jami to'lov:</span>
          <span className="text-xl font-extrabold text-slate-900 tracking-tight">
            {formatMoney(totalAmount)}
          </span>
        </div>

        <button
          onClick={onOpenCheckout}
          disabled={cart.length === 0}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-150 active:scale-[0.99] ${
            cart.length === 0
              ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 hover:shadow-emerald-600/40"
          }`}
        >
          <span>To'lovga o'tish</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
