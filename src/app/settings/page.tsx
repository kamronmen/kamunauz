"use client";

import { useState, useEffect } from "react";
import { Settings, RefreshCw, Store, Phone, MapPin, CheckCircle, Database, Download, Lock, Bot, Send, Printer, BookOpen, Package } from "lucide-react";
import { sound } from "@/lib/sound";
import confetti from "canvas-confetti";
import { useAuthStore } from "@/store/useAuthStore";
import { PrintableReportModal } from "@/components/reports/PrintableReportModal";

export default function SettingsPage() {
  const [storeName, setStoreName] = useState("Baraka Savdo");
  const [address, setAddress] = useState("Toshkent sh., Chilonzor 19-mavze");
  const [phone, setPhone] = useState("+998 90 123 45 67");
  const [receiptFooter, setReceiptFooter] = useState("Xaridingiz uchun rahmat!");
  const [telegramBotToken, setTelegramBotToken] = useState("8808098016:AAFCiEI0ikDo5KIIFFzpbv-nCTmKDFXz9So");
  const [telegramChatId, setTelegramChatId] = useState("8501604479");

  const [newPin, setNewPin] = useState("7777");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // PDF Reports Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<"DAILY" | "DEBTS" | "INVENTORY">("DAILY");

  const { setPinCode } = useAuthStore();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.storeName) setStoreName(data.storeName);
        if (data.phone) setPhone(data.phone);
        if (data.address) setAddress(data.address);
        if (data.receiptFooter) setReceiptFooter(data.receiptFooter);
        if (data.telegramBotToken) setTelegramBotToken(data.telegramBotToken);
        if (data.telegramChatId) setTelegramChatId(data.telegramChatId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName,
          phone,
          address,
          receiptFooter,
          telegramBotToken,
          telegramChatId,
        }),
      });

      if (res.ok) {
        sound.playBeep();
        if (newPin && newPin.length === 4) {
          setPinCode(newPin);
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportBackup = () => {
    sound.playBeep();
    window.open("/api/backup", "_blank");
  };

  const handleResetDemoData = async () => {
    if (!confirm("Diqqat! Barcha savdolar, qarzlar va tovarlar tozalangan holda namunaviy do'kon ma'lumotlari qayta yuklanadi. Razi misiz?")) return;

    try {
      setLoading(true);
      const res = await fetch("/api/seed", { method: "POST" });
      if (res.ok) {
        sound.playSuccess();
        confetti({ particleCount: 40, spread: 50 });
        alert("Demo ma'lumotlar muvaffaqiyatli qayta tiklandi!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" />
            <span>Do'kon Sozlamalari & Telegram Bot</span>
          </h2>
          <p className="text-xs text-slate-500">
            Har bir do'kon uchun alohida rekvizitlar va Telegram hisobot botini ulash
          </p>
        </div>
      </div>

      {/* Store Info & Telegram Form */}
      <form onSubmit={handleSaveStore} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-800 text-sm border-b pb-2 border-slate-100 flex items-center gap-2">
          <Store className="w-4 h-4 text-emerald-600" />
          <span>Do'kon Profili va Chek Rekvizitlari</span>
        </h3>

        {saved && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2 border border-emerald-200">
            <CheckCircle className="w-4 h-4" />
            <span>Do'kon sozlamalari va Telegram bot ma'lumotlari saqlandi!</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block">Do'kon Nomi (Hisobotlarda ko'rinadi):</label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Telefon Raqam:</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Manzil:</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Chek Pastki Xabari (Footer):</label>
            <input
              type="text"
              value={receiptFooter}
              onChange={(e) => setReceiptFooter(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Boshliq PIN Kodu (4 raqam):</span>
            </label>
            <input
              type="password"
              maxLength={4}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold"
            />
          </div>
        </div>

        {/* Telegram Bot Settings Section */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <Bot className="w-4 h-4 text-sky-500" />
            <span>Ushbu Do'konning Telegram Hisobot Boti Sozlamalari</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Telegram Bot Token:</label>
              <input
                type="text"
                value={telegramBotToken}
                onChange={(e) => setTelegramBotToken(e.target.value)}
                placeholder="8808098016:AAFCi..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Do'kon Egasining Chat ID / Username:</label>
              <input
                type="text"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                placeholder="8501604479 yoki @kamronnu"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 disabled:opacity-50"
          >
            {loading ? "Saqlanmoqda..." : "Sozlamalarni Saqlash"}
          </button>
        </div>
      </form>

      {/* Official Human-Friendly PDF Reports */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b pb-3 border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Printer className="w-4 h-4 text-emerald-600" />
              <span>Rasmiy PDF Hisobotlar & Chop Etish</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Odamlar tushunadigan A4 formatdagi rasmiy do'kon hujjatlari (printerda chiqarish yoki PDF saqlash)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Daily Report Button */}
          <button
            onClick={() => {
              setSelectedReportType("DAILY");
              setIsReportModalOpen(true);
            }}
            className="p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 text-left transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900 group-hover:text-emerald-700">
                Kunlik Savdo Hisoboti
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Bugungi tushum, naqd/karta taqsimoti va cheklar
              </p>
            </div>
          </button>

          {/* Debts Report Button */}
          <button
            onClick={() => {
              setSelectedReportType("DEBTS");
              setIsReportModalOpen(true);
            }}
            className="p-4 rounded-2xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-300 text-left transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900 group-hover:text-amber-700">
                Nasiya Daftari Hisoboti
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Barcha qarzdorlar ro'yxati, telefonlar va summalar
              </p>
            </div>
          </button>

          {/* Inventory Report Button */}
          <button
            onClick={() => {
              setSelectedReportType("INVENTORY");
              setIsReportModalOpen(true);
            }}
            className="p-4 rounded-2xl bg-slate-50 hover:bg-sky-50/60 border border-slate-200 hover:border-sky-300 text-left transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900 group-hover:text-sky-700">
                Ombor Qoldig'i Hisoboti
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Mavjud tovarlar ro'yxati, qoldiq miqdori va narxlar
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Backup & Export Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="font-bold text-slate-800 text-sm border-b pb-2 border-slate-100 flex items-center gap-2">
          <Download className="w-4 h-4 text-blue-600" />
          <span>Texnik Zaxira Fayli (Developer JSON Backup)</span>
        </h3>
        <p className="text-xs text-slate-500">
          Dasturni boshqa kompyuterga ko'chirish yoki to'liq bazani texnik `.json` formatda saqlab olish.
        </p>

        <button
          onClick={handleExportBackup}
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 flex items-center gap-2 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Texnik Zaxira (.json)</span>
        </button>
      </div>

      {/* Demo Data Reset Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="font-bold text-slate-800 text-sm border-b pb-2 border-slate-100 flex items-center gap-2">
          <Database className="w-4 h-4 text-amber-600" />
          <span>Demo Baza va Ma'lumotlarni Qayta Yuklash</span>
        </h3>
        <p className="text-xs text-slate-500">
          Ushbu tugma orqali do'konga haqiqiy O'zbekiston oziq-ovqat tovarlari (Non, Cola, Sut, Yog', Guruch, Tuxum) va tayyor nasiya/savdolar bazasi 1-bosishda qayta yuklanadi.
        </p>

        <button
          onClick={handleResetDemoData}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>1-Click Demo Baza Tiklash</span>
        </button>
      </div>

      {/* Printable Report Modal */}
      <PrintableReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportType={selectedReportType}
      />
    </div>
  );
}
