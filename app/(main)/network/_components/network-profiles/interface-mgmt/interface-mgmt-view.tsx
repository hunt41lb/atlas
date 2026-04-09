// @/app/(main)/network/_components/network-profiles/interface-mgmt/interface-mgmt-view.tsx

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
import { InterfaceMgmtDialog } from "./interface-mgmt-dialog"
import type { PanwInterfaceMgmtProfile } from "@/lib/panw-parser/network/network-profiles"
import type { VariableMap } from "@/app/(main)/_components/ui/ip-address-cell"
import type { ParsedPanoramaConfig } from "@/lib/panw-parser/general/config"

// ─── Columns ──────────────────────────────────────────────────────────────────

const col = createColumnHelper<PanwInterfaceMgmtProfile>()

function buildColumns(
  isPanorama: boolean,
  onNameClick: (p: PanwInterfaceMgmtProfile) => void,
): ColumnDef<PanwInterfaceMgmtProfile, unknown>[] {
  const check = (key: keyof PanwInterfaceMgmtProfile): ColumnDef<PanwInterfaceMgmtProfile, unknown> => ({
    id: key,
    header: key === "httpOcsp" ? "HTTP OCSP"
      : key === "responsePages" ? "Response Pages"
      : key === "useridService" ? "User-ID"
      : key === "useridSyslogListenerSsl" ? "User-ID Syslog Listener-SSL"
      : key === "useridSyslogListenerUdp" ? "User-ID Syslog Listener-UDP"
      : key.toUpperCase(),
    enableSorting: false,
    cell: ({ row }) => (
      <Checkbox checked={row.original[key] as boolean} disabled />
    ),
  })

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
    }) as ColumnDef<PanwInterfaceMgmtProfile, unknown>,

    check("ping"),
    check("telnet"),
    check("ssh"),
    check("http"),
    check("httpOcsp"),
    check("https"),
    check("snmp"),
    check("responsePages"),
    check("useridService"),
    check("useridSyslogListenerSsl"),
    check("useridSyslogListenerUdp"),

    {
      id: "permittedIps",
      header: "Permitted IP Addresses",
      enableSorting: false,
      cell: ({ row }) => {
        const ips = row.original.permittedIps
        if (ips.length === 0) return <span className="text-muted-foreground text-xs">—</span>
        return (
          <div className="flex flex-col gap-0.5">
            {ips.map((ip) => (
              <span key={ip} className="font-mono text-xs">{ip}</span>
            ))}
          </div>
        )
      },
    },

    ...templateColumn<PanwInterfaceMgmtProfile>(isPanorama),
  ]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InterfaceMgmtView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])
  const [selected, setSelected] = React.useState<PanwInterfaceMgmtProfile | null>(null)

  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  const data = React.useMemo(() => {
    if (!activeConfig) return []
    return resolveNetworkData(activeConfig.parsedConfig, selectedScope).interfaceMgmtProfiles
  }, [activeConfig, selectedScope])

  const columns = React.useMemo(() => buildColumns(isPanorama, setSelected), [isPanorama])

  const variableMap = React.useMemo<VariableMap>(() => {
    const map: VariableMap = new Map()
    if (activeConfig?.parsedConfig.deviceType === "panorama") {
      const panorama = activeConfig.parsedConfig as ParsedPanoramaConfig
      for (const tmpl of panorama.templates) {
        for (const v of tmpl.variables ?? []) {
          map.set(v.name, { value: v.value, description: v.description })
        }
      }
    }
    return map
  }, [activeConfig])

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
        title="Interface Management Profiles"
        search={search}
        onSearch={setSearch}
      />
      <InterfaceMgmtDialog
        profile={selected}
        open={selected !== null}
        onOpenChange={(open) => { if (!open) setSelected(null) }}
        variableMap={variableMap}
      />
    </>
  )
}

