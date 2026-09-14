"use client";

import { useEffect, useState } from "react";
import { formatMoney, formatDateShort } from "@/lib/utils";
import { 
  X, 
  Printer, 
  FileText, 
  Calendar, 
  TrendingUp, 
  ShoppingBag, 
  BookOpen, 
  Package, 
  Download,
  Building,
  CheckCircle2
} from "lucide-react";

interface PrintableReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: "DAILY" | "DEBTS" | "INVENTORY";
}

export function PrintableReportModal({
  isOpen,
  onClose,
  reportType,
}: PrintableReportModalProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      loadReportData();
    }
  }, [isOpen, reportType]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      if (reportType === "DAILY") {
        const res = await fetch("/api/analytics?period=today");
        if (res.ok) setData(await res.json());
      } else if (reportType === "DEBTS") {
        const res = await fetch("/api/customers?withDebt=true");
        if (res.ok) setData(await res.json());
      } else if (reportType === "INVENTORY") {
        const res = await fetch("/api/products");
        if (res.ok) setData(await res.json());
      }
    } catch (err) {
      console.error("Report load error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const getTitle = () => {
    switch (reportType) {
      case "DAILY":
        return "KUNLIK SAVDO VA KASSA HISOBOTI";
      case "DEBTS":
        return "NASIYA DAFTARI (QARZDORLAR) HISOBOTI";
      case "INVENTORY":
        return "OMBOR VA TOVARLAR QOLDIG'I HISOBOTI";
      default:
        return "RASMIY DO'KON HISOBOTI";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden print:p-0 print:border-none print:shadow-none print:max-h-none print:max-w-none print:absolute print:inset-0">
        
        {/* Modal Navigation Bar (Hidden on Print) */}
        <div className="p-4 md:p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base md:text-lg text-white">
                {getTitle()}
              </h3>
              <p className="text-xs text-slate-300">
                A4 formatda PDF sifatida yuklab olish yoki printerdan chiqarish
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>PDF / Chop etish</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 print:p-8 print:overflow-visible text-slate-800 font-sans">
          
          {/* Header of the Official Report */}
          <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                "BARAKA SAVDO" DO'KONI
              </h1>
              <p className="text-xs text-slate-600 font-medium">
                Toshkent sh., Chilonzor 19-mavze | Tel: +998 90 123 45 67
              </p>
            </div>
            <div className="text-right space-y-1">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-md uppercase">
                Rasmiy Hujjat
              </span>
              <p className="text-xs text-slate-500 font-medium">
                Sana: {new Date().toLocaleDateString("uz-UZ", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>

          <div className="text-center py-2">
            <h2 className="text-lg font-black text-slate-900 tracking-wide uppercase">
              {getTitle()}
            </h2>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400">Hisobot tayyorlanmoqda...</div>
          ) : reportType === "DAILY" && data ? (
            /* DAILY SALES REPORT VIEW */
            <div className="space-y-5">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[11px] text-slate-500 font-semibold block">Jami Tushum</span>
                  <span className="text-lg font-extrabold text-slate-900">{formatMoney(data.summary?.totalRevenue || 0)}</span>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[11px] text-slate-500 font-semibold block">Cheklar Soni</span>
                  <span className="text-lg font-extrabold text-slate-900">{data.summary?.salesCount || 0} ta</span>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[11px] text-slate-500 font-semibold block">O'rtacha Chek</span>
                  <span className="text-lg font-extrabold text-slate-900">{formatMoney(data.summary?.averageCheck || 0)}</span>
                </div>
              </div>

              {/* Payment Type Breakdown Table */}
              <div>
                <h4 className="font-bold text-xs uppercase text-slate-700 mb-2">To'lov Turlari Bo'yicha Taqsimot:</h4>
                <table className="w-full text-xs text-left border border-slate-200">
                  <thead className="bg-slate-100 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5 font-bold">To'lov Usuli</th>
                      <th className="p-2.5 font-bold text-right">Summasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2.5 font-medium">💵 Naqd Pul (Kassa)</td>
                      <td className="p-2.5 font-bold text-right text-slate-900">{formatMoney(data.paymentBreakdown?.CASH || 0)}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">💳 Plastik Karta (Uzcard/Humo)</td>
                      <td className="p-2.5 font-bold text-right text-slate-900">{formatMoney(data.paymentBreakdown?.CARD || 0)}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">📖 Nasiya (Qarzga berildi)</td>
                      <td className="p-2.5 font-bold text-right text-rose-700">{formatMoney(data.paymentBreakdown?.DEBT || 0)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Recent Sales Table */}
              {data.recentSales && data.recentSales.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs uppercase text-slate-700 mb-2">Savdolar Ro'yxati:</h4>
                  <table className="w-full text-xs text-left border border-slate-200">
                    <thead className="bg-slate-100 border-b border-slate-200">
                      <tr>
                        <th className="p-2 font-bold">Chek No</th>
                        <th className="p-2 font-bold">Vaqti</th>
                        <th className="p-2 font-bold">To'lov</th>
                        <th className="p-2 font-bold text-right">Summasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.recentSales.slice(0, 15).map((s: any) => (
                        <tr key={s.id}>
                          <td className="p-2 font-mono">{s.receiptNo}</td>
                          <td className="p-2 text-slate-600">{formatDateShort(s.createdAt)}</td>
                          <td className="p-2 font-semibold">
                            {s.paymentType === "DEBT" ? "Nasiya" : s.paymentType === "CARD" ? "Karta" : "Naqd"}
                          </td>
                          <td className="p-2 text-right font-bold text-slate-900">{formatMoney(s.totalAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : reportType === "DEBTS" && Array.isArray(data) ? (
            /* DEBTS REPORT VIEW */
            <div className="space-y-4">
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex justify-between items-center">
                <span className="text-xs font-bold text-rose-900">Jami Nasiya Balansi ({data.length} ta mijoz):</span>
                <span className="text-lg font-extrabold text-rose-700">
                  {formatMoney(data.reduce((sum: number, c: any) => sum + (c.totalDebt || 0), 0))}
                </span>
              </div>

              <table className="w-full text-xs text-left border border-slate-200">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 font-bold">#</th>
                    <th className="p-2.5 font-bold">Mijoz Ismi</th>
                    <th className="p-2.5 font-bold">Telefon Raqami</th>
                    <th className="p-2.5 font-bold">Manzili / Izoh</th>
                    <th className="p-2.5 font-bold text-right">Qarz Summasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((c: any, index: number) => (
                    <tr key={c.id}>
                      <td className="p-2.5 text-slate-400 font-mono">{index + 1}</td>
                      <td className="p-2.5 font-bold text-slate-900">{c.name}</td>
                      <td className="p-2.5 font-mono text-slate-700">{c.phone}</td>
                      <td className="p-2.5 text-slate-500">{c.address || c.notes || "-"}</td>
                      <td className="p-2.5 text-right font-extrabold text-rose-700">{formatMoney(c.totalDebt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : reportType === "INVENTORY" && Array.isArray(data) ? (
            /* INVENTORY REPORT VIEW */
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700">Jami Mahsulot Turlari: {data.length} xil</span>
                <span className="text-xs font-semibold text-slate-500">
                  Kam qolgan tovarlar: {data.filter((p: any) => p.stockQuantity <= p.minStockAlert).length} ta
                </span>
              </div>

              <table className="w-full text-xs text-left border border-slate-200">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 font-bold">#</th>
                    <th className="p-2.5 font-bold">Shtrix-Kod</th>
                    <th className="p-2.5 font-bold">Mahsulot Nomi</th>
                    <th className="p-2.5 font-bold">Kategoriya</th>
                    <th className="p-2.5 font-bold text-center">Ombor Qoldig'i</th>
                    <th className="p-2.5 font-bold text-right">Sotilish Narxi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((p: any, index: number) => (
                    <tr key={p.id}>
                      <td className="p-2.5 text-slate-400 font-mono">{index + 1}</td>
                      <td className="p-2.5 font-mono text-slate-500">{p.barcode || "-"}</td>
                      <td className="p-2.5 font-bold text-slate-900">{p.name}</td>
                      <td className="p-2.5 text-slate-600">{p.category || "Umumiy"}</td>
                      <td className="p-2.5 text-center font-bold text-slate-800">
                        <span className={p.stockQuantity <= p.minStockAlert ? "text-amber-600 font-extrabold" : ""}>
                          {p.stockQuantity} dona/kg
                        </span>
                      </td>
                      <td className="p-2.5 text-right font-extrabold text-slate-900">{formatMoney(p.sellingPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {/* Official Signatures Section */}
          <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs">
            <div>
              <p className="font-bold text-slate-900">Hisobotni Tuzuvchi (Kassir/Mas'ul):</p>
              <p className="text-slate-500 mt-6">Imzo: ___________________________</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-900">Do'kon Rahbari (Direktor):</p>
              <p className="text-slate-500 mt-6">Imzo: ___________________________</p>
            </div>
          </div>

          <p className="text-[10px] text-center text-slate-400 pt-4">
            SAVDOPRO AI — Avtomatlashtirilgan do'kon boshqaruv tizimi hisoboti.
          </p>

        </div>

        {/* Modal Bottom Footer (Hidden on Print) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors"
          >
            Yopish
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>PDF Hujjatni Chop Etish</span>
          </button>
        </div>

      </div>
    </div>
  );
}
