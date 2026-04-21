// @/app/(main)/network/_components/routing-profiles/bgp/bgp-profiles-view.tsx
//
// BGP Routing Profiles page — thin orchestrator.
// Imports column builders and dialogs from individual section files.

"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Accordion } from "@/components/ui/accordion"

import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import { resolveNetworkData } from "@/app/(main)/_lib/resolve-config-data"

import type {
  PanwBgpAuthProfile,
  PanwBgpTimerProfile,
  PanwBgpDampeningProfile,
  PanwBgpRedistributionProfile,
  PanwBgpAddressFamilyProfile,
  PanwBgpFilteringProfile,
} from "@/lib/panw-parser/network/routing-profiles"

import { ProfileSection, useSectionTable } from "../_shared"
import { AuthProfileDialog, buildAuthColumns } from "./bgp-auth-dialog"
import { TimerProfileDialog, buildTimerColumns } from "./bgp-timer-dialog"
import { buildDampeningColumns } from "./bgp-dampening-columns"
import { DampeningProfileDialog } from "./bgp-dampening-dialog"
import { RedistProfileDialog } from "./bgp-redist-dialog"
import { buildRedistColumns } from "./bgp-redist-columns"
import { AfProfileDialog, buildAfColumns, flattenAfProfiles } from "./bgp-af-dialog"
import { FilteringProfileDialog } from "./bgp-filter-dialog"
import { buildFilterColumns } from "./bgp-filter-columns"

// ─── Section keys ─────────────────────────────────────────────────────────────

const SECTIONS = {
  auth: "auth",
  timer: "timer",
  dampening: "dampening",
  redistribution: "redistribution",
  addressFamily: "addressFamily",
  filtering: "filtering",
} as const

const ALL_SECTION_VALUES = Object.values(SECTIONS)

// ─── Main component ──────────────────────────────────────────────────────────

export function BgpProfilesView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()

  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  // Dialog state
  const [authDialogProfile, setAuthDialogProfile] = React.useState<PanwBgpAuthProfile | null>(null)
  const [timerDialogProfile, setTimerDialogProfile] = React.useState<PanwBgpTimerProfile | null>(null)
  const [dampDialogProfile, setDampDialogProfile] = React.useState<PanwBgpDampeningProfile | null>(null)
  const [afDialogProfile, setAfDialogProfile] = React.useState<PanwBgpAddressFamilyProfile | null>(null)
  const [redistDialogProfile, setRedistDialogProfile] = React.useState<PanwBgpRedistributionProfile | null>(null)
  const [filterDialogProfile, setFilterDialogProfile] = React.useState<PanwBgpFilteringProfile | null>(null)

  // Resolve data
  const bgp = React.useMemo(() => {
    if (!activeConfig) return null
    return resolveNetworkData(activeConfig.parsedConfig, selectedScope).bgpRoutingProfiles
  }, [activeConfig, selectedScope])

  // Build columns
  const authCols = React.useMemo(() => buildAuthColumns(isPanorama, setAuthDialogProfile), [isPanorama])
  const timerCols = React.useMemo(() => buildTimerColumns(isPanorama, setTimerDialogProfile), [isPanorama])
  const dampCols = React.useMemo(() => buildDampeningColumns(isPanorama, setDampDialogProfile), [isPanorama])
  const redistCols = React.useMemo(() => buildRedistColumns(isPanorama, setRedistDialogProfile), [isPanorama])
  const afCols = React.useMemo(() => buildAfColumns(isPanorama, setAfDialogProfile), [isPanorama])
  const filterCols = React.useMemo(() => buildFilterColumns(isPanorama, setFilterDialogProfile), [isPanorama])

  // Create tables
  const authTable = useSectionTable(bgp?.authProfiles ?? [], authCols)
  const timerTable = useSectionTable(bgp?.timerProfiles ?? [], timerCols)
  const dampTable = useSectionTable(bgp?.dampeningProfiles ?? [], dampCols)
  const redistTable = useSectionTable(bgp?.redistributionProfiles ?? [], redistCols)
  const afRows = React.useMemo(
    () => flattenAfProfiles(bgp?.addressFamilyProfiles ?? []),
    [bgp?.addressFamilyProfiles]
  )

  const afTable = useSectionTable(afRows, afCols)
  const filterTable = useSectionTable(bgp?.filteringProfiles ?? [], filterCols)

  const totalProfiles =
    (bgp?.authProfiles.length ?? 0) +
    (bgp?.timerProfiles.length ?? 0) +
    (bgp?.dampeningProfiles.length ?? 0) +
    (bgp?.redistributionProfiles.length ?? 0) +
    (bgp?.addressFamilyProfiles.length ?? 0) +
    (bgp?.filteringProfiles.length ?? 0)

  return (
    <div className="flex h-full flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-2.5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">BGP Routing Profiles</h2>
          <Badge variant="secondary" size="sm" className="tabular-nums">
            {totalProfiles}
          </Badge>
        </div>
      </div>

      {/* Accordion sections */}
      <div className="flex-1 overflow-y-auto p-4">
        <Accordion multiple defaultValue={ALL_SECTION_VALUES} className="gap-3">
          <ProfileSection value={SECTIONS.auth} title="Auth Profiles" count={bgp?.authProfiles.length ?? 0} table={authTable} />
          <ProfileSection value={SECTIONS.timer} title="Timer Profiles" count={bgp?.timerProfiles.length ?? 0} table={timerTable} />
          <ProfileSection value={SECTIONS.dampening} title="Dampening Profiles" count={bgp?.dampeningProfiles.length ?? 0} table={dampTable} />
          <ProfileSection value={SECTIONS.redistribution} title="Redistribution Profiles" count={bgp?.redistributionProfiles.length ?? 0} table={redistTable} />
          <ProfileSection value={SECTIONS.addressFamily} title="Address Family Profiles" count={afRows.length} table={afTable} />
          <ProfileSection value={SECTIONS.filtering} title="Filtering Profiles" count={bgp?.filteringProfiles.length ?? 0} table={filterTable} />
        </Accordion>
      </div>

      {/* Dialogs */}
      <AuthProfileDialog
        profile={authDialogProfile}
        open={authDialogProfile !== null}
        onOpenChange={(open) => { if (!open) setAuthDialogProfile(null) }}
      />
      <TimerProfileDialog
        profile={timerDialogProfile}
        open={timerDialogProfile !== null}
        onOpenChange={(open) => { if (!open) setTimerDialogProfile(null) }}
      />
      <AfProfileDialog
        profile={afDialogProfile}
        open={afDialogProfile !== null}
        onOpenChange={(open) => { if (!open) setAfDialogProfile(null) }}
      />
      <DampeningProfileDialog
        profile={dampDialogProfile}
        open={dampDialogProfile !== null}
        onOpenChange={(open) => { if (!open) setDampDialogProfile(null) }}
      />
      <RedistProfileDialog
        profile={redistDialogProfile}
        open={redistDialogProfile !== null}
        onOpenChange={(open) => { if (!open) setRedistDialogProfile(null) }}
      />
      <FilteringProfileDialog
        profile={filterDialogProfile}
        open={filterDialogProfile !== null}
        onOpenChange={(open) => { if (!open) setFilterDialogProfile(null) }}
      />
    </div>
  )
}
