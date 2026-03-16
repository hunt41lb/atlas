// @/app/(main)/network/_components/virtual-routers-view.tsx
//
// Tabbed view for Virtual Routers — mirrors the Interfaces page pattern.
// Tabs: Router Settings (overview), Static Routes, Redistribution Profile, RIP
// Each detail tab shows data from all VRs with a VR filter dropdown.

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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { MembersList, MonoValue } from "@/app/(main)/_components/ui/category-shell"
import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import { resolveNetworkData } from "@/app/(main)/_lib/resolve-config-data"
import type { PanwVirtualRouter, PanwStaticRoute, PanwRedistProfile } from "@/lib/panw-parser/types"
import { RouterFilterDropdown } from "./router-shared/router-filter-dropdown"
import { RouterSettingsTab } from "./router-shared/router-settings-tab"

// ─── Tab definitions ─────────────────────────────────────────────────────────

const VR_TABS = [
  { value: "router-settings",       label: "Router Settings" },
  { value: "static-routes",         label: "Static Routes" },
  { value: "redistribution-profile", label: "Redistribution Profile" },
  { value: "rip",                   label: "RIP" },
  { value: "ospf",                  label: "OSPF" },
  { value: "ospfv3",                label: "OSPFv3" },
  { value: "bgp",                   label: "BGP" },
  { value: "multicast",             label: "Multicast" },
] as const

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Static Routes Tab ────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

type StaticRouteRow = PanwStaticRoute & {
  vrName: string
  protocol: "IPv4" | "IPv6"
}

const routeColumnHelper = createColumnHelper<StaticRouteRow>()

