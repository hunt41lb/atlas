// @/components/ui/column-visibility.tsx
//
// Generic column visibility toggle for TanStack Table.
// Uses a Popover so users can toggle multiple columns without
// the panel closing after each interaction.
//
// Usage:
//   import { ColumnVisibilityToggle } from "@/components/ui/column-visibility"
//
//   <ColumnVisibilityToggle table={table} />

"use client"

import { Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import type { Table } from "@tanstack/react-table"

interface ColumnVisibilityToggleProps<TData> {
  /** The TanStack Table instance */
  table: Table<TData>
  /** Override the default column id → label mapping */
  columnLabels?: Record<string, string>
}

/** IDs of columns that should never appear in the toggle (always visible) */
const ALWAYS_VISIBLE = new Set(["expand", "name"])

export function ColumnVisibilityToggle<TData>({
  table,
  columnLabels,
}: ColumnVisibilityToggleProps<TData>) {
  const allColumns = table
    .getAllColumns()
    .filter((col) => col.getCanHide() && !ALWAYS_VISIBLE.has(col.id))

  if (allColumns.length === 0) return null

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" size="xs" className="gap-1.5 text-muted-foreground">
            <Settings2 className="size-3.5" />
            <span>Columns</span>
          </Button>
        }
      />
      <PopoverContent align="end" className="w-48 p-1.5">
        <p className="px-1.5 py-1 text-xs font-medium text-muted-foreground">
          Toggle columns
        </p>
        <div className="flex flex-col">
          {allColumns.map((col) => {
            const label =
              columnLabels?.[col.id] ??
              (typeof col.columnDef.header === "string"
                ? col.columnDef.header
                : col.id)

            return (
              <label
                key={col.id}
                className="flex items-center gap-2 rounded-md px-1.5 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer select-none"
              >
                <Checkbox
                  checked={col.getIsVisible()}
                  onCheckedChange={(checked) => col.toggleVisibility(!!checked)}
                />
                {label}
              </label>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
