"use client";

import { Product } from "@/types";
import { formatMoney } from "@/lib/utils";
import { Zap, Plus } from "lucide-react";
import { sound } from "@/lib/sound";
import { useCartStore } from "@/store/useCartStore";

interface FastProductsBarProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

const POPULAR_NAMES = [
  "Non",
  "Tandir non",
  "Paket",
  "Katta paket",
  "Suv 0.5",
  "Suv 1.5",
  "Coca Cola 0.5",
  "Pepsi 0.5",
  "Kofe 3v1",
  "Shakar 1kg",
  "Tuxum 1 dona"
];

export function FastProductsBar({ products, onAddToCart }: FastProductsBarProps) {
  const { cart } = useCartStore();

  const fastProducts = products
    .filter((p) =>
      POPULAR_NAMES.some((name) =>
        p.name.toLowerCase().includes(name.toLowerCase())
      )
    )
    .slice(0, 8);

  const displayList = fastProducts.length > 0 ? fastProducts : products.slice(0, 6);

  if (displayList.length === 0) return null;

  return (
    <div className="bg-emerald-950/5 border border-emerald-500/20 rounded-2xl p-2.5 space-y-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900">
          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
          <span>Tezkor Sotuv (1-bosishda savatga)</span>
        </div>
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
          Tezkor tovarlar
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        {displayList.map((product) => {
          const cartItem = cart.find(
            (i) => i.product.id === product.id || (product.barcode && i.product.barcode === product.barcode)
          );
          const inCartQty = cartItem ? cartItem.quantity : 0;
          const availableStock = Math.max(0, product.stockQuantity - inCartQty);
          const isOutOfStock = availableStock <= 0;

          return (
            <button
              key={product.id}
              disabled={isOutOfStock}
              onClick={() => {
                if (isOutOfStock) {
                  sound.playError();
                  return;
                }
                sound.playBeep();
                onAddToCart(product);
              }}
              className={`group p-2 rounded-xl border text-left transition-all active:scale-95 flex flex-col justify-between h-14 ${
                isOutOfStock
                  ? "bg-rose-50/60 border-rose-200 opacity-60 cursor-not-allowed"
                  : inCartQty > 0
                  ? "bg-emerald-50/50 border-emerald-500 shadow-sm"
                  : "bg-white border-emerald-200/60 hover:border-emerald-500 hover:shadow-md"
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-extrabold text-[11px] text-slate-800 truncate group-hover:text-emerald-700">
                  {product.name}
                </span>
                <Plus className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 flex-shrink-0" />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-auto">
                <span className="font-black text-emerald-700 text-[11px]">
                  {formatMoney(product.sellingPrice)}
                </span>
                {isOutOfStock ? (
                  <span className="text-[9px] text-rose-700 font-bold bg-rose-100 px-1 rounded">
                    Qolmadi!
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-500 font-medium">
                    {availableStock} ta
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