function buildRouteColumns(): ColumnDef<StaticRouteRow, unknown>[] {
  return [
    {
      id: "vrName",
      header: "Virtual Router",
      enableSorting: true,
      enableHiding: false,
      accessorFn: (row) => row.vrName,
      cell: ({ row }) => <span className="text-xs font-medium">{row.original.vrName}</span>,
    },

    routeColumnHelper.accessor("name", {
      header: "Name",
      enableHiding: false,
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }) as ColumnDef<StaticRouteRow, unknown>,

    routeColumnHelper.accessor("destination", {
      header: "Destination",
      cell: (info) => <MonoValue>{info.getValue()}</MonoValue>,
    }) as ColumnDef<StaticRouteRow, unknown>,

        {
      id: "interface",
      header: "Interface",
      enableSorting: true,
      accessorFn: (row) => row.interface ?? "",
      cell: ({ row }) => row.original.interface
        ? <MonoValue className="text-xs">{row.original.interface}</MonoValue>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    {
      id: "nexthopType",
      header: "Type",
      enableSorting: true,
      accessorFn: (row) => row.nexthopType,
      cell: ({ row }) => {
        const labels: Record<string, string> = {
          "ip-address": "IP Address",
          "ipv6-address": "IP Address",
          "next-vr": "Next VR",
          "next-lr": "Next LR",
          "fqdn": "FQDN",
          "discard": "Discard",
          "none": "None",
        }
        return <span className="text-xs">{labels[row.original.nexthopType] ?? row.original.nexthopType}</span>
      },
    },

    {
      id: "nexthop",
      header: "Value",
      enableSorting: true,
      accessorFn: (row) => row.nexthop ?? "",
      cell: ({ row }) => row.original.nexthop
        ? <MonoValue className="text-xs">{row.original.nexthop}</MonoValue>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    {
      id: "adminDistance",
      header: "Admin Distance",
      enableSorting: true,
      accessorFn: (row) => row.adminDistance ?? -1,
      cell: ({ row }) => row.original.adminDistance !== null
        ? <span className="tabular-nums text-xs font-medium">{row.original.adminDistance}</span>
        : <span className="text-muted-foreground text-xs">default</span>,
    },

    {
      id: "metric",
      header: "Metric",
      enableSorting: true,
      accessorFn: (row) => row.metric ?? 0,
      cell: ({ row }) => row.original.metric !== null
        ? <span className="tabular-nums text-xs font-medium">{row.original.metric}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    {
      id: "bfdProfile",
      header: "BFD",
      enableSorting: true,
      accessorFn: (row) => row.bfdProfile ?? "",
      cell: ({ row }) => row.original.bfdProfile
        ? <span className="text-xs">{row.original.bfdProfile}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    {
      id: "routeTable",
      header: "Route Table",
      enableSorting: true,
      accessorFn: (row) => row.routeTable ?? "",
      cell: ({ row }) => row.original.routeTable
        ? <span className="text-xs">{row.original.routeTable}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    {
      id: "protocol",
      header: "Protocol",
      enableSorting: true,
      accessorFn: (row) => row.protocol,
      cell: ({ row }) => (
        <Badge variant={row.original.protocol === "IPv4" ? "blue" : "violet"} size="sm">
          {row.original.protocol}
        </Badge>
      ),
    },

    {
      id: "pathMonitor",
      header: "Path Monitor",
      enableSorting: true,
      accessorFn: (row) => row.pathMonitorEnabled ? "yes" : "no",
      cell: ({ row }) => row.original.pathMonitorEnabled
        ? <Badge variant="green" size="sm">Enabled</Badge>
        : <span className="text-muted-foreground text-xs">—</span>,
    },
  ]
}

function StaticRoutesTab({
  routers,
}: {
  routers: PanwVirtualRouter[]
}) {
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "vrName", desc: false }])
  const [vrFilter, setVrFilter] = React.useState<string | null>(null)

  const allRoutes = React.useMemo((): StaticRouteRow[] => {
    const filtered = vrFilter ? routers.filter((vr) => vr.name === vrFilter) : routers
    return filtered.flatMap((vr) => [
      ...vr.staticRoutes.map((r) => ({ ...r, vrName: vr.name, protocol: "IPv4" as const })),
      ...vr.staticRoutesV6.map((r) => ({ ...r, vrName: vr.name, protocol: "IPv6" as const })),
    ])
  }, [routers, vrFilter])

  const columns = React.useMemo(() => buildRouteColumns(), [])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: allRoutes,
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
      title="Static Routes"
      search={search}
      onSearch={setSearch}
      actions={<RouterFilterDropdown routers={routers} selected={vrFilter} onSelect={setVrFilter} label="All Virtual Routers" />}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Redistribution Profile Tab ───────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

type RedistRow = PanwRedistProfile & { vrName: string }

const redistColumnHelper = createColumnHelper<RedistRow>()

function buildRedistColumns(): ColumnDef<RedistRow, unknown>[] {
  return [
    {
      id: "vrName",
      header: "Virtual Router",
      enableSorting: true,
      enableHiding: false,
      accessorFn: (row) => row.vrName,
      cell: ({ row }) => <span className="text-xs font-medium">{row.original.vrName}</span>,
    },

    redistColumnHelper.accessor("name", {
      header: "Name",
      enableHiding: false,
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }) as ColumnDef<RedistRow, unknown>,

    {
      id: "priority",
      header: "Priority",
      enableSorting: true,
      accessorFn: (row) => row.priority ?? 0,
      cell: ({ row }) => row.original.priority !== null
        ? <span className="tabular-nums text-xs font-medium">{row.original.priority}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    {
      id: "filterTypes",
      header: "Type",
      enableSorting: false,
      cell: ({ row }) => <MembersList members={row.original.filterTypes} max={3} />,
    },

    {
      id: "filterInterfaces",
      header: "Interface",
      enableSorting: false,
      cell: ({ row }) => <MembersList members={row.original.filterInterfaces} max={3} />,
    },

    {
      id: "filterDestinations",
      header: "Destination",
      enableSorting: false,
      cell: ({ row }) => <MembersList members={row.original.filterDestinations} max={3} />,
    },

    {
      id: "filterNexthops",
      header: "Next Hop",
      enableSorting: false,
      cell: ({ row }) => <MembersList members={row.original.filterNexthops} max={3} />,
    },

    {
      id: "action",
      header: "Action",
      enableSorting: true,
      accessorFn: (row) => row.action,
      cell: ({ row }) => (
        <Badge variant={row.original.action === "redist" ? "green" : "muted"} size="sm">
          {row.original.action}
        </Badge>
      ),
    },
  ]
}

function RedistProfileTab({
  routers,
}: {
  routers: PanwVirtualRouter[]
}) {
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "vrName", desc: false }])
  const [vrFilter, setVrFilter] = React.useState<string | null>(null)

  const allProfiles = React.useMemo((): RedistRow[] => {
    const filtered = vrFilter ? routers.filter((vr) => vr.name === vrFilter) : routers
    return filtered.flatMap((vr) =>
      vr.redistProfiles.map((p) => ({ ...p, vrName: vr.name }))
    )
  }, [routers, vrFilter])

  const columns = React.useMemo(() => buildRedistColumns(), [])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: allProfiles,
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
      title="Redistribution Profiles"
      search={search}
      onSearch={setSearch}
      actions={<RouterFilterDropdown routers={routers} selected={vrFilter} onSelect={setVrFilter} label="All Virtual Routers" />}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── RIP Tab ──────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

type RipInterfaceRow = {
  vrName: string
  vrEnabled: boolean
  vrGlobalBfd: string | null
  vrRejectDefault: boolean
  ifName: string
  enabled: boolean
  mode: string | null
  bfdProfile: string | null
  defaultRouteAdvertise: boolean
  defaultRouteMetric: number | null
  authProfile: string | null
}

function buildRipColumns(): ColumnDef<RipInterfaceRow, unknown>[] {
  return [
    {
      id: "vrName",
      header: "Virtual Router",
      enableSorting: true,
      enableHiding: false,
      accessorFn: (row) => row.vrName,
      cell: ({ row }) => <span className="text-xs font-medium">{row.original.vrName}</span>,
    },

    {
      id: "interface",
      header: "Interface",
      enableSorting: true,
      enableHiding: false,
      accessorFn: (row) => row.ifName,
      cell: ({ row }) => <MonoValue className="text-xs">{row.original.ifName}</MonoValue>,
    },

    {
      id: "enable",
      header: "Enable",
      enableSorting: true,
      accessorFn: (row) => row.enabled ? "yes" : "no",
      cell: ({ row }) => row.original.enabled
        ? <Badge variant="green" size="sm">Yes</Badge>
        : <Badge variant="muted" size="sm">No</Badge>,
    },

    {
      id: "defaultRouteAdvertise",
      header: "Advertise",
      enableSorting: true,
      accessorFn: (row) => row.defaultRouteAdvertise ? "yes" : "no",
      cell: ({ row }) => row.original.defaultRouteAdvertise
        ? <Badge variant="blue" size="sm">Yes</Badge>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    {
      id: "defaultRouteMetric",
      header: "Metric",
      enableSorting: true,
      accessorFn: (row) => row.defaultRouteMetric ?? 0,
      cell: ({ row }) => row.original.defaultRouteMetric !== null
        ? <span className="tabular-nums text-xs font-medium">{row.original.defaultRouteMetric}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    {
      id: "authProfile",
      header: "Auth Profile",
      enableSorting: true,
      accessorFn: (row) => row.authProfile ?? "",
      cell: ({ row }) => row.original.authProfile
        ? <span className="text-xs">{row.original.authProfile}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    {
      id: "bfd",
      header: "BFD",
      enableSorting: true,
      accessorFn: (row) => row.bfdProfile ?? "",
      cell: ({ row }) => row.original.bfdProfile
        ? <span className="text-xs">{row.original.bfdProfile}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    {
      id: "mode",
      header: "Mode",
      enableSorting: true,
      accessorFn: (row) => row.mode ?? "",
      cell: ({ row }) => row.original.mode
        ? <span className="text-xs">{row.original.mode}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },
  ]
}

function RipGlobalSummary({ routers, vrFilter }: { routers: PanwVirtualRouter[]; vrFilter: string | null }) {
  const filtered = vrFilter ? routers.filter((vr) => vr.name === vrFilter) : routers
  const ripRouters = filtered.filter((vr) => vr.rip.enabled)

  if (ripRouters.length === 0) return null

  return (
    <div className="flex flex-wrap gap-3 border-b px-4 py-2.5">
      {ripRouters.map((vr) => (
        <div key={vr.name} className="flex items-center gap-3 rounded-lg border bg-muted/20 px-3 py-2 text-xs">
          <span className="font-medium">{vr.name}</span>
          <span className="text-muted-foreground">|</span>
          <span>BFD: <span className="font-medium">{vr.rip.globalBfdProfile ?? "None"}</span></span>
          {vr.rip.rejectDefaultRoute && (
            <>
              <span className="text-muted-foreground">|</span>
              <Badge variant="amber" size="sm">Reject Default Route</Badge>
            </>
          )}
          {vr.rip.timers && (
            <>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground">
                Timers: {vr.rip.timers.intervalSeconds}s interval, {vr.rip.timers.updateIntervals} update, {vr.rip.timers.expireIntervals} expire, {vr.rip.timers.deleteIntervals} delete
              </span>
            </>
          )}
        </div>
      ))}
    </div>
  )
}

function RipTab({ routers }: { routers: PanwVirtualRouter[] }) {
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "vrName", desc: false }])
  const [vrFilter, setVrFilter] = React.useState<string | null>(null)

  const ripRouters = React.useMemo(
    () => routers.filter((vr) => vr.rip.enabled),
    [routers]
  )

  const allInterfaces = React.useMemo((): RipInterfaceRow[] => {
    const filtered = vrFilter ? ripRouters.filter((vr) => vr.name === vrFilter) : ripRouters
    return filtered.flatMap((vr) =>
      vr.rip.interfaces.map((iface) => ({
        vrName: vr.name,
        vrEnabled: vr.rip.enabled,
        vrGlobalBfd: vr.rip.globalBfdProfile,
        vrRejectDefault: vr.rip.rejectDefaultRoute,
        ifName: iface.name,
        enabled: iface.enabled,
        mode: iface.mode,
        bfdProfile: iface.bfdProfile,
        defaultRouteAdvertise: iface.defaultRouteAdvertise,
        defaultRouteMetric: iface.defaultRouteMetric,
        authProfile: iface.authProfile,
      }))
    )
  }, [ripRouters, vrFilter])

  const columns = React.useMemo(() => buildRipColumns(), [])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: allInterfaces,
    columns,
    state: { sorting, globalFilter: search },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: "includesString",
  })

  if (ripRouters.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
        <p className="text-sm font-medium">RIP</p>
        <p className="text-xs text-muted-foreground">No virtual routers have RIP enabled.</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col min-h-0">
      <RipGlobalSummary routers={routers} vrFilter={vrFilter} />
      <div className="flex-1 min-h-0">
        <DataTable
          table={table}
          title="RIP Interfaces"
          search={search}
          onSearch={setSearch}
          actions={<RouterFilterDropdown routers={ripRouters} selected={vrFilter} onSelect={setVrFilter} label="All Virtual Routers" />}
        />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── OSPF Tab ─────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

type OspfAreaRow = {
  vrName: string
  areaId: string
  areaType: string
  interfaceName: string
  enabled: boolean
  passive: boolean
  linkType: string | null
  metric: number | null
  priority: number | null
  helloInterval: number | null
  deadCounts: number | null
  bfdProfile: string | null
}

function buildOspfColumns(): ColumnDef<OspfAreaRow, unknown>[] {
  return [
    {
      id: "vrName",
      header: "Virtual Router",
      enableSorting: true,
      enableHiding: false,
      accessorFn: (row) => row.vrName,
      cell: ({ row }) => <span className="text-xs font-medium">{row.original.vrName}</span>,
    },
    {
      id: "areaId",
      header: "Area ID",
      enableSorting: true,
      accessorFn: (row) => row.areaId,
      cell: ({ row }) => <MonoValue className="text-xs">{row.original.areaId}</MonoValue>,
    },
    {
      id: "areaType",
      header: "Type",
      enableSorting: true,
      accessorFn: (row) => row.areaType,
      cell: ({ row }) => <span className="text-xs">{row.original.areaType}</span>,
    },
    {
      id: "interface",
      header: "Interface",
      enableSorting: true,
      enableHiding: false,
      accessorFn: (row) => row.interfaceName,
      cell: ({ row }) => <MonoValue className="text-xs">{row.original.interfaceName}</MonoValue>,
    },
    {
      id: "enabled",
      header: "Enable",
      enableSorting: true,
      accessorFn: (row) => row.enabled ? "yes" : "no",
      cell: ({ row }) => row.original.enabled
        ? <Badge variant="green" size="sm">Yes</Badge>
        : <Badge variant="muted" size="sm">No</Badge>,
    },
    {
      id: "passive",
      header: "Passive",
      enableSorting: true,
      accessorFn: (row) => row.passive ? "yes" : "no",
      cell: ({ row }) => row.original.passive
        ? <Badge variant="blue" size="sm">Yes</Badge>
        : <span className="text-muted-foreground text-xs">—</span>,
    },
    {
      id: "linkType",
      header: "Link Type",
      enableSorting: true,
      accessorFn: (row) => row.linkType ?? "",
      cell: ({ row }) => row.original.linkType
        ? <span className="text-xs">{row.original.linkType}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },
    {
      id: "metric",
      header: "Metric",
      enableSorting: true,
      accessorFn: (row) => row.metric ?? 0,
      cell: ({ row }) => row.original.metric !== null
        ? <span className="tabular-nums text-xs font-medium">{row.original.metric}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },
    {
      id: "priority",
      header: "Priority",
      enableSorting: true,
      accessorFn: (row) => row.priority ?? 0,
      cell: ({ row }) => row.original.priority !== null
        ? <span className="tabular-nums text-xs font-medium">{row.original.priority}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },
    {
      id: "helloInterval",
      header: "Hello",
      enableSorting: true,
      accessorFn: (row) => row.helloInterval ?? 0,
      cell: ({ row }) => row.original.helloInterval !== null
        ? <span className="tabular-nums text-xs">{row.original.helloInterval}s</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },
    {
      id: "deadCounts",
      header: "Dead Counts",
      enableSorting: true,
      accessorFn: (row) => row.deadCounts ?? 0,
      cell: ({ row }) => row.original.deadCounts !== null
        ? <span className="tabular-nums text-xs">{row.original.deadCounts}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },
    {
      id: "bfd",
      header: "BFD",
      enableSorting: true,
      accessorFn: (row) => row.bfdProfile ?? "",
      cell: ({ row }) => row.original.bfdProfile
        ? <span className="text-xs">{row.original.bfdProfile}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },
  ]
}

function OspfGlobalSummary({ routers, vrFilter }: { routers: PanwVirtualRouter[]; vrFilter: string | null }) {
  const filtered = vrFilter ? routers.filter((vr) => vr.name === vrFilter) : routers
  const ospfRouters = filtered.filter((vr) => vr.ospf.enabled)

  if (ospfRouters.length === 0) return null

  return (
    <div className="flex flex-wrap gap-3 border-b px-4 py-2.5">
      {ospfRouters.map((vr) => (
        <div key={vr.name} className="flex items-center gap-3 rounded-lg border bg-muted/20 px-3 py-2 text-xs">
          <span className="font-medium">{vr.name}</span>
          <span className="text-muted-foreground">|</span>
          <span>Router ID: <span className="font-medium font-mono">{vr.ospf.routerId ?? "—"}</span></span>
          <span className="text-muted-foreground">|</span>
          <span>BFD: <span className="font-medium">{vr.ospf.globalBfdProfile ?? "None"}</span></span>
          {vr.ospf.rejectDefaultRoute && (
            <>
              <span className="text-muted-foreground">|</span>
              <Badge variant="amber" size="sm">Reject Default Route</Badge>
            </>
          )}
        </div>
      ))}
    </div>
  )
}

function OspfTab({ routers }: { routers: PanwVirtualRouter[] }) {
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "vrName", desc: false }])
  const [vrFilter, setVrFilter] = React.useState<string | null>(null)

  const ospfRouters = React.useMemo(
    () => routers.filter((vr) => vr.ospf.enabled),
    [routers]
  )

  const allRows = React.useMemo((): OspfAreaRow[] => {
    const filtered = vrFilter ? ospfRouters.filter((vr) => vr.name === vrFilter) : ospfRouters
    return filtered.flatMap((vr) =>
      vr.ospf.areas.flatMap((area) =>
        area.interfaces.map((iface) => ({
          vrName: vr.name,
          areaId: area.id,
          areaType: area.type,
          interfaceName: iface.name,
          enabled: iface.enabled,
          passive: iface.passive,
          linkType: iface.linkType,
          metric: iface.metric,
          priority: iface.priority,
          helloInterval: iface.helloInterval,
          deadCounts: iface.deadCounts,
          bfdProfile: iface.bfdProfile,
        }))
      )
    )
  }, [ospfRouters, vrFilter])

  const columns = React.useMemo(() => buildOspfColumns(), [])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: allRows,
    columns,
    state: { sorting, globalFilter: search },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: "includesString",
  })

  if (ospfRouters.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
        <p className="text-sm font-medium">OSPF</p>
        <p className="text-xs text-muted-foreground">No virtual routers have OSPF enabled.</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col min-h-0">
      <OspfGlobalSummary routers={routers} vrFilter={vrFilter} />
      <div className="flex-1 min-h-0">
        <DataTable
          table={table}
          title="OSPF Areas & Interfaces"
          search={search}
          onSearch={setSearch}
          actions={<RouterFilterDropdown routers={ospfRouters} selected={vrFilter} onSelect={setVrFilter} label="All Virtual Routers" />}
        />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── OSPFv3 Tab ───────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

type Ospfv3AreaRow = {
  vrName: string
  areaId: string
  areaType: string
  interfaceName: string
  enabled: boolean
  passive: boolean
  instanceId: number | null
  linkType: string | null
  metric: number | null
  priority: number | null
  helloInterval: number | null
  deadCounts: number | null
  bfdProfile: string | null
}

function buildOspfv3Columns(): ColumnDef<Ospfv3AreaRow, unknown>[] {
  return [
    {
      id: "vrName",
      header: "Virtual Router",
      enableSorting: true,
      enableHiding: false,
      accessorFn: (row) => row.vrName,
      cell: ({ row }) => <span className="text-xs font-medium">{row.original.vrName}</span>,
    },
    {
      id: "areaId",
      header: "Area ID",
      enableSorting: true,
      accessorFn: (row) => row.areaId,
      cell: ({ row }) => <MonoValue className="text-xs">{row.original.areaId}</MonoValue>,
    },
    {
      id: "areaType",
      header: "Type",
      enableSorting: true,
      accessorFn: (row) => row.areaType,
      cell: ({ row }) => <span className="text-xs">{row.original.areaType}</span>,
    },
    {
      id: "interface",
      header: "Interface",
      enableSorting: true,
      enableHiding: false,
      accessorFn: (row) => row.interfaceName,
      cell: ({ row }) => <MonoValue className="text-xs">{row.original.interfaceName}</MonoValue>,
    },
    {
      id: "enabled",
      header: "Enable",
      enableSorting: true,
      accessorFn: (row) => row.enabled ? "yes" : "no",
      cell: ({ row }) => row.original.enabled
        ? <Badge variant="green" size="sm">Yes</Badge>
        : <Badge variant="muted" size="sm">No</Badge>,
    },
    {
      id: "instanceId",
      header: "Instance ID",
      enableSorting: true,
      accessorFn: (row) => row.instanceId ?? -1,
      cell: ({ row }) => row.original.instanceId !== null
        ? <span className="tabular-nums text-xs font-medium">{row.original.instanceId}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },
    {
      id: "passive",
      header: "Passive",
      enableSorting: true,
      accessorFn: (row) => row.passive ? "yes" : "no",
      cell: ({ row }) => row.original.passive
        ? <Badge variant="blue" size="sm">Yes</Badge>
        : <span className="text-muted-foreground text-xs">—</span>,
    },
    {
      id: "linkType",
      header: "Link Type",
      enableSorting: true,
      accessorFn: (row) => row.linkType ?? "",
      cell: ({ row }) => row.original.linkType
        ? <span className="text-xs">{row.original.linkType}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },
    {
      id: "metric",
      header: "Metric",
      enableSorting: true,
      accessorFn: (row) => row.metric ?? 0,
      cell: ({ row }) => row.original.metric !== null
        ? <span className="tabular-nums text-xs font-medium">{row.original.metric}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },
    {
      id: "priority",
      header: "Priority",
      enableSorting: true,
      accessorFn: (row) => row.priority ?? 0,
      cell: ({ row }) => row.original.priority !== null
        ? <span className="tabular-nums text-xs font-medium">{row.original.priority}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },
    {
      id: "helloInterval",
      header: "Hello",
      enableSorting: true,
      accessorFn: (row) => row.helloInterval ?? 0,
      cell: ({ row }) => row.original.helloInterval !== null
        ? <span className="tabular-nums text-xs">{row.original.helloInterval}s</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },
    {
      id: "deadCounts",
      header: "Dead Counts",
      enableSorting: true,
      accessorFn: (row) => row.deadCounts ?? 0,
      cell: ({ row }) => row.original.deadCounts !== null
        ? <span className="tabular-nums text-xs">{row.original.deadCounts}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },
    {
      id: "bfd",
      header: "BFD",
      enableSorting: true,
      accessorFn: (row) => row.bfdProfile ?? "",
      cell: ({ row }) => row.original.bfdProfile
        ? <span className="text-xs">{row.original.bfdProfile}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },
  ]
}

function Ospfv3GlobalSummary({ routers, vrFilter }: { routers: PanwVirtualRouter[]; vrFilter: string | null }) {
  const filtered = vrFilter ? routers.filter((vr) => vr.name === vrFilter) : routers
  const ospfv3Routers = filtered.filter((vr) => vr.ospfv3.enabled)

  if (ospfv3Routers.length === 0) return null

  return (
    <div className="flex flex-wrap gap-3 border-b px-4 py-2.5">
      {ospfv3Routers.map((vr) => (
        <div key={vr.name} className="flex items-center gap-3 rounded-lg border bg-muted/20 px-3 py-2 text-xs">
          <span className="font-medium">{vr.name}</span>
          <span className="text-muted-foreground">|</span>
          <span>Router ID: <span className="font-medium font-mono">{vr.ospfv3.routerId ?? "—"}</span></span>
          <span className="text-muted-foreground">|</span>
          <span>BFD: <span className="font-medium">{vr.ospfv3.globalBfdProfile ?? "None"}</span></span>
          {vr.ospfv3.rejectDefaultRoute && (
            <>
              <span className="text-muted-foreground">|</span>
              <Badge variant="amber" size="sm">Reject Default Route</Badge>
            </>
          )}
        </div>
      ))}
    </div>
  )
}

function Ospfv3Tab({ routers }: { routers: PanwVirtualRouter[] }) {
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "vrName", desc: false }])
  const [vrFilter, setVrFilter] = React.useState<string | null>(null)

  const ospfv3Routers = React.useMemo(
    () => routers.filter((vr) => vr.ospfv3.enabled),
    [routers]
  )

  const allRows = React.useMemo((): Ospfv3AreaRow[] => {
    const filtered = vrFilter ? ospfv3Routers.filter((vr) => vr.name === vrFilter) : ospfv3Routers
    return filtered.flatMap((vr) =>
      vr.ospfv3.areas.flatMap((area) =>
        area.interfaces.map((iface) => ({
          vrName: vr.name,
          areaId: area.id,
          areaType: area.type,
          interfaceName: iface.name,
          enabled: iface.enabled,
          passive: iface.passive,
          instanceId: iface.instanceId,
          linkType: iface.linkType,
          metric: iface.metric,
          priority: iface.priority,
          helloInterval: iface.helloInterval,
          deadCounts: iface.deadCounts,
          bfdProfile: iface.bfdProfile,
        }))
      )
    )
  }, [ospfv3Routers, vrFilter])

  const columns = React.useMemo(() => buildOspfv3Columns(), [])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: allRows,
    columns,
    state: { sorting, globalFilter: search },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: "includesString",
  })

  if (ospfv3Routers.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
        <p className="text-sm font-medium">OSPFv3</p>
        <p className="text-xs text-muted-foreground">No virtual routers have OSPFv3 enabled.</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col min-h-0">
      <Ospfv3GlobalSummary routers={routers} vrFilter={vrFilter} />
      <div className="flex-1 min-h-0">
        <DataTable
          table={table}
          title="OSPFv3 Areas & Interfaces"
          search={search}
          onSearch={setSearch}
          actions={<RouterFilterDropdown routers={ospfv3Routers} selected={vrFilter} onSelect={setVrFilter} label="All Virtual Routers" />}
        />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── BGP Tab ──────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

type BgpPeerRow = {
  vrName: string
  peerGroupName: string
  peerGroupType: string | null
  peerGroupEnabled: boolean
  peerName: string
  enabled: boolean
  peerAs: string | null
  peerAddress: string | null
  localInterface: string | null
  bfdProfile: string | null
  maxPrefixes: number | null
}

function buildBgpColumns(): ColumnDef<BgpPeerRow, unknown>[] {
  return [
    {
      id: "vrName",
      header: "Virtual Router",
      enableSorting: true,
      enableHiding: false,
      accessorFn: (row) => row.vrName,
      cell: ({ row }) => <span className="text-xs font-medium">{row.original.vrName}</span>,
    },
    {
      id: "peerGroup",
      header: "Peer Group",
      enableSorting: true,
      accessorFn: (row) => row.peerGroupName,
      cell: ({ row }) => <span className="text-xs font-medium">{row.original.peerGroupName}</span>,
    },
    {
      id: "peerGroupType",
      header: "Type",
      enableSorting: true,
      accessorFn: (row) => row.peerGroupType ?? "",
      cell: ({ row }) => row.original.peerGroupType
        ? <Badge variant={row.original.peerGroupType === "EBGP" ? "blue" : "violet"} size="sm">{row.original.peerGroupType}</Badge>
        : <span className="text-muted-foreground text-xs">—</span>,
    },
    {
      id: "peerName",
      header: "Peer Name",
      enableSorting: true,
      enableHiding: false,
      accessorFn: (row) => row.peerName,
      cell: ({ row }) => <span className="font-medium">{row.original.peerName}</span>,
    },
    {
      id: "enabled",
      header: "Enable",
      enableSorting: true,
      accessorFn: (row) => row.enabled ? "yes" : "no",
      cell: ({ row }) => row.original.enabled
        ? <Badge variant="green" size="sm">Yes</Badge>
        : <Badge variant="muted" size="sm">No</Badge>,
    },
    {
      id: "peerAs",
      header: "Peer AS",
      enableSorting: true,
      accessorFn: (row) => row.peerAs ?? "",
      cell: ({ row }) => row.original.peerAs
        ? <span className="tabular-nums text-xs font-medium">{row.original.peerAs}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },
    {
      id: "peerAddress",
      header: "Peer Address",
      enableSorting: true,
      accessorFn: (row) => row.peerAddress ?? "",
      cell: ({ row }) => row.original.peerAddress
        ? <MonoValue className="text-xs">{row.original.peerAddress}</MonoValue>
        : <span className="text-muted-foreground text-xs">—</span>,
    },
    {
      id: "localInterface",
      header: "Local Interface",
      enableSorting: true,
      accessorFn: (row) => row.localInterface ?? "",
      cell: ({ row }) => row.original.localInterface
        ? <MonoValue className="text-xs">{row.original.localInterface}</MonoValue>
        : <span className="text-muted-foreground text-xs">—</span>,
    },
    {
      id: "bfd",
      header: "BFD",
      enableSorting: true,
      accessorFn: (row) => row.bfdProfile ?? "",
      cell: ({ row }) => row.original.bfdProfile
        ? <span className="text-xs">{row.original.bfdProfile}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },
    {
      id: "maxPrefixes",
      header: "Max Prefixes",
      enableSorting: true,
      accessorFn: (row) => row.maxPrefixes ?? 0,
      cell: ({ row }) => row.original.maxPrefixes !== null
        ? <span className="tabular-nums text-xs font-medium">{row.original.maxPrefixes.toLocaleString()}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },
  ]
}

function BgpGlobalSummary({ routers, vrFilter }: { routers: PanwVirtualRouter[]; vrFilter: string | null }) {
  const filtered = vrFilter ? routers.filter((vr) => vr.name === vrFilter) : routers
  const bgpRouters = filtered.filter((vr) => vr.bgp.enabled)

  if (bgpRouters.length === 0) return null

  return (
    <div className="flex flex-wrap gap-3 border-b px-4 py-2.5">
      {bgpRouters.map((vr) => (
        <div key={vr.name} className="flex items-center gap-3 rounded-lg border bg-muted/20 px-3 py-2 text-xs">
          <span className="font-medium">{vr.name}</span>
          <span className="text-muted-foreground">|</span>
          <span>Router ID: <span className="font-medium font-mono">{vr.bgp.routerId ?? "—"}</span></span>
          <span className="text-muted-foreground">|</span>
          <span>Local AS: <span className="font-medium">{vr.bgp.localAs ?? "—"}</span></span>
          {vr.bgp.installRoute && (
            <>
              <span className="text-muted-foreground">|</span>
              <Badge variant="green" size="sm">Install Route</Badge>
            </>
          )}
          {vr.bgp.gracefulRestartEnabled && (
            <>
              <span className="text-muted-foreground">|</span>
              <Badge variant="blue" size="sm">Graceful Restart</Badge>
            </>
          )}
          {vr.bgp.rejectDefaultRoute && (
            <>
              <span className="text-muted-foreground">|</span>
              <Badge variant="amber" size="sm">Reject Default Route</Badge>
            </>
          )}
        </div>
      ))}
    </div>
  )
}

function BgpTab({ routers }: { routers: PanwVirtualRouter[] }) {
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "vrName", desc: false }])
  const [vrFilter, setVrFilter] = React.useState<string | null>(null)

  const bgpRouters = React.useMemo(
    () => routers.filter((vr) => vr.bgp.enabled),
    [routers]
  )

  const allRows = React.useMemo((): BgpPeerRow[] => {
    const filtered = vrFilter ? bgpRouters.filter((vr) => vr.name === vrFilter) : bgpRouters
    return filtered.flatMap((vr) =>
      vr.bgp.peerGroups.flatMap((pg) =>
        pg.peers.map((peer) => ({
          vrName: vr.name,
          peerGroupName: pg.name,
          peerGroupType: pg.type,
          peerGroupEnabled: pg.enabled,
          peerName: peer.name,
          enabled: peer.enabled,
          peerAs: peer.peerAs,
          peerAddress: peer.peerAddress,
          localInterface: peer.localInterface,
          bfdProfile: peer.bfdProfile,
          maxPrefixes: peer.maxPrefixes,
        }))
      )
    )
  }, [bgpRouters, vrFilter])

  const columns = React.useMemo(() => buildBgpColumns(), [])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: allRows,
    columns,
    state: { sorting, globalFilter: search },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: "includesString",
  })

  if (bgpRouters.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
        <p className="text-sm font-medium">BGP</p>
        <p className="text-xs text-muted-foreground">No virtual routers have BGP enabled.</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col min-h-0">
      <BgpGlobalSummary routers={routers} vrFilter={vrFilter} />
      <div className="flex-1 min-h-0">
        <DataTable
          table={table}
          title="BGP Peer Groups & Peers"
          search={search}
          onSearch={setSearch}
          actions={<RouterFilterDropdown routers={bgpRouters} selected={vrFilter} onSelect={setVrFilter} label="All Virtual Routers" />}
        />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Multicast Tab ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

type MulticastRow = {
  vrName: string
  groupName: string
  description: string | null
  interfaces: string[]
  pimEnabled: boolean
  igmpEnabled: boolean
  igmpVersion: string | null
}

function buildMulticastColumns(): ColumnDef<MulticastRow, unknown>[] {
  return [
    {
      id: "vrName",
      header: "Virtual Router",
      enableSorting: true,
      enableHiding: false,
      accessorFn: (row) => row.vrName,
      cell: ({ row }) => <span className="text-xs font-medium">{row.original.vrName}</span>,
    },
    {
      id: "groupName",
      header: "Name",
      enableSorting: true,
      enableHiding: false,
      accessorFn: (row) => row.groupName,
      cell: ({ row }) => <span className="font-medium">{row.original.groupName}</span>,
    },
    {
      id: "interfaces",
      header: "Interfaces",
      enableSorting: false,
      cell: ({ row }) => <MembersList members={row.original.interfaces} max={4} />,
    },
    {
      id: "pim",
      header: "PIM",
      enableSorting: true,
      accessorFn: (row) => row.pimEnabled ? "yes" : "no",
      cell: ({ row }) => row.original.pimEnabled
        ? <Badge variant="green" size="sm">Enabled</Badge>
        : <span className="text-muted-foreground text-xs">—</span>,
    },
    {
      id: "igmp",
      header: "IGMP",
      enableSorting: true,
      accessorFn: (row) => row.igmpEnabled ? "yes" : "no",
      cell: ({ row }) => row.original.igmpEnabled
        ? <Badge variant="green" size="sm">Enabled</Badge>
        : <span className="text-muted-foreground text-xs">—</span>,
    },
    {
      id: "igmpVersion",
      header: "IGMP Version",
      enableSorting: true,
      accessorFn: (row) => row.igmpVersion ?? "",
      cell: ({ row }) => row.original.igmpVersion
        ? <span className="tabular-nums text-xs font-medium">v{row.original.igmpVersion}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },
    {
      id: "description",
      header: "Description",
      enableSorting: true,
      accessorFn: (row) => row.description ?? "",
      cell: ({ row }) => row.original.description
        ? <span className="text-xs text-muted-foreground">{row.original.description}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },
  ]
}

function MulticastTab({ routers }: { routers: PanwVirtualRouter[] }) {
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "vrName", desc: false }])
  const [vrFilter, setVrFilter] = React.useState<string | null>(null)

  const mcRouters = React.useMemo(
    () => routers.filter((vr) => vr.multicast.enabled),
    [routers]
  )

  const allRows = React.useMemo((): MulticastRow[] => {
    const filtered = vrFilter ? mcRouters.filter((vr) => vr.name === vrFilter) : mcRouters
    return filtered.flatMap((vr) =>
      vr.multicast.interfaceGroups.map((ig) => ({
        vrName: vr.name,
        groupName: ig.name,
        description: ig.description,
        interfaces: ig.interfaces,
        pimEnabled: ig.pimEnabled,
        igmpEnabled: ig.igmpEnabled,
        igmpVersion: ig.igmpVersion,
      }))
    )
  }, [mcRouters, vrFilter])

  const columns = React.useMemo(() => buildMulticastColumns(), [])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: allRows,
    columns,
    state: { sorting, globalFilter: search },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: "includesString",
  })

  if (mcRouters.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
        <p className="text-sm font-medium">Multicast</p>
        <p className="text-xs text-muted-foreground">No virtual routers have multicast enabled.</p>
      </div>
    )
  }

  return (
    <DataTable
      table={table}
      title="Multicast Interface Groups"
      search={search}
      onSearch={setSearch}
      actions={<RouterFilterDropdown routers={mcRouters} selected={vrFilter} onSelect={setVrFilter} label="All Virtual Routers" />}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Main view (tabbed wrapper) ───────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export function VirtualRoutersView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()

  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  const routers = React.useMemo(() => {
    if (!activeConfig) return []
    return resolveNetworkData(activeConfig.parsedConfig, selectedScope).virtualRouters
  }, [activeConfig, selectedScope])

  return (
    <Tabs defaultValue="router-settings" className="flex h-full flex-col min-h-0">
      <div className="shrink-0 border-b px-4">
        <TabsList variant="line">
          {VR_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <TabsContent value="router-settings" className="flex-1 min-h-0">
        <RouterSettingsTab routers={routers} isPanorama={isPanorama} />
      </TabsContent>

      <TabsContent value="static-routes" className="flex-1 min-h-0">
        <StaticRoutesTab routers={routers} />
      </TabsContent>

      <TabsContent value="redistribution-profile" className="flex-1 min-h-0">
        <RedistProfileTab routers={routers} />
      </TabsContent>

      <TabsContent value="rip" className="flex-1 min-h-0">
        <RipTab routers={routers} />
      </TabsContent>

      <TabsContent value="ospf" className="flex-1 min-h-0">
        <OspfTab routers={routers} />
      </TabsContent>

      <TabsContent value="ospfv3" className="flex-1 min-h-0">
        <Ospfv3Tab routers={routers} />
      </TabsContent>

      <TabsContent value="bgp" className="flex-1 min-h-0">
        <BgpTab routers={routers} />
      </TabsContent>

      <TabsContent value="multicast" className="flex-1 min-h-0">
        <MulticastTab routers={routers} />
      </TabsContent>
    </Tabs>
  )
}
