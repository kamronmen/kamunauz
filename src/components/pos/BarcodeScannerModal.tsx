"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X, Camera, Barcode, AlertCircle, RefreshCw } from "lucide-react";
import { sound } from "@/lib/sound";

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (barcode: string) => void;
}

export function BarcodeScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
}: BarcodeScannerModalProps) {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const manualInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCameraError(null);
      setManualBarcode("");
      startCamera();
      setTimeout(() => {
        manualInputRef.current?.focus();
      }, 100);
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      if (typeof window === "undefined") return;
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      const config = {
        fps: 15,
        qrbox: { width: 250, height: 180 },
        aspectRatio: 1.333333,
      };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          sound.playBeep();
          stopCamera();
          onScanSuccess(decodedText);
          onClose();
        },
        () => {
          // Frame parse error - ignore
        }
      );
      setIsScanning(true);
    } catch (err: any) {
      console.warn("Camera access failed:", err);
      setCameraError(
        "Kameraga ulanib bo'lmadi yoki ruxsat berilmadi. Quyida shtrix-kodni qo'lda yoki skaner orqali kiriting."
      );
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (scannerRef.current && isScanning) {
      scannerRef.current
        .stop()
        .then(() => {
          scannerRef.current?.clear();
          scannerRef.current = null;
          setIsScanning(false);
        })
        .catch((err) => console.error(err));
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBarcode.trim()) return;
    sound.playBeep();
    stopCamera();
    onScanSuccess(manualBarcode.trim());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-sm">Shtrix-kod skanerlash</h3>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video / Reader Area */}
        <div className="p-4 flex flex-col items-center bg-slate-900 text-white min-h-[220px] justify-center relative">
          <div id="reader" className="w-full max-w-[320px] overflow-hidden rounded-xl"></div>
          {cameraError && (
            <div className="p-3 bg-amber-500/20 border border-amber-400/30 text-amber-200 rounded-xl text-xs flex items-center gap-2 max-w-xs text-center">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{cameraError}</span>
            </div>
          )}
        </div>

        {/* Manual Barcode Input Form */}
        <div className="p-4 bg-white space-y-3">
          <form onSubmit={handleManualSubmit} className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Shtrix-kodni qo'lda kiritish / Skanerlash:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Barcode className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  ref={manualInputRef}
                  type="text"
                  placeholder="Masalan: 4780001001"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm font-mono border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition-colors"
              >
                Topish
              </button>
            </div>
          </form>

          <p className="text-[11px] text-slate-400 text-center">
            Tashqi USB skaner ulangan bo'lsa, to'g'ridan-to'g'ri skanerlang.
          </p>
        </div>
      </div>
    </div>
  );
}
