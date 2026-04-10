// @/app/(main)/network/_components/sd-wan-interface-profile/sd-wan-interface-profile-view.tsx

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
import { templateColumn } from "@/app/(main)/_components/ui/table-columns"
import { SdwanInterfaceProfileDialog } from "./sd-wan-interface-profile-dialog"
import type { PanwSdwanInterfaceProfile } from "@/lib/panw-parser/network/sd-wan-interface-profile"

// ─── Columns ──────────────────────────────────────────────────────────────────

const col = createColumnHelper<PanwSdwanInterfaceProfile>()

function buildColumns(
  isPanorama: boolean,
  onNameClick: (p: PanwSdwanInterfaceProfile) => void,
): ColumnDef<PanwSdwanInterfaceProfile, unknown>[] {
  return [
    col.accessor("name", {
      header: "Name",
      enableHiding: false,
      cell: (info) => (
        <button
          type="button"
          className="text-xs font-medium text-foreground hover:underline cursor-pointer"
          onClick={() => onNameClick(info.row.original)}
        >
          {info.getValue()}
        </button>
      ),
    }) as ColumnDef<PanwSdwanInterfaceProfile, unknown>,

    col.accessor("linkTag", {
      header: "Link Tag",
      cell: (info) => <span className="text-xs">{info.getValue() ?? "—"}</span>,
    }) as ColumnDef<PanwSdwanInterfaceProfile, unknown>,

    col.accessor("linkType", {
      header: "Link Type",
      cell: (info) => <span className="text-xs">{info.getValue() ?? "—"}</span>,
    }) as ColumnDef<PanwSdwanInterfaceProfile, unknown>,

    {
      id: "maximumDownload",
      header: "Maximum Download (Mbps)",
      enableSorting: true,
      accessorFn: (row) => row.maximumDownload,
      cell: ({ row }) => <span className="text-xs tabular-nums">{row.original.maximumDownload?.toLocaleString() ?? "—"}</span>,
    },

    {
      id: "maximumUpload",
      header: "Maximum Upload (Mbps)",
      enableSorting: true,
      accessorFn: (row) => row.maximumUpload,
      cell: ({ row }) => <span className="text-xs tabular-nums">{row.original.maximumUpload?.toLocaleString() ?? "—"}</span>,
    },

    {
      id: "errorCorrection",
      header: "Error Correction",
      enableSorting: true,
      accessorFn: (row) => row.errorCorrection,
      cell: ({ row }) => <span className="text-xs">{row.original.errorCorrection ? "Enable" : "Disable"}</span>,
    },

    {
      id: "vpnDataTunnelSupport",
      header: "VPN Data Tunnel Support",
      enableSorting: true,
      accessorFn: (row) => row.vpnDataTunnelSupport ?? true,
      cell: ({ row }) => <span className="text-xs">{(row.original.vpnDataTunnelSupport ?? true) ? "Enable" : "Disable"}</span>,
    },

    {
      id: "vpnFailoverMetric",
      header: "VPN Failover Metric",
      enableSorting: true,
      accessorFn: (row) => row.vpnFailoverMetric ?? 10,
      cell: ({ row }) => <span className="text-xs tabular-nums">{row.original.vpnFailoverMetric ?? 10}</span>,
    },

    col.accessor("pathMonitoring", {
      header: "Path Monitoring",
      cell: (info) => <span className="text-xs">{info.getValue() ?? "Aggressive"}</span>,
    }) as ColumnDef<PanwSdwanInterfaceProfile, unknown>,

    {
      id: "probeFrequency",
      header: "Probe Frequency (Per Second)",
      enableSorting: true,
      accessorFn: (row) => row.probeFrequency,
      cell: ({ row }) => <span className="text-xs tabular-nums">{row.original.probeFrequency ?? "—"}</span>,
    },

    {
      id: "probeIdleTime",
      header: "Probe Idle Time (Seconds)",
      enableSorting: true,
      accessorFn: (row) => row.probeIdleTime,
      cell: ({ row }) => <span className="text-xs tabular-nums">{row.original.probeIdleTime ?? "—"}</span>,
    },

    {
      id: "failbackHoldTime",
      header: "Failback Hold Time (Seconds)",
      enableSorting: true,
      accessorFn: (row) => row.failbackHoldTime,
      cell: ({ row }) => <span className="text-xs tabular-nums">{row.original.failbackHoldTime ?? "—"}</span>,
    },

    col.accessor("comment", {
      header: "Description",
      cell: (info) => info.getValue()
        ? <span className="text-xs text-muted-foreground">{info.getValue()}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    }) as ColumnDef<PanwSdwanInterfaceProfile, unknown>,

    ...templateColumn<PanwSdwanInterfaceProfile>(isPanorama),
  ]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SdwanInterfaceProfileView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])
  const [selected, setSelected] = React.useState<PanwSdwanInterfaceProfile | null>(null)

  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  const data = React.useMemo(() => {
    if (!activeConfig) return []
    return resolveNetworkData(activeConfig.parsedConfig, selectedScope).sdwanInterfaceProfiles
  }, [activeConfig, selectedScope])

  const columns = React.useMemo(
    () => buildColumns(isPanorama, setSelected),
    [isPanorama],
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
    <>
      <DataTable
        table={table}
        title="SD-WAN Interface Profiles"
        search={search}
        onSearch={setSearch}
      />
      <SdwanInterfaceProfileDialog
        profile={selected}
        open={selected !== null}
        onOpenChange={(open) => { if (!open) setSelected(null) }}
      />
    </>
  )
}
