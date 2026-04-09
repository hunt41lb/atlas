// @/app/(main)/network/_components/routing-profiles/bfd/bfd-profiles-view.tsx
//
// BFD (Bidirectional Forwarding Detection) Routing Profiles table.
// Displays Logical Router BFD profile definitions.
// XML path: <network><routing-profile><bfd><entry>

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

import { DataTable } from "@/components/ui/data-table"
import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import { resolveNetworkData } from "@/app/(main)/_lib/resolve-config-data"
import type { PanwBfdProfile } from "@/lib/panw-parser/network/routing-profiles"
import { BFD_DEFAULTS } from "@/lib/panw-parser/network/routing-profiles"

// ─── Column builder ──────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<PanwBfdProfile>()

function buildColumns(isPanorama: boolean): ColumnDef<PanwBfdProfile, unknown>[] {
  return [
    columnHelper.accessor("name", {
      header: "Name",
      enableHiding: false,
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }) as ColumnDef<PanwBfdProfile, unknown>,

    {
      id: "minTxInterval",
      header: "Min TX Interval (ms)",
      enableSorting: true,
      accessorFn: (row) => row.minTxInterval,
      cell: ({ row }) => {
        const val = row.original.minTxInterval
        const isDefault = val === BFD_DEFAULTS.minTxInterval
        return (
          <span className={`tabular-nums text-xs ${isDefault ? "text-muted-foreground" : "font-medium"}`}>
            {val.toLocaleString()}
            {isDefault && " (default)"}
          </span>
        )
      },
    },

    {
      id: "minRxInterval",
      header: "Min RX Interval (ms)",
      enableSorting: true,
      accessorFn: (row) => row.minRxInterval,
      cell: ({ row }) => {
        const val = row.original.minRxInterval
        const isDefault = val === BFD_DEFAULTS.minRxInterval
        return (
          <span className={`tabular-nums text-xs ${isDefault ? "text-muted-foreground" : "font-medium"}`}>
            {val.toLocaleString()}
            {isDefault && " (default)"}
          </span>
        )
      },
    },

    {
      id: "detectionMultiplier",
      header: "Detection Multiplier",
      enableSorting: true,
      accessorFn: (row) => row.detectionMultiplier,
      cell: ({ row }) => {
        const val = row.original.detectionMultiplier
        const isDefault = val === BFD_DEFAULTS.detectionMultiplier
        return (
          <span className={`tabular-nums text-xs ${isDefault ? "text-muted-foreground" : "font-medium"}`}>
            {val}
            {isDefault && " (default)"}
          </span>
        )
      },
    },

    {
      id: "holdTime",
      header: "Hold Time (ms)",
      enableSorting: true,
      accessorFn: (row) => row.holdTime ?? -1,
      cell: ({ row }) => {
        const val = row.original.holdTime
        if (val === null) return <span className="text-muted-foreground text-xs">—</span>
        return <span className="tabular-nums text-xs font-medium">{val.toLocaleString()}</span>
      },
    },

    {
      id: "multihopTtl",
      header: "Multihop Min TTL",
      enableSorting: true,
      accessorFn: (row) => row.multihopMinReceivedTtl ?? -1,
      cell: ({ row }) => {
        const val = row.original.multihopMinReceivedTtl
        if (val === null) return <span className="text-muted-foreground text-xs">—</span>
        return <span className="tabular-nums text-xs font-medium">{val}</span>
      },
    },

    ...(isPanorama ? [{
      id: "template",
      header: "Template",
      enableSorting: true,
      accessorFn: (row: PanwBfdProfile) => row.templateName ?? "",
      cell: ({ row }: { row: { original: PanwBfdProfile } }) => row.original.templateName
        ? <span className="text-xs">{row.original.templateName}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    } as ColumnDef<PanwBfdProfile, unknown>] : []),
  ]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BfdProfilesView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])

  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  const data = React.useMemo(() => {
    if (!activeConfig) return []
    return resolveNetworkData(activeConfig.parsedConfig, selectedScope).bfdProfiles
  }, [activeConfig, selectedScope])

  const columns = React.useMemo(
    () => buildColumns(isPanorama),
    [isPanorama]
  )

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

  return (
    <DataTable
      table={table}
      title="BFD Profiles"
      search={search}
      onSearch={setSearch}
    />
  )
}

