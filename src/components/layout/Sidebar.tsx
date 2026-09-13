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
  Store
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Kassa (POS)", icon: ShoppingCart, description: "Tezkor savdo va chek" },
  { href: "/debts", label: "Nasiya daftari", icon: BookOpen, description: "Qarzdorlar hisob-kitobi" },
  { href: "/inventory", label: "Ombor / Tovar", icon: Package, description: "Mahsulotlar va qoldiq" },
  { href: "/expenses", label: "Xarajatlar", icon: Receipt, description: "Ijara, svet, oyliklar" },
  { href: "/analytics", label: "Sof Foyda", icon: TrendingUp, description: "Foyda va hisobotlar" },
  { href: "/customers", label: "Mijozlar", icon: Users, description: "Xaridorlar bazasi" },
  { href: "/settings", label: "Sozlamalar", icon: Settings, description: "Do'kon ma'lumotlari" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-200 border-r border-slate-800 flex-shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 font-bold text-xl tracking-wider">
          <Store className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
            DOKON<span className="text-emerald-400 font-extrabold">PRO</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">Mahalla Savdo Tizimi</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-medium transition-all duration-150 group",
                isActive
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              )}
            >
              <Icon className={cn("w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-slate-400 group-hover:text-emerald-400")} />
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{item.label}</span>
                <span className={cn("text-[11px] line-clamp-1", isActive ? "text-emerald-100" : "text-slate-400")}>{item.description}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer Store Status */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div className="text-xs">
            <p className="font-medium text-slate-200">Kassa Onlayn</p>
            <p className="text-slate-400 text-[11px]">Mahalliy baza: Faol</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
