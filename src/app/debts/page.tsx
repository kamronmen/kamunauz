"use client";

import { useEffect, useState } from "react";
import { Customer } from "@/types";
import { formatMoney, formatDateShort } from "@/lib/utils";
import { DebtPayModal } from "@/components/debts/DebtPayModal";
import { DebtAddModal } from "@/components/debts/DebtAddModal";
import { TelegramReminderModal } from "@/components/debts/TelegramReminderModal";
import { CustomerDebtDetailModal } from "@/components/debts/CustomerDebtDetailModal";
import { PrintableReportModal } from "@/components/reports/PrintableReportModal";
import { 
  BookOpen, 
  Search, 
  PlusCircle, 
  Send, 
  Banknote, 
  Phone, 
  MapPin, 
  AlertCircle, 
  Clock, 
  ChevronRight,
  TrendingDown,
  ShoppingBag,
  Printer
} from "lucide-react";

export default function DebtsPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Selected customer for modals
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Modals
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);

      const res = await fetch(`/api/customers?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalDebtSum = customers.reduce((sum, c) => sum + (c.totalDebt || 0), 0);
  const activeDebtorsCount = customers.filter((c) => c.totalDebt > 0).length;

  return (
    <div className="space-y-5">
      {/* Top Banner Metric */}
      <div className="bg-gradient-to-br from-amber-600 via-amber-700 to-slate-900 rounded-3xl p-5 md:p-6 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <BookOpen className="w-4 h-4 text-amber-200" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-200">
              Raqamli Nasiya Daftari
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {formatMoney(totalDebtSum)}
          </h2>
          <p className="text-xs text-amber-100 font-medium">
            Jami {activeDebtorsCount} ta mijozda nasiya puli bor
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-amber-500/30 hover:bg-amber-500/40 text-white font-bold text-xs flex items-center gap-1.5 border border-amber-400/40 backdrop-blur-xs transition-all active:scale-95"
          >
            <Printer className="w-4 h-4 text-amber-200" />
            <span>PDF Nasiya Hisoboti</span>
          </button>
          <button
            onClick={() => {
              setSelectedCustomer(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 flex items-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-amber-600" />
            <span>Qarz qo'shish</span>
          </button>
        </div>
      </div>

      {/* Control & Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Qarzdor ismi, telefon raqami yoki manzilidan qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-100/80 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Customer Debtors List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200 animate-pulse p-4" />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 text-slate-400 space-y-2">
          <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
          <p className="font-bold text-slate-700 text-sm">Qarzdorlar topilmadi</p>
          <p className="text-xs text-slate-400">
            Hali hech kimga nasiya yozilmadi yoki qidiruv natijasiz
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {customers.map((cust) => {
            const hasDebt = cust.totalDebt > 0;
            const lastTx = cust.debts?.[0];

            return (
              <div
                key={cust.id}
                className={`bg-white rounded-2xl p-4 border transition-all shadow-xs flex flex-col justify-between space-y-3 ${
                  hasDebt ? "border-amber-200 hover:border-amber-400" : "border-slate-200"
                }`}
              >
                {/* Header info - Clickable to open detailed items */}
                <div 
                  onClick={() => {
                    setSelectedCustomer(cust);
                    setIsDetailModalOpen(true);
                  }}
                  className="flex items-start justify-between gap-2 cursor-pointer group"
                  title="Olingan mahsulotlar va to'lovlar tarixini ko'rish"
                >
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-slate-900 text-base flex items-center gap-1.5 group-hover:text-amber-600 transition-colors">
                      <span>{cust.name}</span>
                      <ShoppingBag className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500" />
                    </h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{cust.phone}</span>
                    </p>
                    {cust.address && (
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{cust.address}</span>
                      </p>
                    )}
                  </div>

                  {/* Debt amount badge */}
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-semibold block">Qarz balansi</span>
                    <span className={`text-base font-extrabold ${hasDebt ? "text-rose-600" : "text-emerald-600"}`}>
                      {formatMoney(cust.totalDebt)}
                    </span>
                  </div>
                </div>

                {/* Notes / Last activity */}
                {lastTx && (
                  <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Oxirgi harakat: {formatDateShort(lastTx.createdAt)}
                    </span>
                    <span className="font-semibold text-slate-700 truncate max-w-[150px]">
                      {lastTx.description || lastTx.type}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* View Details / Goods Button */}
                  <button
                    onClick={() => {
                      setSelectedCustomer(cust);
                      setIsDetailModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 transition-colors"
                    title="Mijoz qaysi mahsulotlarni qancha olganini ko'rish"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                    <span>Mahsulotlar ({cust.sales?.length || 0})</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* Telegram / SMS Eslatma */}
                    {hasDebt && (
                      <button
                        onClick={() => {
                          setSelectedCustomer(cust);
                          setIsReminderModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs flex items-center gap-1 transition-colors"
                        title="Telegram / SMS eslatma shakllantirish"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Eslatma</span>
                      </button>
                    )}

                    {/* Manual Qarz qo'shish */}
                    <button
                      onClick={() => {
                        setSelectedCustomer(cust);
                        setIsAddModalOpen(true);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-slate-500" />
                      <span>Qarz</span>
                    </button>

                    {/* Qarz to'lash */}
                    {hasDebt && (
                      <button
                        onClick={() => {
                          setSelectedCustomer(cust);
                          setIsPayModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1 shadow-sm transition-all"
                      >
                        <Banknote className="w-3.5 h-3.5" />
                        <span>To'lash</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <DebtPayModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        customer={selectedCustomer}
        onSuccess={() => fetchCustomers()}
      />

      <DebtAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        customers={customers}
        selectedCustomer={selectedCustomer}
        onSuccess={() => fetchCustomers()}
      />

      <TelegramReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        customer={selectedCustomer}
      />

      <CustomerDebtDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        customerId={selectedCustomer?.id || null}
      />

      <PrintableReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportType="DEBTS"
      />
    </div>
  );
}
