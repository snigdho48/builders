import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons"

import { cn } from "@/lib/utils"
import type { FloorPlanItem } from "@/types/domain"

const fieldShell =
  "rounded-md border border-white/10 bg-[#152a45]/95 px-2 py-0.5 shadow-[inset_0_1px_0_rgb(255_255_255/4%)]"
const control =
  "h-7 w-full min-w-0 border-0 bg-transparent p-0 text-[11px] leading-7 text-white outline-none ring-0 placeholder:text-slate-500 focus:ring-0"
const textarea =
  "w-full min-w-0 resize-y border-0 bg-transparent py-1 text-[11px] leading-snug text-white outline-none ring-0 placeholder:text-slate-500 focus:ring-0"

type PropertyFloorPlanEditorProps = {
  items: FloorPlanItem[]
  onChange: (next: FloorPlanItem[]) => void
}

const emptyRow = (): FloorPlanItem => ({ title: "", image_url: "", description: "" })

export function PropertyFloorPlanEditor({ items, onChange }: PropertyFloorPlanEditorProps) {
  const rows = items.length > 0 ? items : [emptyRow()]

  function patch(i: number, patchRow: Partial<FloorPlanItem>) {
    const next = rows.map((r, j) => (j === i ? { ...r, ...patchRow } : r))
    onChange(next.filter((r) => r.title.trim() || r.image_url.trim() || (r.description ?? "").trim()))
  }

  function remove(i: number) {
    const next = rows.filter((_, j) => j !== i)
    onChange(next.filter((r) => r.title.trim() || r.image_url.trim() || (r.description ?? "").trim()))
  }

  function add() {
    onChange([...rows, emptyRow()])
  }

  return (
    <div className="space-y-3 sm:col-span-2 lg:col-span-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">Floor plans</p>
        <p className="mt-0.5 text-[10px] leading-snug text-slate-500">
          Add one or more plans. Each needs a title and image URL; description is optional. Remove a row with the trash
          icon.
        </p>
      </div>
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="rounded-lg border border-white/10 bg-slate-950/40 p-3">
            <div className="mb-2 flex items-start justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Plan {i + 1}</span>
              <button
                type="button"
                aria-label="Remove floor plan"
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded border border-rose-500/35 text-rose-300 hover:bg-rose-500/10"
                onClick={() => remove(i)}
              >
                <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className={fieldShell}>
                <input
                  className={control}
                  placeholder="Title (e.g. Ground floor)"
                  value={row.title}
                  onChange={(e) => patch(i, { title: e.target.value })}
                />
              </div>
              <div className={fieldShell}>
                <input
                  className={control}
                  placeholder="Image URL"
                  value={row.image_url}
                  onChange={(e) => patch(i, { image_url: e.target.value })}
                />
              </div>
              <div className={cn(fieldShell, "sm:col-span-2")}>
                <textarea
                  className={cn(textarea, "min-h-14")}
                  placeholder="Optional description"
                  value={row.description ?? ""}
                  onChange={(e) => patch(i, { description: e.target.value })}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1.5 rounded border border-white/20 px-2 py-1 text-[10px] font-semibold text-slate-200 hover:bg-white/5"
      >
        <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
        Add floor plan
      </button>
    </div>
  )
}
