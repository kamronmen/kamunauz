"use client";

import { useState, useEffect } from "react";
import { CartItem, Customer, Sale } from "@/types";
import { formatMoney, formatNumber } from "@/lib/utils";
import { 
  X, 
  Banknote, 
  CreditCard, 
  BookOpen, 
  UserPlus, 
  Calendar, 
  Check, 
  Search,
  Loader2,
  AlertCircle
} from "lucide-react";
import { sound } from "@/lib/sound";
import confetti from "canvas-confetti";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onSaleCompleted: (sale: Sale) => void;
}

export function CheckoutModal({
  isOpen,
  onClose,
  cart,
  onSaleCompleted,
}: CheckoutModalProps) {
  const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const [paymentType, setPaymentType] = useState<"CASH" | "CARD" | "DEBT">("CASH");
  const [cashGiven, setCashGiven] = useState<string>("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [customerSearch, setCustomerSearch] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("+998 ");
  const [newCustomerAddress, setNewCustomerAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCashGiven(totalAmount.toString());
      fetchCustomers();
      setError(null);
    }
  }, [isOpen, totalAmount]);

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/customers");
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const numCashGiven = parseFloat(cashGiven) || 0;
  const changeAmount = Math.max(0, numCashGiven - totalAmount);

  const quickCashAdd = (add: number) => {
    const current = parseFloat(cashGiven) || 0;
    setCashGiven((current + add).toString());
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim() || !newCustomerPhone.trim()) {
      setError("Mijoz ismi va telefon raqami majburiy!");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCustomerName,
          phone: newCustomerPhone,
          address: newCustomerAddress,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Mijoz yaratishda xatolik");

      setCustomers((prev) => [data, ...prev]);
      setSelectedCustomerId(data.id);
      setIsNewCustomerOpen(false);
      setNewCustomerName("");
      setNewCustomerPhone("+998 ");
      setNewCustomerAddress("");
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    setError(null);

    if (paymentType === "DEBT" && !selectedCustomerId) {
      setError("Iltimos, qarz egasini (mijozni) tanlang!");
      return;
    }

    if (paymentType === "CASH" && numCashGiven < totalAmount) {
      setError("Berilgan naqd pul summasi jami to'lovdan kam bo'lishi mumkin emas!");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        items: cart.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          sellingPrice: item.product.sellingPrice,
          costPrice: item.product.costPrice,
        })),
        paymentType,
        customerId: paymentType === "DEBT" ? selectedCustomerId : null,
        dueDate: paymentType === "DEBT" && dueDate ? dueDate : null,
      };

      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Savdo amalga oshmadi");

      sound.playSuccess();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });

      onSaleCompleted(data);
      onClose();
    } catch (err: any) {
      sound.playError();
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">To'lovni amalga oshirish</h3>
            <p className="text-xs text-slate-500">Jami to'lov: <span className="font-extrabold text-emerald-700 text-sm">{formatMoney(totalAmount)}</span></p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Payment Type Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
              To'lov turi:
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentType("CASH")}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${
                  paymentType === "CASH"
                    ? "border-emerald-600 bg-emerald-50/70 text-emerald-900 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 text-slate-600"
                }`}
              >
                <Banknote className="w-6 h-6 text-emerald-600" />
                <span className="text-xs font-bold">Naqd pul</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentType("CARD")}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${
                  paymentType === "CARD"
                    ? "border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 text-slate-600"
                }`}
              >
                <CreditCard className="w-6 h-6 text-blue-600" />
                <span className="text-xs font-bold">Karta / Payme</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentType("DEBT")}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${
                  paymentType === "DEBT"
                    ? "border-amber-600 bg-amber-50/70 text-amber-900 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 text-slate-600"
                }`}
              >
                <BookOpen className="w-6 h-6 text-amber-600" />
                <span className="text-xs font-bold">Nasiya (Qarz)</span>
              </button>
            </div>
          </div>

          {/* Cash Specific Controls */}
          {paymentType === "CASH" && (
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Mijoz bergan naqd pul summasi (so'm):
                </label>
                <input
                  type="number"
                  value={cashGiven}
                  onChange={(e) => setCashGiven(e.target.value)}
                  placeholder="0"
                  className="w-full text-xl font-extrabold text-slate-900 px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              {/* Quick Cash Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setCashGiven(totalAmount.toString())}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Aniq summa
                </button>
                <button
                  type="button"
                  onClick={() => quickCashAdd(10000)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  +10 000
                </button>
                <button
                  type="button"
                  onClick={() => quickCashAdd(50000)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  +50 000
                </button>
                <button
                  type="button"
                  onClick={() => quickCashAdd(100000)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  +100 000
                </button>
                <button
                  type="button"
                  onClick={() => quickCashAdd(200000)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  +200 000
                </button>
              </div>

              {/* Change (Qaytim) */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Qaytim (Mijozga qaytariladi):</span>
                <span className={`text-base font-extrabold ${changeAmount > 0 ? "text-emerald-700" : "text-slate-700"}`}>
                  {formatMoney(changeAmount)}
                </span>
              </div>
            </div>
          )}

          {/* Card Specific Controls */}
          {paymentType === "CARD" && (
            <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl text-center space-y-1">
              <p className="text-xs font-bold text-blue-900">Terminal yoki QR (Payme/Click/Uzum)</p>
              <p className="text-[11px] text-blue-700">
                To'lov to'liq summa bo'yicha karta/ilovadan qabul qilinadi.
              </p>
            </div>
          )}

          {/* Debt Specific Controls */}
          {paymentType === "DEBT" && (
            <div className="space-y-3 bg-amber-50/60 p-4 rounded-2xl border border-amber-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-900">
                  Qarzdor mijozni tanlang:
                </label>
                <button
                  type="button"
                  onClick={() => setIsNewCustomerOpen(!isNewCustomerOpen)}
                  className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Yangi mijoz</span>
                </button>
              </div>

              {/* Add New Customer Form Inline */}
              {isNewCustomerOpen && (
                <form onSubmit={handleCreateCustomer} className="p-3 bg-white rounded-xl border border-amber-200 space-y-2.5 animate-in fade-in">
                  <h5 className="font-bold text-xs text-slate-800">Yangi mijoz qo'shish</h5>
                  <input
                    type="text"
                    placeholder="Ism / Familiya / Laqab *"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    required
                    className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <input
                    type="text"
                    placeholder="Telefon raqam *"
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    required
                    className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <input
                    type="text"
                    placeholder="Manzil / Mo'ljal (ixtiyoriy)"
                    value={newCustomerAddress}
                    onChange={(e) => setNewCustomerAddress(e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsNewCustomerOpen(false)}
                      className="px-3 py-1 text-xs text-slate-600 bg-slate-100 rounded-lg font-semibold"
                    >
                      Bekor qilish
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-3 py-1 text-xs text-white bg-amber-600 rounded-lg font-bold hover:bg-amber-700"
                    >
                      Saqlash
                    </button>
                  </div>
                </form>
              )}

              {/* Customer Selector with Search */}
              <div className="space-y-1.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Mijozni qidirish (ism yoki telefon)..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2 bg-white rounded-xl border border-amber-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1 bg-white p-1 rounded-xl border border-amber-100">
                  {filteredCustomers.length === 0 ? (
                    <p className="text-[11px] text-slate-400 p-2 text-center">Mijoz topilmadi</p>
                  ) : (
                    filteredCustomers.map((cust) => (
                      <div
                        key={cust.id}
                        onClick={() => setSelectedCustomerId(cust.id)}
                        className={`p-2 rounded-lg cursor-pointer flex items-center justify-between text-xs transition-colors ${
                          selectedCustomerId === cust.id
                            ? "bg-amber-100 font-bold text-amber-900"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-xs">{cust.name}</p>
                          <p className="text-[10px] text-slate-500">{cust.phone}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">Eski qarzi:</span>
                          <span className={`text-[11px] font-bold ${cust.totalDebt > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                            {formatMoney(cust.totalDebt)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Due Date Picker */}
              <div>
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Qarzni qaytarish muddati (ixtiyoriy):</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-amber-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 md:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={handleCheckout}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Bajarilmoqda...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Savdoni tasdiqlash</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
