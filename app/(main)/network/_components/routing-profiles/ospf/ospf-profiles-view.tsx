// @/app/(main)/network/_components/routing-profiles/ospf/ospf-profiles-view.tsx
//
// OSPF Routing Profiles page — SPF Timer, Auth, IF Timer, Redistribution.

"use client"

import * as React from "react"
import {
  createColumnHelper,
  type ColumnDef,
} from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Accordion } from "@/components/ui/accordion"

import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import { resolveNetworkData } from "@/app/(main)/_lib/resolve-config-data"

import type {
  PanwOspfSpfTimerProfile,
  PanwOspfAuthProfile,
  PanwOspfIfTimerProfile,
  PanwOspfRedistProfile,
} from "@/lib/panw-parser/routing-profiles"

import { ProfileSection, useSectionTable } from "../_shared"

// ─── Column builders ──────────────────────────────────────────────────────────

const spfHelper = createColumnHelper<PanwOspfSpfTimerProfile>()
const authHelper = createColumnHelper<PanwOspfAuthProfile>()
const ifHelper = createColumnHelper<PanwOspfIfTimerProfile>()
const redistHelper = createColumnHelper<PanwOspfRedistProfile>()

export function buildSpfTimerColumns(isPanorama: boolean): ColumnDef<PanwOspfSpfTimerProfile, unknown>[] {
  return [
    spfHelper.accessor("name", {
      header: "Name",
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }) as ColumnDef<PanwOspfSpfTimerProfile, unknown>,
    { id: "lsaInterval", header: "LSA Interval", accessorFn: (r) => r.lsaInterval,
      cell: ({ row }) => <span className="tabular-nums text-xs">{row.original.lsaInterval ?? "—"}</span> },
    { id: "spfDelay", header: "SPF Calculation Delay", accessorFn: (r) => r.spfCalculationDelay,
      cell: ({ row }) => <span className="tabular-nums text-xs">{row.original.spfCalculationDelay ?? "—"}</span> },
    { id: "initHold", header: "Initial Hold Time", accessorFn: (r) => r.initialHoldTime,
      cell: ({ row }) => <span className="tabular-nums text-xs">{row.original.initialHoldTime ?? "—"}</span> },
    { id: "maxHold", header: "Max Hold Time", accessorFn: (r) => r.maxHoldTime,
      cell: ({ row }) => <span className="tabular-nums text-xs">{row.original.maxHoldTime ?? "—"}</span> },
    ...(isPanorama ? [{ id: "template", header: "Template", accessorFn: (r: PanwOspfSpfTimerProfile) => r.templateName ?? "",
      cell: ({ row }: { row: { original: PanwOspfSpfTimerProfile } }) => row.original.templateName
        ? <span className="text-xs">{row.original.templateName}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    } as ColumnDef<PanwOspfSpfTimerProfile, unknown>] : []),
  ]
}

function buildAuthColumns(isPanorama: boolean): ColumnDef<PanwOspfAuthProfile, unknown>[] {
  return [
    authHelper.accessor("name", {
      header: "Name",
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }) as ColumnDef<PanwOspfAuthProfile, unknown>,
    { id: "password", header: "Password",
      cell: ({ row }) => row.original.passwordConfigured
        ? <Badge variant="outline" size="sm">Configured</Badge>
        : <span className="text-muted-foreground text-xs">—</span> },
    ...(isPanorama ? [{ id: "template", header: "Template", accessorFn: (r: PanwOspfAuthProfile) => r.templateName ?? "",
      cell: ({ row }: { row: { original: PanwOspfAuthProfile } }) => row.original.templateName
        ? <span className="text-xs">{row.original.templateName}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    } as ColumnDef<PanwOspfAuthProfile, unknown>] : []),
  ]
}

export function buildIfTimerColumns(isPanorama: boolean): ColumnDef<PanwOspfIfTimerProfile, unknown>[] {
  return [
    ifHelper.accessor("name", {
      header: "Name",
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }) as ColumnDef<PanwOspfIfTimerProfile, unknown>,
    { id: "hello", header: "Hello Interval", accessorFn: (r) => r.helloInterval,
      cell: ({ row }) => <span className="tabular-nums text-xs">{row.original.helloInterval ?? "—"}</span> },
    { id: "dead", header: "Dead Counts", accessorFn: (r) => r.deadCounts,
      cell: ({ row }) => <span className="tabular-nums text-xs">{row.original.deadCounts ?? "—"}</span> },
    { id: "retransmit", header: "Retransmit Interval", accessorFn: (r) => r.retransmitInterval,
      cell: ({ row }) => <span className="tabular-nums text-xs">{row.original.retransmitInterval ?? "—"}</span> },
    { id: "transit", header: "Transit Delay", accessorFn: (r) => r.transitDelay,
      cell: ({ row }) => <span className="tabular-nums text-xs">{row.original.transitDelay ?? "—"}</span> },
    { id: "gr", header: "GR Delay", accessorFn: (r) => r.grDelay,
      cell: ({ row }) => <span className="tabular-nums text-xs">{row.original.grDelay ?? "—"}</span> },
    ...(isPanorama ? [{ id: "template", header: "Template", accessorFn: (r: PanwOspfIfTimerProfile) => r.templateName ?? "",
      cell: ({ row }: { row: { original: PanwOspfIfTimerProfile } }) => row.original.templateName
        ? <span className="text-xs">{row.original.templateName}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    } as ColumnDef<PanwOspfIfTimerProfile, unknown>] : []),
  ]
}

