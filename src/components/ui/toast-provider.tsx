import { useCallback, useMemo, useState } from "react"
import type { ReactNode } from "react"

import { ToastContext, type ToastItem, type ToastVariant } from "@/components/ui/use-toast"

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((title: string, variant: ToastVariant = "info") => {
    const id = Date.now()
    setToasts((current) => [...current, { id, title, variant }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id))
    }, 3000)
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-200 grid gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
              toast.variant === "error"
                ? "bg-rose-600"
                : toast.variant === "success"
                  ? "bg-emerald-600"
                  : "bg-slate-700"
            }`}
          >
            {toast.title}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
