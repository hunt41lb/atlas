// @/app/(main)/network/_components/routing-profiles/multicast/multicast-profiles-view.tsx
//
// Multicast Routing Profiles page — PIM Timer, IGMP Query, MSDP Auth, MSDP Timer.

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
  PanwPimInterfaceTimerProfile,
  PanwIgmpInterfaceQueryProfile,
  PanwMsdpAuthProfile,
  PanwMsdpTimerProfile,
} from "@/lib/panw-parser/network/routing-profiles"

import { ProfileSection, useSectionTable } from "../_shared"

// ─── Column builders ──────────────────────────────────────────────────────────

const pimHelper = createColumnHelper<PanwPimInterfaceTimerProfile>()
const igmpHelper = createColumnHelper<PanwIgmpInterfaceQueryProfile>()
const msdpAuthHelper = createColumnHelper<PanwMsdpAuthProfile>()
const msdpTimerHelper = createColumnHelper<PanwMsdpTimerProfile>()

function buildPimColumns(isPanorama: boolean): ColumnDef<PanwPimInterfaceTimerProfile, unknown>[] {
  return [
    pimHelper.accessor("name", {
      header: "Name",
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }) as ColumnDef<PanwPimInterfaceTimerProfile, unknown>,
    { id: "assert", header: "Assert Interval", accessorFn: (r) => r.assertInterval,
      cell: ({ row }) => <span className="tabular-nums text-xs">{row.original.assertInterval ?? "—"}</span> },
    { id: "hello", header: "Hello Interval", accessorFn: (r) => r.helloInterval,
      cell: ({ row }) => <span className="tabular-nums text-xs">{row.original.helloInterval ?? "—"}</span> },
    { id: "joinPrune", header: "Join/Prune Interval", accessorFn: (r) => r.joinPruneInterval,
      cell: ({ row }) => <span className="tabular-nums text-xs">{row.original.joinPruneInterval ?? "—"}</span> },
    ...(isPanorama ? [{ id: "template", header: "Template", accessorFn: (r: PanwPimInterfaceTimerProfile) => r.templateName ?? "",
      cell: ({ row }: { row: { original: PanwPimInterfaceTimerProfile } }) => row.original.templateName
        ? <span className="text-xs">{row.original.templateName}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    } as ColumnDef<PanwPimInterfaceTimerProfile, unknown>] : []),
  ]
}

function buildIgmpColumns(isPanorama: boolean): ColumnDef<PanwIgmpInterfaceQueryProfile, unknown>[] {
  return [
    igmpHelper.accessor("name", {
      header: "Name",
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }) as ColumnDef<PanwIgmpInterfaceQueryProfile, unknown>,
    { id: "queryInterval", header: "Query Interval", accessorFn: (r) => r.queryInterval,
      cell: ({ row }) => <span className="tabular-nums text-xs">{row.original.queryInterval ?? "—"}</span> },
    { id: "maxResponse", header: "Max Response Time", accessorFn: (r) => r.maxQueryResponseTime,
      cell: ({ row }) => <span className="tabular-nums text-xs">{row.original.maxQueryResponseTime ?? "—"}</span> },
    { id: "lastMember", header: "Last Member Query", accessorFn: (r) => r.lastMemberQueryInterval,
      cell: ({ row }) => <span className="tabular-nums text-xs">{row.original.lastMemberQueryInterval ?? "—"}</span> },
    { id: "immediateLeave", header: "Immediate Leave",
      cell: ({ row }) => row.original.immediateLeave
        ? <Badge variant="blue" size="sm">Yes</Badge>
        : <span className="text-muted-foreground text-xs">No</span> },
    ...(isPanorama ? [{ id: "template", header: "Template", accessorFn: (r: PanwIgmpInterfaceQueryProfile) => r.templateName ?? "",
      cell: ({ row }: { row: { original: PanwIgmpInterfaceQueryProfile } }) => row.original.templateName
        ? <span className="text-xs">{row.original.templateName}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    } as ColumnDef<PanwIgmpInterfaceQueryProfile, unknown>] : []),
  ]
}

function buildMsdpAuthColumns(isPanorama: boolean): ColumnDef<PanwMsdpAuthProfile, unknown>[] {
  return [
    msdpAuthHelper.accessor("name", {
      header: "Name",
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }) as ColumnDef<PanwMsdpAuthProfile, unknown>,
    { id: "secret", header: "Secret",
      cell: ({ row }) => row.original.secretConfigured
        ? <Badge variant="outline" size="sm">Configured</Badge>
        : <span className="text-muted-foreground text-xs">—</span> },
    ...(isPanorama ? [{ id: "template", header: "Template", accessorFn: (r: PanwMsdpAuthProfile) => r.templateName ?? "",
      cell: ({ row }: { row: { original: PanwMsdpAuthProfile } }) => row.original.templateName
        ? <span className="text-xs">{row.original.templateName}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    } as ColumnDef<PanwMsdpAuthProfile, unknown>] : []),
  ]
}

