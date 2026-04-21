// @/app/(main)/network/_components/gre-tunnels/gre-tunnels-view.tsx

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

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import { resolveNetworkData } from "@/app/(main)/_lib/resolve-config-data"
import { templateColumn } from "@/app/(main)/_components/ui/table-columns"
import { NotConfiguredState } from "@/app/(main)/_components/ui/empty-state"
import { GreTunnelDialog } from "./gre-tunnels-dialog"
import type { PanwGreTunnel } from "@/lib/panw-parser/network/gre-tunnels"

// ─── Columns ──────────────────────────────────────────────────────────────────

const col = createColumnHelper<PanwGreTunnel>()

function buildColumns(
  isPanorama: boolean,
  onNameClick: (t: PanwGreTunnel) => void,
  ifaceToRouter: Map<string, string>,
  ifaceToZone: Map<string, string>,
): ColumnDef<PanwGreTunnel, unknown>[] {
  return [
    col.accessor("name", {
      header: "Name",
      enableHiding: false,
      cell: (info) => (
        <Button
          variant="link"
          size="sm"
          className="text-foreground font-medium cursor-pointer"
          onClick={() => onNameClick(info.row.original)}
        >
          {info.getValue()}
        </Button>
      ),
    }) as ColumnDef<PanwGreTunnel, unknown>,

    {
      id: "sourceInterface",
      header: "Source Interface",
      accessorFn: (row) => row.localAddress?.interface ?? "",
      cell: ({ row }) => {
        const val = row.original.localAddress?.interface
        return val
          ? <span className="text-xs">{val}</span>
          : <span className="text-muted-foreground text-xs">—</span>
      },
    },

    {
      id: "localIp",
      header: "Local IP",
      accessorFn: (row) => row.localAddress.ip ?? "",
      cell: ({ row }) => {
        const val = row.original.localAddress.ip
        return val
          ? <span className="text-xs font-mono">{val}</span>
          : <span className="text-muted-foreground text-xs">—</span>
      },
    },

    {
      id: "peerIp",
      header: "Peer IP",
      accessorFn: (row) => row.localAddress?.ip ?? "",
      cell: ({ row }) => {
        const val = row.original.localAddress?.ip
        return val
          ? <span className="text-xs font-mono">{val}</span>
          : <span className="text-muted-foreground text-xs">—</span>
      },
    },

    {
      id: "tunnelInterface",
      header: "Tunnel Interface",
      accessorFn: (row) => row.tunnelInterface ?? "",
      cell: ({ row }) => {
        const val = row.original.tunnelInterface
        return val
          ? <span className="text-xs">{val}</span>
          : <span className="text-muted-foreground text-xs">—</span>
      },
    },

    {
      id: "virtualRouter",
      header: "Virtual Router",
      accessorFn: (row) => ifaceToRouter.get(row.tunnelInterface ?? "") ?? "",
      cell: ({ row }) => {
        const val = ifaceToRouter.get(row.original.tunnelInterface ?? "")
        return val
          ? <span className="text-xs">{val}</span>
          : <span className="text-muted-foreground text-xs">—</span>
      },
    },

    {
      id: "virtualSystem",
      header: "Virtual System",
      enableSorting: false,
      cell: () => <span className="text-xs">vsys1</span>,
    },

    {
      id: "securityZone",
      header: "Security Zone",
      accessorFn: (row) => ifaceToZone.get(row.tunnelInterface ?? "") ?? "",
      cell: ({ row }) => {
        const val = ifaceToZone.get(row.original.tunnelInterface ?? "")
        return val
          ? <span className="text-xs">{val}</span>
          : <span className="text-muted-foreground text-xs">—</span>
      },
    },

    ...templateColumn<PanwGreTunnel>(isPanorama),
  ]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GreTunnelsView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])
  const [selected, setSelected] = React.useState<PanwGreTunnel | null>(null)

  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  const resolved = React.useMemo(() => {
    if (!activeConfig) return null
    return resolveNetworkData(activeConfig.parsedConfig, selectedScope)
  }, [activeConfig, selectedScope])

  const data = resolved?.greTunnels ?? []

  const ifaceToRouter = React.useMemo(() => {
    const map = new Map<string, string>()
    if (!resolved) return map
    for (const vr of resolved.virtualRouters) {
      for (const iface of vr.interfaces) map.set(iface, vr.name)
    }
    return map
  }, [resolved])

  const ifaceToZone = React.useMemo(() => {
    const map = new Map<string, string>()
    if (!resolved) return map
    for (const zone of resolved.zones) {
      for (const iface of zone.interfaces) map.set(iface, zone.name)
    }
    return map
  }, [resolved])

  const columns = React.useMemo(
    () => buildColumns(isPanorama, setSelected, ifaceToRouter, ifaceToZone),
    [isPanorama, ifaceToRouter, ifaceToZone],
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

  if (data.length === 0) {
    return <NotConfiguredState title="GRE Tunnels" />
  }

  return (
    <>
      <DataTable
        table={table}
        title="GRE Tunnels"
        search={search}
        onSearch={setSearch}
      />
      <GreTunnelDialog
        tunnel={selected}
        open={selected !== null}
        onOpenChange={(open) => { if (!open) setSelected(null) }}
      />
    </>
  )
}
