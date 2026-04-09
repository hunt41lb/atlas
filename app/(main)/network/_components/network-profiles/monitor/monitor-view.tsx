// @/app/(main)/network/_components/network-profiles/monitor/monitor-view.tsx

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
import type { PanwMonitorProfile } from "@/lib/panw-parser/network/network-profiles"
import { MONITOR_DEFAULTS } from "@/lib/panw-parser/network/network-profiles"
import { templateColumn } from "@/app/(main)/_components/ui/table-columns"

// ─── Columns ──────────────────────────────────────────────────────────────────

const col = createColumnHelper<PanwMonitorProfile>()

function buildColumns(isPanorama: boolean): ColumnDef<PanwMonitorProfile, unknown>[] {
  return [
    col.accessor("name", {
      header: "Name",
      enableHiding: false,
      cell: (info) => <span className="text-xs text-foreground font-medium">{info.getValue()}</span>,
    }) as ColumnDef<PanwMonitorProfile, unknown>,

    {
      id: "action",
      header: "Action",
      enableSorting: true,
      accessorFn: (row) => row.action,
      cell: ({ row }) => {
        const val = row.original.action
        return (
          <span className={`text-xs ${val === MONITOR_DEFAULTS.action ? "text-muted-foreground" : "font-medium"}`}>
            {val === "wait-recover" ? "Wait Recover" : "Fail Over"}
            {val === MONITOR_DEFAULTS.action && " (default)"}
          </span>
        )
      },
    },

    {
      id: "interval",
      header: "Interval (sec)",
      enableSorting: true,
      accessorFn: (row) => row.interval,
      cell: ({ row }) => {
        const val = row.original.interval
        const isDefault = val === MONITOR_DEFAULTS.interval
        return (
          <span className={`tabular-nums text-xs ${isDefault ? "text-muted-foreground" : "font-medium"}`}>
            {val}{isDefault && " (default)"}
          </span>
        )
      },
    },

    {
      id: "threshold",
      header: "Threshold",
      enableSorting: true,
      accessorFn: (row) => row.threshold,
      cell: ({ row }) => {
        const val = row.original.threshold
        const isDefault = val === MONITOR_DEFAULTS.threshold
        return (
          <span className={`tabular-nums text-xs ${isDefault ? "text-muted-foreground" : "font-medium"}`}>
            {val}{isDefault && " (default)"}
          </span>
        )
      },
    },

    ...templateColumn<PanwMonitorProfile>(isPanorama),
  ]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MonitorView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])

  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  const data = React.useMemo(() => {
    if (!activeConfig) return []
    return resolveNetworkData(activeConfig.parsedConfig, selectedScope).monitorProfiles
  }, [activeConfig, selectedScope])

  const columns = React.useMemo(() => buildColumns(isPanorama), [isPanorama])

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
      title="Monitor Profiles"
      search={search}
      onSearch={setSearch}
    />
  )
}
