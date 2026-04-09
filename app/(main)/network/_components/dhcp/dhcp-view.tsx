// @/app/(main)/network/_components/dhcp/dhcp-view.tsx

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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTable } from "@/components/ui/data-table"
import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import { resolveNetworkData } from "@/app/(main)/_lib/resolve-config-data"
import { templateColumn } from "@/app/(main)/_components/ui/table-columns"
import { NotConfiguredState } from "@/app/(main)/_components/ui/empty-state"
import { DhcpServerDialog } from "./dhcp-server-dialog"
import { DhcpRelayDialog } from "./dhcp-relay-dialog"
import type { PanwDhcpServer, PanwDhcpRelay } from "@/lib/panw-parser/network/dhcp"

// ─── Options summary (multi-line text for the Options column) ─────────────────

function buildOptionsSummary(s: PanwDhcpServer): string[] {
  const lines: string[] = []
  const o = s.options
  lines.push(`Lease: ${o.leaseType === "timeout" ? `${o.leaseTimeout} min` : "Unlimited"}`)
  if (o.dnsPrimary || o.dnsSecondary) lines.push(`DNS: ${[o.dnsPrimary, o.dnsSecondary].filter(Boolean).join(",")}`)
  if (o.winsPrimary || o.winsSecondary) lines.push(`WINS: ${[o.winsPrimary, o.winsSecondary].filter(Boolean).join(",")}`)
  if (o.nisPrimary || o.nisSecondary) lines.push(`NIS: ${[o.nisPrimary, o.nisSecondary].filter(Boolean).join(",")}`)
  if (o.ntpPrimary || o.ntpSecondary) lines.push(`NTP: ${[o.ntpPrimary, o.ntpSecondary].filter(Boolean).join(",")}`)
  if (o.gateway) lines.push(`Gateway: ${o.gateway}`)
  if (o.pop3Server) lines.push(`POP3 Server: ${o.pop3Server}`)
  if (o.smtpServer) lines.push(`SMTP Server: ${o.smtpServer}`)
  return lines
}

// ─── DHCP Server columns ──────────────────────────────────────────────────────

const serverCol = createColumnHelper<PanwDhcpServer>()

function buildServerColumns(
  isPanorama: boolean,
  onNameClick: (s: PanwDhcpServer) => void,
): ColumnDef<PanwDhcpServer, unknown>[] {
  return [
    serverCol.accessor("interface", {
      header: "Interface",
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
    }) as ColumnDef<PanwDhcpServer, unknown>,

    {
      id: "mode",
      header: "Mode",
      accessorFn: (row) => row.mode ?? "",
      cell: ({ row }) => <span className="text-xs">{row.original.mode ?? "—"}</span>,
    },

    {
      id: "probeIp",
      header: "Probe IP",
      enableSorting: false,
      cell: ({ row }) => <Checkbox checked={row.original.probeIp} disabled />,
    },

    {
      id: "options",
      header: "Options",
      enableSorting: false,
      cell: ({ row }) => {
        const lines = buildOptionsSummary(row.original)
        const maxVisible = 6
        const visible = lines.slice(0, maxVisible)
        const hasMore = lines.length > maxVisible
        return (
          <div className="flex flex-col gap-0.5">
            {visible.map((line) => (
              <span key={line} className="text-xs">{line}</span>
            ))}
            {hasMore && <span className="text-xs text-primary">more...</span>}
          </div>
        )
      },
    },

    {
      id: "ipPools",
      header: "IP Pools",
      enableSorting: false,
      cell: ({ row }) => {
        const pools = row.original.ipPools
        return pools.length > 0
          ? <div className="flex flex-col gap-0.5">{pools.map((p) => <span key={p} className="text-xs font-mono">{p}</span>)}</div>
          : <span className="text-muted-foreground text-xs">—</span>
      },
    },

    {
      id: "reserved",
      header: "Reserved",
      enableSorting: false,
      cell: ({ row }) => {
        const res = row.original.reservations
        return res.length > 0
          ? <div className="flex flex-col gap-0.5">{res.map((r) => <span key={r.ip} className="text-xs font-mono">{r.ip}-{r.mac}</span>)}</div>
          : <span className="text-muted-foreground text-xs">—</span>
      },
    },

    ...templateColumn<PanwDhcpServer>(isPanorama),
  ]
}

