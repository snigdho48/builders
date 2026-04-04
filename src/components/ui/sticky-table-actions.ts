/** Narrow width hint so the actions column does not absorb extra table width. */
const actionsColWidth = "w-[1%]"

/** Sticky right "Actions" column — stays visible when tables scroll horizontally. */
export const stickyActionsThClass =
  `${actionsColWidth} sticky right-0 z-20 whitespace-nowrap border-l border-white/10 bg-slate-950 px-2 py-2 text-left text-slate-300 shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.85)]`

export const stickyActionsTdClass =
  `${actionsColWidth} sticky right-0 z-10 whitespace-nowrap border-l border-white/10 bg-slate-950 px-2 py-1.5 align-middle shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.75)] group-hover:bg-white/[0.06]`

/** Shorter row height: horizontal action buttons (agents, reps, investor table). */
export const stickyActionsThCompactClass =
  `${actionsColWidth} sticky right-0 z-20 whitespace-nowrap border-l border-white/10 bg-slate-950 px-2 py-2 text-left text-slate-300 shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.85)]`

export const stickyActionsTdCompactClass =
  `${actionsColWidth} sticky right-0 z-10 whitespace-nowrap border-l border-white/10 bg-slate-950 px-2 py-1.5 align-middle shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.75)] group-hover:bg-white/[0.06]`

/** Investor dashboard table header band (matches existing thead). */
export const stickyActionsThInvestorClass =
  `${actionsColWidth} sticky right-0 z-20 whitespace-nowrap border-l border-white/10 bg-white/[0.04] px-2 py-3 text-right text-xs uppercase tracking-wide text-slate-400 shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.85)]`

export const stickyActionsTdInvestorClass =
  `${actionsColWidth} sticky right-0 z-10 whitespace-nowrap border-l border-white/10 bg-slate-950 px-2 py-1.5 align-middle shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.75)] group-hover:bg-white/[0.02]`

/** Admin properties table uses darker thead band. */
export const stickyActionsThAdminClass =
  `${actionsColWidth} sticky right-0 z-20 whitespace-nowrap border-l border-white/10 bg-[#0f1f35] px-2 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400 shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.85)]`

export const stickyActionsTdAdminClass =
  `${actionsColWidth} sticky right-0 z-10 whitespace-nowrap border-l border-white/5 bg-slate-900/95 px-2 py-1.5 align-middle shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.75)] group-hover:bg-white/5`

/** Single horizontal row of action controls (no wrap — table scrolls horizontally if needed). */
export const actionsButtonRowClass =
  "inline-flex flex-row flex-nowrap items-center gap-1 whitespace-nowrap"
