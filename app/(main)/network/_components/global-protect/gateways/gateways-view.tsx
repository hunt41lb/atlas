// @/app/(main)/network/_components/global-protect/gateways/gateways-view.tsx

"use client"

import * as React from "react"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { TableRow, TableCell } from "@/components/ui/table"
import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import { resolveNetworkData } from "@/app/(main)/_lib/resolve-config-data"
import { templateColumn } from "@/app/(main)/_components/ui/table-columns"
import { useExpandableRows, ExpandToggle } from "@/components/ui/expandable-row"
import { GatewayDialog } from "./gateways-dialog"
import { cn } from "@/lib/utils"
import type { PanwGpGateway } from "@/lib/panw-parser/network/global-protect"

// ─── Columns ──────────────────────────────────────────────────────────────────

const col = createColumnHelper<PanwGpGateway>()

function buildColumns(
  isPanorama: boolean,
  onNameClick: (g: PanwGpGateway) => void,
): ColumnDef<PanwGpGateway, unknown>[] {
  return [
    {
      id: "expand",
      header: "",
      size: 32,
      enableSorting: false,
      cell: () => null, // rendered via renderRow
    },

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
    }) as ColumnDef<PanwGpGateway, unknown>,

    {
      id: "interface",
      header: "Local Interface",
      enableSorting: true,
      accessorFn: (row) => row.general.interface ?? "",
      cell: ({ row }) => <span className="text-xs">{row.original.general.interface ?? "—"}</span>,
    },

    {
      id: "ip",
      header: "Local IP",
      enableSorting: false,
      cell: ({ row }) => {
        const { ipv4, ipv6 } = row.original.general
        if (!ipv4 && !ipv6) return <span className="text-muted-foreground text-xs">—</span>
        return (
          <div className="flex flex-col gap-0.5">
            {ipv4 && <span className="text-xs font-mono">{ipv4}</span>}
            {ipv6 && <span className="text-xs font-mono">{ipv6}</span>}
          </div>
        )
      },
    },

    {
      id: "tunnel",
      header: "Tunnel",
      enableSorting: true,
      accessorFn: (row) => row.tunnelSettings.tunnelInterface ?? "",
      cell: ({ row }) => <span className="text-xs">{row.original.tunnelSettings.tunnelInterface ?? "—"}</span>,
    },

    {
      id: "maxUser",
      header: "Max User",
      enableSorting: true,
      accessorFn: (row) => row.tunnelSettings.maxUser,
      cell: ({ row }) => <span className="text-xs tabular-nums">{row.original.tunnelSettings.maxUser ?? "—"}</span>,
    },

    ...templateColumn<PanwGpGateway>(isPanorama),
  ]
}

// ─── Sub-row: Agent Configs ───────────────────────────────────────────────────

const SUB_HEADERS = [
  "AGENT CONFIGURATION", "USERS", "OS", "REGION",
  "IP ADDRESS", "IP POOL", "AUTHENTICATION IP POOL", "ACCESS ROUTE",
]

function AgentConfigSubRows({ gateway }: { gateway: PanwGpGateway }) {
  const configs = gateway.clientConfigs
  if (configs.length === 0) return null

  return (
    <TableRow className="bg-muted/30">
      <TableCell />
      <TableCell colSpan={6} className="p-0 pb-2">
        <table className="w-full text-xs">
          <thead>
            <tr>
              {SUB_HEADERS.map((h) => (
                <th key={h} className="text-[10px] font-semibold tracking-wider text-muted-foreground whitespace-nowrap px-3 py-1.5 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {configs.map((cfg) => (
              <tr key={cfg.name} className="border-t border-border/50">
                <td className="px-3 py-1.5 font-medium">{cfg.name}</td>
                <td className="px-3 py-1.5">{cfg.sourceUsers.join(", ") || "any"}</td>
                <td className="px-3 py-1.5">{cfg.os.join(", ") || "Any"}</td>
                <td className="px-3 py-1.5">{cfg.sourceAddress.regions.join(", ") || "—"}</td>
                <td className="px-3 py-1.5 font-mono">{cfg.sourceAddress.ipAddresses.join(", ") || "—"}</td>
                <td className="px-3 py-1.5 font-mono">{cfg.ipPools.ipPool.join(", ") || "—"}</td>
                <td className="px-3 py-1.5 font-mono">{cfg.ipPools.authServerIpPool.join(", ") || "—"}</td>
                <td className="px-3 py-1.5">
                  {cfg.splitTunnel.noDirectAccessToLocalNetwork ? "No direct access to local network" : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCell>
    </TableRow>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GatewaysView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])
  const [selected, setSelected] = React.useState<PanwGpGateway | null>(null)

  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  const data = React.useMemo(() => {
    if (!activeConfig) return []
    return resolveNetworkData(activeConfig.parsedConfig, selectedScope).gpGateways
  }, [activeConfig, selectedScope])

  const { isExpanded, toggleRow } = useExpandableRows({
    items: data,
    getRowKey: (g) => `${g.templateName ?? "fw"}-${g.name}`,
    isExpandable: (g) => g.clientConfigs.length > 0,
    defaultExpanded: true,
  })

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
        title="GlobalProtect Gateways"
        search={search}
        onSearch={setSearch}
        renderRow={(row) => {
          const gw = row.original
          const rowKey = `${gw.templateName ?? "fw"}-${gw.name}`
          const hasConfigs = gw.clientConfigs.length > 0
          const expanded = isExpanded(rowKey)

          return (
            <React.Fragment key={rowKey}>
              <TableRow className={cn("transition-colors", hasConfigs && expanded && "border-b-0")}>
                <TableCell className="w-8 px-2">
                  <ExpandToggle expandable={hasConfigs} expanded={expanded} onToggle={() => toggleRow(rowKey)} />
                </TableCell>
                {row.getVisibleCells().slice(1).map((cell) => (
                  <TableCell key={cell.id} className="px-3 py-2 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
              {hasConfigs && expanded && <AgentConfigSubRows gateway={gw} />}
            </React.Fragment>
          )
        }}
      />
      <GatewayDialog
        gateway={selected}
        open={selected !== null}
        onOpenChange={(open) => { if (!open) setSelected(null) }}
      />
    </>
  )
}
