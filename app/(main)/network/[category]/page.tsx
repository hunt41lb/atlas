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
import type { PanwZone, PanwVirtualRouter, PanwStaticRoute } from "@/lib/panw-parser/types"

// ─── Zones view ───────────────────────────────────────────────────────────────

const zoneTypeColors: Record<string, string> = {
  layer3:       "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  layer2:       "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  "virtual-wire": "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  tap:          "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  tunnel:       "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  external:     "bg-muted text-muted-foreground border-border",
  unknown:      "bg-muted text-muted-foreground border-border",
}

function ZonesView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")

  const data = React.useMemo(() => {
    if (!activeConfig) return []
    return resolveNetworkData(activeConfig.parsedConfig, selectedScope).zones
  }, [activeConfig, selectedScope])

  const filtered = React.useMemo(() => {
    if (!search) return data
    const q = search.toLowerCase()
    return data.filter((z) =>
      z.name.toLowerCase().includes(q) ||
      z.type.toLowerCase().includes(q) ||
      z.interfaces.some((i) => i.toLowerCase().includes(q))
    )
  }, [data, search])

  return (
    <CategoryShell title="Zones" count={filtered.length} search={search} onSearch={setSearch}>
      <DataTable>
        <DataThead>
          <DataTh>Name</DataTh>
          <DataTh className="w-32">Type</DataTh>
          <DataTh>Interfaces</DataTh>
        </DataThead>
        <DataTbody>
          {filtered.length === 0
            ? <TableEmpty query={search} />
            : filtered.map((zone: PanwZone) => (
              <DataTr key={zone.name}>
                <DataTd>
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: zone.color !== "var(--muted-foreground)"
                          ? zone.color
                          : undefined
                      }}
                    />
                    <span className="font-medium">{zone.name}</span>
                  </div>
                </DataTd>
                <DataTd>
                  <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${zoneTypeColors[zone.type] ?? zoneTypeColors.unknown}`}>
                    {zone.type}
                  </span>
                </DataTd>
                <DataTd>
                  {zone.interfaces.length > 0
                    ? <MembersList members={zone.interfaces} max={4} />
                    : null
                  }
                </DataTd>
              </DataTr>
            ))}
        </DataTbody>
      </DataTable>
    </CategoryShell>
  )
}

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
  "interfaces":       { title: "Interfaces",          component: InterfacesView },
  "zones":            { title: "Zones",               component: ZonesView },
  "routing":          { title: "Routing",              component: RoutingView },
  "vlans":            { title: "VLANs" },
  "virtual-wires":    { title: "Virtual Wires" },
  "ipsec-tunnels":    { title: "IPSec Tunnels" },
  "gre-tunnels":      { title: "GRE Tunnels" },
  "dhcp":             { title: "DHCP" },
  "dns-proxy":        { title: "DNS Proxy" },
  "global-protect":   { title: "GlobalProtect" },
  "qos":              { title: "QoS" },
  "lldp":             { title: "LLDP" },
  "network-profiles": { title: "Network Profiles" },
  "sd-wan-interface": { title: "SD-WAN Interface Profile" },
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
