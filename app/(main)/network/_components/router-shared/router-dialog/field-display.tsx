// @/app/(main)/network/_components/router-shared/router-dialog/field-display.tsx

"use client"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"

// ─── FieldRow: label + value on a single line ────────────────────────────────

export function FieldRow({
  label,
  value,
  annotation,
  highlight = false,
}: {
  label: string
  value: string | number
  annotation?: string
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
  labelWidth = "w-44",
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
    <fieldset className="rounded-md border bg-card px-3 py-2.5">
      <legend className="px-1 text-xs font-medium text-foreground">{title}</legend>
      <div className="space-y-1.5">
        {children}
      </div>
    </fieldset>
  )
}

// ─── HeaderField: label + read-only input (PAN-OS style) ─────────────────────

export function HeaderField({
  label,
  value,
  labelWidth = "w-36",
}: {
  label: string
  value: string
  labelWidth?: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn("text-xs text-muted-foreground shrink-0 text-right", labelWidth)}>{label}</span>
      <Input readOnly value={value} className="h-7 flex-1 text-xs" />
    </div>
  )
}

// ─── Dash: muted em-dash placeholder ──────────────────────────────────────────

export function Dash() {
  return <span className="text-muted-foreground text-xs">—</span>
}

// ─── DetailDialog: reusable shell for clickable-row detail dialogs ────────────

export function DetailDialog({
  title,
  open,
  onOpenChange,
  children,
  maxWidth = "sm:max-w-lg",
}: {
  title: string
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  maxWidth?: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${maxWidth} max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden`}>
        <DialogHeader className="shrink-0 border-b px-5 pt-4 pb-3">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {children}
        </div>
        <div className="shrink-0 border-t bg-muted/50 rounded-b-xl px-5 py-3 flex justify-end">
          <DialogClose render={<Button variant="outline">Close</Button>} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── ReadOnlyRadio: disabled radio group with label ───────────────────────────

export function ReadOnlyRadio({
  label,
  value,
  options,
  labelWidth = "w-36",
}: {
  label: string
  value: string | null
  options: { value: string; label: string }[]
  labelWidth?: string
}) {
  return (
    <div className="flex items-center gap-4">
      <span className={cn("text-xs text-muted-foreground shrink-0 text-right", labelWidth)}>{label}</span>
      {options.map((opt) => (
        <label key={opt.value} className="flex items-center gap-1.5 text-xs">
          <input type="radio" checked={value === opt.value} readOnly className="accent-primary" />
          {opt.label}
        </label>
      ))}
    </div>
  )
}

// ─── ProfileDialog: reusable shell for network/routing profile dialogs ────────

export function ProfileDialog({
  title,
  open,
  onOpenChange,
  children,
  maxWidth = "sm:max-w-lg",
  height,
  noPadding = false,
}: {
  title: string
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  maxWidth?: string
  height?: string
  noPadding?: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={`${maxWidth} ${height ?? ""} flex flex-col gap-0 p-0 overflow-hidden`}
      >
        <DialogHeader className="shrink-0 border-b px-5 pt-4 pb-3">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className={cn("flex-1 overflow-y-auto", !noPadding && "p-5")}>
          {children}
        </div>
        <div className="shrink-0 border-t bg-muted/50 rounded-b-xl px-5 py-3 flex justify-end">
          <DialogClose render={<Button variant="outline">Close</Button>} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
