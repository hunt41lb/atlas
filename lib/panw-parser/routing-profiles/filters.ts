// @/lib/panw-parser/routing-profiles/filters.ts
//
// Routing filter types and extractors for Logical Routers.
// XML path: <network><routing-profile><filters>
//
// Contains 5 filter categories:
//   1. Access Lists           — <access-list>
//   2. Prefix Lists           — <prefix-list>
//   3. Community Lists        — <community-list>
//   4. AS Path Access Lists   — <as-path-access-list>
//   5. Route Maps             — <route-maps> (BGP + Redistribution)

import { entries, entryName, str, members, toArray } from "../xml-helpers"

// ═══════════════════════════════════════════════════════════════════════════════
// 1. ACCESS LISTS
// ═══════════════════════════════════════════════════════════════════════════════

export interface PanwAccessListEntry {
  /** Sequence number (the entry @_name, e.g. "1", "2") */
  sequence: string
  sourceAddress: string | null
  /** IPv4 only — wildcard mask */
  sourceWildcard: string | null
  /** IPv6 only — exact match flag */
  sourceExactMatch: boolean | null
  destinationAddress: string | null
  /** IPv4 only — wildcard mask */
  destinationWildcard: string | null
  action: string
}

export interface PanwAccessList {
  name: string
  description: string | null
  /** "ipv4" | "ipv6" — determined by which type key is present */
  type: string
  entries: PanwAccessListEntry[]
  templateName: string | null
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. PREFIX LISTS
// ═══════════════════════════════════════════════════════════════════════════════

export interface PanwPrefixListEntry {
  sequence: string
  /** Network address or object name (e.g. "any", "Subnet - Application Services IPv4") */
  network: string | null
  greaterThanOrEqual: number | null
  lessThanOrEqual: number | null
  action: string
}

export interface PanwPrefixList {
  name: string
  description: string | null
  type: string
  entries: PanwPrefixListEntry[]
  templateName: string | null
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. COMMUNITY LISTS
// ═══════════════════════════════════════════════════════════════════════════════

export interface PanwCommunityListEntry {
  sequence: string
  /** Well-known communities (regular) or regex patterns (extended/large) */
  values: string[]
  action: string
}

export interface PanwCommunityList {
  name: string
  description: string | null
  /** "regular" | "extended" | "large" */
  type: string
  entries: PanwCommunityListEntry[]
  templateName: string | null
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. AS PATH ACCESS LISTS
// ═══════════════════════════════════════════════════════════════════════════════

export interface PanwAsPathAccessListEntry {
  sequence: string
  regex: string | null
  action: string
}

export interface PanwAsPathAccessList {
  name: string
  description: string | null
  entries: PanwAsPathAccessListEntry[]
  templateName: string | null
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. ROUTE MAPS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Shared match/set reference types ─────────────────────────────────────────

export interface PanwRouteMapFilterRef {
  accessList: string | null
  prefixList: string | null
}

export interface PanwRouteMapMetric {
  value: number | null
  action: string | null
}

export interface PanwRouteMapAggregator {
  as: number | null
  routerId: string | null
}

// ─── BGP Route Map ────────────────────────────────────────────────────────────

export interface PanwBgpRouteMapMatch {
  ipv4Address: PanwRouteMapFilterRef | null
  ipv4NextHop: PanwRouteMapFilterRef | null
  ipv4RouteSource: PanwRouteMapFilterRef | null
  ipv6Address: PanwRouteMapFilterRef | null
  ipv6NextHop: PanwRouteMapFilterRef | null
  asPathAccessList: string | null
  regularCommunity: string | null
  largeCommunity: string | null
  extendedCommunity: string | null
  interface: string | null
  origin: string | null
  metric: number | null
  tag: number | null
  localPreference: number | null
  peer: string | null
}

export interface PanwBgpRouteMapSet {
  aspathPrepend: string[]
  aspathExclude: string[]
  aggregator: PanwRouteMapAggregator | null
  metric: PanwRouteMapMetric | null
  regularCommunity: string[]
  largeCommunity: string[]
  ipv4SourceAddress: string | null
  ipv4NextHop: string | null
  ipv6NextHop: string | null
  ipv6NextHopPreferGlobal: boolean
  atomicAggregate: boolean
  removeRegularCommunity: string | null
  overwriteRegularCommunity: boolean
  overwriteLargeCommunity: boolean
  removeLargeCommunity: string | null
  tag: number | null
  localPreference: number | null
  weight: number | null
  origin: string | null
  originatorId: string | null
}

export interface PanwBgpRouteMapEntry {
  sequence: string
  description: string | null
  action: string
  match: PanwBgpRouteMapMatch
  set: PanwBgpRouteMapSet
}

export interface PanwBgpRouteMap {
  name: string
  description: string | null
  entries: PanwBgpRouteMapEntry[]
  templateName: string | null
}

// ─── Redistribution Route Map ─────────────────────────────────────────────────

export interface PanwRedistRouteMapMatch {
  /** Filter refs under <ipv4> wrapper (connected-static→bgp) */
  ipv4Address: PanwRouteMapFilterRef | null
  ipv4NextHop: PanwRouteMapFilterRef | null
  /** Filter refs under <ipv6> wrapper */
  ipv6Address: PanwRouteMapFilterRef | null
  ipv6NextHop: PanwRouteMapFilterRef | null
  /** Filter refs directly on match (ospf→bgp, rip→bgp) */
  address: PanwRouteMapFilterRef | null
  nextHop: PanwRouteMapFilterRef | null
  interface: string | null
  origin: string | null
  metric: number | null
  tag: number | null
  localPreference: number | null
  peer: string | null
}

export interface PanwRedistRouteMapSet {
  aggregator: PanwRouteMapAggregator | null
  metric: PanwRouteMapMetric | null
  metricType: string | null
  aspathPrepend: string[]
  regularCommunity: string[]
  largeCommunity: string[]
  ipv4SourceAddress: string | null
  ipv4NextHop: string | null
  ipv6NextHop: string | null
  tag: number | null
  localPreference: number | null
  weight: number | null
  origin: string | null
  atomicAggregate: boolean
  originatorId: string | null
}

export interface PanwRedistRouteMapEntry {
  sequence: string
  description: string | null
  action: string
  match: PanwRedistRouteMapMatch
  set: PanwRedistRouteMapSet
}

export interface PanwRedistRouteMap {
  name: string
  description: string | null
  /** Source protocol(s), e.g. "connected-static", "rip", "bgp", "ospf" */
  sourceProtocol: string
  /** Destination protocol, e.g. "ospf", "bgp" */
  destProtocol: string
  entries: PanwRedistRouteMapEntry[]
  templateName: string | null
}

// ═══════════════════════════════════════════════════════════════════════════════
// AGGREGATE CONTAINER
// ═══════════════════════════════════════════════════════════════════════════════

export interface PanwRoutingFilters {
  accessLists: PanwAccessList[]
  prefixLists: PanwPrefixList[]
  communityLists: PanwCommunityList[]
  asPathAccessLists: PanwAsPathAccessList[]
  bgpRouteMaps: PanwBgpRouteMap[]
  redistRouteMaps: PanwRedistRouteMap[]
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXTRACTORS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Shared helpers ───────────────────────────────────────────────────────────

function extractFilterRef(el: unknown): PanwRouteMapFilterRef | null {
  if (!el || typeof el !== "object") return null
  const o = el as Record<string, unknown>
  const accessList = str(o["access-list"]) ?? null
  const prefixList = str(o["prefix-list"]) ?? null
  if (!accessList && !prefixList) return null
  return { accessList, prefixList }
}

function extractMetric(el: unknown): PanwRouteMapMetric | null {
  if (!el || typeof el !== "object") return null
  const o = el as Record<string, unknown>
  return {
    value: o["value"] !== undefined ? Number(o["value"]) : null,
    action: str(o["action"]) ?? null,
  }
}

function extractAggregator(el: unknown): PanwRouteMapAggregator | null {
  if (!el || typeof el !== "object") return null
  const o = el as Record<string, unknown>
  return {
    as: o["as"] !== undefined ? Number(o["as"]) : null,
    routerId: str(o["router-id"]) ?? null,
  }
}

function numOrNull(val: unknown): number | null {
  return val !== undefined ? Number(val) : null
}

// ─── 1. Access Lists ──────────────────────────────────────────────────────────

function extractIpv4AccessListEntries(typeEl: Record<string, unknown>): PanwAccessListEntry[] {
  const ipv4El = typeEl["ipv4"] as Record<string, unknown> | undefined
  if (!ipv4El) return []

  return entries(ipv4El["ipv4-entry"]).map((entry) => {
    // source-address contains an unnamed <entry> with address + wildcard
    const srcEl = entry["source-address"] as Record<string, unknown> | undefined
    const srcEntry = srcEl ? (toArray(srcEl["entry"] as unknown)[0] as Record<string, unknown> | undefined) : undefined

    // destination-address: either has an <entry> child or direct <address> child
    const dstEl = entry["destination-address"] as Record<string, unknown> | undefined
    let dstAddress: string | null = null
    let dstWildcard: string | null = null
    if (dstEl) {
      const dstEntry = toArray(dstEl["entry"] as unknown)[0] as Record<string, unknown> | undefined
      if (dstEntry) {
        dstAddress = str(dstEntry["address"]) ?? null
        dstWildcard = str(dstEntry["wildcard"]) ?? null
      } else {
        // Direct <address>any</address> pattern
        dstAddress = str(dstEl["address"]) ?? null
      }
    }

    return {
      sequence: entryName(entry),
      sourceAddress: srcEntry ? (str(srcEntry["address"]) ?? null) : null,
      sourceWildcard: srcEntry ? (str(srcEntry["wildcard"]) ?? null) : null,
      sourceExactMatch: null,
      destinationAddress: dstAddress,
      destinationWildcard: dstWildcard,
      action: str(entry["action"]) ?? "deny",
    }
  })
}

function extractIpv6AccessListEntries(typeEl: Record<string, unknown>): PanwAccessListEntry[] {
  const ipv6El = typeEl["ipv6"] as Record<string, unknown> | undefined
  if (!ipv6El) return []

  return entries(ipv6El["ipv6-entry"]).map((entry) => {
    const srcEl = entry["source-address"] as Record<string, unknown> | undefined
    const srcEntry = srcEl ? (toArray(srcEl["entry"] as unknown)[0] as Record<string, unknown> | undefined) : undefined

    return {
      sequence: entryName(entry),
      sourceAddress: srcEntry ? (str(srcEntry["address"]) ?? null) : null,
      sourceWildcard: null,
      sourceExactMatch: srcEntry ? (str(srcEntry["exact-match"]) === "yes") : null,
      destinationAddress: null,
      destinationWildcard: null,
      action: str(entry["action"]) ?? "deny",
    }
  })
}

function extractAccessLists(
  filtersEl: Record<string, unknown>,
  templateName: string | null
): PanwAccessList[] {
  return entries(filtersEl["access-list"]).map((entry) => {
    const typeEl = entry["type"] as Record<string, unknown> | undefined
    const isIpv6 = typeEl?.["ipv6"] !== undefined
    const type = isIpv6 ? "ipv6" : "ipv4"

    return {
      name: entryName(entry),
      description: str(entry["description"]) ?? null,
      type,
      entries: typeEl
        ? (isIpv6 ? extractIpv6AccessListEntries(typeEl) : extractIpv4AccessListEntries(typeEl))
        : [],
      templateName,
    }
  })
}

// ─── 2. Prefix Lists ─────────────────────────────────────────────────────────

function extractPrefixListEntries(typeEl: Record<string, unknown>, type: string): PanwPrefixListEntry[] {
  const protoEl = typeEl[type] as Record<string, unknown> | undefined
  if (!protoEl) return []

  const entriesKey = type === "ipv4" ? "ipv4-entry" : "ipv6-entry"
  return entries(protoEl[entriesKey]).map((entry) => {
    const prefixEl = entry["prefix"] as Record<string, unknown> | undefined
    const prefixEntry = prefixEl
      ? (toArray(prefixEl["entry"] as unknown)[0] as Record<string, unknown> | undefined)
      : undefined

    // <prefix> may have an <entry> wrapper or a direct <network> child
    const source = prefixEntry ?? prefixEl

    return {
      sequence: entryName(entry),
      network: source ? (str(source["network"]) ?? null) : null,
      greaterThanOrEqual: source?.["greater-than-or-equal"] !== undefined
        ? Number(source["greater-than-or-equal"])
        : null,
      lessThanOrEqual: source?.["less-than-or-equal"] !== undefined
        ? Number(source["less-than-or-equal"])
        : null,
      action: str(entry["action"]) ?? "deny",
    }
  })
}

function extractPrefixLists(
  filtersEl: Record<string, unknown>,
  templateName: string | null
): PanwPrefixList[] {
  return entries(filtersEl["prefix-list"]).map((entry) => {
    const typeEl = entry["type"] as Record<string, unknown> | undefined
    const isIpv6 = typeEl?.["ipv6"] !== undefined
    const type = isIpv6 ? "ipv6" : "ipv4"

    return {
      name: entryName(entry),
      description: str(entry["description"]) ?? null,
      type,
      entries: typeEl ? extractPrefixListEntries(typeEl, type) : [],
      templateName,
    }
  })
}

// ─── 3. Community Lists ───────────────────────────────────────────────────────

function extractCommunityLists(
  filtersEl: Record<string, unknown>,
  templateName: string | null
): PanwCommunityList[] {
  return entries(filtersEl["community-list"]).map((entry) => {
    const typeEl = entry["type"] as Record<string, unknown> | undefined
    if (!typeEl) {
      return {
        name: entryName(entry),
        description: str(entry["description"]) ?? null,
        type: "regular",
        entries: [],
        templateName,
      }
    }

    // Detect which type is present
    let type: string
    let seqEntries: PanwCommunityListEntry[]

    if (typeEl["regular"]) {
      type = "regular"
      const regEl = typeEl["regular"] as Record<string, unknown>
      seqEntries = entries(regEl["regular-entry"]).map((e) => ({
        sequence: entryName(e),
        values: members(e["community"]),
        action: str(e["action"]) ?? "deny",
      }))
    } else if (typeEl["extended"]) {
      type = "extended"
      const extEl = typeEl["extended"] as Record<string, unknown>
      seqEntries = entries(extEl["extended-entry"]).map((e) => ({
        sequence: entryName(e),
        values: members(e["ec-regex"]),
        action: str(e["action"]) ?? "deny",
      }))
    } else if (typeEl["large"]) {
      type = "large"
      const lrgEl = typeEl["large"] as Record<string, unknown>
      seqEntries = entries(lrgEl["large-entry"]).map((e) => ({
        sequence: entryName(e),
        values: members(e["lc-regex"]),
        action: str(e["action"]) ?? "deny",
      }))
    } else {
      type = "regular"
      seqEntries = []
    }

    return {
      name: entryName(entry),
      description: str(entry["description"]) ?? null,
      type,
      entries: seqEntries,
      templateName,
    }
  })
}

// ─── 4. AS Path Access Lists ──────────────────────────────────────────────────

function extractAsPathAccessLists(
  filtersEl: Record<string, unknown>,
  templateName: string | null
): PanwAsPathAccessList[] {
  return entries(filtersEl["as-path-access-list"]).map((entry) => ({
    name: entryName(entry),
    description: str(entry["description"]) ?? null,
    entries: entries(entry["aspath-entry"]).map((e) => ({
      sequence: entryName(e),
      regex: str(e["aspath-regex"]) ?? null,
      action: str(e["action"]) ?? "deny",
    })),
    templateName,
  }))
}

// ─── 5a. BGP Route Maps ──────────────────────────────────────────────────────

function extractBgpRouteMapMatch(matchEl: unknown): PanwBgpRouteMapMatch {
  const empty: PanwBgpRouteMapMatch = {
    ipv4Address: null, ipv4NextHop: null, ipv4RouteSource: null,
    ipv6Address: null, ipv6NextHop: null,
    asPathAccessList: null, regularCommunity: null, largeCommunity: null,
    extendedCommunity: null, interface: null, origin: null,
    metric: null, tag: null, localPreference: null, peer: null,
  }
  if (!matchEl || typeof matchEl !== "object") return empty
  const m = matchEl as Record<string, unknown>

  const ipv4El = m["ipv4"] as Record<string, unknown> | undefined
  const ipv6El = m["ipv6"] as Record<string, unknown> | undefined

  return {
    ipv4Address: ipv4El ? extractFilterRef(ipv4El["address"]) : null,
    ipv4NextHop: ipv4El ? extractFilterRef(ipv4El["next-hop"]) : null,
    ipv4RouteSource: ipv4El ? extractFilterRef(ipv4El["route-source"]) : null,
    ipv6Address: ipv6El ? extractFilterRef(ipv6El["address"]) : null,
    ipv6NextHop: ipv6El ? extractFilterRef(ipv6El["next-hop"]) : null,
    asPathAccessList: str(m["as-path-access-list"]) ?? null,
    regularCommunity: str(m["regular-community"]) ?? null,
    largeCommunity: str(m["large-community"]) ?? null,
    extendedCommunity: str(m["extended-community"]) ?? null,
    interface: str(m["interface"]) ?? null,
    origin: str(m["origin"]) ?? null,
    metric: numOrNull(m["metric"]),
    tag: numOrNull(m["tag"]),
    localPreference: numOrNull(m["local-preference"]),
    peer: str(m["peer"]) ?? null,
  }
}

function extractBgpRouteMapSet(setEl: unknown): PanwBgpRouteMapSet {
  const empty: PanwBgpRouteMapSet = {
    aspathPrepend: [], aspathExclude: [], aggregator: null, metric: null,
    regularCommunity: [], largeCommunity: [], ipv4SourceAddress: null,
    ipv4NextHop: null, ipv6NextHop: null, ipv6NextHopPreferGlobal: false,
    atomicAggregate: false, removeRegularCommunity: null,
    overwriteRegularCommunity: false, overwriteLargeCommunity: false,
    removeLargeCommunity: null, tag: null, localPreference: null,
    weight: null, origin: null, originatorId: null,
  }
  if (!setEl || typeof setEl !== "object") return empty
  const s = setEl as Record<string, unknown>

  const ipv4El = s["ipv4"] as Record<string, unknown> | undefined
  const ipv6El = s["ipv6"] as Record<string, unknown> | undefined

  return {
    aspathPrepend: members(s["aspath-prepend"]),
    aspathExclude: members(s["aspath-exclude"]),
    aggregator: extractAggregator(s["aggregator"]),
    metric: extractMetric(s["metric"]),
    regularCommunity: members(s["regular-community"]),
    largeCommunity: members(s["large-community"]),
    ipv4SourceAddress: ipv4El ? (str(ipv4El["source-address"]) ?? null) : null,
    ipv4NextHop: ipv4El ? (str(ipv4El["next-hop"]) ?? null) : null,
    ipv6NextHop: ipv6El ? (str(ipv6El["next-hop"]) ?? null) : null,
    ipv6NextHopPreferGlobal: str(s["ipv6-nexthop-prefer-global"]) === "yes",
    atomicAggregate: str(s["atomic-aggregate"]) === "yes",
    removeRegularCommunity: str(s["remove-regular-community"]) ?? null,
    overwriteRegularCommunity: str(s["overwrite-regular-community"]) === "yes",
    overwriteLargeCommunity: str(s["overwrite-large-community"]) === "yes",
    removeLargeCommunity: str(s["remove-large-community"]) ?? null,
    tag: numOrNull(s["tag"]),
    localPreference: numOrNull(s["local-preference"]),
    weight: numOrNull(s["weight"]),
    origin: str(s["origin"]) ?? null,
    originatorId: str(s["originator-id"]) ?? null,
  }
}

function extractBgpRouteMaps(
  routeMapsEl: Record<string, unknown>,
  templateName: string | null
): PanwBgpRouteMap[] {
  const bgpEl = routeMapsEl["bgp"] as Record<string, unknown> | undefined
  if (!bgpEl) return []

  return entries(bgpEl["bgp-entry"]).map((entry) => ({
    name: entryName(entry),
    description: str(entry["description"]) ?? null,
    entries: entries(entry["route-map"]).map((rm) => ({
      sequence: entryName(rm),
      description: str(rm["description"]) ?? null,
      action: str(rm["action"]) ?? "deny",
      match: extractBgpRouteMapMatch(rm["match"]),
      set: extractBgpRouteMapSet(rm["set"]),
    })),
    templateName,
  }))
}

// ─── 5b. Redistribution Route Maps ───────────────────────────────────────────

function extractRedistRouteMapMatch(matchEl: unknown): PanwRedistRouteMapMatch {
  const empty: PanwRedistRouteMapMatch = {
    ipv4Address: null, ipv4NextHop: null,
    ipv6Address: null, ipv6NextHop: null,
    address: null, nextHop: null,
    interface: null, origin: null, metric: null,
    tag: null, localPreference: null, peer: null,
  }
  if (!matchEl || typeof matchEl !== "object") return empty
  const m = matchEl as Record<string, unknown>

  const ipv4El = m["ipv4"] as Record<string, unknown> | undefined
  const ipv6El = m["ipv6"] as Record<string, unknown> | undefined

  return {
    ipv4Address: ipv4El ? extractFilterRef(ipv4El["address"]) : null,
    ipv4NextHop: ipv4El ? extractFilterRef(ipv4El["next-hop"]) : null,
    ipv6Address: ipv6El ? extractFilterRef(ipv6El["address"]) : null,
    ipv6NextHop: ipv6El ? extractFilterRef(ipv6El["next-hop"]) : null,
    address: extractFilterRef(m["address"]),
    nextHop: extractFilterRef(m["next-hop"]),
    interface: str(m["interface"]) ?? null,
    origin: str(m["origin"]) ?? null,
    metric: numOrNull(m["metric"]),
    tag: numOrNull(m["tag"]),
    localPreference: numOrNull(m["local-preference"]),
    peer: str(m["peer"]) ?? null,
  }
}

function extractRedistRouteMapSet(setEl: unknown): PanwRedistRouteMapSet {
  const empty: PanwRedistRouteMapSet = {
    aggregator: null, metric: null, metricType: null,
    aspathPrepend: [], regularCommunity: [], largeCommunity: [],
    ipv4SourceAddress: null, ipv4NextHop: null, ipv6NextHop: null,
    tag: null, localPreference: null, weight: null,
    origin: null, atomicAggregate: false, originatorId: null,
  }
  if (!setEl || typeof setEl !== "object") return empty
  const s = setEl as Record<string, unknown>

  const ipv4El = s["ipv4"] as Record<string, unknown> | undefined
  const ipv6El = s["ipv6"] as Record<string, unknown> | undefined

  return {
    aggregator: extractAggregator(s["aggregator"]),
    metric: extractMetric(s["metric"]),
    metricType: str(s["metric-type"]) ?? null,
    aspathPrepend: members(s["aspath-prepend"]),
    regularCommunity: members(s["regular-community"]),
    largeCommunity: members(s["large-community"]),
    ipv4SourceAddress: ipv4El ? (str(ipv4El["source-address"]) ?? null) : null,
    ipv4NextHop: ipv4El ? (str(ipv4El["next-hop"]) ?? null) : null,
    ipv6NextHop: ipv6El ? (str(ipv6El["next-hop"]) ?? null) : null,
    tag: numOrNull(s["tag"]),
    localPreference: numOrNull(s["local-preference"]),
    weight: numOrNull(s["weight"]),
    origin: str(s["origin"]) ?? null,
    atomicAggregate: str(s["atomic-aggregate"]) === "yes",
    originatorId: str(s["originator-id"]) ?? null,
  }
}

/** Known source protocol keys in redistribution route maps */
const REDIST_SOURCE_KEYS = ["connected-static", "rip", "bgp", "ospf"] as const

/** Known destination protocol keys */
const REDIST_DEST_KEYS = ["ospf", "bgp", "ospfv3", "rip", "rib"] as const

function extractRedistRouteMaps(
  routeMapsEl: Record<string, unknown>,
  templateName: string | null
): PanwRedistRouteMap[] {
  const redistEl = routeMapsEl["redistribution"] as Record<string, unknown> | undefined
  if (!redistEl) return []

  const results: PanwRedistRouteMap[] = []

  for (const entry of entries(redistEl["redist-entry"])) {
    const name = entryName(entry)
    const description = str(entry["description"]) ?? null

    // Each entry has a source protocol key containing a dest protocol key
    for (const srcKey of REDIST_SOURCE_KEYS) {
      const srcEl = entry[srcKey] as Record<string, unknown> | undefined
      if (!srcEl) continue

      for (const destKey of REDIST_DEST_KEYS) {
        const destEl = srcEl[destKey] as Record<string, unknown> | undefined
        if (!destEl) continue

        results.push({
          name,
          description,
          sourceProtocol: srcKey,
          destProtocol: destKey,
          entries: entries(destEl["route-map"]).map((rm) => ({
            sequence: entryName(rm),
            description: str(rm["description"]) ?? null,
            action: str(rm["action"]) ?? "deny",
            match: extractRedistRouteMapMatch(rm["match"]),
            set: extractRedistRouteMapSet(rm["set"]),
          })),
          templateName,
        })
      }
    }
  }

  return results
}

// ─── Main Extractor ───────────────────────────────────────────────────────────

/**
 * Extract all routing filters from a template's <network> element.
 * Path: networkEl → routing-profile → filters
 */
export function extractRoutingFilters(
  networkEl: unknown,
  templateName: string | null
): PanwRoutingFilters {
  const empty: PanwRoutingFilters = {
    accessLists: [],
    prefixLists: [],
    communityLists: [],
    asPathAccessLists: [],
    bgpRouteMaps: [],
    redistRouteMaps: [],
  }

  if (!networkEl || typeof networkEl !== "object") return empty
  const net = networkEl as Record<string, unknown>
  const routingProfileEl = net["routing-profile"] as Record<string, unknown> | undefined
  if (!routingProfileEl) return empty

  const filtersEl = routingProfileEl["filters"] as Record<string, unknown> | undefined
  if (!filtersEl) return empty

  const routeMapsEl = filtersEl["route-maps"] as Record<string, unknown> | undefined

  return {
    accessLists: extractAccessLists(filtersEl, templateName),
    prefixLists: extractPrefixLists(filtersEl, templateName),
    communityLists: extractCommunityLists(filtersEl, templateName),
    asPathAccessLists: extractAsPathAccessLists(filtersEl, templateName),
    bgpRouteMaps: routeMapsEl ? extractBgpRouteMaps(routeMapsEl, templateName) : [],
    redistRouteMaps: routeMapsEl ? extractRedistRouteMaps(routeMapsEl, templateName) : [],
  }
}
