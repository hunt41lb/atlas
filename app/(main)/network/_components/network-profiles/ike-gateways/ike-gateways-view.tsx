// @/app/(main)/network/_components/network-profiles/ike-gateways/ike-gateways-view.tsx

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

import { Checkbox } from "@/components/ui/checkbox"
import { DataTable } from "@/components/ui/data-table"
import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import { resolveNetworkData } from "@/app/(main)/_lib/resolve-config-data"
import { IkeGatewayDialog } from "./ike-gateways-dialog"
import type { PanwIkeGateway } from "@/lib/panw-parser/network-profiles"
import { ID_TYPE_LABELS } from "@/lib/panw-parser/network-profiles"
import { templateColumn } from "@/app/(main)/_components/ui/table-columns"

// ─── Columns ──────────────────────────────────────────────────────────────────

const col = createColumnHelper<PanwIkeGateway>()

function buildColumns(
  isPanorama: boolean,
  onNameClick: (gw: PanwIkeGateway) => void,
): ColumnDef<PanwIkeGateway, unknown>[] {
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
    }) as ColumnDef<PanwIkeGateway, unknown>,

    {
      id: "peerAddress",
      header: "Peer Address",
      accessorFn: (row) => row.peerAddress ?? "",
      cell: ({ row }) => (
        <span className="text-xs font-mono">{row.original.peerAddress ?? "—"}</span>
      ),
    },

    // Local Address group
    {
      id: "localAddress",
      header: "Local Address",
      columns: [
        {
          id: "localInterface",
          header: "Interface",
          accessorFn: (row: PanwIkeGateway) => row.localInterface ?? "",
          cell: ({ row }: { row: { original: PanwIkeGateway } }) => (
            <span className="text-xs">{row.original.localInterface ?? "—"}</span>
          ),
        },
        {
          id: "localIp",
          header: "IP",
          accessorFn: (row: PanwIkeGateway) => row.localIp ?? "",
          cell: ({ row }: { row: { original: PanwIkeGateway } }) => (
            <span className="text-xs font-mono">{row.original.localIp ?? "—"}</span>
          ),
        },
      ],
    },

    // Peer ID group
    {
      id: "peerId",
      header: "Peer ID",
      columns: [
        {
          id: "peerIdValue",
          header: "ID",
          accessorFn: (row: PanwIkeGateway) => row.peerIdValue ?? "",
          cell: ({ row }: { row: { original: PanwIkeGateway } }) => (
            <span className="text-xs">{row.original.peerIdValue ?? "—"}</span>
          ),
        },
        {
          id: "peerIdType",
          header: "Type",
          accessorFn: (row: PanwIkeGateway) => row.peerIdType ?? "",
          cell: ({ row }: { row: { original: PanwIkeGateway } }) => (
            <span className="text-xs">{ID_TYPE_LABELS[row.original.peerIdType ?? ""] ?? row.original.peerIdType ?? "—"}</span>
          ),
        },
      ],
    },

    // Local ID group
    {
      id: "localId",
      header: "Local ID",
      columns: [
        {
          id: "localIdValue",
          header: "ID",
          accessorFn: (row: PanwIkeGateway) => row.localIdValue ?? "",
          cell: ({ row }: { row: { original: PanwIkeGateway } }) => (
            <span className="text-xs">{row.original.localIdValue ?? "—"}</span>
          ),
        },
        {
          id: "localIdType",
          header: "Type",
          accessorFn: (row: PanwIkeGateway) => row.localIdType ?? "",
          cell: ({ row }: { row: { original: PanwIkeGateway } }) => (
            <span className="text-xs">{ID_TYPE_LABELS[row.original.localIdType ?? ""] ?? row.original.localIdType ?? "—"}</span>
          ),
        },
      ],
    },

    // IKE Advanced Options group
    {
      id: "ikeAdvanced",
      header: "IKE Advanced Options",
      columns: [
        {
          id: "version",
          header: "Version",
          accessorFn: (row: PanwIkeGateway) => row.version,
          cell: ({ row }: { row: { original: PanwIkeGateway } }) => (
            <span className="text-xs">{row.original.version}</span>
          ),
        },
        {
          id: "mode",
          header: "Mode",
          enableSorting: false,
          cell: () => <span className="text-xs">auto</span>,
        },
        {
          id: "passiveMode",
          header: "Passive Mode",
          enableSorting: false,
          cell: ({ row }: { row: { original: PanwIkeGateway } }) => (
            <Checkbox checked={row.original.passiveMode} disabled />
          ),
        },
        {
          id: "natTraversal",
          header: "NAT Traversal",
          enableSorting: false,
          cell: ({ row }: { row: { original: PanwIkeGateway } }) => (
            <Checkbox checked={row.original.natTraversal} disabled />
          ),
        },
        {
          id: "cryptoProfile",
          header: "Crypto Profile",
          accessorFn: (row: PanwIkeGateway) => row.ikev2CryptoProfile ?? row.ikev1CryptoProfile ?? "",
          cell: ({ row }: { row: { original: PanwIkeGateway } }) => (
            <span className="text-xs">{row.original.ikev2CryptoProfile ?? row.original.ikev1CryptoProfile ?? "—"}</span>
          ),
        },
        {
          id: "dpd",
          header: "DPD",
          enableSorting: false,
          cell: ({ row }: { row: { original: PanwIkeGateway } }) => (
            <Checkbox checked={row.original.ikev2DpdEnabled || row.original.ikev1DpdEnabled} disabled />
          ),
        },
        {
          id: "liveness",
          header: "Liveness",
          enableSorting: false,
          cell: () => <span className="text-xs">default</span>,
        },
      ],
    },

    {
      id: "comment",
      header: "Comment",
      accessorFn: (row) => row.comment ?? "",
      cell: ({ row }) => row.original.comment
        ? <span className="text-xs text-muted-foreground">{row.original.comment}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    ...templateColumn<PanwIkeGateway>(isPanorama),
  ]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function IkeGatewaysView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])
  const [selected, setSelected] = React.useState<PanwIkeGateway | null>(null)

  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  const data = React.useMemo(() => {
    if (!activeConfig) return []
    return resolveNetworkData(activeConfig.parsedConfig, selectedScope).ikeGateways
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
        title="IKE Gateways"
        search={search}
        onSearch={setSearch}
      />
      <IkeGatewayDialog
        gateway={selected}
        open={selected !== null}
        onOpenChange={(open) => { if (!open) setSelected(null) }}
      />
    </>
  )
}
