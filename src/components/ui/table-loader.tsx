import { cn } from "@/lib/utils"

type TableLoaderProps = {
  /** Number of placeholder rows */
  rows?: number
  /** Number of placeholder columns */
  cols?: number
  /** Optional per-column widths (Tailwind classes) */
  colClasses?: string[]
  className?: string
}

export function TableLoader({ rows = 8, cols = 6, colClasses, className }: TableLoaderProps) {
  const safeCols = Math.max(1, cols)
  const widths =
    colClasses && colClasses.length > 0
      ? colClasses
      : Array.from({ length: safeCols }, (_, idx) =>
          idx === 0 ? "w-[38%]" : idx === safeCols - 1 ? "w-[16%]" : "w-[12%]"
        )

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40", className)}>
      <div className="animate-pulse">
        {/* header bar */}
        <div className="border-b border-white/10 px-3 py-3">
          <div className="h-3 w-44 rounded bg-white/10" />
        </div>

        {/* rows */}
        <div className="divide-y divide-white/10">
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="flex items-center gap-4 px-3 py-3">
              {Array.from({ length: safeCols }).map((__, c) => (
                <div
                  key={c}
                  className={cn(
                    "h-3 rounded bg-white/10",
                    widths[c] ?? "w-[12%]",
                    c === 0 ? "h-3.5" : ""
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

