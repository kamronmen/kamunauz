"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ShoppingCart, 
  BookOpen, 
  Package, 
  TrendingUp, 
  Receipt, 
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const MOBILE_NAV = [
  { href: "/", label: "Kassa", icon: ShoppingCart },
  { href: "/debts", label: "Nasiya", icon: BookOpen },
  { href: "/inventory", label: "Ombor", icon: Package },
  { href: "/expenses", label: "Xarajat", icon: Receipt },
  { href: "/analytics", label: "Foyda", icon: TrendingUp },
];

export function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {moreOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs animate-in fade-in"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {/* More Menu Drawer */}
      {moreOpen && (
        <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-slate-200 z-50 p-4 rounded-t-2xl shadow-2xl md:hidden space-y-2">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm">Boshqa bo'limlar</h3>
            <button 
              onClick={() => setMoreOpen(false)}
              className="text-xs text-slate-500 font-semibold bg-slate-100 px-2.5 py-1 rounded-full"
            >
              Yopish
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link
              href="/customers"
              onClick={() => setMoreOpen(false)}
              className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 flex items-center gap-2.5 text-slate-800 font-medium text-xs"
            >
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">👥</span>
              <span>Mijozlar</span>
            </Link>
            <Link
              href="/settings"
              onClick={() => setMoreOpen(false)}
              className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 flex items-center gap-2.5 text-slate-800 font-medium text-xs"
            >
              <span className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-bold">⚙️</span>
              <span>Sozlamalar</span>
            </Link>
          </div>
        </div>
      )}

      {/* Bottom Sticky Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-1.5 z-40 md:hidden flex justify-around items-center shadow-lg">
        {MOBILE_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150 min-w-[56px]",
                isActive
                  ? "text-emerald-600 font-bold"
                  : "text-slate-500 hover:text-slate-900 font-medium"
              )}
            >
              <div className={cn("p-1 rounded-lg transition-transform", isActive && "bg-emerald-50 scale-110")}>
                <Icon className={cn("w-5 h-5", isActive ? "text-emerald-600" : "text-slate-500")} />
              </div>
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setMoreOpen(!moreOpen)}
          className={cn(
            "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150 min-w-[56px]",
            moreOpen ? "text-emerald-600 font-bold" : "text-slate-500 hover:text-slate-900 font-medium"
          )}
        >
          <div className={cn("p-1 rounded-lg", moreOpen && "bg-emerald-50")}>
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5">Yana</span>
        </button>
      </nav>
    </>
  );
}
