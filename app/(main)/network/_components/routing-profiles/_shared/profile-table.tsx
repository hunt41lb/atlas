// @/app/(main)/network/_components/routing-profiles/_shared/profile-table.tsx
//
// Reusable components for routing profile accordion sections.
// Used by BGP, OSPF, etc. profile views.

"use client"

import {
  flexRender,
  type Table as TanstackTable,
} from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { SortHeader } from "@/components/ui/sort-header"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"

// ─── ProfileTable: renders a TanStack table inside an accordion section ──────

export function ProfileTable<T>({
  table,
  emptyLabel,
}: {
  table: TanstackTable<T>
  emptyLabel: string
}) {
  if (table.getRowModel().rows.length === 0) {
    return (
      <p className="py-3 text-xs text-muted-foreground">
        No {emptyLabel.toLowerCase()} configured.
      </p>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : header.column.getCanSort() ? (
                    <SortHeader
                      label={typeof header.column.columnDef.header === "string" ? header.column.columnDef.header : ""}
                      column={header.column}
                    />
                  ) : (
                    flexRender(header.column.columnDef.header, header.getContext())
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// ─── ProfileTrigger: accordion trigger with title + count badge ──────────────

export function ProfileTrigger({ title, count }: { title: string; count: number }) {
  return (
    <AccordionTrigger>
      <div className="flex items-center gap-2">
        <span>{title}</span>
        <Badge variant="secondary" size="sm" className="tabular-nums">
          {count}
        </Badge>
      </div>
    </AccordionTrigger>
  )
}

// ─── ProfileSection: Card-wrapped accordion item with table ──────────────────

export function ProfileSection<T>({
  value,
  title,
  count,
  table,
}: {
  value: string
  title: string
  count: number
  table: TanstackTable<T>
}) {
  return (
    <Card size="sm">
      <CardContent>
        <AccordionItem value={value} className="border-none">
          <ProfileTrigger title={title} count={count} />
          <AccordionContent>
            <ProfileTable table={table} emptyLabel={title.toLowerCase()} />
          </AccordionContent>
        </AccordionItem>
      </CardContent>
    </Card>
  )
}
