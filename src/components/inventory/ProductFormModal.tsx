"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types";
import { CATEGORIES } from "@/lib/utils";
import { X, Package, Loader2, AlertCircle } from "lucide-react";
import { sound } from "@/lib/sound";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSuccess: () => void;
}

export function ProductFormModal({
  isOpen,
  onClose,
  product,
  onSuccess,
}: ProductFormModalProps) {
  const [barcode, setBarcode] = useState("");
  const [name, setName] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("0");
  const [minStockAlert, setMinStockAlert] = useState("5");
  const [category, setCategory] = useState("Oziq-ovqat");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (product) {
        setBarcode(product.barcode || "");
        setName(product.name);
        setCostPrice(product.costPrice.toString());
        setSellingPrice(product.sellingPrice.toString());
        setStockQuantity(product.stockQuantity.toString());
        setMinStockAlert(product.minStockAlert.toString());
        setCategory(product.category || "Oziq-ovqat");
      } else {
        setBarcode("");
        setName("");
        setCostPrice("");
        setSellingPrice("");
        setStockQuantity("0");
        setMinStockAlert("5");
        setCategory("Oziq-ovqat");
      }
      setError(null);
    }
  }, [isOpen, product]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !costPrice || !sellingPrice) {
      setError("Mahsulot nomi, tannarxi va sotish narxi kiritilishi shart!");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const url = product ? `/api/products/${product.id}` : "/api/products";
      const method = product ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barcode: barcode ? barcode.trim() : null,
          name: name.trim(),
          costPrice: parseFloat(costPrice) || 0,
          sellingPrice: parseFloat(sellingPrice) || 0,
          stockQuantity: parseFloat(stockQuantity) || 0,
          minStockAlert: parseFloat(minStockAlert) || 5,
          category,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Mahsulotni saqlashda xatolik");

      sound.playBeep();
      onSuccess();
      onClose();
    } catch (err: any) {
      sound.playError();
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {product ? "Mahsulotni tahrirlash" : "Yangi mahsulot qo'shish"}
              </h3>
              <p className="text-xs text-slate-500">
                Ombor tovari ma'lumotlarini kiriting
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Mahsulot nomi *:
            </label>
            <input
              type="text"
              placeholder="Masalan: Coca-Cola Classic 1.5L"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Shtrix-kod (Barcode):
              </label>
              <input
                type="text"
                placeholder="4780001001"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full text-xs font-mono px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Kategoriya:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Tannarx (Kirim narxi) *:
              </label>
              <input
                type="number"
                placeholder="12000"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                required
                className="w-full text-sm font-bold px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Sotish narxi *:
              </label>
              <input
                type="number"
                placeholder="15000"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                required
                className="w-full text-sm font-extrabold text-emerald-700 px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Mavjud miqdor (Qoldiq):
              </label>
              <input
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Kam qolganda ogohlantirish limit:
              </label>
              <input
                type="number"
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saqlanmoqda...</span>
                </>
              ) : (
                <span>Saqlash</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
