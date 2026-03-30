// @/app/(main)/_components/ui/table-columns.tsx
//
// Reusable column builders for TanStack Table.
// Eliminates repeated patterns across all profile/view tables.

import type { ColumnDef } from "@tanstack/react-table"

/**
 * Template column — conditionally shown for Panorama configs.
 * Works with any type that has `templateName: string | null`.
 */
export function templateColumn<T extends { templateName: string | null }>(
  isPanorama: boolean
): ColumnDef<T, unknown>[] {
  if (!isPanorama) return []
  return [{
    id: "template",
    header: "Template",
    enableSorting: true,
    accessorFn: (row: T) => row.templateName ?? "",
    cell: ({ row }: { row: { original: T } }) => row.original.templateName
      ? <span className="text-xs">{row.original.templateName}</span>
      : <span className="text-muted-foreground text-xs">—</span>,
  }]
}
