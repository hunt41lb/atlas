// @/app/(main)/network/_components/dns-proxy/dns-proxy-view.tsx

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
import { templateColumn } from "@/app/(main)/_components/ui/table-columns"
import { NotConfiguredState } from "@/app/(main)/_components/ui/empty-state"
import { DnsProxyDialog } from "./dns-proxy-dialog"
import type { PanwDnsProxy } from "@/lib/panw-parser/network/dns-proxy"

// ─── Columns ──────────────────────────────────────────────────────────────────

const col = createColumnHelper<PanwDnsProxy>()

function buildColumns(
  isPanorama: boolean,
  onNameClick: (p: PanwDnsProxy) => void,
): ColumnDef<PanwDnsProxy, unknown>[] {
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
    }) as ColumnDef<PanwDnsProxy, unknown>,

    {
      id: "location",
      header: "Location",
      enableSorting: false,
      cell: () => <span className="text-xs">vsys1</span>,
    },

    {
      id: "enabled",
      header: "Enabled",
      enableSorting: false,
      cell: () => <Checkbox checked disabled />,
    },

    {
      id: "interfaces",
      header: "Interfaces",
      enableSorting: false,
      cell: ({ row }) => {
        const ifaces = row.original.interfaces
        return ifaces.length > 0
          ? <span className="text-xs">{ifaces.join(", ")}</span>
          : <span className="text-muted-foreground text-xs">—</span>
      },
    },

    {
      id: "primaryDns",
      header: "Primary DNS",
      accessorFn: (row) => row.defaultPrimary ?? "",
      cell: ({ row }) => row.original.defaultPrimary
        ? <span className="text-xs font-mono">{row.original.defaultPrimary}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    {
      id: "secondaryDns",
      header: "Secondary DNS",
      accessorFn: (row) => row.defaultSecondary ?? "",
      cell: ({ row }) => row.original.defaultSecondary
        ? <span className="text-xs font-mono">{row.original.defaultSecondary}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    {
      id: "serverProfile",
      header: "DNS Server Profile",
      accessorFn: (row) => row.serverProfile ?? "",
      cell: ({ row }) => row.original.serverProfile
        ? <span className="text-xs">{row.original.serverProfile}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    {
      id: "cacheEnabled",
      header: "Cache Enabled",
      enableSorting: false,
      cell: ({ row }) => <Checkbox checked={row.original.advanced.cacheEnabled} disabled />,
    },

    {
      id: "staticDnsCount",
      header: "Static DNS Count",
      accessorFn: (row) => row.staticEntries.length,
      cell: ({ row }) => {
        const count = row.original.staticEntries.length
        return count > 0
          ? <span className="text-xs tabular-nums font-medium">{count}</span>
          : <span className="text-muted-foreground text-xs">—</span>
      },
    },

    ...templateColumn<PanwDnsProxy>(isPanorama),
  ]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DnsProxyView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])
  const [selected, setSelected] = React.useState<PanwDnsProxy | null>(null)

  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  const data = React.useMemo(() => {
    if (!activeConfig) return []
    const resolved = resolveNetworkData(activeConfig.parsedConfig, selectedScope)
    const proxies = resolved.dnsProxies
    return Array.isArray(proxies) ? proxies : []
  }, [activeConfig, selectedScope])

  const columns = buildColumns(isPanorama, setSelected)

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
    return <NotConfiguredState title="DNS Proxy" />
  }

  return (
    <>
      <DataTable table={table} title="DNS Proxy" search={search} onSearch={setSearch} />
      <DnsProxyDialog proxy={selected} open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null) }} />
    </>
  )
}

