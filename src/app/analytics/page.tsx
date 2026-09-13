"use client";

import { useEffect, useState } from "react";
import { AnalyticsSummary, AuditAlert } from "@/types";
import { formatMoney, getExpenseCategoryLabel } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Receipt, 
  BookOpen, 
  ShieldAlert, 
  Calendar,
  Layers,
  Award,
  BarChart3,
  Send,
  Lock,
  Copy,
  Check,
  Bot,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { sound } from "@/lib/sound";
import confetti from "canvas-confetti";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("month");
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [auditAlerts, setAuditAlerts] = useState<AuditAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // Telegram Direct Bot State
  const [sendingBot, setSendingBot] = useState(false);
  const [botMessageStatus, setBotMessageStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { isOwner } = useAuthStore();

  useEffect(() => {
    fetchAnalytics();
    fetchAuditAlerts();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/analytics?period=${period}`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (err) {
      console.error(err);
    } fontFinally: {
      setLoading(false);
    }
  };

  const fetchAuditAlerts = async () => {
    try {
      const res = await fetch("/api/audit");
      if (res.ok) {
        const data = await res.json();
        setAuditAlerts(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 1. Direct Telegram Bot API Send (Daily or Monthly)
  const handleSendTelegramBot = async (selectedPeriod: string = period) => {
    try {
      setSendingBot(true);
      setBotMessageStatus(null);

      const res = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: "8501604479",
          reportPeriod: selectedPeriod,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Telegram bot orqali yuborib bo'lmadi");
      }

      sound.playSuccess();
      confetti({ particleCount: 50, spread: 60 });
      setBotMessageStatus({
        type: "success",
        text: `Muvaffaqiyatli! ${selectedPeriod === "today" ? "Kunlik" : "Oylik"} hisobot Telegram botingizga yuborildi! 📲`,
      });
    } catch (err: any) {
      sound.playError();
      setBotMessageStatus({
        type: "error",
        text: err.message,
      });
    } finally {
      setSendingBot(false);
    }
  };

  if (loading || !summary) {
    return (
      <div className="space-y-4 p-8 text-center text-slate-400">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto" />
        <p className="font-bold text-slate-600 text-sm">Hisobot va Sof Foyda hisoblanmoqda...</p>
      </div>
    );
  }

  const paymentChartData = [
    { name: "Naqd pul", amount: summary.paymentBreakdown.CASH, color: "#10b981" },
    { name: "Plastik / Click", amount: summary.paymentBreakdown.CARD, color: "#3b82f6" },
    { name: "Nasiya (Qarz)", amount: summary.paymentBreakdown.DEBT, color: "#f59e0b" },
  ];

  return (
    <div className="space-y-6">
      {/* Bot Notification Banner */}
      {botMessageStatus && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between gap-3 shadow-md animate-in fade-in ${
            botMessageStatus.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-rose-600 text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            {botMessageStatus.type === "success" ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{botMessageStatus.text}</span>
          </div>
          <button onClick={() => setBotMessageStatus(null)} className="hover:opacity-80">
            &times;
          </button>
        </div>
      )}

      {/* Header & Period Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>Moliya & Haqiqiy Sof Foyda Tahlili</span>
          </h2>
          <p className="text-xs text-slate-500">
            Tushum - Tannarx - Xarajatlar = Sof Foyda
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Kunlik Hisobot Telegram Button */}
          <button
            onClick={() => handleSendTelegramBot("today")}
            disabled={sendingBot}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-extrabold text-xs shadow-md shadow-sky-500/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
            title="Telegramga Bugungi Kunlik Hisobotni yuborish"
          >
            {sendingBot ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
            <span>📅 Kunlik Hisobot Botga</span>
          </button>

          {/* Oylik Hisobot Telegram Button */}
          <button
            onClick={() => handleSendTelegramBot("month")}
            disabled={sendingBot}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50"
            title="Telegramga Ushbu Oylik Hisobotni yuborish"
          >
            {sendingBot ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-emerald-400" />}
            <span>📆 Oylik Hisobot Botga</span>
          </button>

          {/* Period Selector Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {[
              { id: "today", label: "Bugun" },
              { id: "yesterday", label: "Kecha" },
              { id: "week", label: "Shu hafta" },
              { id: "month", label: "Shu oy" },
              { id: "all", label: "Barchasi" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setPeriod(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  period === item.id
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Jami Savdo (Tushum)</span>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {formatMoney(summary.totalSales)}
          </p>
          <p className="text-[11px] text-slate-400 font-medium">
            {summary.salesCount} ta chek savdo amalga oshirildi
          </p>
        </div>

        {/* COGS */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Jami Tannarx (COGS)</span>
            <Layers className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-700 tracking-tight">
            {isOwner ? formatMoney(summary.totalCost) : "•••••• so'm"}
          </p>
          <p className="text-[11px] text-slate-400 font-medium">
            Sotilgan tovarlarning kirish summasi
          </p>
        </div>

        {/* Total Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Jami Xarajatlar</span>
            <Receipt className="w-5 h-5 text-rose-600" />
          </div>
          <p className="text-2xl font-extrabold text-rose-600 tracking-tight">
            {isOwner ? formatMoney(summary.totalExpenses) : "•••••• so'm"}
          </p>
          <p className="text-[11px] text-slate-400 font-medium">
            Ijara, svet, oyliklar va shaxsiy chiqimlar
          </p>
        </div>

        {/* TRUE NET PROFIT (SOF FOYDA) */}
        <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-slate-900 p-5 rounded-2xl text-white shadow-lg space-y-2">
          <div className="flex items-center justify-between text-emerald-200">
            <span className="text-xs font-extrabold uppercase tracking-wider">HAQIQIY SOF FOYDA</span>
            <Award className="w-5 h-5 text-emerald-300 animate-pulse" />
          </div>
          <p className="text-2xl md:text-3xl font-black tracking-tight text-white">
            {isOwner ? formatMoney(summary.netProfit) : "🔒 PIN Kod Kerak"}
          </p>
          <p className="text-[11px] text-emerald-100 font-medium">
            Barcha xarajatlar va tannarx chiqarib tashlangach
          </p>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold block">Yalpi Foyda (Gross Profit)</span>
            <span className="text-lg font-extrabold text-slate-900">
              {isOwner ? formatMoney(summary.grossProfit) : "•••••• so'm"}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            📈
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold block">Nasiyadagi Yig'iladigan Mablag'</span>
            <span className="text-lg font-extrabold text-amber-600">{formatMoney(summary.uncollectedDebt)}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            📒
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold block">Rentabellik Ko'rsatkichi</span>
            <span className="text-lg font-extrabold text-emerald-700">
              {isOwner && summary.totalSales > 0 ? `${((summary.netProfit / summary.totalSales) * 100).toFixed(1)}%` : "••••"}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            🎯
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Daily Sales & Net Profit Trend (8 cols) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Kunlik Savdo va Sof Foyda Dinamikasi</span>
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.dailyTrend}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(val: number) => [formatMoney(val), ""]}
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="sales" name="Jami Savdo" stroke="#10b981" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
                {isOwner && (
                  <Area type="monotone" dataKey="netProfit" name="Sof Foyda" stroke="#059669" fillOpacity={1} fill="url(#colorNet)" strokeWidth={3} />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Breakdown (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">To'lov Turlari Bo'yicha</h3>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" fontSize={10} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <YAxis dataKey="name" type="category" fontSize={11} width={80} />
                <Tooltip formatter={(val: number) => [formatMoney(val), ""]} />
                <Bar dataKey="amount" radius={[0, 8, 8, 0]}>
                  {paymentChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex justify-between font-medium">
              <span className="text-slate-600">💵 Naqd pul:</span>
              <span className="font-bold text-slate-900">{formatMoney(summary.paymentBreakdown.CASH)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-slate-600">💳 Plastik karta / Click:</span>
              <span className="font-bold text-slate-900">{formatMoney(summary.paymentBreakdown.CARD)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-slate-600">📒 Nasiya (Qarz):</span>
              <span className="font-bold text-slate-900">{formatMoney(summary.paymentBreakdown.DEBT)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Loss & Theft Audit Alerts Log */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-slate-900 text-sm">Kassa Auditi va Shubhali Harakatlar Jurnali</h3>
          </div>
          <span className="text-xs text-slate-500 font-semibold">{auditAlerts.length} ta hodisa</span>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {auditAlerts.length === 0 ? (
            <p className="text-xs text-slate-400 p-4 text-center">Audit bo'yicha hech qanday shubhali holat aniqlanmadi</p>
          ) : (
            auditAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      alert.severity === "HIGH"
                        ? "bg-rose-600 animate-ping"
                        : alert.severity === "MEDIUM"
                        ? "bg-amber-500"
                        : "bg-blue-500"
                    }`}
                  />
                  <p className="font-medium text-slate-800">{alert.message}</p>
                </div>
                <span className="text-[10px] text-slate-400 flex-shrink-0 font-mono">
                  {new Date(alert.createdAt).toLocaleString("uz-UZ")}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
