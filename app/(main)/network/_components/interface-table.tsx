// @/app/(main)/network/_components/interface-table.tsx
//
// Reusable TanStack Table for unit-based interface types (Tunnel, Loopback, VLAN).
// These interface types share the same XML structure: entries nested inside <units>,
// no mode wrapper (layer3/layer2), no sub-interfaces, no aggregate groups.
//
// Used by InterfacesView as:
//   <InterfaceTable type="tunnel" title="Tunnel Interfaces" {...sharedProps} />

"use client"

import * as React from "react"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { SortHeader } from "@/components/ui/sort-header"
import { ColumnVisibilityToggle } from "@/components/ui/column-visibility"
import { IpAddressCell, type VariableMap } from "@/app/(main)/_components/ui/ip-address-cell"
import { CategoryShell } from "@/app/(main)/_components/ui/category-shell"
import { RouterCell, ZoneCell, FeaturesList } from "./interface-helpers"
import type { PanwInterface, InterfaceType } from "@/lib/panw-parser/types"

// ─── Column builder ──────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<PanwInterface>()

function buildColumns(
  isPanorama: boolean,
  ifaceToRouter: Map<string, string>,
  ifaceToZone: Map<string, string>,
  zoneColorMap: Map<string, string> | undefined,
  dhcpRelaySet: Set<string>,
  variableMap?: VariableMap,
): ColumnDef<PanwInterface, unknown>[] {
  return [
    columnHelper.accessor("name", {
      header: "Name",
      enableHiding: false,
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }) as ColumnDef<PanwInterface, unknown>,

    columnHelper.accessor("managementProfile", {
      header: "Mgmt Profile",
      cell: (info) => info.getValue()
        ? <span className="text-xs">{info.getValue()}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    }) as ColumnDef<PanwInterface, unknown>,

    {
      id: "ipAddresses",
      header: "IP Address",
      enableSorting: false,
      cell: ({ row }) => (
        <IpAddressCell
          ipv4={row.original.ipAddresses}
          ipv6={row.original.ipv6Addresses}
          dhcpClient={row.original.dhcpClient}
          variableMap={variableMap}
        />
      ),
    },

    {
      id: "mtu",
      header: "MTU",
      enableSorting: true,
      accessorFn: (row) => row.mtu ?? 0,
      cell: ({ row }) => row.original.mtu
        ? <span className="tabular-nums text-xs font-medium">{row.original.mtu}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    {
      id: "logicalRouter",
      header: "Logical Router",
      enableSorting: true,
      accessorFn: (row) => ifaceToRouter.get(row.name) ?? "",
      cell: ({ row }) => <RouterCell name={ifaceToRouter.get(row.original.name)} />,
    },

    {
      id: "securityZone",
      header: "Security Zone",
      enableSorting: true,
      accessorFn: (row) => ifaceToZone.get(row.name) ?? "",
      cell: ({ row }) => {
        const zoneName = ifaceToZone.get(row.original.name)
        return <ZoneCell name={zoneName} color={zoneColorMap?.get(zoneName ?? "")} />
      },
    },

    {
      id: "features",
      header: "Features",
      enableSorting: false,
      cell: ({ row }) => {
        const iface = row.original
        const features: string[] = []

        if (iface.adjustTcpMss) features.push("TCP MSS")
        if (iface.ddnsEnabled) features.push("DDNS")
        if (dhcpRelaySet.has(iface.name)) features.push("DHCP Relay")
        if (iface.ndpProxy) features.push("NDP Proxy")
        if (iface.netflowProfile) features.push("Netflow")
        if (iface.sdwanEnabled) features.push("SD-WAN")

        return <FeaturesList features={features} />
      },
    },

    ...(isPanorama ? [{
      id: "template",
      header: "Template",
      enableSorting: true,
      accessorFn: (row: PanwInterface) => row.templateName ?? "",
      cell: ({ row }: { row: { original: PanwInterface } }) => row.original.templateName
        ? <span className="text-xs">{row.original.templateName}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    } as ColumnDef<PanwInterface, unknown>] : []),

    columnHelper.accessor("comment", {
      header: "Comment",
      cell: (info) => info.getValue()
        ? <span className="text-xs text-muted-foreground">{info.getValue()}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    }) as ColumnDef<PanwInterface, unknown>,
  ]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InterfaceTable({
  type,
  title,
  interfaces,
  isPanorama,
  ifaceToRouter,
  ifaceToZone,
  zoneColorMap,
  dhcpRelaySet,
  variableMap,
}: {
  type: InterfaceType
  title: string
  interfaces: PanwInterface[]
  isPanorama: boolean
  ifaceToRouter: Map<string, string>
  ifaceToZone: Map<string, string>
  zoneColorMap?: Map<string, string>
  dhcpRelaySet: Set<string>
  variableMap?: VariableMap
}) {
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])

  const filtered = React.useMemo(
    () => interfaces.filter((i) => i.type === type),
    [interfaces, type]
  )

  const columns = React.useMemo(
    () => buildColumns(isPanorama, ifaceToRouter, ifaceToZone, zoneColorMap, dhcpRelaySet, variableMap),
    [isPanorama, ifaceToRouter, ifaceToZone, zoneColorMap, dhcpRelaySet, variableMap]
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting, globalFilter: search },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: "includesString",
  })

  const rows = table.getRowModel().rows

  return (
    <CategoryShell
      title={title}
      count={rows.length}
      search={search}
      onSearch={setSearch}
      actions={<ColumnVisibilityToggle table={table} />}
    >
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} className="hover:bg-transparent border-b border-border">
              {hg.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="text-[11px] font-semibold tracking-wider text-muted-foreground whitespace-nowrap px-3 h-9"
                  style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                >
                  {header.isPlaceholder ? null : header.column.getCanSort() ? (
                    <SortHeader label={String(header.column.columnDef.header ?? "")} column={header.column} />
                  ) : (
                    flexRender(header.column.columnDef.header, header.getContext())
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="py-16 text-center text-sm text-muted-foreground">
                {search ? `No results matching "${search}"` : `No ${title.toLowerCase()} found in this configuration.`}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.original.name}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-3 py-2 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </CategoryShell>
  )
}
