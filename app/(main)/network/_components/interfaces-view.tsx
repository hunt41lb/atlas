// @/app/(main)/network/_components/interfaces-view.tsx

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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { SortHeader } from "@/components/ui/sort-header"
import { Badge } from "@/components/ui/badge"
import { useExpandableRows, ExpandToggle } from "@/components/ui/expandable-row"
import { IpAddressCell, type VariableMap } from "@/app/(main)/_components/ui/ip-address-cell"
import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import { resolveNetworkData } from "@/app/(main)/_lib/resolve-config-data"
import { CategoryShell, ComingSoonView, MonoValue, MembersList } from "@/app/(main)/_components/ui/category-shell"
import { INTERFACE_MODE_COLORS } from "@/lib/colors"
import { cn } from "@/lib/utils"
import type { PanwInterface, PanwSubInterface, PanwVirtualRouter, PanwZone, ParsedPanoramaConfig } from "@/lib/panw-parser/types"

// ─── Tab definitions ─────────────────────────────────────────────────────────

const INTERFACE_TABS = [
  { value: "ethernet",           label: "Ethernet" },
  { value: "aggregate-ethernet", label: "Aggregate Ethernet" },
  { value: "vlan",               label: "VLAN" },
  { value: "loopback",           label: "Loopback" },
  { value: "tunnel",             label: "Tunnel" },
  { value: "sd-wan",             label: "SD-WAN" },
  { value: "poe",                label: "PoE" },
  { value: "cellular",           label: "Cellular" },
  { value: "fail-open",          label: "Fail Open" },
] as const

// ─── Lookup map builders ──────────────────────────────────────────────────────

function buildIfaceToRouter(routers: PanwVirtualRouter[]): Map<string, string> {
  const map = new Map<string, string>()
  for (const router of routers) {
    for (const iface of router.interfaces) {
      if (iface) map.set(iface, router.name)
    }
  }
  return map
}

function buildIfaceToZone(zones: PanwZone[]): Map<string, string> {
  const map = new Map<string, string>()
  for (const zone of zones) {
    for (const iface of zone.interfaces) {
      if (iface) map.set(iface, zone.name)
    }
  }
  return map
}

// ─── Shared cell helpers ─────────────────────────────────────────────────────

const MODE_LABELS: Record<string, string> = {
  layer3: "Layer3",
  layer2: "Layer2",
  "virtual-wire": "Virtual Wire",
  tap: "Tap",
  ha: "HA",
  "decrypt-mirror": "Decrypt Mirror",
}

function InterfaceTypeBadge({ iface }: { iface: PanwInterface }) {
  if (iface.aggregateGroup) {
    return (
      <Badge variant={INTERFACE_MODE_COLORS["aggregate"]} size="sm">
        Aggregate ({iface.aggregateGroup})
      </Badge>
    )
  }
  if (iface.mode !== "none") {
    return (
      <Badge variant={INTERFACE_MODE_COLORS[iface.mode]} size="sm">
        {MODE_LABELS[iface.mode] ?? iface.mode}
      </Badge>
    )
  }
  return <Badge variant="muted" size="sm">{iface.type}</Badge>
}

function ModeBadge({ iface }: { iface: PanwInterface }) {
  if (iface.mode !== "none") {
    return (
      <Badge variant={INTERFACE_MODE_COLORS[iface.mode]} size="sm">
        {MODE_LABELS[iface.mode] ?? iface.mode}
      </Badge>
    )
  }
  return <Badge variant="muted" size="sm">{iface.type}</Badge>
}

function TagCell() {
  return <span className="text-xs text-muted-foreground">Untagged</span>
}

function RouterCell({ name }: { name: string | undefined }) {
  if (!name) return <span className="text-muted-foreground text-xs">—</span>
  return <span className="text-xs font-medium">{name}</span>
}

function ZoneCell({ name }: { name: string | undefined }) {
  if (!name) return <span className="text-muted-foreground text-xs">none</span>
  return <span className="text-xs font-medium">{name}</span>
}

function FeaturesList({ features }: { features: string[] }) {
  if (features.length === 0) return <span className="text-muted-foreground text-xs">—</span>
  const sorted = [...features].sort((a, b) => a.localeCompare(b))
  return (
    <div className="flex flex-col gap-0.5">
      {sorted.map((f) => (
        <span key={f} className="text-xs text-muted-foreground">{f}</span>
      ))}
    </div>
  )
}

