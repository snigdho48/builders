import { createContext, useContext } from "react"

export type ToastVariant = "success" | "error" | "info"

export type ToastItem = {
  id: number
  title: string
  variant: ToastVariant
}

type ToastContextValue = {
  showToast: (title: string, variant?: ToastVariant) => void
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}
