// @/app/(main)/network/_components/interfaces/poe-table.tsx
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
  createColumnHelper,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { InterfaceTypeBadge } from "./interface-helpers"
import type { PanwInterface } from "@/lib/panw-parser/network/interfaces"

// ─── Column builder ──────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<PanwInterface>()

function buildColumns(
  isPanorama: boolean,
): ColumnDef<PanwInterface, unknown>[] {
  return [
    columnHelper.accessor("name", {
      header: "Name",
      enableHiding: false,
      cell: (info) => <span className="text-xs font-medium">{info.getValue()}</span>,
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
      meta: { freezeColumn: true },
      accessorFn: (row) => row.poeEnabled ? "enabled" : "disabled",
      cell: ({ row }) => row.original.poeEnabled
        ? <Badge variant="green" size="sm">Enabled</Badge>
        : <Badge variant="muted" size="sm">Disabled</Badge>,
    },

    {
      id: "poeReservedPower",
      header: "Reserved Power",
      enableSorting: true,
      meta: { freezeColumn: true },
      accessorFn: (row) => row.poeReservedPower ?? 0,
      cell: ({ row }) => row.original.poeReservedPower
        ? <span className="tabular-nums text-xs font-medium">{row.original.poeReservedPower}W</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    ...(isPanorama ? [{
      id: "template",
      header: "Template",
      enableSorting: true,
      meta: { hidePriority: 2 },
      accessorFn: (row: PanwInterface) => row.templateName ?? "",
      cell: ({ row }: { row: { original: PanwInterface } }) => row.original.templateName
        ? <span className="text-xs">{row.original.templateName}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    } as ColumnDef<PanwInterface, unknown>] : []),

    columnHelper.accessor("comment", {
      header: "Comment",
      meta: { hidePriority: 1 },
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

  return (
    <DataTable
      table={table}
      title="PoE"
      search={search}
      onSearch={setSearch}
    />
  )
}
