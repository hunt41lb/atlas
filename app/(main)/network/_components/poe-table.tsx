// @/app/(main)/network/_components/poe-table.tsx
//
// PoE tab — a filtered view over ethernet interfaces that have PoE configured.
// Unlike the unit-based tabs (Tunnel, Loopback, VLAN), PoE is not its own
// interface type. It shows ethernet interfaces where the <poe> element exists
// in the config, regardless of whether PoE is enabled or disabled.

"use client"

import * as React from "react"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { SortHeader } from "@/components/ui/sort-header"
import { ColumnVisibilityToggle } from "@/components/ui/column-visibility"
import { Badge } from "@/components/ui/badge"
import { CategoryShell } from "@/app/(main)/_components/ui/category-shell"
import { InterfaceTypeBadge } from "./interface-helpers"
import type { PanwInterface } from "@/lib/panw-parser/types"

// ─── Column builder ──────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<PanwInterface>()

function buildColumns(
  isPanorama: boolean,
): ColumnDef<PanwInterface, unknown>[] {
  return [
    columnHelper.accessor("name", {
      header: "Name",
      enableHiding: false,
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }) as ColumnDef<PanwInterface, unknown>,

    {
      id: "interfaceType",
      header: "Interface Type",
      enableSorting: true,
      accessorFn: (row) => row.mode !== "none" ? row.mode : row.type,
      cell: ({ row }) => <InterfaceTypeBadge iface={row.original} />,
    },

    {
      id: "poeEnabled",
      header: "PoE",
      enableSorting: true,
      accessorFn: (row) => row.poeEnabled ? "enabled" : "disabled",
      cell: ({ row }) => row.original.poeEnabled
        ? <Badge variant="green" size="sm">Enabled</Badge>
        : <Badge variant="muted" size="sm">Disabled</Badge>,
    },

    {
      id: "poeReservedPower",
      header: "Reserved Power",
      enableSorting: true,
      accessorFn: (row) => row.poeReservedPower ?? 0,
      cell: ({ row }) => row.original.poeReservedPower
        ? <span className="tabular-nums text-xs font-medium">{row.original.poeReservedPower}W</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    ...(isPanorama ? [{
      id: "template",
      header: "Template",
      enableSorting: true,
      accessorFn: (row: PanwInterface) => row.templateName ?? "",
      cell: ({ row }: { row: { original: PanwInterface } }) => row.original.templateName
        ? <span className="text-xs">{row.original.templateName}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    } as ColumnDef<PanwInterface, unknown>] : []),

    columnHelper.accessor("comment", {
      header: "Comment",
      cell: (info) => info.getValue()
        ? <span className="text-xs text-muted-foreground">{info.getValue()}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    }) as ColumnDef<PanwInterface, unknown>,
  ]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PoeTable({
  interfaces,
  isPanorama,
}: {
  interfaces: PanwInterface[]
  isPanorama: boolean
}) {
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])

  const poeInterfaces = React.useMemo(
    () => interfaces.filter((i) => i.poeConfigured),
    [interfaces]
  )

  const columns = React.useMemo(
    () => buildColumns(isPanorama),
    [isPanorama]
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: poeInterfaces,
    columns,
    state: { sorting, globalFilter: search },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: "includesString",
  })

  const rows = table.getRowModel().rows

  return (
    <CategoryShell
      title="PoE"
      count={rows.length}
      search={search}
      onSearch={setSearch}
      actions={<ColumnVisibilityToggle table={table} />}
    >
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} className="hover:bg-transparent border-b border-border">
              {hg.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="text-[11px] font-semibold tracking-wider text-muted-foreground whitespace-nowrap px-3 h-9"
                  style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                >
                  {header.isPlaceholder ? null : header.column.getCanSort() ? (
                    <SortHeader label={String(header.column.columnDef.header ?? "")} column={header.column} />
                  ) : (
                    flexRender(header.column.columnDef.header, header.getContext())
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="py-16 text-center text-sm text-muted-foreground">
                {search ? `No results matching "${search}"` : "No PoE interfaces found in this configuration."}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.original.name}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-3 py-2 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </CategoryShell>
  )
}
