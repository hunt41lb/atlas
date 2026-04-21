// @/app/(main)/network/_components/interfaces/interface-table.tsx
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
  createColumnHelper,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { IpAddressCell } from "@/app/(main)/_components/ui/ip-address-cell"
import { RouterCell, ZoneCell, MgmtProfileCell, FeaturesList, type SharedInterfaceTabProps } from "./interface-helpers"
import { InterfaceDialog } from "./interface-dialog"
import type { PanwInterface, InterfaceType } from "@/lib/panw-parser/network/interfaces"

// ─── Column builder ──────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<PanwInterface>()

function buildColumns(
  isPanorama: boolean,
  ifaceToVirtualRouter: Map<string, string>,
  ifaceToLogicalRouter: Map<string, string>,
  ifaceToZone: Map<string, string>,
  zoneColorMap: Map<string, string> | undefined,
  dhcpRelaySet: Set<string>,
  variableMap?: SharedInterfaceTabProps["variableMap"],
  onMgmtProfileClick?: (name: string) => void,
  onZoneClick?: (name: string) => void,
  onNameClick?: (item: PanwInterface) => void,
): ColumnDef<PanwInterface, unknown>[] {
  return [
    columnHelper.accessor("name", {
      header: "Name",
      enableHiding: false,
      meta: { freezeColumn: true },
      cell: (info) => onNameClick ? (
        <Button
          variant="link"
          size="sm"
          className="text-foreground font-medium cursor-pointer"
          onClick={() => onNameClick(info.row.original)}
        >
          {info.getValue()}
        </Button>
      ) : (
        <span className="font-medium">{info.getValue()}</span>
      ),
    }) as ColumnDef<PanwInterface, unknown>,

    columnHelper.accessor("managementProfile", {
      header: "Mgmt Profile",
      cell: (info) => <MgmtProfileCell name={info.getValue()} onClick={onMgmtProfileClick} />,
      meta: { hidePriority: 4 },
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
      meta: { hidePriority: 3 },
      accessorFn: (row) => row.mtu ?? 0,
      cell: ({ row }) => row.original.mtu
        ? <span className="tabular-nums text-xs font-medium">{row.original.mtu}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    {
      id: "virtualRouter",
      header: "Virtual Router",
      enableSorting: true,
      accessorFn: (row) => ifaceToVirtualRouter.get(row.name) ?? "",
      cell: ({ row }) => <RouterCell name={ifaceToVirtualRouter.get(row.original.name)} />,
    },

    {
      id: "logicalRouter",
      header: "Logical Router",
      enableSorting: true,
      accessorFn: (row) => ifaceToLogicalRouter.get(row.name) ?? "",
      cell: ({ row }) => <RouterCell name={ifaceToLogicalRouter.get(row.original.name)} />,
    },

    {
      id: "securityZone",
      header: "Security Zone",
      enableSorting: true,
      meta: { freezeColumn: true },
      accessorFn: (row) => ifaceToZone.get(row.name) ?? "",
      cell: ({ row }) => {
        const zoneName = ifaceToZone.get(row.original.name)
        return <ZoneCell name={zoneName} color={zoneColorMap?.get(zoneName ?? "")} onClick={onZoneClick} />
      },
    },

    {
      id: "features",
      header: "Features",
      enableSorting: false,
      meta: { hidePriority: 2 },
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
      meta: { hidePriority: 5 },
      accessorFn: (row: PanwInterface) => row.templateName ?? "",
      cell: ({ row }: { row: { original: PanwInterface } }) => row.original.templateName
        ? <span className="text-xs">{row.original.templateName}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    } as ColumnDef<PanwInterface, unknown>] : []),

    columnHelper.accessor("comment", {
      header: "Comment",
      meta: { hidePriority: 1 },
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
  ifaceToVirtualRouter,
  ifaceToLogicalRouter,
  hasVirtualRouters,
  hasLogicalRouters,
  ifaceToZone,
  zoneColorMap,
  dhcpRelaySet,
  variableMap,
  onMgmtProfileClick,
  onZoneClick,
  onRouterClick,
  ifaceToVlan,
}: SharedInterfaceTabProps & {
  type: InterfaceType
  title: string
}) {
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])
  const [selected, setSelected] = React.useState<PanwInterface | null>(null)
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    mtu: false,
    virtualRouter: hasVirtualRouters,
    logicalRouter: hasLogicalRouters,
  })

  const filtered = React.useMemo(
    () => interfaces.filter((i) => i.type === type),
    [interfaces, type]
  )

  const columns = React.useMemo(
    () => buildColumns(isPanorama, ifaceToVirtualRouter, ifaceToLogicalRouter, ifaceToZone, zoneColorMap, dhcpRelaySet, variableMap, onMgmtProfileClick, onZoneClick, setSelected),
    [isPanorama, ifaceToVirtualRouter, ifaceToLogicalRouter, ifaceToZone, zoneColorMap, dhcpRelaySet, variableMap, onMgmtProfileClick, onZoneClick]
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting, globalFilter: search, columnVisibility },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: "includesString",
  })

  return (
    <>
      <DataTable
        table={table}
        title={title}
        search={search}
        onSearch={setSearch}
      />
      <InterfaceDialog
        item={selected}
        open={selected !== null}
        onOpenChange={(open) => { if (!open) setSelected(null) }}
        ifaceToVirtualRouter={ifaceToVirtualRouter}
        ifaceToLogicalRouter={ifaceToLogicalRouter}
        ifaceToZone={ifaceToZone}
        zoneColorMap={zoneColorMap}
        ifaceToVlan={ifaceToVlan}
        onRouterClick={onRouterClick}
        onMgmtProfileClick={onMgmtProfileClick}
        onZoneClick={onZoneClick}
      />
    </>
  )
}
