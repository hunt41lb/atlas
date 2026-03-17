// @/app/(main)/network/_components/router-shared/router-dialog/field-display.tsx
//
// Reusable read-only field display components for router dialog pages.
// These render labeled values in a consistent style across all pages.

"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

// ─── FieldRow: label + value on a single line ────────────────────────────────

export function FieldRow({
  label,
  value,
  annotation,
  highlight = false,
}: {
  label: string
  value: string | number
  /** Small muted text shown before the value (e.g. "(default: 10)") */
  annotation?: string
  /** Highlight the value in primary color */
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        {annotation && (
          <span className="text-[10px] text-muted-foreground">{annotation}</span>
        )}
        <span className={cn(
          "tabular-nums text-xs font-medium w-12 text-right",
          highlight && "text-primary"
        )}>
          {value}
        </span>
      </div>
    </div>
  )
}

// ─── LabeledValue: label + value inline (no justify-between) ──────────────────

export function LabeledValue({
  label,
  value,
  labelWidth = "w-36",
}: {
  label: string
  value: string | number
  labelWidth?: string
}) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className={cn("text-xs text-muted-foreground shrink-0", labelWidth)}>{label}</span>
      <span className="text-xs font-medium">{value}</span>
    </div>
  )
}

// ─── ReadOnlyCheckbox: disabled checkbox with label ───────────────────────────

export function ReadOnlyCheckbox({
  checked,
  label,
}: {
  checked: boolean
  label: string
}) {
  return (
    <label className="flex items-center gap-2 py-1">
      <Checkbox checked={checked} disabled />
      <span className="text-xs">{label}</span>
    </label>
  )
}

// ─── FieldGroup: bordered section with legend title ───────────────────────────

export function FieldGroup({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <fieldset className="rounded-md border px-3 py-2.5">
      <legend className="px-1 text-xs font-medium text-foreground">{title}</legend>
      <div className="space-y-1.5">
        {children}
      </div>
    </fieldset>
  )
}
