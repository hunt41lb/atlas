// @/app/(main)/network/_components/vlans-table.tsx
//
// TanStack Table view for VLAN objects (network-level entities that map
// a virtual interface to physical member ports). Not to be confused with
// VLAN *interfaces* (vlan.X), which are shown in the Interfaces → VLAN tab.

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
import { MembersList, MonoValue } from "@/app/(main)/_components/ui/category-shell"
import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import { resolveNetworkData } from "@/app/(main)/_lib/resolve-config-data"
import type { PanwVlan } from "@/lib/panw-parser/types"

// ─── Column builder ──────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<PanwVlan>()

function buildColumns(isPanorama: boolean): ColumnDef<PanwVlan, unknown>[] {
  return [
    columnHelper.accessor("name", {
      header: "Name",
      enableHiding: false,
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }) as ColumnDef<PanwVlan, unknown>,

    {
      id: "virtualInterface",
      header: "Virtual Interface",
      enableSorting: true,
      accessorFn: (row) => row.virtualInterface ?? "",
      cell: ({ row }) => row.original.virtualInterface
        ? <MonoValue>{row.original.virtualInterface}</MonoValue>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    {
      id: "memberInterfaces",
      header: "Member Interfaces",
      enableSorting: false,
      cell: ({ row }) => <MembersList members={row.original.memberInterfaces} max={5} />,
    },

    {
      id: "staticMacs",
      header: "Static MACs",
      enableSorting: true,
      accessorFn: (row) => row.staticMacs.length,
      cell: ({ row }) => {
        const macs = row.original.staticMacs
        if (macs.length === 0) return <span className="text-muted-foreground text-xs">—</span>
        return (
          <div className="flex flex-col gap-0.5">
            {macs.map((m) => (
              <span key={m.mac} className="text-xs font-mono">
                {m.mac}{m.interface ? <span className="text-muted-foreground"> → {m.interface}</span> : ""}
              </span>
            ))}
          </div>
        )
      },
    },

    ...(isPanorama ? [{
      id: "template",
      header: "Template",
      enableSorting: true,
      accessorFn: (row: PanwVlan) => row.templateName ?? "",
      cell: ({ row }: { row: { original: PanwVlan } }) => row.original.templateName
        ? <span className="text-xs">{row.original.templateName}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    } as ColumnDef<PanwVlan, unknown>] : []),
  ]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function VlansTable() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])

  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  const data = React.useMemo(() => {
    if (!activeConfig) return []
    return resolveNetworkData(activeConfig.parsedConfig, selectedScope).vlans
  }, [activeConfig, selectedScope])

  const columns = React.useMemo(
    () => buildColumns(isPanorama),
    [isPanorama]
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
    <DataTable
      table={table}
      title="VLANs"
      search={search}
      onSearch={setSearch}
    />
  )
}
