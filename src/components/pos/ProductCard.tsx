"use client";

import { Product } from "@/types";
import { formatMoney } from "@/lib/utils";
import { Plus, Barcode, AlertTriangle, Check } from "lucide-react";
import { sound } from "@/lib/sound";
import { useCartStore } from "@/store/useCartStore";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { cart } = useCartStore();

  // Find item in cart to calculate REAL dynamic remaining stock
  const cartItem = cart.find(
    (i) => i.product.id === product.id || (product.barcode && i.product.barcode === product.barcode)
  );
  const inCartQty = cartItem ? cartItem.quantity : 0;
  const availableStock = Math.max(0, product.stockQuantity - inCartQty);
  const isOutOfStock = availableStock <= 0;
  const isLowStock = !isOutOfStock && availableStock <= product.minStockAlert;

  const handleClick = () => {
    if (isOutOfStock) {
      sound.playError();
      return;
    }
    sound.playBeep();
    onAddToCart(product);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isOutOfStock}
      className={`group relative flex flex-col justify-between text-left p-3.5 rounded-2xl border transition-all duration-150 active:scale-[0.98] ${
        isOutOfStock
          ? "bg-rose-50/40 border-rose-200 cursor-not-allowed opacity-80"
          : inCartQty > 0
          ? "bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
          : isLowStock
          ? "bg-white border-amber-200 hover:border-amber-400 hover:shadow-md"
          : "bg-white border-slate-200 hover:border-emerald-500 hover:shadow-md shadow-xs"
      }`}
    >
      {/* Top badges */}
      <div className="flex items-start justify-between w-full gap-1 mb-2">
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[110px]">
          {product.category || "Umumiy"}
        </span>

        {isOutOfStock ? (
          <span className="text-[10px] font-black text-rose-700 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-md flex items-center gap-0.5 uppercase tracking-wider animate-pulse">
            Qolmadi!
          </span>
        ) : inCartQty > 0 ? (
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />
            <span>{availableStock} ta qoldi</span>
          </span>
        ) : isLowStock ? (
          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded-md flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>{availableStock} ta qoldi</span>
          </span>
        ) : (
          <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
            {availableStock} ta
          </span>
        )}
      </div>

      {/* Product Name */}
      <div className="flex-1 min-h-[38px] mb-2">
        <h4 className="font-bold text-sm text-slate-800 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
          {product.name}
        </h4>
        {product.barcode && (
          <p className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1 truncate">
            <Barcode className="w-3 h-3 text-slate-400 flex-shrink-0" />
            {product.barcode}
          </p>
        )}
      </div>

      {/* Price, Cart badge and Add button */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 w-full">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-medium block">Narxi</span>
            {inCartQty > 0 && (
              <span className="text-[9px] font-black bg-emerald-600 text-white px-1.5 py-0.2 rounded-full">
                Savatda: {inCartQty}
              </span>
            )}
          </div>
          <span className="text-sm font-extrabold text-slate-900 tracking-tight text-emerald-700">
            {formatMoney(product.sellingPrice)}
          </span>
        </div>

        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors shadow-xs ${
            isOutOfStock
              ? "bg-rose-100 text-rose-400"
              : inCartQty > 0
              ? "bg-emerald-600 text-white"
              : "bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white"
          }`}
        >
          <Plus className="w-4 h-4" />
        </div>
      </div>
    </button>
  );
}
