// @/app/(main)/network/_components/network-profiles/lldp/lldp-view.tsx

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
import { Checkbox } from "@/components/ui/checkbox"
import { DataTable } from "@/components/ui/data-table"
import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import { resolveNetworkData } from "@/app/(main)/_lib/resolve-config-data"
import { LldpDialog } from "./lldp-dialog"
import type { PanwLldpProfile } from "@/lib/panw-parser/network/network-profiles"
import { templateColumn } from "@/app/(main)/_components/ui/table-columns"

// ─── Columns ──────────────────────────────────────────────────────────────────

const col = createColumnHelper<PanwLldpProfile>()

function buildColumns(
  isPanorama: boolean,
  onNameClick: (p: PanwLldpProfile) => void,
): ColumnDef<PanwLldpProfile, unknown>[] {
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
    }) as ColumnDef<PanwLldpProfile, unknown>,

    {
      id: "mode",
      header: "Mode",
      enableSorting: false,
      cell: () => <span className="text-xs">transmit-receive</span>,
    },

    {
      id: "snmpSyslog",
      header: "SNMP Syslog Notification",
      enableSorting: false,
      cell: ({ row }) => <Checkbox checked={row.original.snmpSyslogNotification} disabled />,
    },

    {
      id: "portDesc",
      header: "Port Description",
      enableSorting: false,
      cell: ({ row }) => <Checkbox checked={row.original.portDescription} disabled />,
    },

    {
      id: "systemName",
      header: "System Name",
      enableSorting: false,
      cell: ({ row }) => <Checkbox checked={row.original.systemName} disabled />,
    },

    {
      id: "systemDesc",
      header: "System Description",
      enableSorting: false,
      cell: ({ row }) => <Checkbox checked={row.original.systemDescription} disabled />,
    },

    {
      id: "systemCap",
      header: "System Capabilities",
      enableSorting: false,
      cell: ({ row }) => <Checkbox checked={row.original.systemCapabilities} disabled />,
    },

    {
      id: "mgmtAddress",
      header: "Management Address",
      enableSorting: false,
      cell: ({ row }) => {
        const p = row.original
        if (!p.managementAddressEnabled || p.managementAddresses.length === 0) {
          return <span className="text-muted-foreground text-xs">—</span>
        }
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs">yes</span>
            {p.managementAddresses.map((a) => (
              <span key={a.name} className="text-xs font-mono">{a.ipv4 ?? a.name}</span>
            ))}
          </div>
        )
      },
    },

    ...templateColumn<PanwLldpProfile>(isPanorama),
  ]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LldpProfileView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])
  const [selected, setSelected] = React.useState<PanwLldpProfile | null>(null)

  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  const data = React.useMemo(() => {
    if (!activeConfig) return []
    return resolveNetworkData(activeConfig.parsedConfig, selectedScope).lldpProfiles
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
      <DataTable table={table} title="LLDP Profiles" search={search} onSearch={setSearch} />
      <LldpDialog profile={selected} open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null) }} />
    </>
  )
}
