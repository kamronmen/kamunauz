"use client";

import { useEffect, useState } from "react";
import { AuditAlert } from "@/types";
import { AlertTriangle, ShieldAlert, X, ChevronRight } from "lucide-react";
import Link from "next/link";

export function AuditAlertsBanner() {
  const [alerts, setAlerts] = useState<AuditAlert[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await fetch("/api/audit");
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (dismissed || alerts.length === 0) return null;

  const highSeverityAlerts = alerts.filter((a) => a.severity === "HIGH");
  const latestAlert = highSeverityAlerts[0] || alerts[0];

  return (
    <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-amber-700 text-white px-4 py-2.5 rounded-2xl shadow-lg flex items-center justify-between gap-3 mb-4 animate-in slide-in-from-top duration-300">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="p-1.5 bg-white/20 rounded-xl flex-shrink-0 backdrop-blur-xs">
          <ShieldAlert className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xs uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
              Kassa Audit Ogohlantirishi
            </span>
            <span className="text-[11px] opacity-80 font-mono">({alerts.length} ta holat)</span>
          </div>
          <p className="text-xs font-medium truncate mt-0.5 opacity-95">
            {latestAlert.message}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          href="/analytics"
          className="text-xs font-bold bg-white text-rose-900 hover:bg-slate-100 px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1 transition-colors"
        >
          <span>Auditi ko'rish</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
