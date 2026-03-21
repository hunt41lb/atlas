// @/lib/panw-parser/routing-profiles/bgp.ts
//
// BGP routing profile types and extractors for Logical Routers.
// XML path: <network><routing-profile><bgp>
//
// Contains 6 profile categories:
//   1. Auth Profiles       — <auth-profile>
//   2. Timer Profiles      — <timer-profile>
//   3. Dampening Profiles  — <dampening-profile>
//   4. Redistribution      — <redistribution-profile>
//   5. Address Family      — <address-family-profile>
//   6. Filtering Profiles  — <filtering-profile>

import { entries, entryName, str, dig } from "../xml-helpers"

// ═══════════════════════════════════════════════════════════════════════════════
// 1. AUTH PROFILES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PanwBgpAuthProfile {
  name: string
  /** Whether a secret is configured (we never expose the actual value) */
  secretConfigured: boolean
  templateName: string | null
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. TIMER PROFILES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PanwBgpTimerProfile {
  name: string
  /** Keep Alive Interval in seconds — default: 30 */
  keepAliveInterval: number
  /** Hold Time in seconds — default: 90 */
  holdTime: number
  /** Reconnect Retry Interval (idle hold) in seconds — default: 15 */
  reconnectRetryInterval: number
  /** Open Delay Time in seconds — default: 0 */
  openDelayTime: number
  /** Min Route Advertisement Interval in seconds — default: 30 */
  minRouteAdvInterval: number
  templateName: string | null
}

export const BGP_TIMER_DEFAULTS = {
  keepAliveInterval: 30,
  holdTime: 90,
  reconnectRetryInterval: 15,
  openDelayTime: 0,
  minRouteAdvInterval: 30,
} as const

// ═══════════════════════════════════════════════════════════════════════════════
// 3. DAMPENING PROFILES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PanwBgpDampeningProfile {
  name: string
  description: string | null
  /** Suppress limit — default: 2000 */
  suppressLimit: number
  /** Reuse limit — default: 750 */
  reuseLimit: number
  /** Half life in minutes — default: 15 */
  halfLife: number
  /** Max suppress limit in minutes — default: 60 */
  maxSuppressLimit: number
  templateName: string | null
}

export const BGP_DAMPENING_DEFAULTS = {
  suppressLimit: 2000,
  reuseLimit: 750,
  halfLife: 15,
  maxSuppressLimit: 60,
} as const

// ═══════════════════════════════════════════════════════════════════════════════
// 4. REDISTRIBUTION PROFILES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PanwBgpRedistEntry {
  enabled: boolean
  metric: number | null
}

export interface PanwBgpRedistSubConfig {
  static: PanwBgpRedistEntry | null
  connected: PanwBgpRedistEntry | null
  rip: PanwBgpRedistEntry | null
  ospf: PanwBgpRedistEntry | null
  ospfv3: PanwBgpRedistEntry | null
}

export interface PanwBgpRedistributionProfile {
  name: string
  ipv4Unicast: PanwBgpRedistSubConfig | null
  ipv6Unicast: PanwBgpRedistSubConfig | null
  templateName: string | null
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. ADDRESS FAMILY PROFILES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PanwBgpAddressFamilySubConfig {
  enabled: boolean
  softReconfiguration: boolean
  asOverride: boolean
  defaultOriginate: boolean
  defaultOriginateMap: string | null
  routeReflectorClient: boolean
  /** Add Path: TX all paths */
  addPathTxAllPaths: boolean
  /** Add Path: TX bestpath per AS */
  addPathTxBestpathPerAs: boolean
  /** ORF prefix list mode: "send" | "receive" | "both" | null */
  orfPrefixList: string | null
  /** Maximum prefix action: "warning-only" | "restart" | "idle" | null */
  maximumPrefixAction: string | null
  maximumPrefixNumPrefixes: number | null
  maximumPrefixThreshold: number | null
  nextHop: string | null
  /** Remove private AS: "all" | "replace" | null */
  removePrivateAs: string | null
  /** Send community: "all" | "standard" | "extended" | "both" | null */
  sendCommunity: string | null
  /** Allowas-in: "origin" | number (occurrence count) | null */
  allowasIn: string | null
}

export interface PanwBgpAddressFamilyProfile {
  name: string
  ipv4Unicast: PanwBgpAddressFamilySubConfig | null
  ipv4Multicast: PanwBgpAddressFamilySubConfig | null
  ipv6Unicast: PanwBgpAddressFamilySubConfig | null
  ipv6Multicast: PanwBgpAddressFamilySubConfig | null
  templateName: string | null
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. FILTERING PROFILES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PanwBgpFilteringCondAdvert {
  existMap: string | null
  advertiseMap: string | null
}

