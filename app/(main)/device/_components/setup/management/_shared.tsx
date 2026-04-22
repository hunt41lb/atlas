// @/app/(main)/device/_components/setup/management/_shared.tsx

"use client"

import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DisplayField } from "@/components/ui/display-field"

/** Consistent label width across all management cards */
export const LW = "w-72"

/** Reusable card shell — matches PAN-OS section cards */
export function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {children}
      </CardContent>
    </Card>
  )
}

/** Text/number field — wraps DisplayField with consistent labelWidth */
export function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  return <DisplayField label={label} value={String(value ?? "—")} labelWidth={LW} />
}

/** Boolean field — matches DisplayField alignment with a disabled checkbox */
export function BoolField({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className="flex items-center gap-3 py-px">
      <span className="w-72 shrink-0 text-right text-xs text-muted-foreground">{label}</span>
      <Checkbox checked={checked} disabled />
    </div>
  )
}

/** Quota storage row — "Total: X%  Unallocated: Y%" */
export function QuotaField({
  label,
  entries,
}: {
  label: string
  entries: Record<string, { quotaPercent: number | null }>
}) {
  const total = Object.values(entries).reduce((sum, e) => sum + (e.quotaPercent ?? 0), 0)
  const unallocated = 100 - total

  return (
    <div className="flex items-center gap-3 py-px">
      <span className="w-72 shrink-0 text-right text-xs text-muted-foreground">{label}</span>
      <span className="text-xs">
        Total: {total} %
        <span className="ml-4 text-muted-foreground">Unallocated: {unallocated} %</span>
      </span>
    </div>
  )
}

/** Inline color swatch for banner colors */
export function ColorSwatch({ label, color }: { label: string; color: string | null }) {
  return (
    <div className="flex items-center gap-3 py-px">
      <span className="w-72 shrink-0 text-right text-xs text-muted-foreground">{label}</span>
      {color ? (
        <span
          className="inline-block size-4 rounded border border-border"
          style={{ backgroundColor: color }}
        />
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      )}
    </div>
  )
}
