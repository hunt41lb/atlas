// @/app/(main)/network/_components/virtual-wires/virtual-wires-view.tsx
//
// TanStack Table view for Virtual Wire objects. Virtual wires bind two
// interfaces together in a bump-in-the-wire configuration.

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

import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { MonoValue } from "@/app/(main)/_components/ui/category-shell"
import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import { resolveNetworkData } from "@/app/(main)/_lib/resolve-config-data"
import type { PanwVirtualWire } from "@/lib/panw-parser/network/virtual-wires"

const columnHelper = createColumnHelper<PanwVirtualWire>()

function buildColumns(isPanorama: boolean): ColumnDef<PanwVirtualWire, unknown>[] {
  return [
    columnHelper.accessor("name", {
      header: "Name",
      enableHiding: false,
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }) as ColumnDef<PanwVirtualWire, unknown>,

    {
      id: "interface1",
      header: "Interface 1",
      enableSorting: true,
      accessorFn: (row) => row.interface1 ?? "",
      cell: ({ row }) => row.original.interface1
        ? <MonoValue>{row.original.interface1}</MonoValue>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    {
      id: "interface2",
      header: "Interface 2",
      enableSorting: true,
      accessorFn: (row) => row.interface2 ?? "",
      cell: ({ row }) => row.original.interface2
        ? <MonoValue>{row.original.interface2}</MonoValue>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    {
      id: "tagAllowed",
      header: "Tag Allowed",
      enableSorting: true,
      accessorFn: (row) => row.tagAllowed ?? "",
      cell: ({ row }) => row.original.tagAllowed
        ? <MonoValue>{row.original.tagAllowed}</MonoValue>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    {
      id: "multicastFirewalling",
      header: "Multicast Firewalling",
      enableSorting: true,
      accessorFn: (row) => row.multicastFirewalling ? "yes" : "no",
      cell: ({ row }) => row.original.multicastFirewalling
        ? <Badge variant="green" size="sm">Enabled</Badge>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    ...(isPanorama ? [{
      id: "template",
      header: "Template",
      enableSorting: true,
      accessorFn: (row: PanwVirtualWire) => row.templateName ?? "",
      cell: ({ row }: { row: { original: PanwVirtualWire } }) => row.original.templateName
        ? <span className="text-xs">{row.original.templateName}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    } as ColumnDef<PanwVirtualWire, unknown>] : []),
  ]
}

export function VirtualWiresView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])

  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  const data = React.useMemo(() => {
    if (!activeConfig) return []
    return resolveNetworkData(activeConfig.parsedConfig, selectedScope).virtualWires
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
      title="Virtual Wires"
      search={search}
      onSearch={setSearch}
    />
  )
}

