// @/app/(main)/network/_components/interfaces/aggregate-ethernet-tab.tsx

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
  type VisibilityState,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { TableCell, TableRow } from "@/components/ui/table"
import { useExpandableRows, ExpandToggle } from "@/components/ui/expandable-row"
import { IpAddressCell } from "@/app/(main)/_components/ui/ip-address-cell"
import { MembersList } from "@/app/(main)/_components/ui/category-shell"
import { cn } from "@/lib/utils"
import type { PanwInterface, PanwSubInterface } from "@/lib/panw-parser/network/interfaces"
import { InterfaceDialog } from "./interface-dialog"
import {
  MODE_LABELS,
  ModeBadge,
  TagCell,
  RouterCell,
  ZoneCell,
  MgmtProfileCell,
  FeaturesList,
  SubInterfaceRows,
  type SharedInterfaceTabProps,
} from "./interface-helpers"

// ─── Column builder ──────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<PanwInterface>()

function buildAeColumns(
  isPanorama: boolean,
  ifaceToVirtualRouter: Map<string, string>,
  ifaceToLogicalRouter: Map<string, string>,
  ifaceToZone: Map<string, string>,
  zoneColorMap: Map<string, string>,
  dhcpRelaySet: Set<string>,
  dhcpServerSet: Set<string>,
  memberMap: Map<string, string[]>,
  variableMap?: SharedInterfaceTabProps["variableMap"],
  onMgmtProfileClick?: (name: string) => void,
  onRouterClick?: (name: string) => void,
  onZoneClick?: (name: string) => void,
  onNameClick?: (item: PanwInterface) => void,
): ColumnDef<PanwInterface, unknown>[] {
  return [
    { id: "expand", enableSorting: false, enableHiding: false, size: 32, cell: () => null },

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
        <span className="text-xs font-medium">{info.getValue()}</span>
      ),
    }) as ColumnDef<PanwInterface, unknown>,

    {
      id: "interfaceType",
      header: "Interface Type",
      enableSorting: true,
      accessorFn: (row) => row.mode !== "none" ? (MODE_LABELS[row.mode] ?? row.mode) : row.type,
      cell: ({ row }) => <ModeBadge iface={row.original} />,
    },

    {
      id: "members",
      header: "Member Ports",
      enableSorting: false,
      cell: ({ row }) => {
        const members = memberMap.get(row.original.name) ?? []
        return <MembersList members={members} max={4} />
      },
    },

    columnHelper.accessor("managementProfile", {
      header: "Mgmt Profile",
      cell: (info) => <MgmtProfileCell name={info.getValue()} onClick={onMgmtProfileClick} />,
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
      id: "subIfCount",
      header: "Sub Interfaces",
      enableSorting: true,
      accessorFn: (row) => row.subInterfaces.length,
      cell: ({ row }) => {
        const count = row.original.subInterfaces.length
        return count > 0
          ? <span className="tabular-nums text-xs font-medium">{count}</span>
          : <span className="text-muted-foreground text-xs">—</span>
      },
    },

    {
      id: "tag",
      header: "Tag",
      enableSorting: false,
      cell: () => <TagCell />,
    },

    {
      id: "virtualRouter",
      header: "Virtual Router",
      enableSorting: true,
      accessorFn: (row) => ifaceToVirtualRouter.get(row.name) ?? "",
      cell: ({ row }) => <RouterCell name={ifaceToVirtualRouter.get(row.original.name)} onClick={onRouterClick} />,
    },

    {
      id: "logicalRouter",
      header: "Logical Router",
      enableSorting: true,
      accessorFn: (row) => ifaceToLogicalRouter.get(row.name) ?? "",
      cell: ({ row }) => <RouterCell name={ifaceToLogicalRouter.get(row.original.name)} onClick={onRouterClick} />,
    },

    {
      id: "securityZone",
      header: "Security Zone",
      enableSorting: true,
      accessorFn: (row) => ifaceToZone.get(row.name) ?? "",
      cell: ({ row }) => {
        const zoneName = ifaceToZone.get(row.original.name)
        return <ZoneCell name={zoneName} color={zoneColorMap.get(zoneName ?? "")} onClick={onZoneClick} />
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

        if (dhcpServerSet.has(iface.name)) features.push("DHCP Server")
        if (dhcpRelaySet.has(iface.name)) features.push("DHCP Relay")

        if (iface.lacpEnabled) features.push("LACP")
        if (iface.lldpEnabled) features.push("LLDP")
        if (iface.ndpProxy) features.push("NDP Proxy")
        if (iface.sdwanEnabled) features.push("SD-WAN")
        if (iface.adjustTcpMss) features.push("TCP MSS")
        if (iface.netflowProfile) features.push("Netflow")
        if (iface.poeEnabled) features.push("PoE")

        return <FeaturesList features={features} />
      },
    },

    ...(isPanorama ? [{
      id: "template",
      header: "Template",
      enableSorting: true,
      meta: { hidePriority: 3 },
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

export function AggregateEthernetTab({
  interfaces,
  isPanorama,
  ifaceToVirtualRouter,
  ifaceToLogicalRouter,
  hasVirtualRouters,
  hasLogicalRouters,
  ifaceToZone,
  zoneColorMap,
  dhcpRelaySet,
  dhcpServerSet,
  variableMap,
  onMgmtProfileClick,
  onRouterClick,
  onZoneClick,
}: SharedInterfaceTabProps) {
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])
  const [selected, setSelected] = React.useState<PanwInterface | PanwSubInterface | null>(null)
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    subIfCount: false,
    virtualRouter: hasVirtualRouters,
    logicalRouter: hasLogicalRouters,
    ...(isPanorama ? {} : { template: false }),
  })

  const aeInterfaces = React.useMemo(
    () => interfaces.filter((i) => i.type === "ae"),
    [interfaces]
  )

  // Build a map of AE name → member Ethernet port names
  const memberMap = React.useMemo(() => {
    const map = new Map<string, string[]>()
    for (const iface of interfaces) {
      if (iface.type === "ethernet" && iface.aggregateGroup) {
        const existing = map.get(iface.aggregateGroup) ?? []
        existing.push(iface.name)
        map.set(iface.aggregateGroup, existing)
      }
    }
    for (const [key, members] of map) {
      map.set(key, members.sort())
    }
    return map
  }, [interfaces])

  const { isExpanded, toggleRow } = useExpandableRows({
    items: aeInterfaces,
    getRowKey: (i) => `${i.templateName ?? "fw"}-${i.name}`,
    isExpandable: (i) => i.subInterfaces.length > 0,
    defaultExpanded: false,
  })

  const columns = React.useMemo(
    () => buildAeColumns(isPanorama, ifaceToVirtualRouter, ifaceToLogicalRouter, ifaceToZone, zoneColorMap, dhcpRelaySet, dhcpServerSet, memberMap, variableMap, onMgmtProfileClick, onRouterClick, onZoneClick, setSelected),
    [isPanorama, ifaceToVirtualRouter, ifaceToLogicalRouter, ifaceToZone, zoneColorMap, dhcpRelaySet, dhcpServerSet, memberMap, variableMap, onMgmtProfileClick, onRouterClick, onZoneClick]
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: aeInterfaces,
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
      title="Aggregate Ethernet"
      search={search}
      onSearch={setSearch}
      renderRow={(row) => {
        const iface = row.original
        const rowKey = `${iface.templateName ?? "fw"}-${iface.name}`
        const hasSubIfs = iface.subInterfaces.length > 0
        const expanded = isExpanded(rowKey)

        return (
          <React.Fragment key={rowKey}>
            <TableRow className={cn("transition-colors", hasSubIfs && expanded && "border-b-0")}>
              <TableCell className="w-8 px-2">
                <ExpandToggle expandable={hasSubIfs} expanded={expanded} onToggle={() => toggleRow(rowKey)} />
              </TableCell>
              {row.getVisibleCells().slice(1).map((cell) => (
                <TableCell key={cell.id} className="px-3 py-2 align-middle">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
            {hasSubIfs && expanded && (
              <SubInterfaceRows
                subs={iface.subInterfaces}
                isPanorama={isPanorama}
                templateName={iface.templateName}
                ifaceToZone={ifaceToZone}
                ifaceToVirtualRouter={ifaceToVirtualRouter}
                ifaceToLogicalRouter={ifaceToLogicalRouter}
                dhcpRelaySet={dhcpRelaySet}
                dhcpServerSet={dhcpServerSet}
                showMemberPorts
                visibleColumns={new Set(table.getVisibleLeafColumns().map((c) => c.id))}
                variableMap={variableMap}
                zoneColorMap={zoneColorMap}
                onMgmtProfileClick={onMgmtProfileClick}
                onRouterClick={onRouterClick}
                onZoneClick={onZoneClick}
                onSubInterfaceClick={setSelected}
              />
            )}
          </React.Fragment>
        )
      }}
    />
    <InterfaceDialog
      item={selected}
      open={selected !== null}
      onOpenChange={(open) => { if (!open) setSelected(null) }}
      ifaceToVirtualRouter={ifaceToVirtualRouter}
      ifaceToLogicalRouter={ifaceToLogicalRouter}
      ifaceToZone={ifaceToZone}
      zoneColorMap={zoneColorMap}
      onRouterClick={onRouterClick}
      onMgmtProfileClick={onMgmtProfileClick}
    />
    </>
  )
}
