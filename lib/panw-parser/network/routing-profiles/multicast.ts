// @/src/lib/panw-parser/network/routing-profiles/multicast.ts
//
// Multicast routing profile types and extractor.
// XML path: <network><routing-profile><multicast>
//
// Contains: PIM Interface Timer, IGMP Interface Query, MSDP Auth, MSDP Timer

import { str, entries, entryName } from "../../xml-helpers"

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PanwPimInterfaceTimerProfile {
  name: string
  assertInterval: number | null
  helloInterval: number | null
  joinPruneInterval: number | null
  templateName: string | null
}

export interface PanwIgmpInterfaceQueryProfile {
  name: string
  queryInterval: number | null
  maxQueryResponseTime: number | null
  lastMemberQueryInterval: number | null
  immediateLeave: boolean
  templateName: string | null
}

export interface PanwMsdpAuthProfile {
  name: string
  secretConfigured: boolean
  templateName: string | null
}

export interface PanwMsdpTimerProfile {
  name: string
  keepAliveInterval: number | null
  messageTimeout: number | null
  connectionRetryInterval: number | null
  templateName: string | null
}

export interface PanwMulticastRoutingProfiles {
  pimInterfaceTimerProfiles: PanwPimInterfaceTimerProfile[]
  igmpInterfaceQueryProfiles: PanwIgmpInterfaceQueryProfile[]
  msdpAuthProfiles: PanwMsdpAuthProfile[]
  msdpTimerProfiles: PanwMsdpTimerProfile[]
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXTRACTOR
// ═══════════════════════════════════════════════════════════════════════════════

function numOrNull(val: unknown): number | null {
  return val !== undefined ? Number(val) : null
}

export function extractMulticastRoutingProfiles(
  networkEl: unknown,
  templateName: string | null
): PanwMulticastRoutingProfiles {
  const empty: PanwMulticastRoutingProfiles = {
    pimInterfaceTimerProfiles: [], igmpInterfaceQueryProfiles: [],
    msdpAuthProfiles: [], msdpTimerProfiles: [],
  }

  if (!networkEl || typeof networkEl !== "object") return empty
  const net = networkEl as Record<string, unknown>
  const rpEl = net["routing-profile"] as Record<string, unknown> | undefined
  if (!rpEl) return empty
  const mcastEl = rpEl["multicast"] as Record<string, unknown> | undefined
  if (!mcastEl) return empty

  return {
    pimInterfaceTimerProfiles: entries(mcastEl["pim-interface-timer-profile"]).map((entry) => ({
      name: entryName(entry),
      assertInterval: numOrNull(entry["assert-interval"]),
      helloInterval: numOrNull(entry["hello-interval"]),
      joinPruneInterval: numOrNull(entry["join-prune-interval"]),
      templateName,
    })),

    igmpInterfaceQueryProfiles: entries(mcastEl["igmp-interface-query-profile"]).map((entry) => ({
      name: entryName(entry),
      queryInterval: numOrNull(entry["query-interval"]),
      maxQueryResponseTime: numOrNull(entry["max-query-response-time"]),
      lastMemberQueryInterval: numOrNull(entry["last-member-query-interval"]),
      immediateLeave: str(entry["immediate-leave"]) === "yes",
      templateName,
    })),

    msdpAuthProfiles: entries(mcastEl["msdp-auth-profile"]).map((entry) => ({
      name: entryName(entry),
      secretConfigured: entry["secret"] !== undefined,
      templateName,
    })),

    msdpTimerProfiles: entries(mcastEl["msdp-timer-profile"]).map((entry) => ({
      name: entryName(entry),
      keepAliveInterval: numOrNull(entry["keep-alive-interval"]),
      messageTimeout: numOrNull(entry["message-timeout"]),
      connectionRetryInterval: numOrNull(entry["connection-retry-interval"]),
      templateName,
    })),
  }
}
