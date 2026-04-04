import { Select } from "radix-ui"

import { cn } from "@/lib/utils"

/** Internal sentinel when the field allows an empty value (Radix Select needs a string value). */
const EMPTY_VALUE = "__form_empty__"

export type CompactFormSelectOption = {
  value: string
  label: string
}

export type CompactFormSelectProps = {
  id?: string
  value: string
  onValueChange: (value: string) => void
  options: CompactFormSelectOption[]
  /** First option clears the field to `""` (parent maps to undefined if needed). */
  emptyLabel?: string
  ariaLabel: string
  disabled?: boolean
  className?: string
}

const triggerClass =
  "flex h-full min-h-8 w-full min-w-0 items-center justify-between gap-1 border-0 bg-transparent p-0 text-left text-xs leading-5 text-white outline-none ring-0 focus:ring-0 data-[placeholder]:text-slate-500 [&>span]:truncate"

const itemClass =
  "relative flex cursor-pointer select-none items-center rounded-sm py-1 pl-2 pr-6 text-[11px] text-white outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[highlighted]:bg-white/10"

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={cn("size-3 shrink-0 text-slate-400", className)}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export function CompactFormSelect({
  id,
  value,
  onValueChange,
  options,
  emptyLabel,
  ariaLabel,
  disabled,
  className,
}: CompactFormSelectProps) {
  const allowEmpty = Boolean(emptyLabel)
  const rootValue = allowEmpty && value === "" ? EMPTY_VALUE : value

  return (
    <Select.Root
      value={rootValue}
      onValueChange={(next) => {
        if (allowEmpty && next === EMPTY_VALUE) onValueChange("")
        else onValueChange(next)
      }}
      disabled={disabled}
    >
      <Select.Trigger id={id} aria-label={ariaLabel} className={cn(triggerClass, className)}>
        <Select.Value placeholder={emptyLabel} />
        <Select.Icon className="shrink-0">
          <ChevronDown />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={4}
          className="z-[500] max-h-[min(240px,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-white/10 bg-[#152a45] py-0.5 shadow-[0_12px_40px_rgb(0_0_0/45%)]"
        >
          <Select.Viewport className="p-0.5">
            {allowEmpty ? (
              <Select.Item value={EMPTY_VALUE} className={itemClass}>
                <Select.ItemText>{emptyLabel}</Select.ItemText>
              </Select.Item>
            ) : null}
            {options.map((opt) => (
              <Select.Item key={opt.value} value={opt.value} className={itemClass}>
                <Select.ItemText>{opt.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
