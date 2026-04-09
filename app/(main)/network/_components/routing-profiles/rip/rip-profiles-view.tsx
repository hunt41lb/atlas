// @/app/(main)/network/_components/routing-profiles/rip/rip-profiles-view.tsx
//
// RIPv2 Routing Profiles page — Global Timer, Auth, Redistribution.

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
  PanwRipGlobalTimerProfile,
  PanwRipAuthProfile,
  PanwRipRedistProfile,
} from "@/lib/panw-parser/network/routing-profiles"

import { ProfileSection, useSectionTable } from "../_shared"

// ─── Column builders ──────────────────────────────────────────────────────────

const timerHelper = createColumnHelper<PanwRipGlobalTimerProfile>()
const authHelper = createColumnHelper<PanwRipAuthProfile>()
const redistHelper = createColumnHelper<PanwRipRedistProfile>()

function buildTimerColumns(isPanorama: boolean): ColumnDef<PanwRipGlobalTimerProfile, unknown>[] {
  return [
    timerHelper.accessor("name", {
      header: "Name",
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }) as ColumnDef<PanwRipGlobalTimerProfile, unknown>,
    { id: "update", header: "Update Interval", accessorFn: (r) => r.updateIntervals,
      cell: ({ row }) => <span className="tabular-nums text-xs">{row.original.updateIntervals ?? "—"}</span> },
    { id: "expire", header: "Expire Interval", accessorFn: (r) => r.expireIntervals,
      cell: ({ row }) => <span className="tabular-nums text-xs">{row.original.expireIntervals ?? "—"}</span> },
    { id: "delete", header: "Delete Interval", accessorFn: (r) => r.deleteIntervals,
      cell: ({ row }) => <span className="tabular-nums text-xs">{row.original.deleteIntervals ?? "—"}</span> },
    ...(isPanorama ? [{ id: "template", header: "Template", accessorFn: (r: PanwRipGlobalTimerProfile) => r.templateName ?? "",
      cell: ({ row }: { row: { original: PanwRipGlobalTimerProfile } }) => row.original.templateName
        ? <span className="text-xs">{row.original.templateName}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    } as ColumnDef<PanwRipGlobalTimerProfile, unknown>] : []),
  ]
}

function buildAuthColumns(isPanorama: boolean): ColumnDef<PanwRipAuthProfile, unknown>[] {
  return [
    authHelper.accessor("name", {
      header: "Name",
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }) as ColumnDef<PanwRipAuthProfile, unknown>,
    { id: "type", header: "Type",
      cell: ({ row }) => row.original.type
        ? <Badge variant="outline" size="sm">{row.original.type.toUpperCase()}</Badge>
        : <span className="text-muted-foreground text-xs">—</span> },
    ...(isPanorama ? [{ id: "template", header: "Template", accessorFn: (r: PanwRipAuthProfile) => r.templateName ?? "",
      cell: ({ row }: { row: { original: PanwRipAuthProfile } }) => row.original.templateName
        ? <span className="text-xs">{row.original.templateName}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    } as ColumnDef<PanwRipAuthProfile, unknown>] : []),
  ]
}

function buildRedistColumns(isPanorama: boolean): ColumnDef<PanwRipRedistProfile, unknown>[] {
  return [
    redistHelper.accessor("name", {
      header: "Name",
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }) as ColumnDef<PanwRipRedistProfile, unknown>,
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
    ...(isPanorama ? [{ id: "template", header: "Template", accessorFn: (r: PanwRipRedistProfile) => r.templateName ?? "",
      cell: ({ row }: { row: { original: PanwRipRedistProfile } }) => row.original.templateName
        ? <span className="text-xs">{row.original.templateName}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    } as ColumnDef<PanwRipRedistProfile, unknown>] : []),
  ]
}

// ─── Section keys ─────────────────────────────────────────────────────────────

const SECTIONS = { timer: "timer", auth: "auth", redistribution: "redistribution" } as const
const ALL = Object.values(SECTIONS)

// ─── Component ────────────────────────────────────────────────────────────────

export function RipProfilesView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  const data = React.useMemo(() => {
    if (!activeConfig) return null
    return resolveNetworkData(activeConfig.parsedConfig, selectedScope).ripRoutingProfiles
  }, [activeConfig, selectedScope])

  const timerCols = React.useMemo(() => buildTimerColumns(isPanorama), [isPanorama])
  const authCols = React.useMemo(() => buildAuthColumns(isPanorama), [isPanorama])
  const redistCols = React.useMemo(() => buildRedistColumns(isPanorama), [isPanorama])

  const timerTable = useSectionTable(data?.globalTimerProfiles ?? [], timerCols)
  const authTable = useSectionTable(data?.authProfiles ?? [], authCols)
  const redistTable = useSectionTable(data?.redistributionProfiles ?? [], redistCols)

  const total = (data?.globalTimerProfiles.length ?? 0) + (data?.authProfiles.length ?? 0) +
    (data?.redistributionProfiles.length ?? 0)

  return (
    <div className="flex h-full flex-col min-h-0">
      <div className="flex items-center justify-between border-b px-4 py-2.5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">RIPv2 Routing Profiles</h2>
          <Badge variant="secondary" size="sm" className="tabular-nums">{total}</Badge>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <Accordion multiple defaultValue={ALL} className="gap-3">
          <ProfileSection value={SECTIONS.timer} title="Global Timer Profiles" count={data?.globalTimerProfiles.length ?? 0} table={timerTable} />
          <ProfileSection value={SECTIONS.auth} title="Auth Profiles" count={data?.authProfiles.length ?? 0} table={authTable} />
          <ProfileSection value={SECTIONS.redistribution} title="Redistribution Profiles" count={data?.redistributionProfiles.length ?? 0} table={redistTable} />
        </Accordion>
      </div>
    </div>
  )
}

