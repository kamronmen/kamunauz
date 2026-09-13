import Link from "next/link";
import { Store, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-2xl shadow-sm">
        <Store className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-extrabold text-slate-900">Sahifa topilmadi (404)</h2>
      <p className="text-xs text-slate-500 max-w-sm">
        Siz qidirgan sahifa mavjud emas yoki boshqa manzilga ko'chirilgan bo'lishi mumkin.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kassa (POS) sahifasiga qaytish</span>
      </Link>
    </div>
  );
}
