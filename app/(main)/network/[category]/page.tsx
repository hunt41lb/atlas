// @/app/(main)/network/[category]/page.tsx

"use client"

import * as React from "react"
import { notFound } from "next/navigation"
import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import { resolveNetworkData } from "@/app/(main)/_lib/resolve-config-data"
import { EmptyState } from "@/app/(main)/_components/ui/empty-state"
import {
  CategoryShell, ComingSoonView,
  DataTable, DataThead, DataTh, DataTbody, DataTr, DataTd, TableEmpty,
  MonoValue, MembersList,
} from "@/app/(main)/_components/ui/category-shell"
import { InterfacesView } from "@/app/(main)/network/_components/interfaces-view"
import type { PanwVirtualRouter, PanwStaticRoute } from "@/lib/panw-parser/types"

// Table Imports
import { ZonesTable } from "@/app/(main)/network/_components/zones-table"
import { VlansTable } from "../_components/vlans-table"
import { VirtualWiresTable } from "../_components/virtual-wires-table"
import { VirtualRoutersView } from "@/app/(main)/network/_components/virtual-routers-view"
import { LogicalRoutersView } from "@/app/(main)/network/_components/logical-routers-view"
import { BfdProfilesView } from "@/app/(main)/network/_components/routing-profiles/bfd/bfd-profiles-view"
import { BgpProfilesView } from "@/app/(main)/network/_components/routing-profiles/bgp/bgp-profiles-view"
import { FiltersView } from "@/app/(main)/network/_components/routing-profiles/filters/filters-view"
import { OspfProfilesView } from "@/app/(main)/network/_components/routing-profiles/ospf/ospf-profiles-view"
import { Ospfv3ProfilesView } from "@/app/(main)/network/_components/routing-profiles/ospfv3/ospfv3-profiles-view"
import { RipProfilesView } from "@/app/(main)/network/_components/routing-profiles/rip/rip-profiles-view"
import { MulticastProfilesView } from "@/app/(main)/network/_components/routing-profiles/multicast/multicast-profiles-view"


// ─── Routing view ─────────────────────────────────────────────────────────────

function RoutingView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")

  const data = React.useMemo(() => {
    if (!activeConfig) return []
    return resolveNetworkData(activeConfig.parsedConfig, selectedScope).virtualRouters
  }, [activeConfig, selectedScope])

  const filtered = React.useMemo(() => {
    if (!search) return data
    const q = search.toLowerCase()
    return data.filter((vr) =>
      vr.name.toLowerCase().includes(q) ||
      vr.interfaces.some((i) => i.toLowerCase().includes(q)) ||
      vr.staticRoutes.some((r) =>
        r.name.toLowerCase().includes(q) ||
        r.destination.includes(q) ||
        r.nexthop?.includes(q)
      )
    )
  }, [data, search])

  type RouteRow = { vr: PanwVirtualRouter; route: PanwStaticRoute | null; idx: number }
  const rows = React.useMemo((): RouteRow[] =>
    filtered.flatMap((vr: PanwVirtualRouter): RouteRow[] =>
      vr.staticRoutes.length > 0
        ? vr.staticRoutes.map((route, idx) => ({ vr, route, idx }))
        : [{ vr, route: null, idx: 0 }]
    )
  , [filtered])

  return (
    <CategoryShell title="Routing" count={filtered.length} search={search} onSearch={setSearch}>
      <DataTable>
        <DataThead>
          <DataTh className="w-36">Virtual Router</DataTh>
          <DataTh>Interfaces</DataTh>
          <DataTh className="w-36">Route Name</DataTh>
          <DataTh className="w-36">Destination</DataTh>
          <DataTh className="w-36">Next Hop</DataTh>
          <DataTh className="w-28">Interface</DataTh>
          <DataTh className="w-16 text-right">Metric</DataTh>
        </DataThead>
        <DataTbody>
          {rows.length === 0
            ? <TableEmpty query={search} />
            : rows.map(({ vr, route, idx }) => (
              <DataTr key={`${vr.name}-${idx}`}>
                <DataTd>
                  {idx === 0 && (
                    <span className="font-medium">{vr.name}</span>
                  )}
                </DataTd>
                <DataTd>
                  {idx === 0 && <MembersList members={vr.interfaces} max={3} />}
                </DataTd>
                {route ? (
                  <>
                    <DataTd><span className="text-xs">{route.name}</span></DataTd>
                    <DataTd><MonoValue>{route.destination}</MonoValue></DataTd>
                    <DataTd><MonoValue>{route.nexthop}</MonoValue></DataTd>
                    <DataTd><span className="text-xs text-muted-foreground">{route.interface}</span></DataTd>
                    <DataTd className="text-right tabular-nums text-xs text-muted-foreground">
                      {route.metric}
                    </DataTd>
                  </>
                ) : (
                  <td colSpan={5} className="px-3 py-2 align-middle">
                    <span className="text-xs text-muted-foreground italic">No static routes</span>
                  </td>
                )}
              </DataTr>
            ))}
        </DataTbody>
      </DataTable>
    </CategoryShell>
  )
}

// ─── Route map ────────────────────────────────────────────────────────────────

const NETWORK_VIEWS: Record<string, { title: string; component?: React.ComponentType; countKey?: string }> = {
  "interfaces":                   { title: "Interfaces",          component: InterfacesView },
  "zones":                        { title: "Zones",               component: ZonesTable },
  "vlans":                        { title: "VLANs",               component: VlansTable },
  "virtual-wires":                { title: "Virtual Wires",       component: VirtualWiresTable },
  "routing":                      { title: "Routing",             component: RoutingView },
  "virtual-routers":              { title: "Virtual Routers",     component: VirtualRoutersView },
  "logical-routers":              { title: "Logical Routers",     component: LogicalRoutersView },
  "routing-profiles":             { title: "Routing Profiles" },
  "routing-profiles-bgp":         { title: "BGP",                 component: BgpProfilesView },
  "routing-profiles-bfd":         { title: "BFD",                 component: BfdProfilesView },
  "routing-profiles-ospf":        { title: "OSPF",                component: OspfProfilesView },
  "routing-profiles-ospfv3":      { title: "OSPFv3",              component: Ospfv3ProfilesView },
  "routing-profiles-ripv2":       { title: "RIPv2",               component: RipProfilesView },
  "routing-profiles-filters":     { title: "Filters",             component: FiltersView },
  "routing-profiles-multicast":   { title: "Multicast",           component: MulticastProfilesView },
  "ipsec-tunnels":                { title: "IPSec Tunnels" },
  "gre-tunnels":                  { title: "GRE Tunnels" },
  "dhcp":                         { title: "DHCP" },
  "dns-proxy":                    { title: "DNS Proxy" },
  "global-protect":               { title: "GlobalProtect" },
  "qos":                          { title: "QoS" },
  "lldp":                         { title: "LLDP" },
  "network-profiles":             { title: "Network Profiles" },
  "sd-wan-interface":             { title: "SD-WAN Interface Profile" },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NetworkCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = React.use(params)
  const { activeConfig } = useConfig()

  const view = NETWORK_VIEWS[category]
  if (!view) notFound()

  if (!activeConfig) return <EmptyState />

  if (view.component) {
    const View = view.component
    return <View />
  }

  return <ComingSoonView title={view.title} />
}