   export interface PanwBgpFilteringSubConfig {
     conditionalAdvertExist: PanwBgpFilteringCondAdvert | null
     conditionalAdvertNonExist: PanwBgpFilteringCondAdvert | null
     routeMapInbound: string | null
     routeMapOutbound: string | null
     unsuppressMap: string | null
     /** AS Path Access List filter-list refs */
     filterListInbound: string | null
     filterListOutbound: string | null
     /** Inbound network filters — mutually exclusive: distribute-list (Access List) OR prefix-list */
     inboundDistributeList: string | null
     inboundPrefixList: string | null
     /** Outbound network filters — mutually exclusive: distribute-list (Access List) OR prefix-list */
     outboundDistributeList: string | null
     outboundPrefixList: string | null
     /** Multicast inherit from unicast — only relevant on multicast sub-config */
     inherit: boolean
   }

export interface PanwBgpFilteringProfile {
  name: string
  description: string | null
  ipv4Unicast: PanwBgpFilteringSubConfig | null
  ipv4Multicast: PanwBgpFilteringSubConfig | null
  ipv6Unicast: PanwBgpFilteringSubConfig | null
  ipv6Multicast: PanwBgpFilteringSubConfig | null
  templateName: string | null
}

// ═══════════════════════════════════════════════════════════════════════════════
// AGGREGATE CONTAINER — all 6 in one object per template
// ═══════════════════════════════════════════════════════════════════════════════

export interface PanwBgpRoutingProfiles {
  authProfiles: PanwBgpAuthProfile[]
  timerProfiles: PanwBgpTimerProfile[]
  dampeningProfiles: PanwBgpDampeningProfile[]
  redistributionProfiles: PanwBgpRedistributionProfile[]
  addressFamilyProfiles: PanwBgpAddressFamilyProfile[]
  filteringProfiles: PanwBgpFilteringProfile[]
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXTRACTORS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Detect the first key in an object (for self-closing XML tags).
 * e.g. `<next-hop><self/></next-hop>` → parsed as `{ "self": "" }` → returns "self"
 */
function detectKey(el: unknown): string | null {
  if (!el || typeof el !== "object") return null
  const keys = Object.keys(el as Record<string, unknown>)
  return keys.length > 0 ? keys[0] : null
}

// ─── 1. Auth Profiles ─────────────────────────────────────────────────────────

function extractAuthProfiles(
  bgpEl: Record<string, unknown>,
  templateName: string | null
): PanwBgpAuthProfile[] {
  return entries(bgpEl["auth-profile"]).map((entry) => ({
    name: entryName(entry),
    secretConfigured: entry["secret"] !== undefined,
    templateName,
  }))
}

// ─── 2. Timer Profiles ───────────────────────────────────────────────────────

function extractTimerProfiles(
  bgpEl: Record<string, unknown>,
  templateName: string | null
): PanwBgpTimerProfile[] {
  return entries(bgpEl["timer-profile"]).map((entry) => ({
    name: entryName(entry),
    keepAliveInterval: entry["keepalive-interval"] !== undefined
      ? Number(entry["keepalive-interval"])
      : BGP_TIMER_DEFAULTS.keepAliveInterval,
    holdTime: entry["hold-time"] !== undefined
      ? Number(entry["hold-time"])
      : BGP_TIMER_DEFAULTS.holdTime,
    reconnectRetryInterval: entry["reconnect-retry-interval"] !== undefined
      ? Number(entry["reconnect-retry-interval"])
      : BGP_TIMER_DEFAULTS.reconnectRetryInterval,
    openDelayTime: entry["open-delay-time"] !== undefined
      ? Number(entry["open-delay-time"])
      : BGP_TIMER_DEFAULTS.openDelayTime,
    minRouteAdvInterval: entry["min-route-adv-interval"] !== undefined
      ? Number(entry["min-route-adv-interval"])
      : BGP_TIMER_DEFAULTS.minRouteAdvInterval,
    templateName,
  }))
}

// ─── 3. Dampening Profiles ────────────────────────────────────────────────────

function extractDampeningProfiles(
  bgpEl: Record<string, unknown>,
  templateName: string | null
): PanwBgpDampeningProfile[] {
  return entries(bgpEl["dampening-profile"]).map((entry) => ({
    name: entryName(entry),
    description: str(entry["description"]) ?? null,
    suppressLimit: entry["suppress-limit"] !== undefined
      ? Number(entry["suppress-limit"])
      : BGP_DAMPENING_DEFAULTS.suppressLimit,
    reuseLimit: entry["reuse-limit"] !== undefined
      ? Number(entry["reuse-limit"])
      : BGP_DAMPENING_DEFAULTS.reuseLimit,
    halfLife: entry["half-life"] !== undefined
      ? Number(entry["half-life"])
      : BGP_DAMPENING_DEFAULTS.halfLife,
    maxSuppressLimit: entry["max-suppress-limit"] !== undefined
      ? Number(entry["max-suppress-limit"])
      : BGP_DAMPENING_DEFAULTS.maxSuppressLimit,
    templateName,
  }))
}

// ─── 4. Redistribution Profiles ───────────────────────────────────────────────

function extractRedistEntry(el: unknown): PanwBgpRedistEntry | null {
  if (!el || typeof el !== "object") return null
  const e = el as Record<string, unknown>
  return {
    enabled: str(e["enable"]) === "yes",
    metric: e["metric"] !== undefined ? Number(e["metric"]) : null,
  }
}

function extractRedistSubConfig(castEl: unknown): PanwBgpRedistSubConfig | null {
  if (!castEl || typeof castEl !== "object") return null
  const c = castEl as Record<string, unknown>
  return {
    static: extractRedistEntry(c["static"]),
    connected: extractRedistEntry(c["connected"]),
    rip: extractRedistEntry(c["rip"]),
    ospf: extractRedistEntry(c["ospf"]),
    ospfv3: extractRedistEntry(c["ospfv3"]),
  }
}

function extractRedistributionProfiles(
  bgpEl: Record<string, unknown>,
  templateName: string | null
): PanwBgpRedistributionProfile[] {
  return entries(bgpEl["redistribution-profile"]).map((entry) => {
    const ipv4 = entry["ipv4"] as Record<string, unknown> | undefined
    const ipv6 = entry["ipv6"] as Record<string, unknown> | undefined
    return {
      name: entryName(entry),
      ipv4Unicast: ipv4 ? extractRedistSubConfig(ipv4["unicast"]) : null,
      ipv6Unicast: ipv6 ? extractRedistSubConfig(ipv6["unicast"]) : null,
      templateName,
    }
  })
}

// ─── 5. Address Family Profiles ───────────────────────────────────────────────

function extractAddressFamilySubConfig(castEl: unknown): PanwBgpAddressFamilySubConfig | null {
  if (!castEl || typeof castEl !== "object") return null
  const c = castEl as Record<string, unknown>
  const maxPrefixEl = c["maximum-prefix"] as Record<string, unknown> | undefined
  return {
    enabled: str(c["enable"]) === "yes",
    softReconfiguration: str(c["soft-reconfiguration-with-stored-info"]) !== "no",
    asOverride: str(c["as-override"]) === "yes",
    defaultOriginate: str(c["default-originate"]) === "yes",
    defaultOriginateMap: str(c["default-originate-map"]) ?? null,
    routeReflectorClient: str(c["route-reflector-client"]) === "yes",
    addPathTxAllPaths: str(dig(c, "add-path", "tx-all-paths")) === "yes",
    addPathTxBestpathPerAs: str(dig(c, "add-path", "tx-bestpath-per-AS")) === "yes",
    orfPrefixList: str(dig(c, "orf", "orf-prefix-list")) ?? null,
    maximumPrefixAction: maxPrefixEl ? detectKey(maxPrefixEl["action"]) : null,
    maximumPrefixNumPrefixes: maxPrefixEl?.["num-prefixes"] !== undefined
      ? Number(maxPrefixEl["num-prefixes"]) : null,
    maximumPrefixThreshold: maxPrefixEl?.["threshold"] !== undefined
      ? Number(maxPrefixEl["threshold"]) : null,
    nextHop: detectKey(c["next-hop"]),
    removePrivateAs: detectKey(c["remove-private-AS"]),
    sendCommunity: detectKey(c["send-community"]),
    allowasIn: detectKey(c["allowas-in"]),
  }
}

function extractAddressFamilyProfiles(
  bgpEl: Record<string, unknown>,
  templateName: string | null
): PanwBgpAddressFamilyProfile[] {
  return entries(bgpEl["address-family-profile"]).map((entry) => {
    const ipv4 = entry["ipv4"] as Record<string, unknown> | undefined
    const ipv6 = entry["ipv6"] as Record<string, unknown> | undefined
    return {
      name: entryName(entry),
      ipv4Unicast: ipv4 ? extractAddressFamilySubConfig(ipv4["unicast"]) : null,
      ipv4Multicast: ipv4 ? extractAddressFamilySubConfig(ipv4["multicast"]) : null,
      ipv6Unicast: ipv6 ? extractAddressFamilySubConfig(ipv6["unicast"]) : null,
      ipv6Multicast: ipv6 ? extractAddressFamilySubConfig(ipv6["multicast"]) : null,
      templateName,
    }
  })
}

// ─── 6. Filtering Profiles ────────────────────────────────────────────────────

function extractFilteringSubConfig(castEl: unknown): PanwBgpFilteringSubConfig | null {
  if (!castEl || typeof castEl !== "object") return null
  const c = castEl as Record<string, unknown>

  const condAdvert = c["conditional-advertisement"] as Record<string, unknown> | undefined
  const existEl = condAdvert?.["exist"] as Record<string, unknown> | undefined
  const nonExistEl = condAdvert?.["non-exist"] as Record<string, unknown> | undefined
  const routeMapsEl = c["route-maps"] as Record<string, unknown> | undefined
  const filterListEl = c["filter-list"] as Record<string, unknown> | undefined
  const inboundNfEl = c["inbound-network-filters"] as Record<string, unknown> | undefined
  const outboundNfEl = c["outbound-network-filters"] as Record<string, unknown> | undefined

  return {
    conditionalAdvertExist: existEl ? {
      existMap: str(existEl["exist-map"]) ?? null,
      advertiseMap: str(existEl["advertise-map"]) ?? null,
    } : null,
    conditionalAdvertNonExist: nonExistEl ? {
      existMap: str(nonExistEl["non-exist-map"]) ?? null,
      advertiseMap: str(nonExistEl["advertise-map"]) ?? null,
    } : null,
    routeMapInbound: routeMapsEl ? (str(routeMapsEl["inbound"]) ?? null) : null,
    routeMapOutbound: routeMapsEl ? (str(routeMapsEl["outbound"]) ?? null) : null,
    unsuppressMap: str(c["unsuppress-map"]) ?? null,
    filterListInbound: filterListEl ? (str(filterListEl["inbound"]) ?? null) : null,
    filterListOutbound: filterListEl ? (str(filterListEl["outbound"]) ?? null) : null,
    inboundDistributeList: inboundNfEl ? (str(inboundNfEl["distribute-list"]) ?? null) : null,
    inboundPrefixList: inboundNfEl ? (str(inboundNfEl["prefix-list"]) ?? null) : null,
    outboundDistributeList: outboundNfEl ? (str(outboundNfEl["distribute-list"]) ?? null) : null,
    outboundPrefixList: outboundNfEl ? (str(outboundNfEl["prefix-list"]) ?? null) : null,
    inherit: str(c["inherit"]) === "yes",
  }
}

function extractFilteringProfiles(
  bgpEl: Record<string, unknown>,
  templateName: string | null
): PanwBgpFilteringProfile[] {
  return entries(bgpEl["filtering-profile"]).map((entry) => {
    const ipv4 = entry["ipv4"] as Record<string, unknown> | undefined
    const ipv6 = entry["ipv6"] as Record<string, unknown> | undefined
    return {
      name: entryName(entry),
      description: str(entry["description"]) ?? null,
      ipv4Unicast: ipv4 ? extractFilteringSubConfig(ipv4["unicast"]) : null,
      ipv4Multicast: ipv4 ? extractFilteringSubConfig(ipv4["multicast"]) : null,
      ipv6Unicast: ipv6 ? extractFilteringSubConfig(ipv6["unicast"]) : null,
      ipv6Multicast: ipv6 ? extractFilteringSubConfig(ipv6["multicast"]) : null,
      templateName,
    }
  })
}

// ─── Main Extractor ───────────────────────────────────────────────────────────

/**
 * Extract all BGP routing profiles from a template's <network> element.
 * Path: networkEl → routing-profile → bgp → (auth|timer|dampening|redist|af|filtering)
 */
export function extractBgpRoutingProfiles(
  networkEl: unknown,
  templateName: string | null
): PanwBgpRoutingProfiles {
  const empty: PanwBgpRoutingProfiles = {
    authProfiles: [],
    timerProfiles: [],
    dampeningProfiles: [],
    redistributionProfiles: [],
    addressFamilyProfiles: [],
    filteringProfiles: [],
  }

  if (!networkEl || typeof networkEl !== "object") return empty
  const net = networkEl as Record<string, unknown>
  const routingProfileEl = net["routing-profile"] as Record<string, unknown> | undefined
  if (!routingProfileEl) return empty

  const bgpEl = routingProfileEl["bgp"] as Record<string, unknown> | undefined
  if (!bgpEl) return empty

  return {
    authProfiles: extractAuthProfiles(bgpEl, templateName),
    timerProfiles: extractTimerProfiles(bgpEl, templateName),
    dampeningProfiles: extractDampeningProfiles(bgpEl, templateName),
    redistributionProfiles: extractRedistributionProfiles(bgpEl, templateName),
    addressFamilyProfiles: extractAddressFamilyProfiles(bgpEl, templateName),
    filteringProfiles: extractFilteringProfiles(bgpEl, templateName),
  }
}