function buildMsdpTimerColumns(isPanorama: boolean): ColumnDef<PanwMsdpTimerProfile, unknown>[] {
  return [
    msdpTimerHelper.accessor("name", {
      header: "Name",
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }) as ColumnDef<PanwMsdpTimerProfile, unknown>,
    { id: "keepAlive", header: "Keep-Alive Interval", accessorFn: (r) => r.keepAliveInterval,
      cell: ({ row }) => <span className="tabular-nums text-xs">{row.original.keepAliveInterval ?? "—"}</span> },
    { id: "msgTimeout", header: "Message Timeout", accessorFn: (r) => r.messageTimeout,
      cell: ({ row }) => <span className="tabular-nums text-xs">{row.original.messageTimeout ?? "—"}</span> },
    { id: "connRetry", header: "Connection Retry", accessorFn: (r) => r.connectionRetryInterval,
      cell: ({ row }) => <span className="tabular-nums text-xs">{row.original.connectionRetryInterval ?? "—"}</span> },
    ...(isPanorama ? [{ id: "template", header: "Template", accessorFn: (r: PanwMsdpTimerProfile) => r.templateName ?? "",
      cell: ({ row }: { row: { original: PanwMsdpTimerProfile } }) => row.original.templateName
        ? <span className="text-xs">{row.original.templateName}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    } as ColumnDef<PanwMsdpTimerProfile, unknown>] : []),
  ]
}

// ─── Section keys ─────────────────────────────────────────────────────────────

const SECTIONS = { pim: "pim", igmp: "igmp", msdpAuth: "msdpAuth", msdpTimer: "msdpTimer" } as const
const ALL = Object.values(SECTIONS)

// ─── Component ────────────────────────────────────────────────────────────────

export function MulticastProfilesView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  const data = React.useMemo(() => {
    if (!activeConfig) return null
    return resolveNetworkData(activeConfig.parsedConfig, selectedScope).multicastRoutingProfiles
  }, [activeConfig, selectedScope])

  const pimCols = React.useMemo(() => buildPimColumns(isPanorama), [isPanorama])
  const igmpCols = React.useMemo(() => buildIgmpColumns(isPanorama), [isPanorama])
  const msdpAuthCols = React.useMemo(() => buildMsdpAuthColumns(isPanorama), [isPanorama])
  const msdpTimerCols = React.useMemo(() => buildMsdpTimerColumns(isPanorama), [isPanorama])

  const pimTable = useSectionTable(data?.pimInterfaceTimerProfiles ?? [], pimCols)
  const igmpTable = useSectionTable(data?.igmpInterfaceQueryProfiles ?? [], igmpCols)
  const msdpAuthTable = useSectionTable(data?.msdpAuthProfiles ?? [], msdpAuthCols)
  const msdpTimerTable = useSectionTable(data?.msdpTimerProfiles ?? [], msdpTimerCols)

  const total = (data?.pimInterfaceTimerProfiles.length ?? 0) + (data?.igmpInterfaceQueryProfiles.length ?? 0) +
    (data?.msdpAuthProfiles.length ?? 0) + (data?.msdpTimerProfiles.length ?? 0)

  return (
    <div className="flex h-full flex-col min-h-0">
      <div className="flex items-center justify-between border-b px-4 py-2.5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Multicast Routing Profiles</h2>
          <Badge variant="secondary" size="sm" className="tabular-nums">{total}</Badge>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <Accordion multiple defaultValue={ALL} className="gap-3">
          <ProfileSection value={SECTIONS.pim} title="PIM Interface Timer Profiles" count={data?.pimInterfaceTimerProfiles.length ?? 0} table={pimTable} />
          <ProfileSection value={SECTIONS.igmp} title="IGMP Interface Query Profiles" count={data?.igmpInterfaceQueryProfiles.length ?? 0} table={igmpTable} />
          <ProfileSection value={SECTIONS.msdpAuth} title="MSDP Auth Profiles" count={data?.msdpAuthProfiles.length ?? 0} table={msdpAuthTable} />
          <ProfileSection value={SECTIONS.msdpTimer} title="MSDP Timer Profiles" count={data?.msdpTimerProfiles.length ?? 0} table={msdpTimerTable} />
        </Accordion>
      </div>
    </div>
  )
}