// ─── DHCP Relay columns ───────────────────────────────────────────────────────

const relayCol = createColumnHelper<PanwDhcpRelay>()

function buildRelayColumns(
  isPanorama: boolean,
  onNameClick: (r: PanwDhcpRelay) => void,
): ColumnDef<PanwDhcpRelay, unknown>[] {
  return [
    relayCol.accessor("interface", {
      header: "Interface",
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
    }) as ColumnDef<PanwDhcpRelay, unknown>,

    {
      id: "ipv4Enabled",
      header: "IPv4 Enabled",
      enableSorting: false,
      cell: ({ row }) => <Checkbox checked={row.original.ipv4Enabled} disabled />,
    },

    {
      id: "ipv4Servers",
      header: "IPv4 Servers",
      enableSorting: false,
      cell: ({ row }) => {
        const servers = row.original.ipv4Servers
        return servers.length > 0
          ? <span className="text-xs font-mono">{servers.join(", ")}</span>
          : <span className="text-muted-foreground text-xs">—</span>
      },
    },

    {
      id: "ipv6Enabled",
      header: "IPv6 Enabled",
      enableSorting: false,
      cell: ({ row }) => <Checkbox checked={row.original.ipv6Enabled} disabled />,
    },

    {
      id: "ipv6Servers",
      header: "IPv6 Servers",
      enableSorting: false,
      cell: ({ row }) => {
        const servers = row.original.ipv6Servers
        return servers.length > 0
          ? <div className="flex flex-col gap-0.5">{servers.map((s) => <span key={s.address} className="text-xs font-mono">{s.address}{s.interface ? `-${s.interface}` : ""}</span>)}</div>
          : <span className="text-muted-foreground text-xs">—</span>
      },
    },

    ...templateColumn<PanwDhcpRelay>(isPanorama),
  ]
}

// ─── Sub-table components ─────────────────────────────────────────────────────

function DhcpServerTable({ data, isPanorama }: { data: PanwDhcpServer[]; isPanorama: boolean }) {
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "interface", desc: false }])
  const [selected, setSelected] = React.useState<PanwDhcpServer | null>(null)

  const columns = React.useMemo(() => buildServerColumns(isPanorama, setSelected), [isPanorama])

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
      <DataTable table={table} title="DHCP Servers" search={search} onSearch={setSearch} />
      <DhcpServerDialog server={selected} open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null) }} />
    </>
  )
}

function DhcpRelayTable({ data, isPanorama }: { data: PanwDhcpRelay[]; isPanorama: boolean }) {
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "interface", desc: false }])
  const [selected, setSelected] = React.useState<PanwDhcpRelay | null>(null)

  const columns = React.useMemo(() => buildRelayColumns(isPanorama, setSelected), [isPanorama])

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
      <DataTable table={table} title="DHCP Relays" search={search} onSearch={setSearch} />
      <DhcpRelayDialog relay={selected} open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null) }} />
    </>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DhcpView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()

  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  const resolved = React.useMemo(() => {
    if (!activeConfig) return null
    return resolveNetworkData(activeConfig.parsedConfig, selectedScope)
  }, [activeConfig, selectedScope])

  const servers = resolved?.dhcpServers ?? []
  const relays = resolved?.dhcpRelays ?? []

  if (servers.length === 0 && relays.length === 0) {
    return <NotConfiguredState title="DHCP" />
  }

  return (
    <Tabs defaultValue="server" className="flex h-full flex-col min-h-0">
      <div className="shrink-0 border-b px-4">
        <TabsList variant="line">
          <TabsTrigger value="server">DHCP Server</TabsTrigger>
          <TabsTrigger value="relay">DHCP Relay</TabsTrigger>
        </TabsList>
      </div>
      <div className="flex-1 min-h-0">
        <TabsContent value="server" className="h-full">
          <DhcpServerTable data={servers} isPanorama={isPanorama} />
        </TabsContent>
        <TabsContent value="relay" className="h-full">
          <DhcpRelayTable data={relays} isPanorama={isPanorama} />
        </TabsContent>
      </div>
    </Tabs>
  )
}

