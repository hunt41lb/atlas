// @/app/(main)/network/_components/routers/routing/routing-view.tsx

"use client"

import * as React from "react"
import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import { resolveNetworkData } from "@/app/(main)/_lib/resolve-config-data"
import {
  CategoryShell,
  DataTable,
  DataThead,
  DataTh,
  DataTbody,
  DataTr,
  DataTd,
  TableEmpty,
  MonoValue,
  MembersList,
} from "@/app/(main)/_components/ui/category-shell"
import type { PanwVirtualRouter, PanwStaticRoute } from "@/lib/panw-parser/types"

export function RoutingView() {
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
