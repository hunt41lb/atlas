// @/components/ui/expandable-row.tsx
//
// Reusable expand/collapse pattern for tables with hierarchical rows.
//
// Two exports:
//   useExpandableRows — hook for state, toggle, auto-expand, and lookup
//   ExpandToggle      — chevron button (or spacer when not expandable)
//
// Usage:
//   const { isExpanded, toggleRow } = useExpandableRows({
//     items: interfaces,
//     getRowKey: (i) => `${i.templateName ?? "fw"}-${i.name}`,
//     isExpandable: (i) => i.subInterfaces.length > 0,
//     defaultExpanded: true,
//   })
//
//   <ExpandToggle
//     expandable={hasChildren}
//     expanded={isExpanded(rowKey)}
//     onToggle={() => toggleRow(rowKey)}
//   />

"use client"

import * as React from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

// ─── Hook ────────────────────────────────────────────────────────────────────

interface UseExpandableRowsOptions<T> {
  /** The data items to track expansion for */
  items: T[]
  /** Returns a unique string key for each item */
  getRowKey: (item: T) => string
  /** Determines which items are expandable (have children) */
  isExpandable: (item: T) => boolean
  /**
   * When true, all expandable rows start expanded on first load.
   * When false, all rows start collapsed.
   * @default true
   */
  defaultExpanded?: boolean
}

interface UseExpandableRowsReturn {
  /** Check if a row is currently expanded */
  isExpanded: (key: string) => boolean
  /** Toggle a row's expanded/collapsed state */
  toggleRow: (key: string) => void
  /** Expand all expandable rows */
  expandAll: () => void
  /** Collapse all rows */
  collapseAll: () => void
}

export function useExpandableRows<T>({
  items,
  getRowKey,
  isExpandable,
  defaultExpanded = true,
}: UseExpandableRowsOptions<T>): UseExpandableRowsReturn {
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set())
  const initialized = React.useRef(false)

  // Auto-expand on first load when items become available
  React.useEffect(() => {
    if (items.length > 0 && !initialized.current) {
      initialized.current = true
      if (defaultExpanded) {
        setExpandedRows(new Set(
          items.filter(isExpandable).map(getRowKey)
        ))
      }
    }
  }, [items, getRowKey, isExpandable, defaultExpanded])

  const isExpanded = React.useCallback(
    (key: string) => expandedRows.has(key),
    [expandedRows]
  )

  const toggleRow = React.useCallback((key: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(key)) { next.delete(key) } else { next.add(key) }
      return next
    })
  }, [])

  const expandAll = React.useCallback(() => {
    setExpandedRows(new Set(
      items.filter(isExpandable).map(getRowKey)
    ))
  }, [items, getRowKey, isExpandable])

  const collapseAll = React.useCallback(() => {
    setExpandedRows(new Set())
  }, [])

  return { isExpanded, toggleRow, expandAll, collapseAll }
}

// ─── Toggle button ───────────────────────────────────────────────────────────

interface ExpandToggleProps {
  /** Whether this row has children and can be expanded */
  expandable: boolean
  /** Current expanded state */
  expanded: boolean
  /** Called when the user clicks the toggle */
  onToggle: () => void
}

export function ExpandToggle({ expandable, expanded, onToggle }: ExpandToggleProps) {
  if (!expandable) {
    return <div className="size-5" />
  }

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      className="text-muted-foreground hover:text-foreground"
      onClick={onToggle}
      aria-label={expanded ? "Collapse" : "Expand"}
    >
      {expanded
        ? <ChevronDown className="size-3.5" />
        : <ChevronRight className="size-3.5" />}
    </Button>
  )
}
