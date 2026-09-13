"use client";

import { useEffect, useState } from "react";
import { Product } from "@/types";
import { formatMoney, CATEGORIES } from "@/lib/utils";
import { ProductFormModal } from "@/components/inventory/ProductFormModal";
import { KirimAiModal } from "@/components/kirim/KirimAiModal";
import { BarcodeGeneratorModal } from "@/components/inventory/BarcodeGeneratorModal";
import { 
  Package, 
  Search, 
  Plus, 
  Sparkles, 
  AlertTriangle, 
  Barcode, 
  Trash2, 
  Edit3, 
  TrendingUp, 
  Layers,
  Printer 
} from "lucide-react";
import { sound } from "@/lib/sound";

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Barchasi");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isKirimAiOpen, setIsKirimAiOpen] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory, lowStockOnly]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedCategory && selectedCategory !== "Barchasi") {
        params.append("category", selectedCategory);
      }
      if (lowStockOnly) params.append("lowStock", "true");

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`"${name}" mahsulotini ombordan o'chirishni tasdiqlaysizmi?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        sound.playBeep();
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Metrics
  const totalStockCount = products.reduce((sum, p) => sum + p.stockQuantity, 0);
  const totalCostValuation = products.reduce((sum, p) => sum + (p.stockQuantity * p.costPrice), 0);
  const totalExpectedRevenue = products.reduce((sum, p) => sum + (p.stockQuantity * p.sellingPrice), 0);
  const lowStockCount = products.filter((p) => p.stockQuantity <= p.minStockAlert).length;

  return (
    <div className="space-y-5">
      {/* Top Inventory Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Jami Tovar Qoldig'i</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">{totalStockCount} dona</p>
          <p className="text-[11px] text-slate-400">{products.length} xil pozitsiyada</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Ombor Tannarx Qiymati</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">{formatMoney(totalCostValuation)}</p>
          <p className="text-[11px] text-slate-400">Jami sarmoya / kelish narxi</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Kutilayotgan Savdo</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-extrabold text-emerald-700">{formatMoney(totalExpectedRevenue)}</p>
          <p className="text-[11px] text-slate-400">Sotilganda keladigan tushum</p>
        </div>

        <div className={`p-4 rounded-2xl border shadow-xs space-y-1 transition-all ${
          lowStockCount > 0 ? "bg-amber-50 border-amber-200" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-xs font-semibold">Kam Qolgan Tovar</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-extrabold text-amber-900">{lowStockCount} ta pozitsiya</p>
          <button
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className="text-[11px] font-bold text-amber-800 underline hover:text-amber-900"
          >
            {lowStockOnly ? "Barchasini ko'rsatish" : "Faqat kam qolganlarni saralash"}
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Mahsulot nomi yoki shtrix-kod orqali qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-100/80 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Barcode Print Trigger */}
          <button
            onClick={() => setIsBarcodeModalOpen(true)}
            className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-all"
            title="Shtrix-kod narx yorliqlarini chop etish"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Shtrix-kod Yorlig'i</span>
          </button>

          {/* Kirim AI Trigger */}
          <button
            onClick={() => setIsKirimAiOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
            <span>Kirim AI (Nakladnoy)</span>
          </button>

          {/* Add Manual Product */}
          <button
            onClick={() => {
              setSelectedProduct(null);
              setIsFormModalOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Mahsulot</span>
          </button>
        </div>
      </div>

      {/* Table Catalog */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Mahsulot Nomi</th>
                <th className="p-3.5">Kategoriya</th>
                <th className="p-3.5">Shtrix-kod</th>
                <th className="p-3.5 text-right">Tannarx</th>
                <th className="p-3.5 text-right">Sotish Narxi</th>
                <th className="p-3.5 text-center">Mavjud Qoldiq</th>
                <th className="p-3.5 text-center">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Mahsulotlar topilmadi
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isLow = p.stockQuantity <= p.minStockAlert;
                  const isOut = p.stockQuantity <= 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">
                        {p.name}
                      </td>
                      <td className="p-3.5">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium text-[11px]">
                          {p.category || "Umumiy"}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-500 text-[11px]">
                        {p.barcode ? (
                          <span className="flex items-center gap-1">
                            <Barcode className="w-3 h-3 text-slate-400" />
                            {p.barcode}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-3.5 text-right font-medium text-slate-600">
                        {formatMoney(p.costPrice)}
                      </td>
                      <td className="p-3.5 text-right font-extrabold text-emerald-700">
                        {formatMoney(p.sellingPrice)}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-full text-[11px] ${
                            isOut
                              ? "bg-red-100 text-red-700"
                              : isLow
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {isLow && <AlertTriangle className="w-3 h-3" />}
                          {p.stockQuantity} ta
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedProduct(p);
                              setIsFormModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="Tahrirlash"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="O'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        product={selectedProduct}
        onSuccess={() => fetchProducts()}
      />

      <KirimAiModal
        isOpen={isKirimAiOpen}
        onClose={() => setIsKirimAiOpen(false)}
        onSuccess={() => fetchProducts()}
      />

      <BarcodeGeneratorModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        products={products}
      />
    </div>
  );
}
