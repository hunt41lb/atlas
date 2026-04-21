// @/components/ui/data-table.tsx
//
// Batteries-included TanStack Table wrapper that composes:
//   - ColumnVisibilityToggle (popover with checkbox per column)
//   - SortHeader (sortable column headers with directional icons)
//   - Standard row/cell rendering with empty state
//
// Covers ~95% of table use cases. For tables with expandable rows or other
// custom row rendering, use the `renderRow` prop for full control.
//
// Usage (simple):
//   <DataTable
//     table={table}
//     title="Zones"
//     search={search}
//     onSearch={setSearch}
//     emptyMessage="No zones found in this configuration."
//   />
//
// Usage (custom rows):
//   <DataTable
//     table={table}
//     title="Ethernet"
//     search={search}
//     onSearch={setSearch}
//     emptyMessage="No Ethernet interfaces found."
//     renderRow={(row) => (
//       <React.Fragment key={row.id}>
//         <TableRow>{/* custom cells, expand toggles, etc. */}</TableRow>
//         {/* sub-interface rows */}
//       </React.Fragment>
//     )}
//   />

"use client"

import * as React from "react"
import {
  flexRender,
  type Table,
  type Row,
} from "@tanstack/react-table"

import {
  Table as TableRoot,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { SortHeader } from "@/components/ui/sort-header"
import { useRegisterHeaderColumns } from "@/app/(main)/_context/header-toolbar-context"
import { CategoryShell } from "@/app/(main)/_components/ui/category-shell"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

interface DataTableProps<TData> {
  /** TanStack Table instance (from useReactTable) */
  table: Table<TData>
  /** Title shown in the toolbar and used for search placeholder */
  title: string
  /** Current search string */
  search: string
  /** Search change handler */
  onSearch: (value: string) => void
  /** Message shown when the table has no rows */
  emptyMessage?: string
  /** Override column id → label mapping for the column visibility toggle */
  columnLabels?: Record<string, string>
  /** Additional toolbar actions rendered between the column toggle and count */
  actions?: React.ReactNode
  /**
   * Custom row renderer for tables that need expandable rows or other
   * non-standard row layouts. When omitted, rows render with the default
   * cell-per-column pattern.
   */
  renderRow?: (row: Row<TData>) => React.ReactNode
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DataTable<TData>({
  table,
  title,
  search,
  onSearch,
  emptyMessage,
  columnLabels,
  actions,
  renderRow,
}: DataTableProps<TData>) {
  useRegisterHeaderColumns(table, columnLabels)

// Responsive column auto-hide based on column.meta.hidePriority.
  // Columns with a lower hidePriority are hidden first when the container
  // is too narrow, and restored when sufficient space becomes available.
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  // Tracks the wrapper width required to restore each auto-hidden column,
  // recorded at the moment of hiding.
  const hideThresholdRef = React.useRef<Map<string, number>>(new Map())

  React.useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const getPriority = (col: { columnDef: { meta?: unknown } }) =>
      (col.columnDef.meta as { hidePriority?: number } | undefined)?.hidePriority
    const isFrozen = (col: { columnDef: { meta?: unknown } }) =>
      !!(col.columnDef.meta as { freezeColumn?: boolean } | undefined)?.freezeColumn

    const GROW_BACK_MARGIN_PX = 32
    const MAX_ADJUSTMENTS_PER_CYCLE = 10

    let rafId: number | null = null
    let attempts = 0

    const adjust = () => {
      rafId = null
      if (attempts++ >= MAX_ADJUSTMENTS_PER_CYCLE) return

      const tableEl = wrapper.querySelector("table") as HTMLTableElement | null
      if (!tableEl) return

      const available = wrapper.clientWidth
      const needed = tableEl.scrollWidth

      // Clear thresholds for columns that are now visible (auto- or user-shown)
      for (const colId of Array.from(hideThresholdRef.current.keys())) {
        if (table.getColumn(colId)?.getIsVisible()) {
          hideThresholdRef.current.delete(colId)
        }
      }

      if (needed > available) {
        // Overflowing — hide next-lowest-priority visible column
        const candidates = table
          .getAllLeafColumns()
          .filter((c) =>
            c.getCanHide() &&
            c.getIsVisible() &&
            getPriority(c) !== undefined &&
            !isFrozen(c)
          )
          .sort((a, b) => (getPriority(a) ?? 0) - (getPriority(b) ?? 0))
        if (candidates.length > 0) {
          const col = candidates[0]
          hideThresholdRef.current.set(col.id, needed)
          col.toggleVisibility(false)
          rafId = requestAnimationFrame(adjust)
        }
        return
      }

      // Not overflowing — see if any hidden column's threshold has been cleared
      const restorable = table
        .getAllLeafColumns()
        .filter((c) => c.getCanHide() && !c.getIsVisible() && getPriority(c) !== undefined)
        .sort((a, b) => (getPriority(b) ?? 0) - (getPriority(a) ?? 0))

      for (const col of restorable) {
        const threshold = hideThresholdRef.current.get(col.id)
        if (threshold !== undefined && available >= threshold + GROW_BACK_MARGIN_PX) {
          hideThresholdRef.current.delete(col.id)
          col.toggleVisibility(true)
          rafId = requestAnimationFrame(adjust)
          return
        }
      }
    }

    const observer = new ResizeObserver(() => {
      attempts = 0
      if (rafId !== null) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(adjust)
    })
    observer.observe(wrapper)
    rafId = requestAnimationFrame(adjust)

    return () => {
      observer.disconnect()
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [table])

  const rows = table.getRowModel().rows
  const columns = table.getAllColumns()

  return (
    <CategoryShell
      title={title}
      count={rows.length}
      search={search}
      onSearch={onSearch}
      actions={
        <>
          {actions}
        </>
      }
    >
      <div ref={wrapperRef} className="flex-1 min-w-0 min-h-0 overflow-hidden">
        <TableRoot>
          <TableHeader className="[&_tr]:border-b-2">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent">
                {hg.headers.map((header) => {
                  const meta = header.column.columnDef.meta as { headerClassName?: string } | undefined
                  return (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn("text-[11px] font-semibold tracking-wider text-muted-foreground whitespace-nowrap px-3 h-9", meta?.headerClassName)}
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                  >
                    {header.isPlaceholder
                      ? null
                      : header.column.getCanSort()
                        ? <SortHeader label={String(header.column.columnDef.header ?? "")} column={header.column} />
                        : flexRender(header.column.columnDef.header, header.getContext())
                    }
                  </TableHead>
                )})}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-16 text-center text-sm text-muted-foreground"
                >
                  {search
                    ? `No results matching "${search}"`
                    : emptyMessage ?? `No ${title.toLowerCase()} found in this configuration.`
                  }
                </TableCell>
              </TableRow>
            ) : renderRow ? (
              rows.map(renderRow)
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-3 py-2 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </TableRoot>
      </div>
    </CategoryShell>
  )
}
