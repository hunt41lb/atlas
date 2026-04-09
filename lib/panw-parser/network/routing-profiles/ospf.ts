// @/src/lib/panw-parser/network/routing-profiles/ospf.ts
//
// OSPF and OSPFv3 routing profile types and extractors.
// XML path: <network><routing-profile><ospf|ospfv3>
//
// OSPF and OSPFv3 share identical structures for SPF Timer, IF Timer, and
// redistribution profiles. Auth profiles differ (password vs ESP/AH).

import { str, entries, entryName } from "../../xml-helpers"

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED TYPES (OSPF + OSPFv3)
// ═══════════════════════════════════════════════════════════════════════════════

export interface PanwOspfSpfTimerProfile {
  name: string
  lsaInterval: number | null
  spfCalculationDelay: number | null
  initialHoldTime: number | null
  maxHoldTime: number | null
  templateName: string | null
}

export interface PanwOspfIfTimerProfile {
  name: string
  helloInterval: number | null
  deadCounts: number | null
  retransmitInterval: number | null
  transitDelay: number | null
  grDelay: number | null
  templateName: string | null
}

export interface PanwOspfRedistEntry {
  protocol: string
  enabled: boolean
  metric: number | null
  metricType: string | null
  routeMap: string | null
}

export interface PanwOspfRedistProfile {
  name: string
  entries: PanwOspfRedistEntry[]
  /** OSPF-only: default route origination */
  defaultRoute: {
    enabled: boolean
    always: boolean
    metric: number | null
    metricType: string | null
  } | null
  templateName: string | null
}

// ═══════════════════════════════════════════════════════════════════════════════
// OSPF-SPECIFIC TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PanwOspfAuthProfile {
  name: string
  /** true if a password is configured (value is redacted) */
  passwordConfigured: boolean
  templateName: string | null
}

export interface PanwOspfRoutingProfiles {
  spfTimerProfiles: PanwOspfSpfTimerProfile[]
  authProfiles: PanwOspfAuthProfile[]
  ifTimerProfiles: PanwOspfIfTimerProfile[]
  redistributionProfiles: PanwOspfRedistProfile[]
}

// ═══════════════════════════════════════════════════════════════════════════════
// OSPFv3-SPECIFIC TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PanwOspfv3AuthProfile {
  name: string
  /** "esp" | "ah" */
  type: string | null
  spi: string | null
  templateName: string | null
}

