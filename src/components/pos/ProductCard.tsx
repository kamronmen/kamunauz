"use client";

import { Product } from "@/types";
import { formatMoney } from "@/lib/utils";
import { Plus, Barcode, AlertTriangle } from "lucide-react";
import { sound } from "@/lib/sound";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = !isOutOfStock && product.stockQuantity <= product.minStockAlert;

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
          ? "bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed"
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
          <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-md flex items-center gap-0.5">
            Qolmagan
          </span>
        ) : isLowStock ? (
          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            {product.stockQuantity} ta
          </span>
        ) : (
          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            {product.stockQuantity} ta
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

      {/* Price and Add button */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 w-full">
        <div>
          <span className="text-[10px] text-slate-400 font-medium block">Narxi</span>
          <span className="text-sm font-extrabold text-slate-900 tracking-tight text-emerald-700">
            {formatMoney(product.sellingPrice)}
          </span>
        </div>
        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-xs">
          <Plus className="w-4 h-4" />
        </div>
      </div>
    </button>
  );
}
