"use client";

import { useEffect, useState } from "react";
import { Store, Clock, Volume2, VolumeX, Sparkles, Lock, Unlock } from "lucide-react";
import { sound } from "@/lib/sound";
import { useAuthStore } from "@/store/useAuthStore";

export function Navbar() {
  const [time, setTime] = useState<string>("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pinInput, setPinInput] = useState("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinError, setPinError] = useState(false);

  const { isOwner, loginOwner, logoutOwner } = useAuthStore();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("uz-UZ", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) {
      sound.playBeep();
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginOwner(pinInput);
    if (success) {
      sound.playSuccess();
      setShowPinModal(false);
      setPinInput("");
      setPinError(false);
    } else {
      sound.playError();
      setPinError(true);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 md:hidden">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
              <Store className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-800 text-base tracking-tight">
              SAVDO<span className="text-emerald-600">PRO AI</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-slate-700 bg-slate-100/80 px-3 py-1.5 rounded-lg text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Do'kon: "Baraka Savdo"</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Owner vs Cashier Lock Mode Toggle */}
          <button
            onClick={() => {
              if (isOwner) {
                logoutOwner();
                sound.playBeep();
              } else {
                setShowPinModal(true);
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
              isOwner
                ? "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
                : "bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100"
            }`}
            title={isOwner ? "Boshliq Rejimi (Ochiq)" : "Sotuvchi Rejimi (Foyda yashirilgan)"}
          >
            {isOwner ? <Unlock className="w-3.5 h-3.5 text-emerald-600" /> : <Lock className="w-3.5 h-3.5 text-amber-600" />}
            <span className="hidden sm:inline">{isOwner ? "Boshliq Rejimi" : "Sotuvchi Rejimi"}</span>
          </button>

          {/* Real-time Clock */}
          <div className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-mono font-semibold">{time || "00:00:00"}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? "Ovozni o'chirish" : "Ovozni yoqish"}
            className={`p-2 rounded-lg border transition-colors ${
              soundEnabled
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                : "bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200"
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xs w-full p-5 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Boshliq PIN Kodini Kiriting</h4>
              <p className="text-xs text-slate-500">Moliya va Sof Foydani ko'rish uchun (Default PIN: 7777)</p>
            </div>

            {pinError && <p className="text-xs font-bold text-rose-600">PIN kod noto'g'ri!</p>}

            <form onSubmit={handlePinSubmit} className="space-y-3">
              <input
                type="password"
                maxLength={4}
                autoFocus
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="****"
                className="w-full text-center text-2xl font-mono tracking-widest py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 rounded-lg font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs text-white bg-amber-600 rounded-lg font-bold hover:bg-amber-700"
                >
                  Kirish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
