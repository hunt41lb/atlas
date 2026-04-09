// @/app/(main)/network/_components/zones/zones-view.tsx
//
// TanStack Table view for Zones with sorting, search, and column visibility.

"use client"

import * as React from "react"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  createColumnHelper,
  type VisibilityState,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { MembersList, ZoneBadge } from "@/app/(main)/_components/ui/category-shell"
import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import { resolveNetworkData } from "@/app/(main)/_lib/resolve-config-data"
import { ZONE_TYPE_COLORS } from "@/lib/colors"
import type { PanwZone } from "@/lib/panw-parser/network/zones"

const ZONE_TYPE_LABELS: Record<string, string> = {
  layer3: "Layer3",
  layer2: "Layer2",
  "virtual-wire": "Virtual Wire",
  tap: "Tap",
  tunnel: "Tunnel",
  external: "External",
  unknown: "Unknown",
}

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

    {
      id: "prenatUserId",
      header: "Pre-NAT User-ID",
      enableSorting: true,
      accessorFn: (row) => row.prenatUserIdentification ? "yes" : "no",
      cell: ({ row }) => row.original.prenatUserIdentification
        ? <Badge variant="blue" size="sm">Enabled</Badge>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    {
      id: "prenatDeviceId",
      header: "Pre-NAT Device-ID",
      enableSorting: true,
      accessorFn: (row) => row.prenatDeviceIdentification ? "yes" : "no",
      cell: ({ row }) => row.original.prenatDeviceIdentification
        ? <Badge variant="blue" size="sm">Enabled</Badge>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    {
      id: "prenatSourceLookup",
      header: "Pre-NAT Source Lookup",
      enableSorting: true,
      accessorFn: (row) => row.prenatSourceLookup ? "yes" : "no",
      cell: ({ row }) => row.original.prenatSourceLookup
        ? <Badge variant="blue" size="sm">Enabled</Badge>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    {
      id: "prenatDownstream",
      header: "Pre-NAT Original ID Downstream",
      enableSorting: true,
      accessorFn: (row) => row.prenatSourceIpDownstream ? "yes" : "no",
      cell: ({ row }) => row.original.prenatSourceIpDownstream
        ? <Badge variant="blue" size="sm">Enabled</Badge>
        : <span className="text-muted-foreground text-xs">—</span>,
    },
  ]
}

export function ZonesView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])

  const data = React.useMemo(() => {
    if (!activeConfig) return []
    return resolveNetworkData(activeConfig.parsedConfig, selectedScope).zones
  }, [activeConfig, selectedScope])

  const columns = React.useMemo(() => buildColumns(), [])

  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    userAclExclude: false,
    deviceAclExclude: false,
    prenatUserId: false,
    prenatDeviceId: false,
    prenatSourceLookup: false,
    prenatDownstream: false,
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter: search, columnVisibility },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: "includesString",
  })

  return (
    <DataTable
      table={table}
      title="Zones"
      search={search}
      onSearch={setSearch}
    />
  )
}

