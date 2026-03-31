import { useEffect, type ReactNode } from "react"

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

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        className={`relative flex max-h-[92vh] w-full flex-col rounded-t-2xl border border-white/15 bg-slate-900 shadow-2xl sm:rounded-2xl ${
          wide ? "max-w-6xl" : "max-w-3xl"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dashboard-modal-title"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
          <h2 id="dashboard-modal-title" className="text-lg font-semibold text-white">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-slate-300 hover:bg-white/10 hover:text-white"
          >
            Close
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">{children}</div>
        {footer ? (
          <div className="shrink-0 border-t border-white/10 bg-slate-950/80 px-4 py-3 sm:px-5">{footer}</div>
        ) : null}
      </div>
    </div>
  )
}
