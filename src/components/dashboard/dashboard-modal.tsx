import { useEffect, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faXmark } from "@fortawesome/free-solid-svg-icons"

import { cn } from "@/lib/utils"

/** Inputs, selects, and textareas inside the light `DashboardModal` body. */
export const dashboardModalFieldClass =
  "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-[#f58e43]/80 focus:outline-none focus:ring-2 focus:ring-[#f58e43]/20"

/** Compact grid rows (e.g. payment tier lines) inside `DashboardModal`. */
export const dashboardModalFieldClassTight =
  "mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-[#f58e43]/80 focus:outline-none focus:ring-2 focus:ring-[#f58e43]/20"

type DashboardModalProps = {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
}

export function DashboardModal({ open, title, onClose, children, footer, wide }: DashboardModalProps) {
  useEffect(() => {
    if (!open) {
      return
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [open, onClose])

  if (!open) {
    return null
  }

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-end justify-center pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)] pt-[env(safe-area-inset-top,0px)] sm:items-center sm:p-4 sm:py-10">
      <button
        type="button"
        className="absolute inset-0 border-0 bg-slate-900/40 backdrop-blur-sm motion-reduce:backdrop-blur-none"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-10 flex w-full max-w-none flex-col overflow-hidden rounded-t-[1.35rem] border border-slate-200 bg-white pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] shadow-[0_-16px_48px_rgba(15,23,42,0.16),0_24px_64px_rgba(15,23,42,0.14)]",
          "max-h-[min(92dvh,calc(100dvh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)))] sm:max-h-[min(92vh,900px)] sm:rounded-2xl sm:pb-0",
          wide ? "sm:max-w-6xl" : "sm:max-w-3xl",
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dashboard-modal-title"
      >
        <div className="flex justify-center pt-3 pb-0 sm:hidden" aria-hidden>
          <div className="h-1 w-11 rounded-full bg-slate-300" />
        </div>
        <div className="flex shrink-0 items-center gap-2.5 border-b border-slate-200 px-4 py-2.5 sm:px-5 sm:py-3">
          <h2
            id="dashboard-modal-title"
            className="min-w-0 flex-1 font-sans text-sm font-semibold tracking-tight text-slate-900 sm:text-[0.95rem]"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-slate-300 text-slate-500 transition-colors hover:border-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faXmark} className="text-sm" aria-hidden />
          </button>
        </div>
        <div className="dashboard-modal-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white px-4 py-4 sm:px-5 sm:py-4">
          {children}
        </div>
        {footer ? (
          <div className="shrink-0 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
