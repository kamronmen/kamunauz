"use client";

import { useEffect, useState } from "react";
import { Product, Sale } from "@/types";
import { CATEGORIES } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import { ProductCard } from "@/components/pos/ProductCard";
import { CartPanel } from "@/components/pos/CartPanel";
import { CheckoutModal } from "@/components/pos/CheckoutModal";
import { ReceiptModal } from "@/components/pos/ReceiptModal";
import { BarcodeScannerModal } from "@/components/pos/BarcodeScannerModal";
import { KirimAiModal } from "@/components/kirim/KirimAiModal";
import { ShiftCloseModal } from "@/components/pos/ShiftCloseModal";
import { AuditAlertsBanner } from "@/components/audit/AuditAlertsBanner";
import { 
  Search, 
  Barcode, 
  Sparkles, 
  RefreshCw, 
  ShoppingBag, 
  X,
  ShieldCheck
} from "lucide-react";
import { sound } from "@/lib/sound";

export default function PosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Barchasi");

  // Modals
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isKirimAiOpen, setIsKirimAiOpen] = useState(false);
  const [isShiftCloseOpen, setIsShiftCloseOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  // Zustand Store
  const { cart, addItem, updateQuantity, removeItem, clearCart } = useCartStore();

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedCategory && selectedCategory !== "Barchasi") {
        params.append("category", selectedCategory);
      }
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

  const handleBarcodeScanned = async (barcode: string) => {
    try {
      const res = await fetch(`/api/products?barcode=${encodeURIComponent(barcode)}`);
      if (res.ok) {
        const product = await res.json();
        if (product && product.id) {
          addItem(product);
        } else {
          sound.playError();
          alert(`Shtrix-kod topilmadi: ${barcode}`);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaleCompleted = (sale: Sale) => {
    setCompletedSale(sale);
    setIsReceiptOpen(true);
    clearCart();
    fetchProducts();
  };

  return (
    <div className="space-y-4">
      {/* Loss & Theft Audit Alert Banner */}
      <AuditAlertsBanner />

      {/* Main Kassa POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Search, Categories, Product Catalog (8 cols) */}
        <div className="lg:col-span-8 space-y-3.5">
          {/* Top Control Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Mahsulot nomi yoki shtrix-kod..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-8 py-2.5 bg-slate-100/80 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Kirim AI Button */}
              <button
                onClick={() => setIsKirimAiOpen(true)}
                className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
                <span>Kirim AI</span>
              </button>

              {/* Barcode Scanner Button */}
              <button
                onClick={() => setIsScannerOpen(true)}
                className="px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors active:scale-95"
              >
                <Barcode className="w-4 h-4 text-slate-300" />
                <span className="hidden sm:inline">Skaner</span>
              </button>

              {/* Shift Close / Z-Report Button */}
              <button
                onClick={() => setIsShiftCloseOpen(true)}
                className="px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 font-bold text-xs flex items-center gap-1.5 transition-all"
                title="Smenani yopish va Z-Hisobot"
              >
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span className="hidden md:inline">Smena (Z-Report)</span>
              </button>

              {/* Refresh Button */}
              <button
                onClick={() => fetchProducts()}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                title="Yangilash"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Categories Pill Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategory("Barchasi")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === "Barchasi"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Barchasi
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-36 rounded-2xl bg-white border border-slate-200 animate-pulse p-4 flex flex-col justify-between">
                  <div className="w-16 h-4 bg-slate-100 rounded" />
                  <div className="w-28 h-5 bg-slate-200 rounded" />
                  <div className="w-20 h-4 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 text-slate-400 space-y-2">
              <ShoppingBag className="w-10 h-10 mx-auto text-slate-300" />
              <p className="font-bold text-slate-700 text-sm">Mahsulotlar topilmadi</p>
              <p className="text-xs text-slate-400">
                Qidiruv so'zini o'zgartiring yoki "Kirim AI" orqali tovar kiriting
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Sticky POS Cart Panel (4 cols) */}
        <div className="lg:col-span-4 lg:sticky lg:top-20 h-[calc(100vh-100px)]">
          <CartPanel
            cart={cart}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeItem}
            onClearCart={clearCart}
            onOpenCheckout={() => setIsCheckoutOpen(true)}
          />
        </div>
      </div>

      {/* Modals */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        onSaleCompleted={handleSaleCompleted}
      />

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        sale={completedSale}
      />

      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleBarcodeScanned}
      />

      <KirimAiModal
        isOpen={isKirimAiOpen}
        onClose={() => setIsKirimAiOpen(false)}
        onSuccess={() => fetchProducts()}
      />

      <ShiftCloseModal
        isOpen={isShiftCloseOpen}
        onClose={() => setIsShiftCloseOpen(false)}
      />
    </div>
  );
}
