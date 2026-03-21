// @/src/parser/routing-profiles/rip.ts
//
// RIP (RIPv2) routing profile types and extractor.
// XML path: <network><routing-profile><rip>

import { str, entries, entryName } from "../xml-helpers"

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PanwRipGlobalTimerProfile {
  name: string
  updateIntervals: number | null
  expireIntervals: number | null
  deleteIntervals: number | null
  templateName: string | null
}

export interface PanwRipAuthProfile {
  name: string
  /** "password" | "md5" */
  type: string | null
  templateName: string | null
}

export interface PanwRipRedistEntry {
  protocol: string
  enabled: boolean
  metric: number | null
  routeMap: string | null
}

export interface PanwRipRedistProfile {
  name: string
  entries: PanwRipRedistEntry[]
  templateName: string | null
}

export interface PanwRipRoutingProfiles {
  globalTimerProfiles: PanwRipGlobalTimerProfile[]
  authProfiles: PanwRipAuthProfile[]
  redistributionProfiles: PanwRipRedistProfile[]
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXTRACTOR
// ═══════════════════════════════════════════════════════════════════════════════

function numOrNull(val: unknown): number | null {
  return val !== undefined ? Number(val) : null
}

const RIP_REDIST_PROTOCOLS = ["static", "connected", "bgp", "ospf"] as const

export function extractRipRoutingProfiles(
  networkEl: unknown,
  templateName: string | null
): PanwRipRoutingProfiles {
  const empty: PanwRipRoutingProfiles = {
    globalTimerProfiles: [], authProfiles: [], redistributionProfiles: [],
  }

  if (!networkEl || typeof networkEl !== "object") return empty
  const net = networkEl as Record<string, unknown>
  const rpEl = net["routing-profile"] as Record<string, unknown> | undefined
  if (!rpEl) return empty
  const ripEl = rpEl["rip"] as Record<string, unknown> | undefined
  if (!ripEl) return empty

  return {
    globalTimerProfiles: entries(ripEl["global-timer-profile"]).map((entry) => ({
      name: entryName(entry),
      updateIntervals: numOrNull(entry["update-intervals"]),
      expireIntervals: numOrNull(entry["expire-intervals"]),
      deleteIntervals: numOrNull(entry["delete-intervals"]),
      templateName,
    })),

    authProfiles: entries(ripEl["auth-profile"]).map((entry) => ({
      name: entryName(entry),
      type: entry["password"] !== undefined ? "password"
        : entry["md5"] !== undefined ? "md5"
        : null,
      templateName,
    })),

    redistributionProfiles: entries(ripEl["redistribution-profile"]).map((entry) => ({
      name: entryName(entry),
      entries: RIP_REDIST_PROTOCOLS.flatMap((proto) => {
        const el = entry[proto] as Record<string, unknown> | undefined
        if (!el) return []
        return [{
          protocol: proto,
          enabled: str(el["enable"]) === "yes",
          metric: numOrNull(el["metric"]),
          routeMap: str(el["route-map"]) ?? null,
        }]
      }),
      templateName,
    })),
  }
}
