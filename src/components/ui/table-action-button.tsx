import type { IconDefinition } from "@fortawesome/fontawesome-svg-core"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import * as React from "react"
import { Link } from "react-router-dom"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Compact row actions for data tables — fixed height, works on dark dashboards.
 * Prefer `TableActionIconButton` for icon-only toolbars.
 */
const tableActionVariants = cva(
  "inline-flex h-7 shrink-0 items-center justify-center rounded-md px-2.5 text-[11px] font-semibold tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f58e43]/35 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      tone: {
        neutral:
          "bg-white/[0.07] text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:bg-white/[0.12]",
        accent:
          "bg-[#f58e43] text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:bg-[#ffa14d]",
        danger:
          "bg-rose-500/[0.14] text-rose-100 hover:bg-rose-500/25",
        warning:
          "bg-amber-500/[0.12] text-amber-100 hover:bg-amber-500/22",
        sky:
          "bg-sky-500/[0.16] text-sky-50 hover:bg-sky-500/28",
        success:
          "bg-emerald-500/[0.14] text-emerald-50 hover:bg-emerald-500/26",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  }
)

const iconActionBox =
  "!px-0 h-7 w-7 min-w-7 text-[0] [&_svg]:h-3.5 [&_svg]:w-3.5"

export type TableActionTone = NonNullable<VariantProps<typeof tableActionVariants>["tone"]>

export function tableActionClass(tone: TableActionTone = "neutral", className?: string) {
  return cn(tableActionVariants({ tone }), className)
}

export type TableActionButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof tableActionVariants>

export function TableActionButton({ className, tone, type = "button", ...props }: TableActionButtonProps) {
  return <button type={type} className={cn(tableActionVariants({ tone }), className)} {...props} />
}

export type TableActionIconButtonProps = Omit<React.ComponentProps<"button">, "children"> &
  VariantProps<typeof tableActionVariants> & {
    icon: IconDefinition
    /** Tooltip and accessible name */
    label: string
  }

export function TableActionIconButton({
  icon,
  label,
  className,
  tone,
  type = "button",
  ...props
}: TableActionIconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(tableActionVariants({ tone }), iconActionBox, className)}
      {...props}
    >
      <FontAwesomeIcon icon={icon} aria-hidden />
    </button>
  )
}

export type TableActionIconLinkProps = {
  to: string
  icon: IconDefinition
  label: string
  tone?: TableActionTone
  className?: string
}

export function TableActionIconLink({ to, icon, label, tone = "neutral", className }: TableActionIconLinkProps) {
  return (
    <Link
      to={to}
      aria-label={label}
      title={label}
      className={cn(tableActionClass(tone), iconActionBox, className)}
    >
      <FontAwesomeIcon icon={icon} aria-hidden />
    </Link>
  )
}
