"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ShoppingCart, 
  BookOpen, 
  Package, 
  TrendingUp, 
  Receipt, 
  Users, 
  Settings, 
  Store,
  Lock,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";

const CASHIER_NAV = [
  { href: "/", label: "Kassa (POS)", icon: ShoppingCart, description: "Tezkor savdo va chek" },
  { href: "/debts", label: "Nasiya daftari", icon: BookOpen, description: "Qarzdorlar hisob-kitobi" },
  { href: "/inventory", label: "Ombor / Tovar", icon: Package, description: "Mahsulotlar va qoldiq" },
  { href: "/customers", label: "Mijozlar", icon: Users, description: "Xaridorlar bazasi" },
];

const DIRECTOR_NAV = [
  { href: "/analytics", label: "Sof Foyda", icon: TrendingUp, description: "Haqiqiy foyda & audit" },
  { href: "/expenses", label: "Xarajatlar", icon: Receipt, description: "Ijara, svet, oyliklar" },
  { href: "/settings", label: "Sozlamalar", icon: Settings, description: "Do'kon & Bot sozlamasi" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isOwner, role } = useAuthStore();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-200 border-r border-slate-800 flex-shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 font-bold text-xl tracking-wider">
          <Store className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
            SAVDO<span className="text-emerald-400 font-extrabold">PRO</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">Aqlli Savdo Tizimi</p>
        </div>
      </div>

      {/* User Role Card */}
      <div className="mx-3 my-2.5 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base font-bold ${
          isOwner ? "bg-purple-900/60 text-amber-300 border border-purple-500/40" : "bg-emerald-950/60 text-emerald-400 border border-emerald-500/40"
        }`}>
          {isOwner ? "👑" : "👨‍💼"}
        </div>
        <div className="space-y-0.5 overflow-hidden">
          <p className="text-xs font-bold text-white truncate">
            {isOwner ? "Direktor Kabineti" : "Kassir Ish Stoli"}
          </p>
          <p className="text-[10px] text-slate-400 font-medium">
            {isOwner ? "Barcha huquqlar ochiq" : "Sotuvchi rejimi faol"}
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1">
          Asosiy Kassa & Savdo
        </p>
        {CASHIER_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium transition-all duration-150 group",
                isActive
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30 font-bold"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              )}
            >
              <Icon className={cn("w-4.5 h-4.5 flex-shrink-0 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-slate-400 group-hover:text-emerald-400")} />
              <div className="flex flex-col">
                <span className="text-xs font-semibold">{item.label}</span>
                <span className={cn("text-[10px] line-clamp-1", isActive ? "text-emerald-100" : "text-slate-400")}>{item.description}</span>
              </div>
            </Link>
          );
        })}

        <div className="pt-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1 flex items-center justify-between">
            <span>Direktor Bo'limi</span>
            {!isOwner && <Lock className="w-3 h-3 text-amber-500" />}
          </p>
          {DIRECTOR_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-all duration-150 group",
                  isActive
                    ? "bg-purple-700 text-white shadow-md shadow-purple-900/30 font-bold"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3.5">
                  <Icon className={cn("w-4.5 h-4.5 flex-shrink-0 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-slate-400 group-hover:text-purple-400")} />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">{item.label}</span>
                    <span className={cn("text-[10px] line-clamp-1", isActive ? "text-purple-200" : "text-slate-400")}>{item.description}</span>
                  </div>
                </div>
                {!isOwner && <Lock className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer Store Status */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div className="text-xs">
            <p className="font-medium text-slate-200">Kassa Onlayn</p>
            <p className="text-slate-400 text-[11px]">Netlify Cloud: Faol</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
