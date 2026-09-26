"use client"

import React from "react"
import { useAdmin } from "@/contexts/AdminContext"
import { CheckCircle2, AlertCircle, Info, XCircle, X } from "lucide-react"

export function AdminToasts() {
  const { toasts, removeToast } = useAdmin()

  if (toasts.length === 0) return null

  return (
    <aside aria-label="Notifications" className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        let borderColor = "border-emerald-500/30"
        let bgGlow = "shadow-[0_8px_30px_rgb(16,185,129,0.12)]"

        if (toast.type === "warning") {
          icon = <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          borderColor = "border-amber-500/40"
          bgGlow = "shadow-[0_8px_30px_rgb(245,158,11,0.15)]"
        } else if (toast.type === "error") {
          icon = <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          borderColor = "border-rose-500/40"
          bgGlow = "shadow-[0_8px_30px_rgb(244,63,94,0.15)]"
        } else if (toast.type === "info") {
          icon = <Info className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
          borderColor = "border-[#D4AF37]/40"
          bgGlow = "shadow-[0_8px_30px_rgb(212,175,55,0.12)]"
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3.5 p-4 rounded-xl bg-[#1C1417]/95 backdrop-blur-md text-white border ${borderColor} ${bgGlow} transition-all duration-300 transform translate-y-0`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold tracking-wide text-[#FAF7F2]">
                {toast.title}
              </h4>
              <p className="text-xs text-[#D8CFBC] mt-0.5 leading-relaxed">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#A89F91] hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </aside>
  )
}
