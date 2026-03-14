// @/app/(main)/network/_components/zones-table.tsx
//
// TanStack Table view for Zones with sorting, search, and column visibility.
// Displays zone type, interfaces, protection profile, log setting, User-ID,
// Device-ID, and ACL members.

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
import { Badge } from "@/components/ui/badge"
import { SortHeader } from "@/components/ui/sort-header"
import { ColumnVisibilityToggle } from "@/components/ui/column-visibility"
import { CategoryShell, MembersList, ZoneBadge } from "@/app/(main)/_components/ui/category-shell"
import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import { resolveNetworkData } from "@/app/(main)/_lib/resolve-config-data"
import { ZONE_TYPE_COLORS } from "@/lib/colors"
import type { PanwZone } from "@/lib/panw-parser/types"

// ─── Zone type labels ─────────────────────────────────────────────────────────

const ZONE_TYPE_LABELS: Record<string, string> = {
  layer3: "Layer3",
  layer2: "Layer2",
  "virtual-wire": "Virtual Wire",
  tap: "Tap",
  tunnel: "Tunnel",
  external: "External",
  unknown: "Unknown",
}

// ─── Column builder ──────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<PanwZone>()

function buildColumns(): ColumnDef<PanwZone, unknown>[] {
  return [
    columnHelper.accessor("name", {
      header: "Name",
      enableHiding: false,
      cell: ({ row }) => <ZoneBadge name={row.original.name} color={row.original.color} />,
    }) as ColumnDef<PanwZone, unknown>,

    {
      id: "type",
      header: "Type",
      enableSorting: true,
      accessorFn: (row) => row.type,
      cell: ({ row }) => (
        <Badge variant={ZONE_TYPE_COLORS[row.original.type] ?? "muted"} size="sm">
          {ZONE_TYPE_LABELS[row.original.type] ?? row.original.type}
        </Badge>
      ),
    },

    {
      id: "interfaces",
      header: "Interfaces",
      enableSorting: false,
      cell: ({ row }) => <MembersList members={row.original.interfaces} max={5} />,
    },

    columnHelper.accessor("zoneProtectionProfile", {
      header: "Zone Protection",
      cell: (info) => info.getValue()
        ? <span className="text-xs">{info.getValue()}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    }) as ColumnDef<PanwZone, unknown>,

    columnHelper.accessor("logSetting", {
      header: "Log Setting",
      cell: (info) => info.getValue()
        ? <span className="text-xs">{info.getValue()}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    }) as ColumnDef<PanwZone, unknown>,

    {
      id: "netInspection",
      header: "Net Inspection",
      enableSorting: true,
      accessorFn: (row) => row.netInspection ? "yes" : "no",
      cell: ({ row }) => row.original.netInspection
        ? <Badge variant="green" size="sm">Yes</Badge>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    {
      id: "userId",
      header: "User-ID",
      enableSorting: true,
      accessorFn: (row) => row.enableUserIdentification ? "yes" : "no",
      cell: ({ row }) => row.original.enableUserIdentification
        ? <Badge variant="blue" size="sm">Enabled</Badge>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    {
      id: "deviceId",
      header: "Device-ID",
      enableSorting: true,
      accessorFn: (row) => row.enableDeviceIdentification ? "yes" : "no",
      cell: ({ row }) => row.original.enableDeviceIdentification
        ? <Badge variant="blue" size="sm">Enabled</Badge>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    {
      id: "userAcl",
      header: "User ACL Include",
      enableSorting: false,
      cell: ({ row }) => <MembersList members={row.original.userAclInclude} max={3} />,
    },

    {
      id: "userAclExclude",
      header: "User ACL Exclude",
      enableSorting: false,
      cell: ({ row }) => <MembersList members={row.original.userAclExclude} max={3} />,
    },

    {
      id: "deviceAcl",
      header: "Device ACL Include",
      enableSorting: false,
      cell: ({ row }) => <MembersList members={row.original.deviceAclInclude} max={3} />,
    },

    {
      id: "deviceAclExclude",
      header: "Device ACL Exclude",
      enableSorting: false,
      cell: ({ row }) => <MembersList members={row.original.deviceAclExclude} max={3} />,
    },
  ]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ZonesTable() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])

  const data = React.useMemo(() => {
    if (!activeConfig) return []
    return resolveNetworkData(activeConfig.parsedConfig, selectedScope).zones
  }, [activeConfig, selectedScope])

  const columns = React.useMemo(() => buildColumns(), [])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
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
      title="Zones"
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
                {search ? `No results matching "${search}"` : "No zones found in this configuration."}
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
