// @/app/(main)/network/_components/network-profiles/zone-protection/zone-protection-view.tsx

"use client"

import * as React from "react"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"

import { Checkbox } from "@/components/ui/checkbox"
import { DataTable } from "@/components/ui/data-table"
import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import { resolveNetworkData } from "@/app/(main)/_lib/resolve-config-data"
import type { PanwZoneProtectionProfile } from "@/lib/panw-parser/network-profiles"
import { ZoneProtectionDialog } from "./zone-protection-dialog"
import { templateColumn } from "@/app/(main)/_components/ui/table-columns"

// ─── Scan entry name → label mapping ──────────────────────────────────────────

function getScanAction(profile: PanwZoneProtectionProfile, scanId: string): string {
  const entry = profile.rpScanEntries.find((e) => e.name === scanId)
  return entry?.action ?? "—"
}

// ─── Columns ──────────────────────────────────────────────────────────────────

function buildColumns(isPanorama: boolean, onNameClick: (p: PanwZoneProtectionProfile) => void): ColumnDef<PanwZoneProtectionProfile, unknown>[] {
  return [
    {
      id: "name",
      accessorKey: "name",
      header: "Name",
      enableHiding: false,
      cell: ({ row }) => (
        <button
          type="button"
          className="text-xs font-medium text-foreground hover:underline cursor-pointer"
          onClick={() => onNameClick(row.original)}
        >
          {row.original.name}
        </button>
      ),
    },

    // ── Flood Protection group ──
    {
      id: "floodProtection",
      header: () => <span className="text-center w-full block">Flood Protection</span>,
      meta: { headerClassName: "bg-blue-500/10" },
      columns: [
        {
          id: "fpSyn",
          header: "SYN Flood",
          meta: { headerClassName: "bg-blue-500/5" },
          enableSorting: false,
          cell: ({ row }) => <Checkbox checked={row.original.fpUdpEnabled} disabled />,
        },
        {
          id: "fpUdp",
          header: "UDP Flood",
          meta: { headerClassName: "bg-blue-500/5" },
          enableSorting: false,
          cell: ({ row }) => <Checkbox checked={row.original.fpUdpEnabled} disabled />,
        },
        {
          id: "fpIcmp",
          header: "ICMP Flood",
          meta: { headerClassName: "bg-blue-500/5" },
          enableSorting: false,
          cell: ({ row }) => <Checkbox checked={row.original.fpIcmpEnabled} disabled />,
        },
        {
          id: "fpIcmpv6",
          header: "ICMPv6 Flood",
          meta: { headerClassName: "bg-blue-500/5" },
          enableSorting: false,
          cell: ({ row }) => <Checkbox checked={row.original.fpIcmpv6Enabled} disabled />,
        },
        {
          id: "fpOtherIp",
          header: "Other IP Flood",
          meta: { headerClassName: "bg-blue-500/5" },
          enableSorting: false,
          cell: ({ row }) => <Checkbox checked={row.original.fpOtherIpEnabled} disabled />,
        },
      ],
    },

    // ── Reconnaissance Protection group ──
    {
      id: "reconProtection",
      header: () => <span className="text-center w-full block">Reconnaissance Protection</span>,
      meta: { headerClassName: "bg-amber-500/10" },
      columns: [
        {
          id: "rpTcpPortScan",
          header: "TCP Port Scan",
          meta: { headerClassName: "bg-amber-500/5" },
          enableSorting: false,
          cell: ({ row }) => {
            const val = getScanAction(row.original, "8001")
            return <span className="text-xs">{val}</span>
          },
        },
        {
          id: "rpUdpPortScan",
          header: "UDP Port Scan",
          meta: { headerClassName: "bg-amber-500/5" },
          enableSorting: false,
          cell: ({ row }) => {
            const val = getScanAction(row.original, "8003")
            return <span className="text-xs">{val}</span>
          },
        },
        {
          id: "rpHostSweep",
          header: "Host Sweep",
          meta: { headerClassName: "bg-amber-500/5" },
          enableSorting: false,
          cell: ({ row }) => {
            const val = getScanAction(row.original, "8002")
            return <span className="text-xs">{val}</span>
          },
        },
        {
          id: "rpIpProtocolScan",
          header: "IP Protocol Scan",
          meta: { headerClassName: "bg-amber-500/5" },
          enableSorting: false,
          cell: ({ row }) => {
            const val = getScanAction(row.original, "8006")
            return <span className="text-xs">{val}</span>
          },
        },
      ],
    },

    ...templateColumn<PanwZoneProtectionProfile>(isPanorama),
  ]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ZoneProtectionView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])
  const [selected, setSelected] = React.useState<PanwZoneProtectionProfile | null>(null)

  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  const data = React.useMemo(() => {
    if (!activeConfig) return []
    return resolveNetworkData(activeConfig.parsedConfig, selectedScope).zoneProtectionProfiles
  }, [activeConfig, selectedScope])

  const columns = React.useMemo(() => buildColumns(isPanorama, setSelected), [isPanorama])

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
        title="Zone Protection Profiles"
        search={search}
        onSearch={setSearch}
      />
      <ZoneProtectionDialog
        profile={selected}
        open={selected !== null}
        onOpenChange={(open) => { if (!open) setSelected(null) }}
      />
    </>
  )
}
