/** Narrow width hint so the actions column does not absorb extra table width. */
const actionsColWidth = "w-[1%]"

/** Sticky right "Actions" column — stays visible when tables scroll horizontally. */
export const stickyActionsThClass =
  `${actionsColWidth} sticky right-0 z-20 whitespace-nowrap border-l border-slate-200 bg-white px-2 py-2 text-left text-slate-600 shadow-[-8px_0_16px_-10px_rgba(15,23,42,0.16)]`

export const stickyActionsTdClass =
  `${actionsColWidth} sticky right-0 z-10 whitespace-nowrap border-l border-slate-200 bg-white px-2 py-1.5 align-middle shadow-[-8px_0_16px_-10px_rgba(15,23,42,0.14)] group-hover:bg-slate-50`

/** Shorter row height: horizontal action buttons (agents, reps, investor table). */
export const stickyActionsThCompactClass =
  `${actionsColWidth} sticky right-0 z-20 whitespace-nowrap border-l border-slate-200 bg-white px-2 py-2 text-left text-slate-600 shadow-[-8px_0_16px_-10px_rgba(15,23,42,0.16)]`

export const stickyActionsTdCompactClass =
  `${actionsColWidth} sticky right-0 z-10 whitespace-nowrap border-l border-slate-200 bg-white px-2 py-1.5 align-middle shadow-[-8px_0_16px_-10px_rgba(15,23,42,0.14)] group-hover:bg-slate-50`

/** Investor dashboard table header band (matches existing thead). */
export const stickyActionsThInvestorClass =
  `${actionsColWidth} sticky right-0 z-20 whitespace-nowrap border-l border-slate-200 bg-slate-50 px-2 py-3 text-right text-xs uppercase tracking-wide text-slate-500 shadow-[-8px_0_16px_-10px_rgba(15,23,42,0.16)]`

export const stickyActionsTdInvestorClass =
  `${actionsColWidth} sticky right-0 z-10 whitespace-nowrap border-l border-slate-200 bg-white px-2 py-1.5 align-middle shadow-[-8px_0_16px_-10px_rgba(15,23,42,0.14)] group-hover:bg-slate-50`

/** Admin properties table uses darker thead band. */
export const stickyActionsThAdminClass =
  `${actionsColWidth} sticky right-0 z-20 whitespace-nowrap border-l border-slate-200 bg-slate-50 px-2 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 shadow-[-8px_0_16px_-10px_rgba(15,23,42,0.16)]`

export const stickyActionsTdAdminClass =
  `${actionsColWidth} sticky right-0 z-10 whitespace-nowrap border-l border-slate-200 bg-white px-2 py-1.5 align-middle shadow-[-8px_0_16px_-10px_rgba(15,23,42,0.14)] group-hover:bg-slate-50`

/** Single horizontal row of action controls (no wrap — table scrolls horizontally if needed). */
export const actionsButtonRowClass =
  "inline-flex flex-row flex-nowrap items-center gap-1 whitespace-nowrap"
