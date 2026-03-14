// @/app/(main)/_components/ui/category-shell.tsx

"use client"

import * as React from "react"
import { Search, Construction } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// ─── Tag pill ────────────────────────────────────────────────────────────────

export function TagPill({ name, color }: { name: string; color?: string }) {
  return (
    <span
      className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium leading-none border"
      style={
        color && color !== "var(--muted-foreground)"
          ? {
              backgroundColor: `color-mix(in oklch, ${color} 15%, transparent)`,
              borderColor: `color-mix(in oklch, ${color} 40%, transparent)`,
              color,
            }
          : undefined
      }
    >
      {name}
    </span>
  )
}

// ─── Action badge ────────────────────────────────────────────────────────────

const actionColors: Record<string, string> = {
  allow:        "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  deny:         "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  drop:         "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  "reset-client": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  "reset-server": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  "reset-both": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
}

export function ActionBadge({ action }: { action: string }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
      actionColors[action] ?? "bg-muted text-muted-foreground border-border"
    )}>
      {action}
    </span>
  )
}

// ─── Protocol badge ──────────────────────────────────────────────────────────

const protoColors: Record<string, string> = {
  tcp:  "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  udp:  "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  sctp: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
}

export function ProtoBadge({ proto }: { proto: string }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
      protoColors[proto] ?? "bg-muted text-muted-foreground border-border"
    )}>
      {proto}
    </span>
  )
}

// ─── Type badge (generic) ─────────────────────────────────────────────────────

export function TypeBadge({ label, className }: { label: string; className?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded border bg-muted/40 px-1.5 py-0.5 text-[10px] font-medium border-border text-muted-foreground",
      className
    )}>
      {label}
    </span>
  )
}

// ─── Mono cell value ─────────────────────────────────────────────────────────

export function MonoValue({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("font-mono text-xs", className)}>
      {children}
    </span>
  )
}

// ─── Members list ────────────────────────────────────────────────────────────

export function MembersList({ members, max = 3 }: { members: string[]; max?: number }) {
  if (!members.length) return <span className="text-muted-foreground text-xs">—</span>
  const visible = members.slice(0, max)
  const rest = members.length - max
  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((m) => (
        <span key={m} className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono">
          {m}
        </span>
      ))}
      {rest > 0 && (
        <span className="text-[10px] text-muted-foreground self-center">+{rest} more</span>
      )}
    </div>
  )
}

// ─── Table primitives ────────────────────────────────────────────────────────

export function DataTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full text-sm border-collapse">
        {children}
      </table>
    </div>
  )
}

export function DataThead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="sticky top-0 z-10 bg-background border-b border-border">
      <tr>{children}</tr>
    </thead>
  )
}

export function DataTh({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={cn(
      "px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap",
      className
    )}>
      {children}
    </th>
  )
}

export function DataTbody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-border">{children}</tbody>
}

export function DataTr({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <tr className={cn("hover:bg-muted/30 transition-colors", className)}>
      {children}
    </tr>
  )
}

export function DataTd({ children, className, colSpan }: { children?: React.ReactNode; className?: string; colSpan?: number }) {
  return (
    <td colSpan={colSpan} className={cn("px-3 py-2 align-middle", className)}>
      {children ?? <span className="text-muted-foreground text-xs">—</span>}
    </td>
  )
}

// ─── Empty table state ────────────────────────────────────────────────────────

export function TableEmpty({ query }: { query?: string }) {
  return (
    <tr>
      <td colSpan={99} className="px-3 py-16 text-center text-sm text-muted-foreground">
        {query ? `No results matching "${query}"` : "No entries found in this configuration."}
      </td>
    </tr>
  )
}

// ─── Coming soon view ─────────────────────────────────────────────────────────

export function ComingSoonView({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
        <Construction className="size-5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        {count !== undefined && count > 0 && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {count.toLocaleString()} {count === 1 ? "entry" : "entries"} in this configuration
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">Detailed view coming soon</p>
      </div>
    </div>
  )
}

// ─── Category shell ───────────────────────────────────────────────────────────

interface CategoryShellProps {
  title: string
  count: number
  search: string
  onSearch: (v: string) => void
  actions?: React.ReactNode
  children: React.ReactNode
}

export function CategoryShell({ title, count, search, onSearch, actions, children }: CategoryShellProps) {
  return (
    <div className="flex h-full flex-col min-h-0">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center gap-3 border-b px-4 py-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={`Search ${title.toLowerCase()}…`}
            className="pl-8 h-7 text-sm"
          />
        </div>
        {actions}
        <span className="text-xs text-muted-foreground tabular-nums shrink-0">
          {count.toLocaleString()} {count === 1 ? "entry" : "entries"}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto min-h-0">
        {children}
      </div>
    </div>
  )
}

// ─── Zone badge ──────────────────────────────────────────────────────────────

export function ZoneBadge({ name, color }: { name?: string; color?: string }) {
  if (!name) return <span className="text-muted-foreground text-xs">none</span>
  const hasColor = color && color !== "var(--muted-foreground)"
  return hasColor ? (
    <span
      className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium leading-none border"
      style={{
        backgroundColor: `color-mix(in oklch, ${color} 15%, transparent)`,
        borderColor: `color-mix(in oklch, ${color} 40%, transparent)`,
        color,
      }}
    >
      {name}
    </span>
  ) : (
    <span className="text-xs font-medium">{name}</span>
  )
}