export interface PanwOspfv3RoutingProfiles {
  spfTimerProfiles: PanwOspfSpfTimerProfile[]
  authProfiles: PanwOspfv3AuthProfile[]
  ifTimerProfiles: PanwOspfIfTimerProfile[]
  redistributionProfiles: PanwOspfRedistProfile[]
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED EXTRACTORS
// ═══════════════════════════════════════════════════════════════════════════════

function numOrNull(val: unknown): number | null {
  return val !== undefined ? Number(val) : null
}

function extractSpfTimerProfiles(
  protocolEl: Record<string, unknown>,
  templateName: string | null
): PanwOspfSpfTimerProfile[] {
  return entries(protocolEl["spf-timer-profile"]).map((entry) => ({
    name: entryName(entry),
    lsaInterval: numOrNull(entry["lsa-interval"]),
    spfCalculationDelay: numOrNull(entry["spf-calculation-delay"]),
    initialHoldTime: numOrNull(entry["initial-hold-time"]),
    maxHoldTime: numOrNull(entry["max-hold-time"]),
    templateName,
  }))
}

function extractIfTimerProfiles(
  protocolEl: Record<string, unknown>,
  templateName: string | null
): PanwOspfIfTimerProfile[] {
  return entries(protocolEl["if-timer-profile"]).map((entry) => ({
    name: entryName(entry),
    helloInterval: numOrNull(entry["hello-interval"]),
    deadCounts: numOrNull(entry["dead-counts"]),
    retransmitInterval: numOrNull(entry["retransmit-interval"]),
    transitDelay: numOrNull(entry["transit-delay"]),
    grDelay: numOrNull(entry["gr-delay"]),
    templateName,
  }))
}

/** Known redistribution source protocols */
const OSPF_REDIST_PROTOCOLS = ["static", "connected", "bgp", "rip"] as const
const OSPFV3_REDIST_PROTOCOLS = ["static", "connected", "bgp"] as const

function extractRedistProfiles(
  protocolEl: Record<string, unknown>,
  protocols: readonly string[],
  templateName: string | null
): PanwOspfRedistProfile[] {
  return entries(protocolEl["redistribution-profile"]).map((entry) => {
    const redistEntries: PanwOspfRedistEntry[] = []
    for (const proto of protocols) {
      const el = entry[proto] as Record<string, unknown> | undefined
      if (!el) continue
      redistEntries.push({
        protocol: proto,
        enabled: str(el["enable"]) === "yes",
        metric: numOrNull(el["metric"]),
        metricType: str(el["metric-type"]) ?? null,
        routeMap: str(el["route-map"]) ?? null,
      })
    }

    // Default route (OSPF/OSPFv3 specific)
    const drEl = entry["default-route"] as Record<string, unknown> | undefined
    const defaultRoute = drEl ? {
      enabled: str(drEl["enable"]) === "yes",
      always: str(drEl["always"]) === "yes",
      metric: numOrNull(drEl["metric"]),
      metricType: str(drEl["metric-type"]) ?? null,
    } : null

    return {
      name: entryName(entry),
      entries: redistEntries,
      defaultRoute,
      templateName,
    }
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
// OSPF EXTRACTOR
// ═══════════════════════════════════════════════════════════════════════════════

export function extractOspfRoutingProfiles(
  networkEl: unknown,
  templateName: string | null
): PanwOspfRoutingProfiles {
  const empty: PanwOspfRoutingProfiles = {
    spfTimerProfiles: [], authProfiles: [],
    ifTimerProfiles: [], redistributionProfiles: [],
  }

  if (!networkEl || typeof networkEl !== "object") return empty
  const net = networkEl as Record<string, unknown>
  const rpEl = net["routing-profile"] as Record<string, unknown> | undefined
  if (!rpEl) return empty
  const ospfEl = rpEl["ospf"] as Record<string, unknown> | undefined
  if (!ospfEl) return empty

  return {
    spfTimerProfiles: extractSpfTimerProfiles(ospfEl, templateName),
    authProfiles: entries(ospfEl["auth-profile"]).map((entry) => ({
      name: entryName(entry),
      passwordConfigured: entry["password"] !== undefined,
      templateName,
    })),
    ifTimerProfiles: extractIfTimerProfiles(ospfEl, templateName),
    redistributionProfiles: extractRedistProfiles(ospfEl, OSPF_REDIST_PROTOCOLS, templateName),
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// OSPFv3 EXTRACTOR
// ═══════════════════════════════════════════════════════════════════════════════

export function extractOspfv3RoutingProfiles(
  networkEl: unknown,
  templateName: string | null
): PanwOspfv3RoutingProfiles {
  const empty: PanwOspfv3RoutingProfiles = {
    spfTimerProfiles: [], authProfiles: [],
    ifTimerProfiles: [], redistributionProfiles: [],
  }

  if (!networkEl || typeof networkEl !== "object") return empty
  const net = networkEl as Record<string, unknown>
  const rpEl = net["routing-profile"] as Record<string, unknown> | undefined
  if (!rpEl) return empty
  const ospfv3El = rpEl["ospfv3"] as Record<string, unknown> | undefined
  if (!ospfv3El) return empty

  return {
    spfTimerProfiles: extractSpfTimerProfiles(ospfv3El, templateName),
    authProfiles: entries(ospfv3El["auth-profile"]).map((entry) => {
      const hasEsp = entry["esp"] !== undefined
      const hasAh = entry["ah"] !== undefined
      return {
        name: entryName(entry),
        type: hasEsp ? "esp" : hasAh ? "ah" : null,
        spi: str(entry["spi"]) ?? null,
        templateName,
      }
    }),
    ifTimerProfiles: extractIfTimerProfiles(ospfv3El, templateName),
    redistributionProfiles: extractRedistProfiles(ospfv3El, OSPFV3_REDIST_PROTOCOLS, templateName),
  }
}
