import { cn } from "@/lib/utils"

type GridLoaderProps = {
  /** Number of skeleton cards to render */
  count?: number
  className?: string
}

export function GridLoader({ count = 9, className }: GridLoaderProps) {
  return (
    <div className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40"
        >
          <div className="h-44 w-full bg-white/10" />
          <div className="space-y-3 p-4">
            <div className="h-3.5 w-3/4 rounded bg-white/10" />
            <div className="h-3 w-2/5 rounded bg-white/10" />
            <div className="flex gap-2 pt-2">
              <div className="h-6 w-20 rounded-full bg-white/10" />
              <div className="h-6 w-24 rounded-full bg-white/10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