export function buildRedistColumns(isPanorama: boolean): ColumnDef<PanwOspfRedistProfile, unknown>[] {
  return [
    redistHelper.accessor("name", {
      header: "Name",
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }) as ColumnDef<PanwOspfRedistProfile, unknown>,
    { id: "sources", header: "Sources",
      cell: ({ row }) => {
        const items = row.original.entries.filter(e => e.enabled).map(e => e.protocol)
        if (items.length === 0) return <span className="text-muted-foreground text-xs">None</span>
        return <div className="flex flex-wrap gap-1">{items.map(p =>
          <Badge key={p} variant="outline" size="sm">{p}</Badge>
        )}</div>
      } },
    { id: "routeMaps", header: "Route Maps",
      cell: ({ row }) => {
        const maps = row.original.entries.filter(e => e.routeMap).map(e => `${e.protocol}: ${e.routeMap}`)
        if (maps.length === 0) return <span className="text-muted-foreground text-xs">—</span>
        return <div className="flex flex-wrap gap-1">{maps.map(m =>
          <Badge key={m} variant="outline" size="sm">{m}</Badge>
        )}</div>
      } },
    { id: "defaultRoute", header: "Default Route",
      cell: ({ row }) => {
        const dr = row.original.defaultRoute
        if (!dr?.enabled) return <span className="text-muted-foreground text-xs">—</span>
        return <Badge variant="blue" size="sm">{dr.always ? "Always" : "Enabled"}</Badge>
      } },
    ...(isPanorama ? [{ id: "template", header: "Template", accessorFn: (r: PanwOspfRedistProfile) => r.templateName ?? "",
      cell: ({ row }: { row: { original: PanwOspfRedistProfile } }) => row.original.templateName
        ? <span className="text-xs">{row.original.templateName}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    } as ColumnDef<PanwOspfRedistProfile, unknown>] : []),
  ]
}

// ─── Section keys ─────────────────────────────────────────────────────────────

const SECTIONS = { spfTimer: "spfTimer", auth: "auth", ifTimer: "ifTimer", redistribution: "redistribution" } as const
const ALL = Object.values(SECTIONS)

// ─── Component ────────────────────────────────────────────────────────────────

export function OspfProfilesView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  const data = React.useMemo(() => {
    if (!activeConfig) return null
    return resolveNetworkData(activeConfig.parsedConfig, selectedScope).ospfRoutingProfiles
  }, [activeConfig, selectedScope])

  const spfCols = React.useMemo(() => buildSpfTimerColumns(isPanorama), [isPanorama])
  const authCols = React.useMemo(() => buildAuthColumns(isPanorama), [isPanorama])
  const ifCols = React.useMemo(() => buildIfTimerColumns(isPanorama), [isPanorama])
  const redistCols = React.useMemo(() => buildRedistColumns(isPanorama), [isPanorama])

  const spfTable = useSectionTable(data?.spfTimerProfiles ?? [], spfCols)
  const authTable = useSectionTable(data?.authProfiles ?? [], authCols)
  const ifTable = useSectionTable(data?.ifTimerProfiles ?? [], ifCols)
  const redistTable = useSectionTable(data?.redistributionProfiles ?? [], redistCols)

  const total = (data?.spfTimerProfiles.length ?? 0) + (data?.authProfiles.length ?? 0) +
    (data?.ifTimerProfiles.length ?? 0) + (data?.redistributionProfiles.length ?? 0)

  return (
    <div className="flex h-full flex-col min-h-0">
      <div className="flex items-center justify-between border-b px-4 py-2.5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">OSPF Routing Profiles</h2>
          <Badge variant="secondary" size="sm" className="tabular-nums">{total}</Badge>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <Accordion multiple defaultValue={ALL} className="gap-3">
          <ProfileSection value={SECTIONS.spfTimer} title="SPF Timer Profiles" count={data?.spfTimerProfiles.length ?? 0} table={spfTable} />
          <ProfileSection value={SECTIONS.auth} title="Auth Profiles" count={data?.authProfiles.length ?? 0} table={authTable} />
          <ProfileSection value={SECTIONS.ifTimer} title="Interface Timer Profiles" count={data?.ifTimerProfiles.length ?? 0} table={ifTable} />
          <ProfileSection value={SECTIONS.redistribution} title="Redistribution Profiles" count={data?.redistributionProfiles.length ?? 0} table={redistTable} />
        </Accordion>
      </div>
    </div>
  )
}
