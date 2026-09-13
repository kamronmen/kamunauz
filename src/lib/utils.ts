import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "0 so'm";
  return Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm";
}

export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function formatDateUz(date: string | Date | null | undefined): string {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";
  
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

export function formatDateShort(date: string | Date | null | undefined): string {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";
  
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  
  return `${day}.${month}.${year}`;
}

export const CATEGORIES = [
  "Oziq-ovqat",
  "Ichimliklar",
  "Sut mahsulotlari",
  "Non va qandolat",
  "Meva va sabzavotlar",
  "Go'sht va kolbasa",
  "Xo'jalik mollari",
  "Gigiyena",
  "Boshqa"
] as const;

export const EXPENSE_CATEGORIES = [
  { id: "RENT", label: "Do'kon ijarasi", color: "bg-amber-100 text-amber-800" },
  { id: "UTILITY", label: "Svet / Gaz / Kommunal", color: "bg-blue-100 text-blue-800" },
  { id: "SALARY", label: "Oylik maosh (Sotuvchi)", color: "bg-purple-100 text-purple-800" },
  { id: "PERSONAL", label: "Kassadan olindi (Shaxsiy)", color: "bg-rose-100 text-rose-800" },
  { id: "OTHER", label: "Boshqa xarajatlar", color: "bg-gray-100 text-gray-800" },
] as const;

export function getExpenseCategoryLabel(cat: string): string {
  const found = EXPENSE_CATEGORIES.find((c) => c.id === cat);
  return found ? found.label : cat;
}

export const PAYMENT_TYPES = [
  { id: "CASH", label: "Naqd pul", badge: "bg-emerald-100 text-emerald-800" },
  { id: "CARD", label: "Plastik karta / Payme", badge: "bg-blue-100 text-blue-800" },
  { id: "DEBT", label: "Nasiya (Qarz)", badge: "bg-amber-100 text-amber-800" },
] as const;

export function getPaymentTypeLabel(type: string): string {
  const found = PAYMENT_TYPES.find((p) => p.id === type);
  return found ? found.label : type;
}