// ─── Sub-interface rows (shared between Ethernet & AE tabs) ──────────────────

function SubInterfaceRows({
  subs,
  isPanorama,
  templateName,
  ifaceToZone,
  ifaceToRouter,
  dhcpRelaySet,
  showMemberPorts = false,
  variableMap,
}: {
  subs: PanwSubInterface[]
  isPanorama: boolean
  templateName: string | null
  ifaceToZone: Map<string, string>
  ifaceToRouter: Map<string, string>
  dhcpRelaySet: Set<string>
  showMemberPorts?: boolean
  variableMap?: VariableMap
}) {
  return (
    <>
      {subs.map((sub) => (
        <TableRow key={sub.name} className="bg-muted/20 hover:bg-muted/40 border-border/50">
          <TableCell className="w-8" />
          <TableCell className="pl-2">
            <span className="text-muted-foreground mr-1 text-xs">↳</span>
            <span className="font-medium text-sm">{sub.name}</span>
          </TableCell>
          <TableCell>
            <Badge variant="muted" size="sm">Sub Interface</Badge>
          </TableCell>
          {/* Member Ports placeholder (AE tab only) */}
          {showMemberPorts && <TableCell />}
          <TableCell>
            {sub.managementProfile
              ? <span className="text-xs">{sub.managementProfile}</span>
              : <span className="text-muted-foreground text-xs">—</span>}
          </TableCell>
          <TableCell>
            <IpAddressCell ipv4={sub.ipAddresses} ipv6={sub.ipv6Addresses ?? []} dhcpClient={sub.dhcpClient} variableMap={variableMap} />
          </TableCell>
          {/* Sub Interfaces count — n/a */}
          <TableCell />
          {/* Aggregate Group placeholder (Ethernet tab only) */}
          {!showMemberPorts && <TableCell />}
          <TableCell>
            {sub.tag !== null
              ? <span className="text-xs font-mono">{sub.tag}</span>
              : <span className="text-muted-foreground text-xs">Untagged</span>}
          </TableCell>
          <TableCell><RouterCell name={ifaceToRouter.get(sub.name)} /></TableCell>
          <TableCell><ZoneCell name={ifaceToZone.get(sub.name)} /></TableCell>
          <TableCell>
            <FeaturesList features={[
              ...(sub.bonjourEnabled ? ["Bonjour"] : []),
              ...(sub.dhcpClient ? ["DHCP Client"] : []),
              ...(dhcpRelaySet.has(sub.name) ? ["DHCP Relay"] : []),
              ...(sub.ndpProxy ? ["NDP Proxy"] : []),
              ...(sub.adjustTcpMss ? ["TCP MSS"] : []),
              ...(sub.sdwanEnabled ? ["SD-WAN"] : []),
            ]} />
          </TableCell>
          {isPanorama && (
            <TableCell>
              {templateName && <span className="text-xs text-muted-foreground">{templateName}</span>}
            </TableCell>
          )}
          <TableCell>
            {sub.comment
              ? <span className="text-xs text-muted-foreground">{sub.comment}</span>
              : <span className="text-muted-foreground text-xs">—</span>}
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Ethernet Tab ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const ethernetColumnHelper = createColumnHelper<PanwInterface>()

function buildEthernetColumns(
  isPanorama: boolean,
  ifaceToRouter: Map<string, string>,
  ifaceToZone: Map<string, string>,
  dhcpRelaySet: Set<string>,
  variableMap?: VariableMap,
): ColumnDef<PanwInterface, unknown>[] {
  return [
    { id: "expand", enableSorting: false, size: 32, cell: () => null },

    ethernetColumnHelper.accessor("name", {
      header: "Name",
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }) as ColumnDef<PanwInterface, unknown>,

    {
      id: "interfaceType",
      header: "Interface Type",
      enableSorting: true,
      accessorFn: (row) => row.aggregateGroup
        ? `Aggregate (${row.aggregateGroup})`
        : row.mode !== "none"
          ? (MODE_LABELS[row.mode] ?? row.mode)
          : row.type,
      cell: ({ row }) => <InterfaceTypeBadge iface={row.original} />,
    },

    ethernetColumnHelper.accessor("managementProfile", {
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
      id: "aggregateGroup",
      header: "Aggregate Group",
      enableSorting: true,
      accessorFn: (row) => row.aggregateGroup ?? "",
      cell: ({ row }) => row.original.aggregateGroup
        ? <MonoValue className="text-xs">{row.original.aggregateGroup}</MonoValue>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    {
      id: "tag",
      header: "Tag",
      enableSorting: false,
      cell: () => <TagCell />,
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
      cell: ({ row }) => <ZoneCell name={ifaceToZone.get(row.original.name)} />,
    },

    {
      id: "features",
      header: "Features",
      enableSorting: false,
      cell: ({ row }) => {
        const iface = row.original
        const features: string[] = []

        if (iface.dhcpClient) features.push("DHCP Client")

        const selfHasRelay = dhcpRelaySet.has(iface.name)
        const subHasRelay = iface.subInterfaces.some((s) => dhcpRelaySet.has(s.name))
        if (selfHasRelay || subHasRelay) features.push("DHCP Relay")

        if (iface.lldpEnabled) features.push("LLDP")
        if (iface.ndpProxy) features.push("NDP Proxy")
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

    ethernetColumnHelper.accessor("comment", {
      header: "Comment",
      cell: (info) => info.getValue()
        ? <span className="text-xs text-muted-foreground">{info.getValue()}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    }) as ColumnDef<PanwInterface, unknown>,
  ]
}

function EthernetTab({
  interfaces,
  isPanorama,
  ifaceToRouter,
  ifaceToZone,
  dhcpRelaySet,
  variableMap,
}: {
  interfaces: PanwInterface[]
  isPanorama: boolean
  ifaceToRouter: Map<string, string>
  ifaceToZone: Map<string, string>
  dhcpRelaySet: Set<string>
  variableMap?: VariableMap
}) {
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])

  const ethernetInterfaces = React.useMemo(
    () => interfaces.filter((i) => i.type === "ethernet"),
    [interfaces]
  )

  const { isExpanded, toggleRow } = useExpandableRows({
    items: ethernetInterfaces,
    getRowKey: (i) => `${i.templateName ?? "fw"}-${i.name}`,
    isExpandable: (i) => i.subInterfaces.length > 0,
  })

  const columns = React.useMemo(
    () => buildEthernetColumns(isPanorama, ifaceToRouter, ifaceToZone, dhcpRelaySet, variableMap),
    [isPanorama, ifaceToRouter, ifaceToZone, dhcpRelaySet, variableMap]
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: ethernetInterfaces,
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
    <CategoryShell title="Ethernet" count={rows.length} search={search} onSearch={setSearch}>
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
                {search ? `No results matching "${search}"` : "No Ethernet interfaces found in this configuration."}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => {
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
                      ifaceToRouter={ifaceToRouter}
                      dhcpRelaySet={dhcpRelaySet}
                      variableMap={variableMap}
                    />
                  )}
                </React.Fragment>
              )
            })
          )}
        </TableBody>
      </Table>
    </CategoryShell>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Aggregate Ethernet Tab ───────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const aeColumnHelper = createColumnHelper<PanwInterface>()

function buildAeColumns(
  isPanorama: boolean,
  ifaceToRouter: Map<string, string>,
  ifaceToZone: Map<string, string>,
  dhcpRelaySet: Set<string>,
  memberMap: Map<string, string[]>,
  variableMap?: VariableMap,
): ColumnDef<PanwInterface, unknown>[] {
  return [
    { id: "expand", enableSorting: false, size: 32, cell: () => null },

    aeColumnHelper.accessor("name", {
      header: "Name",
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
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

    aeColumnHelper.accessor("managementProfile", {
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
      cell: ({ row }) => <ZoneCell name={ifaceToZone.get(row.original.name)} />,
    },

    {
      id: "features",
      header: "Features",
      enableSorting: false,
      cell: ({ row }) => {
        const iface = row.original
        const features: string[] = []

        if (iface.dhcpClient) features.push("DHCP Client")

        const selfHasRelay = dhcpRelaySet.has(iface.name)
        const subHasRelay = iface.subInterfaces.some((s) => dhcpRelaySet.has(s.name))
        if (selfHasRelay || subHasRelay) features.push("DHCP Relay")

        if (iface.lacpEnabled) features.push("LACP")
        if (iface.lldpEnabled) features.push("LLDP")
        if (iface.ndpProxy) features.push("NDP Proxy")
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

    aeColumnHelper.accessor("comment", {
      header: "Comment",
      cell: (info) => info.getValue()
        ? <span className="text-xs text-muted-foreground">{info.getValue()}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    }) as ColumnDef<PanwInterface, unknown>,
  ]
}

function AggregateEthernetTab({
  interfaces,
  isPanorama,
  ifaceToRouter,
  ifaceToZone,
  dhcpRelaySet,
  variableMap,
}: {
  interfaces: PanwInterface[]
  isPanorama: boolean
  ifaceToRouter: Map<string, string>
  ifaceToZone: Map<string, string>
  dhcpRelaySet: Set<string>
  variableMap?: VariableMap
}) {
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])

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
  })

  const columns = React.useMemo(
    () => buildAeColumns(isPanorama, ifaceToRouter, ifaceToZone, dhcpRelaySet, memberMap, variableMap),
    [isPanorama, ifaceToRouter, ifaceToZone, dhcpRelaySet, memberMap, variableMap]
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: aeInterfaces,
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
    <CategoryShell title="Aggregate Ethernet" count={rows.length} search={search} onSearch={setSearch}>
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
                {search ? `No results matching "${search}"` : "No Aggregate Ethernet interfaces found in this configuration."}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => {
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
                      ifaceToRouter={ifaceToRouter}
                      dhcpRelaySet={dhcpRelaySet}
                      showMemberPorts
                      variableMap={variableMap}
                    />
                  )}
                </React.Fragment>
              )
            })
          )}
        </TableBody>
      </Table>
    </CategoryShell>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Main view (tabbed wrapper) ───────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export function InterfacesView() {
  "use no memo"

  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()

  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  const { interfaces, zones, virtualRouters, logicalRouters, dhcpRelayInterfaces } = React.useMemo(() => {
    if (!activeConfig) return { interfaces: [], zones: [], virtualRouters: [], logicalRouters: [], dhcpRelayInterfaces: [] }
    const data = resolveNetworkData(activeConfig.parsedConfig, selectedScope)
    return {
      interfaces:          data.interfaces          ?? [],
      zones:               data.zones               ?? [],
      virtualRouters:      data.virtualRouters      ?? [],
      logicalRouters:      data.logicalRouters      ?? [],
      dhcpRelayInterfaces: data.dhcpRelayInterfaces ?? [],
    }
  }, [activeConfig, selectedScope])

  const ifaceToRouter = React.useMemo(
    () => buildIfaceToRouter([...virtualRouters, ...logicalRouters]),
    [virtualRouters, logicalRouters]
  )

  const ifaceToZone = React.useMemo(
    () => buildIfaceToZone(zones),
    [zones]
  )

  const dhcpRelaySet = React.useMemo(
    () => new Set(dhcpRelayInterfaces),
    [dhcpRelayInterfaces]
  )

  // Build a map of template variable names → resolved values for tooltip display
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

  const sharedProps = { interfaces, isPanorama, ifaceToRouter, ifaceToZone, dhcpRelaySet, variableMap }

  return (
    <Tabs defaultValue="ethernet" className="flex h-full flex-col min-h-0">
      <div className="shrink-0 border-b px-4">
        <TabsList variant="line">
          {INTERFACE_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <TabsContent value="ethernet" className="flex-1 min-h-0">
        <EthernetTab {...sharedProps} />
      </TabsContent>

      <TabsContent value="aggregate-ethernet" className="flex-1 min-h-0">
        <AggregateEthernetTab {...sharedProps} />
      </TabsContent>

      <TabsContent value="vlan" className="flex-1 min-h-0">
        <ComingSoonView title="VLAN Interfaces" />
      </TabsContent>

      <TabsContent value="loopback" className="flex-1 min-h-0">
        <ComingSoonView title="Loopback Interfaces" />
      </TabsContent>

      <TabsContent value="tunnel" className="flex-1 min-h-0">
        <ComingSoonView title="Tunnel Interfaces" />
      </TabsContent>

      <TabsContent value="sd-wan" className="flex-1 min-h-0">
        <ComingSoonView title="SD-WAN Interfaces" />
      </TabsContent>

      <TabsContent value="poe" className="flex-1 min-h-0">
        <ComingSoonView title="PoE Interfaces" />
      </TabsContent>

      <TabsContent value="cellular" className="flex-1 min-h-0">
        <ComingSoonView title="Cellular Interfaces" />
      </TabsContent>

      <TabsContent value="fail-open" className="flex-1 min-h-0">
        <ComingSoonView title="Fail Open Interfaces" />
      </TabsContent>
    </Tabs>
  )
}
