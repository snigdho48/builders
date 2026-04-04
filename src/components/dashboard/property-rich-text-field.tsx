import { useCallback, useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

type PropertyRichTextFieldProps = {
  id: string
  label: string
  hint?: string
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeightClass?: string
}

function exec(cmd: string, value?: string) {
  try {
    document.execCommand(cmd, false, value)
  } catch {
    /* ignore */
  }
}

function ToolbarButton({
  onMouseDown,
  children,
  title,
}: {
  onMouseDown: (e: React.MouseEvent) => void
  children: React.ReactNode
  title: string
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault()
        onMouseDown(e)
      }}
      className="rounded border border-white/15 bg-slate-900/80 px-2 py-0.5 text-[10px] font-bold text-slate-200 hover:border-[#f58e43]/50 hover:text-white"
    >
      {children}
    </button>
  )
}

export function PropertyRichTextField({
  id,
  label,
  hint,
  value,
  onChange,
  placeholder,
  minHeightClass = "min-h-[140px]",
}: PropertyRichTextFieldProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [focused, setFocused] = useState(false)

  const syncFromProp = useCallback(() => {
    const el = ref.current
    if (!el || focused) return
    const next = value || ""
    if (el.innerHTML !== next) {
      el.innerHTML = next
    }
    if (!next.trim()) {
      el.setAttribute("data-placeholder", placeholder ?? "")
    } else {
      el.removeAttribute("data-placeholder")
    }
  }, [value, focused, placeholder])

  useEffect(() => {
    syncFromProp()
  }, [syncFromProp])

  const onLink = () => {
    const url = window.prompt("Link URL (https://…)", "https://")
    if (url) exec("createLink", url)
  }

  return (
    <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
      <div>
        <label htmlFor={id} className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">
          {label}
        </label>
        {hint ? <p className="mt-0.5 text-[10px] leading-snug text-slate-500">{hint}</p> : null}
      </div>
      <div className="overflow-hidden rounded-md border border-white/10 bg-[#152a45]/95 shadow-[inset_0_1px_0_rgb(255_255_255/4%)] focus-within:border-[#f58e43]/70 focus-within:ring-1 focus-within:ring-[#f58e43]/25">
        <div
          className="flex flex-wrap gap-1 border-b border-white/10 bg-slate-950/50 px-2 py-1.5"
          role="toolbar"
          aria-label="Formatting"
        >
          <ToolbarButton title="Bold" onMouseDown={() => exec("bold")}>
            B
          </ToolbarButton>
          <ToolbarButton title="Italic" onMouseDown={() => exec("italic")}>
            I
          </ToolbarButton>
          <ToolbarButton title="Underline" onMouseDown={() => exec("underline")}>
            U
          </ToolbarButton>
          <ToolbarButton title="Bullet list" onMouseDown={() => exec("insertUnorderedList")}>
            • List
          </ToolbarButton>
          <ToolbarButton title="Numbered list" onMouseDown={() => exec("insertOrderedList")}>
            1. List
          </ToolbarButton>
          <ToolbarButton title="Link" onMouseDown={onLink}>
            Link
          </ToolbarButton>
          <ToolbarButton title="Remove link" onMouseDown={() => exec("unlink")}>
            Unlink
          </ToolbarButton>
          <ToolbarButton title="Clear formatting" onMouseDown={() => exec("removeFormat")}>
            Clear
          </ToolbarButton>
        </div>
        <div
          id={id}
          ref={ref}
          role="textbox"
          aria-multiline="true"
          contentEditable
          suppressContentEditableWarning
          className={cn(
            minHeightClass,
            "px-2 py-2 text-[11px] leading-relaxed text-white outline-none",
            "[&:empty]:before:text-slate-500 [&:empty]:before:content-[attr(data-placeholder)]"
          )}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false)
            const html = ref.current?.innerHTML ?? ""
            onChange(html === "<br>" ? "" : html)
          }}
          onInput={() => {
            const html = ref.current?.innerHTML ?? ""
            onChange(html === "<br>" ? "" : html)
          }}
        />
      </div>
    </div>
  )
}
