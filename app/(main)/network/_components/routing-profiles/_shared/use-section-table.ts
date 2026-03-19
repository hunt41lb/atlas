// @/app/(main)/network/_components/routing-profiles/_shared/use-section-table.ts
//
// Reusable table hook for accordion profile sections.
// Provides a minimal TanStack Table with sorting only (no search/filter).

"use client"

import * as React from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"

export function useSectionTable<T>(data: T[], columns: ColumnDef<T, unknown>[]) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  // eslint-disable-next-line react-hooks/incompatible-library
  return useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })
}
