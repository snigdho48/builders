import { useEffect, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faXmark } from "@fortawesome/free-solid-svg-icons"

import { cn } from "@/lib/utils"

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
        className="absolute inset-0 border-0 bg-[#030912]/82 backdrop-blur-md motion-reduce:backdrop-blur-none"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-10 flex w-full max-w-none flex-col overflow-hidden rounded-t-[1.35rem] border border-white/8 bg-[#0a1628] pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] shadow-[0_-16px_48px_rgba(0,0,0,0.45),0_24px_64px_rgba(0,0,0,0.35)] ring-1 ring-white/4",
          "max-h-[min(92dvh,calc(100dvh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)))] sm:max-h-[min(92vh,900px)] sm:rounded-2xl sm:pb-0",
          wide ? "sm:max-w-6xl" : "sm:max-w-3xl",
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dashboard-modal-title"
      >
        <div className="flex justify-center pt-3 pb-0 sm:hidden" aria-hidden>
          <div className="h-1 w-11 rounded-full bg-white/18" />
        </div>
        <div className="flex shrink-0 items-center gap-2.5 border-b border-white/6 px-4 py-2.5 sm:px-5 sm:py-3">
          <h2
            id="dashboard-modal-title"
            className="min-w-0 flex-1 font-sans text-sm font-semibold tracking-tight text-white sm:text-[0.95rem]"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition-colors hover:border-white/18 hover:bg-white/6 hover:text-white"
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faXmark} className="text-sm" aria-hidden />
          </button>
        </div>
        <div className="dashboard-modal-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#060d18]/40 px-4 py-4 sm:px-5 sm:py-4">
          {children}
        </div>
        {footer ? (
          <div className="shrink-0 border-t border-white/6 bg-[#060d18]/90 px-4 py-3 backdrop-blur-sm sm:px-5">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
