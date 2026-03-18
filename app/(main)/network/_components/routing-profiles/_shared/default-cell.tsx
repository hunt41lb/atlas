// @/app/(main)/network/_components/routing-profiles/_shared/default-cell.tsx
//
// Reusable cell renderer that shows values with "(default)" annotation
// when the value matches the PAN-OS factory default.

"use client"

export function DefaultCell({
  value,
  defaultValue,
  unit,
}: {
  value: number
  defaultValue: number
  unit?: string
}) {
  const isDefault = value === defaultValue
  return (
    <span className={`tabular-nums text-xs ${isDefault ? "text-muted-foreground" : "font-medium"}`}>
      {value.toLocaleString()}{unit ? ` ${unit}` : ""}
      {isDefault && " (default)"}
    </span>
  )
}
