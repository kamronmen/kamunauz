"use client";

import { CartItem } from "@/types";
import { formatMoney } from "@/lib/utils";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, X } from "lucide-react";
import { sound } from "@/lib/sound";

interface MobileCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onOpenCheckout: () => void;
}

export function MobileCartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOpenCheckout,
}: MobileCartDrawerProps) {
  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in lg:hidden">
      {/* Backdrop tap to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Sliding Bottom Sheet Container */}
      <div className="bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl border-t border-slate-200 overflow-hidden animate-in slide-in-from-bottom-10 duration-200">
        
        {/* Drag handle & Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Savatchadagi Mahsulotlar</h3>
              <p className="text-[11px] text-slate-500 font-medium">{totalItemsCount} dona tovar tanlandi</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={() => {
                  if (confirm("Savatchani bo'shatmoqchimisiz?")) {
                    onClearCart();
                    onClose();
                  }
                }}
                className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Tozalash</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Products in Cart */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3 divide-y divide-slate-100">
          {cart.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <ShoppingBag className="w-12 h-12 mx-auto text-slate-300" />
              <p className="font-bold text-slate-700 text-sm">Savatcha bo'sh</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="pt-3 first:pt-0 flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-slate-900 truncate">
                    {item.product.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-emerald-700 font-bold">
                      {formatMoney(item.product.sellingPrice)}
                    </span>
                    <span className="text-[10px] text-slate-400">× {item.quantity}</span>
                  </div>
                </div>

                {/* Large Stepper for Mobile Touch */}
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() =>
                      handleQtyChange(
                        item.product.id,
                        item.quantity - 1,
                        item.product.stockQuantity
                      )
                    }
                    className="w-8 h-8 rounded-lg bg-white shadow-xs text-slate-800 flex items-center justify-center font-extrabold active:scale-90"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-7 text-center font-black text-xs text-slate-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      handleQtyChange(
                        item.product.id,
                        item.quantity + 1,
                        item.product.stockQuantity
                      )
                    }
                    className="w-8 h-8 rounded-lg bg-white shadow-xs text-slate-800 flex items-center justify-center font-extrabold active:scale-90"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Subtotal & Delete */}
                <div className="text-right min-w-[70px]">
                  <div className="text-xs font-black text-slate-900">
                    {formatMoney(item.subtotal)}
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="text-[10px] text-rose-600 font-semibold"
                  >
                    O'chirish
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pinned Bottom Checkout Button inside Drawer */}
        <div className="p-4 border-t border-slate-200 bg-white shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-500 uppercase tracking-wider">Jami to'lov:</span>
            <span className="text-xl font-black text-slate-900">{formatMoney(totalAmount)}</span>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenCheckout();
            }}
            disabled={cart.length === 0}
            className="w-full py-4 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-between shadow-xl shadow-emerald-600/30 active:scale-[0.98] transition-all"
          >
            <span>TO'LOVNI QABUL QILISH</span>
            <div className="flex items-center gap-1">
              <span>{formatMoney(totalAmount)}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>

      </div>
    </div>
  );
}
