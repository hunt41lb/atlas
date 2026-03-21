// @/app/(main)/network/_components/routing-profiles/ospfv3/ospfv3-profiles-view.tsx
//
// OSPFv3 Routing Profiles page — reuses OSPF's shared column builders.
// Only auth differs (ESP/AH + SPI instead of password).

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

import type { PanwOspfv3AuthProfile } from "@/lib/panw-parser/routing-profiles"

import { ProfileSection, useSectionTable } from "../_shared"
import {
  buildSpfTimerColumns,
  buildIfTimerColumns,
  buildRedistColumns,
} from "../ospf/ospf-profiles-view"

// ─── OSPFv3-specific auth columns ─────────────────────────────────────────────

const authHelper = createColumnHelper<PanwOspfv3AuthProfile>()

function buildV3AuthColumns(isPanorama: boolean): ColumnDef<PanwOspfv3AuthProfile, unknown>[] {
  return [
    authHelper.accessor("name", {
      header: "Name",
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }) as ColumnDef<PanwOspfv3AuthProfile, unknown>,
    { id: "type", header: "Type",
      cell: ({ row }) => row.original.type
        ? <Badge variant="outline" size="sm">{row.original.type.toUpperCase()}</Badge>
        : <span className="text-muted-foreground text-xs">—</span> },
    { id: "spi", header: "SPI",
      cell: ({ row }) => row.original.spi
        ? <span className="tabular-nums text-xs">{row.original.spi}</span>
        : <span className="text-muted-foreground text-xs">—</span> },
    ...(isPanorama ? [{ id: "template", header: "Template", accessorFn: (r: PanwOspfv3AuthProfile) => r.templateName ?? "",
      cell: ({ row }: { row: { original: PanwOspfv3AuthProfile } }) => row.original.templateName
        ? <span className="text-xs">{row.original.templateName}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    } as ColumnDef<PanwOspfv3AuthProfile, unknown>] : []),
  ]
}

// ─── Section keys ─────────────────────────────────────────────────────────────

const SECTIONS = { spfTimer: "spfTimer", auth: "auth", ifTimer: "ifTimer", redistribution: "redistribution" } as const
const ALL = Object.values(SECTIONS)

// ─── Component ────────────────────────────────────────────────────────────────

export function Ospfv3ProfilesView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  const data = React.useMemo(() => {
    if (!activeConfig) return null
    return resolveNetworkData(activeConfig.parsedConfig, selectedScope).ospfv3RoutingProfiles
  }, [activeConfig, selectedScope])

  const spfCols = React.useMemo(() => buildSpfTimerColumns(isPanorama), [isPanorama])
  const authCols = React.useMemo(() => buildV3AuthColumns(isPanorama), [isPanorama])
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
          <h2 className="text-sm font-semibold">OSPFv3 Routing Profiles</h2>
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
