"use client";

import { useEffect, useState } from "react";
import { Customer, Sale, DebtTransaction } from "@/types";
import { formatMoney, formatDateShort } from "@/lib/utils";
import { 
  X, 
  ShoppingBag, 
  Clock, 
  Printer, 
  FileText, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  Receipt
} from "lucide-react";

interface CustomerDebtDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string | null;
}

interface CustomerDetailData extends Customer {
  debts: DebtTransaction[];
  sales: (Sale & {
    items: {
      id: string;
      productId: string;
      quantity: number;
      sellingPrice: number;
      subtotal: number;
      product: {
        id: string;
        name: string;
        barcode: string | null;
        category: string | null;
      };
    }[];
  })[];
}

export function CustomerDebtDetailModal({
  isOpen,
  onClose,
  customerId,
}: CustomerDebtDetailModalProps) {
  const [data, setData] = useState<CustomerDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"items" | "transactions">("items");

  useEffect(() => {
    if (isOpen && customerId) {
      fetchCustomerDetails(customerId);
    } else {
      setData(null);
    }
  }, [isOpen, customerId]);

  const fetchCustomerDetails = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/customers/${id}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Error fetching customer details:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Flatten all borrowed items across debt sales
  const debtSales = data?.sales?.filter((s) => s.paymentType === "DEBT") || [];
  const allSales = data?.sales || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden print:p-0 print:border-none print:shadow-none print:max-h-none print:max-w-none print:absolute print:inset-0">
        
        {/* Modal Header */}
        <div className="p-4 md:p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between gap-4 print:hidden">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-lg text-white">
                {data?.name || "Mijoz Nasiya Tarixi"}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
              {data?.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {data.phone}
                </span>
              )}
              {data?.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {data.address}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
              title="A4 formatda PDF/Chop etish"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">PDF / Chop etish</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Header (Only visible on Print/PDF) */}
        <div className="hidden print:block p-6 border-b border-slate-300">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                "BARAKA SAVDO" DO'KONI
              </h1>
              <p className="text-xs text-slate-600">Oziq-ovqat va nooziq-ovqat mahsulotlari</p>
              <p className="text-xs text-slate-600">Tel: +998 90 123 45 67 | Manzil: Chilonzor 19-mavze</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-slate-800">NASIYA VA SAVDO HISOBOTI</h2>
              <p className="text-xs text-slate-500">Sana: {new Date().toLocaleDateString("uz-UZ")}</p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-100 rounded-lg text-xs space-y-1">
            <p><strong>Mijoz:</strong> {data?.name}</p>
            <p><strong>Telefon:</strong> {data?.phone}</p>
            {data?.address && <p><strong>Manzil:</strong> {data.address}</p>}
            <p className="text-sm font-bold text-rose-700 mt-2">
              Joriy Qarz Balansi: {formatMoney(data?.totalDebt || 0)}
            </p>
          </div>
        </div>

        {/* Summary Metric Strip */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="text-xs font-semibold text-slate-500">
              Joriy qarz summasi:
            </div>
            <div className={`text-xl font-extrabold ${(data?.totalDebt || 0) > 0 ? "text-rose-600" : "text-emerald-600"}`}>
              {formatMoney(data?.totalDebt || 0)}
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab("items")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "items"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🛍️ Olingan Mahsulotlar ({allSales.reduce((acc, s) => acc + (s.items?.length || 0), 0)})
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "transactions"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              💳 To'lovlar & Qarz Harakati ({data?.debts?.length || 0})
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 space-y-4 print:p-0 print:overflow-visible">
          {loading ? (
            <div className="space-y-3 p-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : !data ? (
            <div className="text-center py-12 text-slate-400">Ma'lumot topilmadi</div>
          ) : activeTab === "items" ? (
            /* TAB 1: Itemized Product Purchases */
            <div className="space-y-4">
              {allSales.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
                  Ushbu mijoz nomiga hali kassa orqali mahsulot sotilmagan
                </div>
              ) : (
                allSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs print:border-slate-300 print:shadow-none mb-4"
                  >
                    {/* Sale Header */}
                    <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <Receipt className="w-3.5 h-3.5 text-slate-500" />
                        <span>Chek: {sale.receiptNo}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">{formatDateShort(sale.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            sale.paymentType === "DEBT"
                              ? "bg-amber-100 text-amber-800"
                              : sale.paymentType === "CARD"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {sale.paymentType === "DEBT" ? "Nasiya" : sale.paymentType === "CARD" ? "Karta" : "Naqd"}
                        </span>
                        <span className="font-extrabold text-slate-900">
                          {formatMoney(sale.totalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Items Table */}
                    <div className="p-3">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="text-slate-400 border-b border-slate-100 pb-1 text-[11px]">
                            <th className="font-medium pb-2">Mahsulot Nomi</th>
                            <th className="font-medium pb-2 text-center">Miqdori</th>
                            <th className="font-medium pb-2 text-right">Narxi</th>
                            <th className="font-medium pb-2 text-right">Jami</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {sale.items?.map((item) => (
                            <tr key={item.id} className="text-slate-700">
                              <td className="py-2 font-medium">
                                {item.product?.name || "Mahsulot"}
                                {item.product?.category && (
                                  <span className="text-[10px] text-slate-400 block">
                                    {item.product.category}
                                  </span>
                                )}
                              </td>
                              <td className="py-2 text-center font-bold text-slate-800">
                                {item.quantity} dona/kg
                              </td>
                              <td className="py-2 text-right text-slate-600">
                                {formatMoney(item.sellingPrice)}
                              </td>
                              <td className="py-2 text-right font-extrabold text-slate-900">
                                {formatMoney(item.subtotal)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* TAB 2: Debt Transactions (Borrow & Payments) */
            <div className="space-y-3">
              {data.debts?.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
                  Qarz yoki to'lov tarixi mavjud emas
                </div>
              ) : (
                data.debts.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                          tx.type === "PAYMENT"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {tx.type === "PAYMENT" ? "↓" : "↑"}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">
                          {tx.type === "PAYMENT" ? "Qarz to'landi" : "Nasiya berildi"}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {tx.description || (tx.type === "PAYMENT" ? "To'lov" : "Nasiya savdo")}
                        </p>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-2.5 h-2.5" />
                          {formatDateShort(tx.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-sm font-extrabold ${
                          tx.type === "PAYMENT" ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {tx.type === "PAYMENT" ? "-" : "+"}
                        {formatMoney(tx.amount)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Printable Footer / Signatures for Official A4 PDF */}
        <div className="hidden print:block p-6 mt-6 border-t border-slate-300">
          <div className="grid grid-cols-2 gap-8 pt-4">
            <div className="border-t border-slate-400 pt-2 text-xs">
              <p className="font-bold text-slate-800">Do'kon egasi / Kassir:</p>
              <p className="text-slate-500 mt-6">Imzo: ___________________</p>
            </div>
            <div className="border-t border-slate-400 pt-2 text-xs text-right">
              <p className="font-bold text-slate-800">Mijoz (Qarzdor):</p>
              <p className="text-slate-500 mt-6">Imzo: ___________________</p>
            </div>
          </div>
          <p className="text-[10px] text-center text-slate-400 mt-8">
            SAVDOPRO AI tomonidan avtomatik shakllantirilgan rasmiy qarz hujjati.
          </p>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between print:hidden">
          <span className="text-xs text-slate-500">
            Jami savdolar soni: {allSales.length} ta
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all active:scale-95"
          >
            Yopish
          </button>
        </div>

      </div>
    </div>
  );
}
