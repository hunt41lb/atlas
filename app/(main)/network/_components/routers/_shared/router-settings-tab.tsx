// @/app/(main)/network/_components/routers/_shared/router-settings-tab.tsx

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
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { MonoValue } from "@/app/(main)/_components/ui/category-shell"
import type { PanwVirtualRouter } from "@/lib/panw-parser/network/routers"

// ─── Column builder ──────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<PanwVirtualRouter>()

function buildColumns(
  isPanorama: boolean,
  onRouterClick?: (router: PanwVirtualRouter) => void,
): ColumnDef<PanwVirtualRouter, unknown>[] {
  return [
    columnHelper.accessor("name", {
      header: "Name",
      enableHiding: false,
      cell: (info) => {
        const router = info.row.original
        if (onRouterClick) {
          return (
            <Button
              variant="link"
              size="sm"
              onClick={() => onRouterClick(router)}
              className="text-foreground h-auto p-0 font-medium cursor-pointer"
            >
              {info.getValue()}
            </Button>
          )
        }
        return <span className="font-medium">{info.getValue()}</span>
      },
    }) as ColumnDef<PanwVirtualRouter, unknown>,

    {
      id: "interfaces",
      header: "Interfaces",
      enableSorting: false,
      cell: ({ row }) => {
        const ifaces = row.original.interfaces
        if (ifaces.length === 0) return <span className="text-muted-foreground text-xs">—</span>
        return (
          <div className="flex flex-col gap-0.5">
            {ifaces.map((i) => (
              <MonoValue key={i} className="text-xs">{i}</MonoValue>
            ))}
          </div>
        )
      },
    },

    {
      id: "configuration",
      header: "Configuration",
      enableSorting: false,
      cell: ({ row }) => {
        const vr = row.original
        const items: { label: string; value: string }[] = []
        if (vr.staticRoutes.length > 0) items.push({ label: "Static Routes", value: String(vr.staticRoutes.length) })
        if (vr.staticRoutesV6.length > 0) items.push({ label: "Static IPv6 Routes", value: String(vr.staticRoutesV6.length) })
        if (vr.ecmp.enabled) items.push({ label: "ECMP", value: "Enabled" })
        if (vr.redistProfiles.length > 0) items.push({ label: "Redist Profiles", value: String(vr.redistProfiles.length) })

        if (items.length === 0) return <span className="text-muted-foreground text-xs">—</span>
        return (
          <div className="flex flex-col gap-0.5">
            {items.map((item) => (
              <span key={item.label} className="text-xs">
                <span className="text-muted-foreground">{item.label}:</span> {item.value}
              </span>
            ))}
          </div>
        )
      },
    },

    {
      id: "rip",
      header: "RIP",
      enableSorting: true,
      accessorFn: (row) => row.rip.enabled ? "yes" : "no",
      cell: ({ row }) => row.original.rip.enabled
        ? <Badge variant="green" size="sm">Enabled</Badge>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    {
      id: "ospf",
      header: "OSPF",
      enableSorting: true,
      accessorFn: (row) => row.ospf.enabled ? "yes" : "no",
      cell: ({ row }) => row.original.ospf.enabled
        ? <Badge variant="green" size="sm">Enabled</Badge>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    {
      id: "ospfv3",
      header: "OSPFv3",
      enableSorting: true,
      accessorFn: (row) => row.ospfv3.enabled ? "yes" : "no",
      cell: ({ row }) => row.original.ospfv3.enabled
        ? <Badge variant="green" size="sm">Enabled</Badge>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    {
      id: "bgp",
      header: "BGP",
      enableSorting: true,
      accessorFn: (row) => row.bgp.enabled ? "yes" : "no",
      cell: ({ row }) => row.original.bgp.enabled
        ? <Badge variant="green" size="sm">Enabled</Badge>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    {
      id: "multicast",
      header: "Multicast",
      enableSorting: true,
      accessorFn: (row) => row.multicast.enabled ? "yes" : "no",
      cell: ({ row }) => {
        if (!row.original.multicast.enabled) return <span className="text-muted-foreground text-xs">—</span>
        const groups = row.original.multicast.interfaceGroups.length
        return (
          <div className="flex flex-col gap-0.5">
            <Badge variant="green" size="sm">Enabled</Badge>
            {groups > 0 && (
              <span className="text-[10px] text-muted-foreground">
                I/Fs: {groups}
              </span>
            )}
          </div>
        )
      },
    },

    ...(isPanorama ? [{
      id: "template",
      header: "Template",
      enableSorting: true,
      accessorFn: (row: PanwVirtualRouter) => row.templateName ?? "",
      cell: ({ row }: { row: { original: PanwVirtualRouter } }) => row.original.templateName
        ? <span className="text-xs">{row.original.templateName}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    } as ColumnDef<PanwVirtualRouter, unknown>] : []),
  ]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RouterSettingsTab({
  routers,
  isPanorama,
  title = "Router Settings",
  onRouterClick,
}: {
  routers: PanwVirtualRouter[]
  isPanorama: boolean
  title?: string
  onRouterClick?: (router: PanwVirtualRouter) => void
}) {
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])

  const columns = React.useMemo(
    () => buildColumns(isPanorama, onRouterClick),
    [isPanorama, onRouterClick]
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: routers,
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
      title={title}
      search={search}
      onSearch={setSearch}
    />
  )
}

