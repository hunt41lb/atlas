// @/components/ui/sort-header.tsx
//
// Sortable column header for TanStack Table views.
//
// Usage:
//   import { SortHeader } from "@/app/(main)/_components/ui/sort-header"
//
//   <TableHead>
//     <SortHeader label="Name" column={header.column} />
//   </TableHead>

"use client"

import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SortHeaderProps {
  /** Display text for the column header */
  label: string
  /** TanStack Table column instance — only the sorting methods are required */
  column: {
    getIsSorted: () => false | "asc" | "desc"
    toggleSorting: (desc?: boolean) => void
  }
}

export function SortHeader({ label, column }: SortHeaderProps) {
  const sorted = column.getIsSorted()

  return (
    <Button
      variant="ghost"
      size="xs"
      className="-ml-2 gap-1"
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {label}
      {sorted === "asc"  ? <ArrowUp className="size-3" /> :
       sorted === "desc" ? <ArrowDown className="size-3" /> :
       <ArrowUpDown className="size-3 opacity-40" />}
    </Button>
  )
}
