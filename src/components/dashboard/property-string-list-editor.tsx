import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons"

import { cn } from "@/lib/utils"

const fieldShell =
  "rounded-md border border-white/10 bg-[#152a45]/95 px-2 py-0.5 shadow-[inset_0_1px_0_rgb(255_255_255/4%)]"
const control =
  "h-7 w-full min-w-0 border-0 bg-transparent p-0 text-[11px] leading-7 text-white outline-none ring-0 placeholder:text-slate-500 focus:ring-0"

type PropertyStringListEditorProps = {
  label: string
  hint?: string
  values: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  addButtonLabel: string
}

export function PropertyStringListEditor({
  label,
  hint,
  values,
  onChange,
  placeholder,
  addButtonLabel,
}: PropertyStringListEditorProps) {
  const rows = values.length > 0 ? values : [""]

  function setRow(i: number, v: string) {
    const next = [...rows]
    next[i] = v
    onChange(next.filter((s) => s.trim() !== ""))
  }

  function removeRow(i: number) {
    const next = rows.filter((_, j) => j !== i)
    onChange(next.filter((s) => s.trim() !== ""))
  }

  function addRow() {
    onChange([...rows.filter((s) => s.trim() !== ""), ""])
  }

  return (
    <div className="space-y-2 sm:col-span-2 lg:col-span-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">{label}</p>
        {hint ? <p className="mt-0.5 text-[10px] leading-snug text-slate-500">{hint}</p> : null}
      </div>
      <ul className="space-y-2">
        {rows.map((row, i) => (
          <li key={i} className="flex items-center gap-2">
            <div className={cn(fieldShell, "min-w-0 flex-1")}>
              <input
                className={control}
                type="text"
                placeholder={placeholder}
                value={row}
                onChange={(e) => setRow(i, e.target.value)}
              />
            </div>
            <button
              type="button"
              aria-label="Remove row"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded border border-rose-500/35 text-rose-300 hover:bg-rose-500/10"
              onClick={() => removeRow(i)}
            >
              <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={addRow}
        className="inline-flex items-center gap-1.5 rounded border border-white/20 px-2 py-1 text-[10px] font-semibold text-slate-200 hover:bg-white/5"
      >
        <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
        {addButtonLabel}
      </button>
    </div>
  )
}
