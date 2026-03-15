// @/components/ui/data-table.tsx
//
// Batteries-included TanStack Table wrapper that composes:
//   - CategoryShell (search bar, entry count, toolbar actions)
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
import { ColumnVisibilityToggle } from "@/components/ui/column-visibility"
import { CategoryShell } from "@/app/(main)/_components/ui/category-shell"

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
          <ColumnVisibilityToggle table={table} columnLabels={columnLabels} />
          {actions}
        </>
      }
    >
      <TableRoot>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} className="hover:bg-transparent border-b border-border">
              {hg.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="text-[11px] font-semibold tracking-wider text-muted-foreground whitespace-nowrap px-3 h-9"
                  style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                >
                  {header.isPlaceholder
                    ? null
                    : header.column.getCanSort()
                      ? <SortHeader label={String(header.column.columnDef.header ?? "")} column={header.column} />
                      : flexRender(header.column.columnDef.header, header.getContext())
                  }
                </TableHead>
              ))}
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
    </CategoryShell>
  )
}
