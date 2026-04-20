// @/app/(main)/network/_components/ipsec-tunnels/ipsec-tunnels-view.tsx

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
import { NotConfiguredState } from "@/app/(main)/_components/ui/empty-state"
import { IpsecTunnelDialog } from "./ipsec-tunnels-dialog"
import type { PanwIpsecTunnel } from "@/lib/panw-parser/network/ipsec-tunnels"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const KEY_TYPE_LABELS: Record<string, string> = {
  "auto-key": "Auto Key",
  "manual-key": "Manual Key",
  "global-protect-satellite": "GlobalProtect Satellite",
}

/** Derive the interface shown in the IKE Gateway/Satellite "Interface" column. */
function getGatewayInterface(t: PanwIpsecTunnel): string | null {
  if (t.manualKey) return t.manualKey?.localAddress?.interface
  if (t.gpSatellite) return t.gpSatellite?.localAddress?.interface
  return null // auto-key doesn't store interface directly on the tunnel
}

/** Derive the Local IP shown in the IKE Gateway/Satellite column. */
function getLocalIp(t: PanwIpsecTunnel): string | null {
  if (t.manualKey) return t.manualKey?.localAddress?.ip
  if (t.gpSatellite) {
    const parts = [t.gpSatellite?.localAddress?.ipv4, t.gpSatellite?.localAddress?.ipv6].filter(Boolean)
    return parts.join("\n") || null
  }
  return null
}

/** Derive the Peer Address shown in the IKE Gateway/Satellite column. */
function getPeerAddress(t: PanwIpsecTunnel): string | null {
  if (t.manualKey) return t.manualKey?.peerAddress
  return null
}

// ─── Columns ──────────────────────────────────────────────────────────────────

const col = createColumnHelper<PanwIpsecTunnel>()

function buildColumns(
  isPanorama: boolean,
  onNameClick: (t: PanwIpsecTunnel) => void,
  ifaceToRouter: Map<string, string>,
  ifaceToZone: Map<string, string>,
): ColumnDef<PanwIpsecTunnel, unknown>[] {
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
    }) as ColumnDef<PanwIpsecTunnel, unknown>,

    {
      id: "type",
      header: "Type",
      accessorFn: (row) => KEY_TYPE_LABELS[row.keyType] ?? row.keyType,
      cell: ({ row }) => (
        <span className="text-xs">{KEY_TYPE_LABELS[row.original.keyType] ?? row.original.keyType}</span>
      ),
    },

    // IKE Gateway/Satellite group
    {
      id: "ikeGatewaySatellite",
      header: "IKE Gateway/Satellite",
      columns: [
        {
          id: "gwInterface",
          header: "Interface",
          accessorFn: (row: PanwIpsecTunnel) => getGatewayInterface(row) ?? "",
          cell: ({ row }: { row: { original: PanwIpsecTunnel } }) => {
            const val = getGatewayInterface(row.original)
            return val
              ? <span className="text-xs">{val}</span>
              : <span className="text-muted-foreground text-xs">—</span>
          },
        },
        {
          id: "localIp",
          header: "Local IP",
          accessorFn: (row: PanwIpsecTunnel) => getLocalIp(row) ?? "",
          cell: ({ row }: { row: { original: PanwIpsecTunnel } }) => {
            const val = getLocalIp(row.original)
            if (!val) return <span className="text-muted-foreground text-xs">—</span>
            return (
              <div className="flex flex-col">
                {val.split("\n").map((ip) => (
                  <span key={ip} className="text-xs font-mono">{ip}</span>
                ))}
              </div>
            )
          },
        },
        {
          id: "peerAddress",
          header: "Peer Address",
          accessorFn: (row: PanwIpsecTunnel) => getPeerAddress(row) ?? "",
          cell: ({ row }: { row: { original: PanwIpsecTunnel } }) => {
            const val = getPeerAddress(row.original)
            return val
              ? <span className="text-xs font-mono">{val}</span>
              : <span className="text-muted-foreground text-xs">—</span>
          },
        },
      ],
    },

    // Tunnel Interface group
    {
      id: "tunnelInterfaceGroup",
      header: "Tunnel Interface",
      columns: [
        {
          id: "tunnelInterface",
          header: "Interface",
          accessorFn: (row: PanwIpsecTunnel) => row.tunnelInterface ?? "",
          cell: ({ row }: { row: { original: PanwIpsecTunnel } }) => {
            const val = row.original.tunnelInterface
            return val
              ? <span className="text-xs">{val}</span>
              : <span className="text-muted-foreground text-xs">—</span>
          },
        },
        {
          id: "virtualRouter",
          header: "Virtual Router",
          accessorFn: (row: PanwIpsecTunnel) => ifaceToRouter.get(row.tunnelInterface ?? "") ?? "",
          cell: ({ row }: { row: { original: PanwIpsecTunnel } }) => {
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
          meta: { hidePriority: 1 },
          cell: () => <span className="text-xs">vsys1</span>,
        },
        {
          id: "securityZone",
          header: "Security Zone",
          accessorFn: (row: PanwIpsecTunnel) => ifaceToZone.get(row.tunnelInterface ?? "") ?? "",
          cell: ({ row }: { row: { original: PanwIpsecTunnel } }) => {
            const val = ifaceToZone.get(row.original.tunnelInterface ?? "")
            return val
              ? <span className="text-xs">{val}</span>
              : <span className="text-muted-foreground text-xs">—</span>
          },
        },
      ],
    },

    {
      id: "comment",
      header: "Comment",
      meta: { hidePriority: 2 },
      accessorFn: (row) => row.comment ?? "",
      cell: ({ row }) => row.original.comment
        ? <span className="text-xs text-muted-foreground">{row.original.comment}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    ...templateColumn<PanwIpsecTunnel>(isPanorama),
  ]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function IpsecTunnelsView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])
  const [selected, setSelected] = React.useState<PanwIpsecTunnel | null>(null)

  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  const resolved = React.useMemo(() => {
    if (!activeConfig) return null
    return resolveNetworkData(activeConfig.parsedConfig, selectedScope)
  }, [activeConfig, selectedScope])

  const data = resolved?.ipsecTunnels ?? []

  // Build interface→router and interface→zone lookup maps
  const ifaceToRouter = React.useMemo(() => {
    const map = new Map<string, string>()
    if (!resolved) return map
    for (const vr of resolved.virtualRouters) {
      for (const iface of vr.interfaces) {
        map.set(iface, vr.name)
      }
    }
    return map
  }, [resolved])

  const ifaceToZone = React.useMemo(() => {
    const map = new Map<string, string>()
    if (!resolved) return map
    for (const zone of resolved.zones) {
      for (const iface of zone.interfaces) {
        map.set(iface, zone.name)
      }
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
    return <NotConfiguredState title="IPSec Tunnels" />
  }

  return (
    <>
      <DataTable
        table={table}
        title="IPSec Tunnels"
        search={search}
        onSearch={setSearch}
      />
      <IpsecTunnelDialog
        tunnel={selected}
        open={selected !== null}
        onOpenChange={(open) => { if (!open) setSelected(null) }}
      />
    </>
  )
}
