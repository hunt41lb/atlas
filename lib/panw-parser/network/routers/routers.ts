// @/src/lib/panw-parser/network/routers/routers.ts
//
// Virtual Router and Logical Router types and extractors.
// Path: network > virtual-router > entry[]
// Path: network > logical-router > entry[] > vrf > entry[]

import { entries, entryName, str, dig, members, membersAt } from "../../xml-helpers"

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Path Monitor ─────────────────────────────────────────────────────────────

export interface PanwPathMonitorDestination {
  name: string
  enabled: boolean
  source: string | null
  sourceOverride: string | null
  destinationType: string | null
  destinationIp: string | null
  destinationFqdn: string | null
  interval: number | null
  count: number | null
}

// ─── Static Routes ────────────────────────────────────────────────────────────

export interface PanwStaticRoute {
  name: string
  destination: string
  nexthopType: string
  nexthop: string | null
  adminDistance: number | null
  interface: string | null
  metric: number | null
  routeTable: string | null
  bfdProfile: string | null
  pathMonitorEnabled: boolean
  pathMonitorFailureCondition: string | null
  pathMonitorHoldTime: number | null
  monitorDestinations: PanwPathMonitorDestination[]
}

// ─── Admin Distances ──────────────────────────────────────────────────────────

export interface PanwAdminDistances {
  static: number | null
  staticIpv6: number | null
  ospfIntra: number | null
  ospfInter: number | null
  ospfExt: number | null
  ospfv3Intra: number | null
  ospfv3Inter: number | null
  ospfv3Ext: number | null
  bgpInternal: number | null
  bgpExternal: number | null
  bgpLocal: number | null
  rip: number | null
}

// ─── Redistribution ───────────────────────────────────────────────────────────

export interface PanwRedistProfile {
  name: string
  priority: number | null
  action: string
  filterTypes: string[]
  filterInterfaces: string[]
  filterDestinations: string[]
  filterNexthops: string[]
}

// ─── RIP ──────────────────────────────────────────────────────────────────────

export interface PanwRipInterface {
  name: string
  enabled: boolean
  splitHorizon: string | null
  mode: string | null
  bfdProfile: string | null
  defaultRouteAdvertise: boolean
  defaultRouteMetric: number | null
  authProfile: string | null
}

export interface PanwRipTimers {
  intervalSeconds: number | null
  updateIntervals: number | null
  expireIntervals: number | null
  deleteIntervals: number | null
}

export interface PanwRipConfig {
  enabled: boolean
  defaultInformationOriginate: boolean
  globalBfdProfile: string | null
  rejectDefaultRoute: boolean
  interfaces: PanwRipInterface[]
  timers: PanwRipTimers | null
}

// ─── OSPF ─────────────────────────────────────────────────────────────────────

export interface PanwOspfInterface {
  name: string
  enabled: boolean
  passive: boolean
  metric: number | null
  priority: number | null
  helloInterval: number | null
  deadCounts: number | null
  retransmitInterval: number | null
  transitDelay: number | null
  grDelay: number | null
  linkType: string | null
  authProfile: string | null
  timingProfile: string | null
  bfdProfile: string | null
  mtuIgnore: boolean
}

export interface PanwOspfRange {
  prefix: string
  substitute: string | null
  advertise: boolean
}

export interface PanwOspfGracefulRestart {
  enabled: boolean
  helperEnabled: boolean
  strictLsaChecking: boolean
  gracePeriod: number | null
  maxNeighborRestartTime: number | null
}

export interface PanwOspfVirtualLink {
  name: string
  enabled: boolean
  neighborId: string | null
  transitAreaId: string | null
  authProfile: string | null
  timingProfile: string | null
}

export interface PanwOspfArea {
  id: string
  type: string
  ranges: PanwOspfRange[]
  interfaces: PanwOspfInterface[]
  virtualLinks: PanwOspfVirtualLink[]
}

export interface PanwOspfConfig {
  enabled: boolean
  routerId: string | null
  globalBfdProfile: string | null
  rejectDefaultRoute: boolean
  gracefulRestart: PanwOspfGracefulRestart | null
  rfc1583: boolean
  areas: PanwOspfArea[]
}

// ─── OSPFv3 ───────────────────────────────────────────────────────────────────

export interface PanwOspfv3Interface {
  name: string
  enabled: boolean
  passive: boolean
  instanceId: number | null
  metric: number | null
  priority: number | null
  helloInterval: number | null
  deadCounts: number | null
  retransmitInterval: number | null
  transitDelay: number | null
  grDelay: number | null
  linkType: string | null
  authProfile: string | null
  timingProfile: string | null
  bfdProfile: string | null
  mtuIgnore: boolean
}

export interface PanwOspfv3Area {
  id: string
  type: string
  ranges: PanwOspfRange[]
  interfaces: PanwOspfv3Interface[]
  virtualLinks: PanwOspfVirtualLink[]
}

export interface PanwOspfv3Config {
  enabled: boolean
  routerId: string | null
  globalBfdProfile: string | null
  rejectDefaultRoute: boolean
  gracefulRestart: PanwOspfGracefulRestart | null
  disableTransitTraffic: boolean
  areas: PanwOspfv3Area[]
}

// ─── BGP ──────────────────────────────────────────────────────────────────────

export interface PanwBgpPeer {
  name: string
  enabled: boolean
  peerAs: string | null
  peerAddress: string | null
  localInterface: string | null
  bfdProfile: string | null
  maxPrefixes: number | null
  addressFamily: string | null
  reflectorClient: string | null
  peeringType: string | null
}

export interface PanwBgpPeerGroup {
  name: string
  enabled: boolean
  type: string | null
  peers: PanwBgpPeer[]
}

export interface PanwBgpGracefulRestart {
  enabled: boolean
  staleRouteTime: number | null
  maxPeerRestartTime: number | null
  localRestartTime: number | null
}

export interface PanwBgpNetworkEntry {
  network: string
  unicast: boolean
  multicast: boolean
  backdoor: boolean
}

export interface PanwBgpConfig {
  enabled: boolean
  routerId: string | null
  localAs: string | null
  globalBfdProfile: string | null
  installRoute: boolean
  fastExternalFailover: boolean
  gracefulShutdown: boolean
  ecmpMultiAs: boolean
  enforceFirstAs: boolean
  defaultLocalPreference: number | null
  alwaysAdvertiseNetworkRoute: boolean
  gracefulRestart: PanwBgpGracefulRestart
  alwaysCompareMed: boolean
  deterministicMedComparison: boolean
  rejectDefaultRoute: boolean
  peerGroups: PanwBgpPeerGroup[]
  ipv4Networks: PanwBgpNetworkEntry[]
  ipv6Networks: PanwBgpNetworkEntry[]
}

// ─── Multicast ────────────────────────────────────────────────────────────────

export interface PanwMulticastInterfaceGroup {
  name: string
  description: string | null
  interfaces: string[]
  pimEnabled: boolean
  igmpEnabled: boolean
  igmpVersion: string | null
}

export interface PanwMulticastStaticRoute {
  name: string
  destination: string | null
  nexthop: string | null
  interface: string | null
  preference: number | null
}

export interface PanwMulticastPimSptThreshold {
  groupAddress: string
  threshold: string | null
}

export interface PanwMulticastPimInterface {
  name: string
  drPriority: number | null
  ifTimer: string | null
  neighborFilter: string | null
  description: string | null
  sendBsm: boolean
}

export interface PanwMulticastPimRp {
  address: string | null
  groupList: string | null
  interface: string | null
  override: boolean
}

export interface PanwMulticastPimExternalRp {
  ipAddress: string
  groupList: string | null
  override: boolean
}

export interface PanwMulticastPimConfig {
  enabled: boolean
  rpfLookupMode: string | null
  routeAgeoutTime: number | null
  groupPermission: string | null
  ssmGroupList: string | null
  interfaces: PanwMulticastPimInterface[]
  sptThresholds: PanwMulticastPimSptThreshold[]
  localRp: PanwMulticastPimRp | null
  externalRps: PanwMulticastPimExternalRp[]
}

export interface PanwMulticastIgmpDynamicInterface {
  name: string
  groupFilter: string | null
  queryProfile: string | null
  version: string | null
  robustness: number | null
  maxGroups: string | null
  maxSources: string | null
  routerAlertPolicing: boolean
}

export interface PanwMulticastIgmpStaticEntry {
  name: string
  interface: string | null
  groupAddress: string | null
  sourceAddress: string | null
}

export interface PanwMulticastIgmpConfig {
  enabled: boolean
  dynamicInterfaces: PanwMulticastIgmpDynamicInterface[]
  staticEntries: PanwMulticastIgmpStaticEntry[]
}

export interface PanwMulticastMsdpPeer {
  name: string
  peerAddress: string | null
  localInterface: string | null
  localIp: string | null
  authProfile: string | null
  maxSa: number | null
  inboundSaFilter: string | null
  outboundSaFilter: string | null
}

export interface PanwMulticastMsdpConfig {
  enabled: boolean
  globalTimer: string | null
  globalAuth: string | null
  originatorIp: string | null
  originatorInterface: string | null
  peers: PanwMulticastMsdpPeer[]
}

export interface PanwMulticastConfig {
  enabled: boolean
  interfaceGroups: PanwMulticastInterfaceGroup[]
  staticRoutes: PanwMulticastStaticRoute[]
  pim: PanwMulticastPimConfig | null
  igmp: PanwMulticastIgmpConfig | null
  msdp: PanwMulticastMsdpConfig | null
}

// ─── ECMP ─────────────────────────────────────────────────────────────────────

export interface PanwEcmpIpHash {
  srcOnly: boolean
  usePort: boolean
  hashSeed: number | null
}

export interface PanwEcmpWeightedInterface {
  name: string
  weight: number | null
}

export interface PanwEcmpConfig {
  enabled: boolean
  maxPath: number | null
  algorithm: string | null
  symmetricReturn: boolean
  strictSourcePath: boolean
  ipHash: PanwEcmpIpHash | null
  weightedInterfaces: PanwEcmpWeightedInterface[]
}

// ─── Logical Router Refs ──────────────────────────────────────────────────────

export interface PanwLrAreaRef {
  id: string
  abrImportList: string | null
  abrExportList: string | null
  abrInboundFilterList: string | null
  abrOutboundFilterList: string | null
  authProfile: string | null
  interfaces: {
    name: string
    timingProfile: string | null
    authProfile: string | null
    bfdProfile: string | null
  }[]
}

export interface PanwLrOspfRefs {
  enabled: boolean
  routerId: string | null
  redistProfileName: string | null
  spfTimerName: string | null
  globalIfTimerName: string | null
  globalBfdProfile: string | null
  areas: PanwLrAreaRef[]
}

export interface PanwLrRipRefs {
  enabled: boolean
  globalTimerName: string | null
  authProfileName: string | null
  redistProfileName: string | null
  globalBfdProfile: string | null
  globalInboundDistList: string | null
  globalOutboundDistList: string | null
  interfaces: {
    name: string
    inboundDistList: string | null
    inboundDistMetric: number | null
    outboundDistList: string | null
    outboundDistMetric: number | null
    authProfile: string | null
    bfdProfile: string | null
  }[]
}

export interface PanwLrBgpPeerGroup {
  name: string
  enabled: boolean
  type: string | null
  addressFamily: { ipv4: string | null; ipv6: string | null }
  filteringProfile: { ipv4: string | null; ipv6: string | null }
  connectionOptions: { auth: string | null; timers: string | null; dampening: string | null; multihop: string | null }
  peers: {
    name: string
    enabled: boolean
    peerAs: string | null
    inherit: boolean
    localAddress: string | null
    peerAddress: string | null
    passive: boolean
    senderSideLoopDetection: boolean
    connectionOptions: { auth: string | null; timers: string | null; dampening: string | null; multihop: string | null }
    bfdProfile: string | null
  }[]
}

export interface PanwLrBgpAggregateRoute {
  name: string
  description: string | null
  enabled: boolean
  asSet: boolean
  summaryOnly: boolean
  sameMed: boolean
  type: "ipv4" | "ipv6" | null
  summaryPrefix: string | null
  suppressMap: string | null
  attributeMap: string | null
}

export interface PanwLrBgpRefs {
  enabled: boolean
  routerId: string | null
  localAs: string | null
  globalBfdProfile: string | null
  redistProfile: { ipv4Unicast: string | null; ipv6Unicast: string | null }
  peerGroups: PanwLrBgpPeerGroup[]
  aggregateRoutes: PanwLrBgpAggregateRoute[]
}

export interface PanwLrRibFilter {
  ipv4: { bgp: string | null; ospf: string | null; static: string | null; rip: string | null }
  ipv6: { bgp: string | null; ospfv3: string | null; static: string | null }
}

export interface PanwLrMsdpRefs {
  globalTimerName: string | null
  globalAuthName: string | null
  peers: {
    name: string
    authProfile: string | null
    inboundSaFilter: string | null
    outboundSaFilter: string | null
  }[]
}

// ─── Virtual Router ───────────────────────────────────────────────────────────

export interface PanwVirtualRouter {
  name: string
  interfaces: string[]
  staticRoutes: PanwStaticRoute[]
  staticRoutesV6: PanwStaticRoute[]
  templateName: string | null
  ecmp: PanwEcmpConfig
  bgp: PanwBgpConfig
  ospf: PanwOspfConfig
  ospfv3: PanwOspfv3Config
  rip: PanwRipConfig
  redistProfiles: PanwRedistProfile[]
  multicast: PanwMulticastConfig
  adminDistances: PanwAdminDistances | null
  ospfRefs?: PanwLrOspfRefs
  ospfv3Refs?: PanwLrOspfRefs
  ripRefs?: PanwLrRipRefs
  bgpRefs?: PanwLrBgpRefs
  ribFilter?: PanwLrRibFilter
  msdpRefs?: PanwLrMsdpRefs
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Admin Distances ──────────────────────────────────────────────────────────

function extractAdminDistances(el: unknown): PanwAdminDistances | null {
  if (!el || typeof el !== "object") return null
  const d = el as Record<string, unknown>
  return {
    static: d["static"] !== undefined ? Number(d["static"]) : null,
    staticIpv6: d["static-ipv6"] !== undefined ? Number(d["static-ipv6"]) : null,
    ospfIntra: d["ospf-intra"] !== undefined ? Number(d["ospf-intra"]) : null,
    ospfInter: d["ospf-inter"] !== undefined ? Number(d["ospf-inter"]) : null,
    ospfExt: d["ospf-ext"] !== undefined ? Number(d["ospf-ext"]) : null,
    ospfv3Intra: d["ospfv3-intra"] !== undefined ? Number(d["ospfv3-intra"]) : null,
    ospfv3Inter: d["ospfv3-inter"] !== undefined ? Number(d["ospfv3-inter"]) : null,
    ospfv3Ext: d["ospfv3-ext"] !== undefined ? Number(d["ospfv3-ext"]) : null,
    bgpInternal: d["bgp-internal"] !== undefined ? Number(d["bgp-internal"]) : null,
    bgpExternal: d["bgp-external"] !== undefined ? Number(d["bgp-external"]) : null,
    bgpLocal: d["bgp-local"] !== undefined ? Number(d["bgp-local"]) : null,
    rip: d["rip"] !== undefined ? Number(d["rip"]) : null,
  }
}

// ─── Static Routes (shared between IPv4 and IPv6) ────────────────────────────

function extractStaticRoutes(routeEl: unknown): PanwStaticRoute[] {
  return entries(routeEl).map((r) => {
    const nexthopEl = r["nexthop"] as Record<string, unknown> | undefined

    let nexthopType = "none"
    let nexthop: string | null = null
    if (nexthopEl) {
      if (nexthopEl["ip-address"] !== undefined) {
        nexthopType = "ip-address"
        nexthop = str(nexthopEl["ip-address"])
      } else if (nexthopEl["ipv6-address"] !== undefined) {
        nexthopType = "ipv6-address"
        nexthop = str(nexthopEl["ipv6-address"])
      } else if (nexthopEl["next-vr"] !== undefined) {
        nexthopType = "next-vr"
        nexthop = str(nexthopEl["next-vr"])
      } else if (nexthopEl["next-lr"] !== undefined) {
        nexthopType = "next-lr"
        nexthop = str(nexthopEl["next-lr"])
      } else if (nexthopEl["fqdn"] !== undefined) {
        nexthopType = "fqdn"
        nexthop = str(nexthopEl["fqdn"])
      } else if (nexthopEl["discard"] !== undefined) {
        nexthopType = "discard"
        nexthop = null
      }
    }

    const routeTableEl = r["route-table"] as Record<string, unknown> | undefined
    let routeTable: string | null = null
    if (routeTableEl) {
      if (routeTableEl["unicast"] !== undefined) routeTable = "unicast"
      else if (routeTableEl["multicast"] !== undefined) routeTable = "multicast"
      else if (routeTableEl["both"] !== undefined) routeTable = "both"
      else if (routeTableEl["no-install"] !== undefined) routeTable = "no-install"
    }

    return {
      name: entryName(r),
      destination: str(r["destination"]) ?? "",
      nexthopType,
      nexthop,
      adminDistance: r["admin-dist"] !== undefined ? Number(r["admin-dist"]) : null,
      interface: str(r["interface"]),
      metric: r["metric"] !== undefined ? Number(r["metric"]) : null,
      routeTable,
      bfdProfile: str(dig(r, "bfd", "profile")) ?? null,
      pathMonitorEnabled: str(dig(r, "path-monitor", "enable")) === "yes",
      pathMonitorFailureCondition: str(dig(r, "path-monitor", "failure-condition")) ?? null,
      pathMonitorHoldTime: dig(r, "path-monitor", "hold-time") !== undefined
        ? Number(str(dig(r, "path-monitor", "hold-time")))
        : null,
      monitorDestinations: entries(dig(r, "path-monitor", "monitor-destinations")).map((md) => {
        const destIp = str(md["destination"]) ?? null
        const destFqdn = str(md["destination-fqdn"]) ?? null
        const destinationType = destFqdn ? "FQDN" : destIp ? "IP Address" : "None"

        return {
          name: entryName(md),
          enabled: str(md["enable"]) === "yes",
          source: str(md["source"]) ?? null,
          sourceOverride: str(md["source-override"]) ?? null,
          destinationType,
          destinationIp: destIp,
          destinationFqdn: destFqdn,
          interval: md["interval"] !== undefined ? Number(md["interval"]) : null,
          count: md["count"] !== undefined ? Number(md["count"]) : null,
        }
      }),
    }
  })
}

// ─── Redistribution Profiles ──────────────────────────────────────────────────

function extractRedistProfiles(protocolEl: unknown): PanwRedistProfile[] {
  if (!protocolEl || typeof protocolEl !== "object") return []
  const proto = protocolEl as Record<string, unknown>
  return entries(proto["redist-profile"]).map((entry) => {
    const filterEl = entry["filter"] as Record<string, unknown> | undefined
    const actionEl = entry["action"] as Record<string, unknown> | undefined
    let action = "no-redist"
    if (actionEl) {
      if (actionEl["redist"] !== undefined) action = "redist"
      else if (actionEl["no-redist"] !== undefined) action = "no-redist"
    }
    return {
      name: entryName(entry),
      priority: entry["priority"] !== undefined ? Number(entry["priority"]) : null,
      action,
      filterTypes: filterEl ? members(filterEl["type"]) : [],
      filterInterfaces: filterEl ? members(filterEl["interface"]) : [],
      filterDestinations: filterEl ? members(filterEl["destination"]) : [],
      filterNexthops: filterEl ? members(filterEl["nexthop"]) : [],
    }
  })
}

// ─── RIP ──────────────────────────────────────────────────────────────────────

function extractRipConfig(protocolEl: unknown): PanwRipConfig {
  const ripEl = dig(protocolEl, "rip") as Record<string, unknown> | undefined
  if (!ripEl) {
    return {
      enabled: false, defaultInformationOriginate: false,
      globalBfdProfile: null, rejectDefaultRoute: false,
      interfaces: [], timers: null,
    }
  }

  const interfaces: PanwRipInterface[] = entries(dig(ripEl, "interface")).map((entry) => ({
    name: entryName(entry),
    enabled: str(entry["enable"]) === "yes",
    splitHorizon: str(entry["split-horizon"]) ?? null,
    mode: str(entry["mode"]) ?? null,
    bfdProfile: str(dig(entry, "bfd", "profile")) ?? null,
    defaultRouteAdvertise: dig(entry, "default-route", "advertise") !== undefined,
    defaultRouteMetric: dig(entry, "default-route", "advertise", "metric") !== undefined
      ? Number(str(dig(entry, "default-route", "advertise", "metric")))
      : null,
    authProfile: str(entry["authentication"]) ?? str(entry["auth-profile"]) ?? null,
  }))

  const timersEl = ripEl["timers"] as Record<string, unknown> | undefined
  const timers: PanwRipTimers | null = timersEl ? {
    intervalSeconds: timersEl["interval-seconds"] !== undefined ? Number(timersEl["interval-seconds"]) : null,
    updateIntervals: timersEl["update-intervals"] !== undefined ? Number(timersEl["update-intervals"]) : null,
    expireIntervals: timersEl["expire-intervals"] !== undefined ? Number(timersEl["expire-intervals"]) : null,
    deleteIntervals: timersEl["delete-intervals"] !== undefined ? Number(timersEl["delete-intervals"]) : null,
  } : null

  return {
    enabled: str(ripEl["enable"]) === "yes",
    defaultInformationOriginate: str(ripEl["default-information-originate"]) === "yes",
    globalBfdProfile: str(dig(ripEl, "global-bfd", "profile")) ?? null,
    rejectDefaultRoute: str(dig(ripEl, "reject-default-route")) === "yes",
    interfaces,
    timers,
  }
}

// ─── OSPF ─────────────────────────────────────────────────────────────────────

function detectAreaType(entry: Record<string, unknown>): string {
  const typeEl = entry["type"] as Record<string, unknown> | undefined
  if (!typeEl) return "normal"
  if (typeEl["normal"] !== undefined) return "normal"
  if (typeEl["stub"] !== undefined) return "stub"
  if (typeEl["nssa"] !== undefined) return "nssa"
  return "normal"
}

function detectLinkType(entry: Record<string, unknown>): string | null {
  const ltEl = entry["link-type"] as Record<string, unknown> | undefined
  if (!ltEl) return null
  if (ltEl["broadcast"] !== undefined) return "broadcast"
  if (ltEl["p2p"] !== undefined) return "p2p"
  if (ltEl["p2mp"] !== undefined) return "p2mp"
  return null
}

function extractGracefulRestart(el: unknown): PanwOspfGracefulRestart | null {
  if (!el || typeof el !== "object") return null
  const gr = el as Record<string, unknown>
  return {
    enabled: str(gr["enable"]) === "yes",
    helperEnabled: str(gr["helper-enable"]) === "yes",
    strictLsaChecking: str(gr["strict-LSA-checking"]) === "yes",
    gracePeriod: gr["grace-period"] !== undefined ? Number(gr["grace-period"]) : null,
    maxNeighborRestartTime: gr["max-neighbor-restart-time"] !== undefined ? Number(gr["max-neighbor-restart-time"]) : null,
  }
}

function extractOspfRanges(areaEntry: Record<string, unknown>): PanwOspfRange[] {
  return entries(areaEntry["range"]).map((r) => ({
    prefix: entryName(r),
    substitute: str(r["@_substitute"]) ?? null,
    advertise: str(r["advertise"]) !== "no",
  }))
}

function extractVirtualLinks(areaEntry: Record<string, unknown>): PanwOspfVirtualLink[] {
  return entries(dig(areaEntry, "virtual-link")).map((entry) => ({
    name: entryName(entry),
    enabled: str(entry["enable"]) === "yes",
    neighborId: str(entry["neighbor-id"]) ?? null,
    transitAreaId: str(entry["transit-area-id"]) ?? null,
    authProfile: str(entry["authentication"]) ?? null,
    timingProfile: str(entry["timing"]) ?? null,
  }))
}

function extractOspfConfig(protocolEl: unknown): PanwOspfConfig {
  const ospfEl = dig(protocolEl, "ospf") as Record<string, unknown> | undefined
  if (!ospfEl) {
    return { enabled: false, routerId: null, globalBfdProfile: null, rejectDefaultRoute: false, gracefulRestart: null, rfc1583: false, areas: [] }
  }

  const areas: PanwOspfArea[] = entries(dig(ospfEl, "area")).map((areaEntry) => ({
    id: entryName(areaEntry),
    type: detectAreaType(areaEntry),
    ranges: extractOspfRanges(areaEntry),
    interfaces: entries(dig(areaEntry, "interface")).map((ifEntry) => ({
      name: entryName(ifEntry),
      enabled: str(ifEntry["enable"]) === "yes",
      passive: str(ifEntry["passive"]) === "yes",
      metric: ifEntry["metric"] !== undefined ? Number(ifEntry["metric"]) : null,
      priority: ifEntry["priority"] !== undefined ? Number(ifEntry["priority"]) : null,
      helloInterval: ifEntry["hello-interval"] !== undefined ? Number(ifEntry["hello-interval"]) : null,
      deadCounts: ifEntry["dead-counts"] !== undefined ? Number(ifEntry["dead-counts"]) : null,
      retransmitInterval: ifEntry["retransmit-interval"] !== undefined ? Number(ifEntry["retransmit-interval"]) : null,
      transitDelay: ifEntry["transit-delay"] !== undefined ? Number(ifEntry["transit-delay"]) : null,
      grDelay: ifEntry["gr-delay"] !== undefined ? Number(ifEntry["gr-delay"]) : null,
      linkType: detectLinkType(ifEntry),
      authProfile: str(ifEntry["authentication"]) ?? null,
      timingProfile: str(ifEntry["timing"]) ?? null,
      bfdProfile: str(dig(ifEntry, "bfd", "profile")) ?? null,
      mtuIgnore: str(ifEntry["mtu-ignore"]) === "yes",
    })),
    virtualLinks: extractVirtualLinks(areaEntry),
  }))

  return {
    enabled: str(ospfEl["enable"]) === "yes",
    routerId: str(ospfEl["router-id"]) ?? null,
    globalBfdProfile: str(dig(ospfEl, "global-bfd", "profile")) ?? null,
    rejectDefaultRoute: str(dig(ospfEl, "reject-default-route")) === "yes",
    gracefulRestart: extractGracefulRestart(ospfEl["graceful-restart"]),
    rfc1583: str(ospfEl["rfc1583"]) === "yes",
    areas,
  }
}

// ─── OSPFv3 ───────────────────────────────────────────────────────────────────

function extractOspfv3Config(protocolEl: unknown): PanwOspfv3Config {
  const ospfv3El = dig(protocolEl, "ospfv3") as Record<string, unknown> | undefined
  if (!ospfv3El) {
    return { enabled: false, routerId: null, globalBfdProfile: null, rejectDefaultRoute: false, gracefulRestart: null, disableTransitTraffic: false, areas: [] }
  }

  const areas: PanwOspfv3Area[] = entries(dig(ospfv3El, "area")).map((areaEntry) => ({
    id: entryName(areaEntry),
    type: detectAreaType(areaEntry),
    ranges: extractOspfRanges(areaEntry),
    interfaces: entries(dig(areaEntry, "interface")).map((ifEntry) => ({
      name: entryName(ifEntry),
      enabled: str(ifEntry["enable"]) === "yes",
      passive: str(ifEntry["passive"]) === "yes",
      instanceId: ifEntry["instance-id"] !== undefined ? Number(ifEntry["instance-id"]) : null,
      metric: ifEntry["metric"] !== undefined ? Number(ifEntry["metric"]) : null,
      priority: ifEntry["priority"] !== undefined ? Number(ifEntry["priority"]) : null,
      helloInterval: ifEntry["hello-interval"] !== undefined ? Number(ifEntry["hello-interval"]) : null,
      deadCounts: ifEntry["dead-counts"] !== undefined ? Number(ifEntry["dead-counts"]) : null,
      retransmitInterval: ifEntry["retransmit-interval"] !== undefined ? Number(ifEntry["retransmit-interval"]) : null,
      transitDelay: ifEntry["transit-delay"] !== undefined ? Number(ifEntry["transit-delay"]) : null,
      grDelay: ifEntry["gr-delay"] !== undefined ? Number(ifEntry["gr-delay"]) : null,
      linkType: detectLinkType(ifEntry),
      authProfile: str(ifEntry["authentication"]) ?? null,
      timingProfile: str(ifEntry["timing"]) ?? null,
      bfdProfile: str(dig(ifEntry, "bfd", "profile")) ?? null,
      mtuIgnore: str(ifEntry["mtu-ignore"]) === "yes",
    })),
    virtualLinks: extractVirtualLinks(areaEntry),
  }))

  return {
    enabled: str(ospfv3El["enable"]) === "yes",
    routerId: str(ospfv3El["router-id"]) ?? null,
    globalBfdProfile: str(dig(ospfv3El, "global-bfd", "profile")) ?? null,
    rejectDefaultRoute: str(dig(ospfv3El, "reject-default-route")) === "yes",
    gracefulRestart: extractGracefulRestart(ospfv3El["graceful-restart"]),
    disableTransitTraffic: str(ospfv3El["disable-transit-traffic"]) === "yes",
    areas,
  }
}

// ─── BGP ──────────────────────────────────────────────────────────────────────

function detectBgpPeerGroupType(entry: Record<string, unknown>): string | null {
  const typeEl = entry["type"] as Record<string, unknown> | undefined
  if (!typeEl) return null
  if (typeEl["ebgp"] !== undefined) return "EBGP"
  if (typeEl["ibgp"] !== undefined) return "IBGP"
  if (typeEl["ebgp-confed"] !== undefined) return "EBGP Confed"
  if (typeEl["ibgp-confed"] !== undefined) return "IBGP Confed"
  return null
}

function extractBgpConfig(protocolEl: unknown): PanwBgpConfig {
  const bgpEl = dig(protocolEl, "bgp") as Record<string, unknown> | undefined
  if (!bgpEl) {
    return {
      enabled: false, routerId: null, localAs: null, globalBfdProfile: null,
      installRoute: false, fastExternalFailover: false, gracefulShutdown: false,
      ecmpMultiAs: false, enforceFirstAs: false, defaultLocalPreference: null,
      alwaysAdvertiseNetworkRoute: false,
      gracefulRestart: { enabled: false, staleRouteTime: null, maxPeerRestartTime: null, localRestartTime: null },
      alwaysCompareMed: false, deterministicMedComparison: false,
      rejectDefaultRoute: false, peerGroups: [],
      ipv4Networks: [], ipv6Networks: [],
    }
  }

  const peerGroups: PanwBgpPeerGroup[] = entries(dig(bgpEl, "peer-group")).map((pgEntry) => ({
    name: entryName(pgEntry),
    enabled: str(pgEntry["enable"]) === "yes",
    type: detectBgpPeerGroupType(pgEntry),
    peers: entries(dig(pgEntry, "peer")).map((peerEntry) => ({
      name: entryName(peerEntry),
      enabled: str(peerEntry["enable"]) === "yes",
      peerAs: str(peerEntry["peer-as"]) ?? null,
      peerAddress: str(dig(peerEntry, "peer-address", "ip")) ?? null,
      localInterface: str(dig(peerEntry, "local-address", "interface")) ?? null,
      bfdProfile: str(dig(peerEntry, "bfd", "profile")) ?? null,
      maxPrefixes: peerEntry["max-prefixes"] !== undefined ? Number(peerEntry["max-prefixes"]) : null,
      addressFamily: str(peerEntry["address-family-identifier"]) ?? null,
      reflectorClient: str(peerEntry["reflector-client"]) ?? null,
      peeringType: str(peerEntry["peering-type"]) ?? null,
    })),
  }))

  const grEl = bgpEl["graceful-restart"] as Record<string, unknown> | undefined
  const medEl = bgpEl["med"] as Record<string, unknown> | undefined
  const advNet = bgpEl["advertise-network"] as Record<string, unknown> | undefined

  function extractNetworkEntries(afiEl: unknown): PanwBgpNetworkEntry[] {
    if (!afiEl || typeof afiEl !== "object") return []
    const afi = afiEl as Record<string, unknown>
    return entries(dig(afi, "network")).map((entry) => ({
      network: entryName(entry),
      unicast: str(entry["unicast"]) === "yes",
      multicast: str(entry["multicast"]) === "yes",
      backdoor: str(entry["backdoor"]) === "yes",
    }))
  }

  return {
    enabled: str(bgpEl["enable"]) === "yes",
    routerId: str(bgpEl["router-id"]) ?? null,
    localAs: str(bgpEl["local-as"]) ?? null,
    globalBfdProfile: str(dig(bgpEl, "global-bfd", "profile")) ?? null,
    installRoute: str(bgpEl["install-route"]) === "yes",
    fastExternalFailover: str(bgpEl["fast-external-failover"]) === "yes",
    gracefulShutdown: str(bgpEl["graceful-shutdown"]) === "yes",
    ecmpMultiAs: str(bgpEl["ecmp-multi-as"]) === "yes",
    enforceFirstAs: str(bgpEl["enforce-first-as"]) === "yes",
    defaultLocalPreference: bgpEl["default-local-preference"] !== undefined ? Number(bgpEl["default-local-preference"]) : null,
    alwaysAdvertiseNetworkRoute: str(bgpEl["always-advertise-network-route"]) === "yes",
    gracefulRestart: {
      enabled: grEl ? str(grEl["enable"]) === "yes" : false,
      staleRouteTime: grEl?.["stale-route-time"] !== undefined ? Number(grEl["stale-route-time"]) : null,
      maxPeerRestartTime: grEl?.["max-peer-restart-time"] !== undefined ? Number(grEl["max-peer-restart-time"]) : null,
      localRestartTime: grEl?.["local-restart-time"] !== undefined ? Number(grEl["local-restart-time"]) : null,
    },
    alwaysCompareMed: medEl ? str(medEl["always-compare-med"]) === "yes" : false,
    deterministicMedComparison: medEl ? str(medEl["deterministic-med-comparison"]) === "yes" : false,
    rejectDefaultRoute: str(dig(bgpEl, "reject-default-route")) === "yes",
    peerGroups,
    ipv4Networks: extractNetworkEntries(advNet?.["ipv4"]),
    ipv6Networks: extractNetworkEntries(advNet?.["ipv6"]),
  }
}

// ─── Multicast ────────────────────────────────────────────────────────────────

function extractMulticastConfig(vrEntry: Record<string, unknown>): PanwMulticastConfig {
  const mcEl = vrEntry["multicast"] as Record<string, unknown> | undefined
  if (!mcEl) {
    return { enabled: false, interfaceGroups: [], staticRoutes: [], pim: null, igmp: null, msdp: null }
  }

  const interfaceGroups: PanwMulticastInterfaceGroup[] = entries(dig(mcEl, "interface-group")).map((igEntry) => ({
    name: entryName(igEntry),
    description: str(igEntry["description"]) ?? null,
    interfaces: members(dig(igEntry, "interface")),
    pimEnabled: str(dig(igEntry, "pim", "enable")) === "yes",
    igmpEnabled: str(dig(igEntry, "igmp", "enable")) === "yes",
    igmpVersion: str(dig(igEntry, "igmp", "version")) ?? null,
  }))

  const staticRoutes: PanwMulticastStaticRoute[] = entries(mcEl["static-route"]).map((entry) => ({
    name: entryName(entry),
    destination: str(entry["destination"]) ?? null,
    nexthop: str(dig(entry, "nexthop", "ip-address")) ?? null,
    interface: str(entry["interface"]) ?? null,
    preference: entry["preference"] !== undefined ? Number(entry["preference"]) : null,
  }))

  const pimEl = mcEl["pim"] as Record<string, unknown> | undefined
  const pim: PanwMulticastPimConfig | null = pimEl ? {
    enabled: str(pimEl["enable"]) === "yes",
    rpfLookupMode: str(pimEl["rpf-lookup-mode"]) ?? null,
    routeAgeoutTime: pimEl["route-ageout-time"] !== undefined ? Number(pimEl["route-ageout-time"]) : null,
    groupPermission: str(pimEl["group-permission"]) ?? null,
    ssmGroupList: str(dig(pimEl, "ssm-address-space", "group-list")) ?? null,
    interfaces: entries(dig(pimEl, "interface")).map((entry) => ({
      name: entryName(entry),
      drPriority: entry["dr-priority"] !== undefined ? Number(entry["dr-priority"]) : null,
      ifTimer: str(entry["if-timer"]) ?? null,
      neighborFilter: str(entry["neighbor-filter"]) ?? null,
      description: str(entry["description"]) ?? null,
      sendBsm: str(entry["send-bsm"]) === "yes",
    })),
    sptThresholds: entries(dig(pimEl, "spt-threshold")).map((entry) => ({
      groupAddress: entryName(entry),
      threshold: str(entry["threshold"]) ?? null,
    })),
    localRp: (() => {
      const rpEl = dig(pimEl, "rp", "local-rp", "static-rp") as Record<string, unknown> | undefined
      if (!rpEl) return null
      return {
        address: str(rpEl["address"]) ?? null,
        groupList: str(rpEl["group-list"]) ?? null,
        interface: str(rpEl["interface"]) ?? null,
        override: str(rpEl["override"]) === "yes",
      }
    })(),
    externalRps: entries(dig(pimEl, "rp", "external-rp")).map((entry) => ({
      ipAddress: entryName(entry),
      groupList: str(entry["group-list"]) ?? null,
      override: str(entry["override"]) === "yes",
    })),
  } : null

  const igmpEl = mcEl["igmp"] as Record<string, unknown> | undefined
  const igmp: PanwMulticastIgmpConfig | null = igmpEl ? {
    enabled: str(igmpEl["enable"]) === "yes",
    dynamicInterfaces: entries(dig(igmpEl, "dynamic", "interface")).map((entry) => ({
      name: entryName(entry),
      groupFilter: str(entry["group-filter"]) ?? null,
      queryProfile: str(entry["query-profile"]) ?? null,
      version: str(entry["version"]) ?? null,
      robustness: entry["robustness"] !== undefined ? Number(entry["robustness"]) : null,
      maxGroups: str(entry["max-groups"]) ?? null,
      maxSources: str(entry["max-sources"]) ?? null,
      routerAlertPolicing: str(entry["router-alert-policing"]) === "yes",
    })),
    staticEntries: entries(dig(igmpEl, "static")).map((entry) => ({
      name: entryName(entry),
      interface: str(entry["interface"]) ?? null,
      groupAddress: str(entry["group-address"]) ?? null,
      sourceAddress: str(entry["source-address"]) ?? null,
    })),
  } : null

  const msdpEl = mcEl["msdp"] as Record<string, unknown> | undefined
  const msdp: PanwMulticastMsdpConfig | null = msdpEl ? {
    enabled: str(msdpEl["enable"]) === "yes",
    globalTimer: str(msdpEl["global-timer"]) ?? null,
    globalAuth: str(msdpEl["global-authentication"]) ?? null,
    originatorIp: str(dig(msdpEl, "originator-id", "ip")) ?? null,
    originatorInterface: str(dig(msdpEl, "originator-id", "interface")) ?? null,
    peers: entries(dig(msdpEl, "peer")).map((entry) => ({
      name: entryName(entry),
      peerAddress: str(dig(entry, "peer-address", "ip")) ?? null,
      localInterface: str(dig(entry, "local-address", "interface")) ?? null,
      localIp: str(dig(entry, "local-address", "ip")) ?? null,
      authProfile: str(entry["authentication"]) ?? null,
      maxSa: entry["max-sa"] !== undefined ? Number(entry["max-sa"]) : null,
      inboundSaFilter: str(entry["inbound-sa-filter"]) ?? null,
      outboundSaFilter: str(entry["outbound-sa-filter"]) ?? null,
    })),
  } : null

  return {
    enabled: str(mcEl["enable"]) === "yes",
    interfaceGroups,
    staticRoutes,
    pim,
    igmp,
    msdp,
  }
}

// ─── ECMP ─────────────────────────────────────────────────────────────────────

function extractEcmpConfig(ecmpEl: Record<string, unknown> | undefined): PanwEcmpConfig {
  if (!ecmpEl) {
    return { enabled: false, maxPath: null, algorithm: null, symmetricReturn: false, strictSourcePath: false, ipHash: null, weightedInterfaces: [] }
  }

  const algoEl = ecmpEl["algorithm"] as Record<string, unknown> | undefined
  let algorithm: string | null = null
  let ipHash: PanwEcmpIpHash | null = null
  let weightedInterfaces: PanwEcmpWeightedInterface[] = []

  if (algoEl) {
    const algoKey = Object.keys(algoEl)[0] ?? null
    algorithm = algoKey

    if (algoKey === "ip-hash") {
      const h = algoEl["ip-hash"] as Record<string, unknown>
      ipHash = {
        srcOnly: str(h["src-only"]) === "yes",
        usePort: str(h["use-port"]) === "yes",
        hashSeed: h["hash-seed"] !== undefined ? Number(h["hash-seed"]) : null,
      }
    } else if (algoKey === "weighted-round-robin") {
      const w = algoEl["weighted-round-robin"] as Record<string, unknown>
      weightedInterfaces = entries(dig(w, "interface")).map((entry) => ({
        name: entryName(entry),
        weight: entry["weight"] !== undefined ? Number(entry["weight"]) : null,
      }))
    }
  }

  return {
    enabled: str(ecmpEl["enable"]) === "yes",
    maxPath: ecmpEl["max-path"] !== undefined ? Number(ecmpEl["max-path"]) : null,
    algorithm,
    symmetricReturn: str(ecmpEl["symmetric-return"]) === "yes",
    strictSourcePath: str(ecmpEl["strict-source-path"]) === "yes",
    ipHash,
    weightedInterfaces,
  }
}

// ─── Logical Router Refs ──────────────────────────────────────────────────────

function extractAreaRefs(protocolEl: Record<string, unknown> | undefined): PanwLrAreaRef[] {
  return entries(protocolEl?.["area"]).map((area) => {
    const abrEl = dig(area, "type", "normal", "abr") as Record<string, unknown> | undefined
    return {
      id: entryName(area),
      abrImportList: abrEl ? (str(abrEl["import-list"]) ?? null) : null,
      abrExportList: abrEl ? (str(abrEl["export-list"]) ?? null) : null,
      abrInboundFilterList: abrEl ? (str(abrEl["inbound-filter-list"]) ?? null) : null,
      abrOutboundFilterList: abrEl ? (str(abrEl["outbound-filter-list"]) ?? null) : null,
      authProfile: str(area["authentication"]) ?? null,
      interfaces: entries(area["interface"]).map((iface) => ({
        name: entryName(iface),
        timingProfile: str(iface["timing"]) ?? null,
        authProfile: str(iface["authentication"]) ?? null,
        bfdProfile: iface["bfd"] ? (str((iface["bfd"] as Record<string, unknown>)["profile"]) ?? null) : null,
      })),
    }
  })
}

function extractLrOspfRefs(ospfEl: Record<string, unknown> | undefined): PanwLrOspfRefs | undefined {
  if (!ospfEl) return undefined
  return {
    enabled: str(ospfEl["enable"]) === "yes",
    routerId: str(ospfEl["router-id"]) ?? null,
    redistProfileName: str(ospfEl["redistribution-profile"]) ?? null,
    spfTimerName: str(ospfEl["spf-timer"]) ?? null,
    globalIfTimerName: str(ospfEl["global-if-timer"]) ?? null,
    globalBfdProfile: ospfEl["global-bfd"] ? (str((ospfEl["global-bfd"] as Record<string, unknown>)["profile"]) ?? null) : null,
    areas: extractAreaRefs(ospfEl),
  }
}

function extractLrRipRefs(ripEl: Record<string, unknown> | undefined): PanwLrRipRefs | undefined {
  if (!ripEl) return undefined
  const gInEl = ripEl["global-inbound-distribute-list"] as Record<string, unknown> | undefined
  const gOutEl = ripEl["global-outbound-distribute-list"] as Record<string, unknown> | undefined
  return {
    enabled: str(ripEl["enable"]) === "yes",
    globalTimerName: str(ripEl["global-timer"]) ?? null,
    authProfileName: str(ripEl["auth-profile"]) ?? null,
    redistProfileName: str(ripEl["redistribution-profile"]) ?? null,
    globalBfdProfile: ripEl["global-bfd"] ? (str((ripEl["global-bfd"] as Record<string, unknown>)["profile"]) ?? null) : null,
    globalInboundDistList: gInEl ? (str(gInEl["access-list"]) ?? null) : null,
    globalOutboundDistList: gOutEl ? (str(gOutEl["access-list"]) ?? null) : null,
    interfaces: entries(ripEl["interface"]).map((iface) => {
      const iInEl = iface["interface-inbound-distribute-list"] as Record<string, unknown> | undefined
      const iOutEl = iface["interface-outbound-distribute-list"] as Record<string, unknown> | undefined
      return {
        name: entryName(iface),
        inboundDistList: iInEl ? (str(iInEl["access-list"]) ?? null) : null,
        inboundDistMetric: iInEl?.["metric"] !== undefined ? Number(iInEl["metric"]) : null,
        outboundDistList: iOutEl ? (str(iOutEl["access-list"]) ?? null) : null,
        outboundDistMetric: iOutEl?.["metric"] !== undefined ? Number(iOutEl["metric"]) : null,
        authProfile: str(iface["authentication"]) ?? null,
        bfdProfile: iface["bfd"] ? (str((iface["bfd"] as Record<string, unknown>)["profile"]) ?? null) : null,
      }
    }),
  }
}

function extractLrBgpRefs(bgpEl: Record<string, unknown> | undefined): PanwLrBgpRefs | undefined {
  if (!bgpEl) return undefined
  const redistEl = bgpEl["redistribution-profile"] as Record<string, unknown> | undefined
  return {
    enabled: str(bgpEl["enable"]) === "yes",
    routerId: str(bgpEl["router-id"]) ?? null,
    localAs: str(bgpEl["local-as"]) ?? null,
    globalBfdProfile: bgpEl["global-bfd"] ? (str((bgpEl["global-bfd"] as Record<string, unknown>)["profile"]) ?? null) : null,
    redistProfile: {
      ipv4Unicast: redistEl?.["ipv4"] ? (str((redistEl["ipv4"] as Record<string, unknown>)["unicast"]) ?? null) : null,
      ipv6Unicast: redistEl?.["ipv6"] ? (str((redistEl["ipv6"] as Record<string, unknown>)["unicast"]) ?? null) : null,
    },
    peerGroups: entries(bgpEl["peer-group"]).map((pg) => {
      const afEl = pg["address-family"] as Record<string, unknown> | undefined
      const fpEl = pg["filtering-profile"] as Record<string, unknown> | undefined
      const coEl = pg["connection-options"] as Record<string, unknown> | undefined
      return {
        name: entryName(pg),
        enabled: str(pg["enable"]) === "yes",
        type: pg["type"] ? Object.keys(pg["type"] as Record<string, unknown>)[0] : null,
        addressFamily: { ipv4: afEl ? (str(afEl["ipv4"]) ?? null) : null, ipv6: afEl ? (str(afEl["ipv6"]) ?? null) : null },
        filteringProfile: { ipv4: fpEl ? (str(fpEl["ipv4"]) ?? null) : null, ipv6: fpEl ? (str(fpEl["ipv6"]) ?? null) : null },
        connectionOptions: {
          auth: coEl ? (str(coEl["authentication"]) ?? null) : null,
          timers: coEl ? (str(coEl["timers"]) ?? null) : null,
          dampening: coEl ? (str(coEl["dampening"]) ?? null) : null,
          multihop: coEl ? (str(coEl["multihop"]) ?? null) : null,
        },
        peers: entries(pg["peer"]).map((p) => {
          const pco = p["connection-options"] as Record<string, unknown> | undefined
          return {
            name: entryName(p),
            enabled: str(p["enable"]) === "yes",
            peerAs: str(p["peer-as"]) ?? null,
            inherit: p["inherit"] !== undefined && (p["inherit"] as Record<string,unknown>)["yes"] !== undefined,
            localAddress: str(dig(p, "local-address", "ip")) ?? null,
            peerAddress: str(dig(p, "peer-address", "ip")) ?? null,
            passive: str(p["passive"]) === "yes",
            senderSideLoopDetection: str(p["enable-sender-side-loop-detection"]) === "yes",
            connectionOptions: {
              auth: pco ? (str(pco["authentication"]) ?? null) : null,
              timers: pco ? (str(pco["timers"]) ?? null) : null,
              dampening: pco ? (str(pco["dampening"]) ?? null) : null,
              multihop: pco ? (str(pco["multihop"]) ?? null) : null,
            },
            bfdProfile: p["bfd"] ? (str((p["bfd"] as Record<string, unknown>)["profile"]) ?? null) : null,
          }
        }),
      }
    }),
    aggregateRoutes: entries(bgpEl["aggregate-routes"]).map((ar) => {
      const typeEl = ar["type"] as Record<string, unknown> | undefined
      const ipv4 = typeEl?.["ipv4"] as Record<string, unknown> | undefined
      const ipv6 = typeEl?.["ipv6"] as Record<string, unknown> | undefined
      const isIpv4 = ipv4 !== undefined
      const detail = ipv4 ?? ipv6
      return {
        name: entryName(ar),
        description: str(ar["description"]) ?? null,
        enabled: str(ar["enable"]) === "yes",
        asSet: str(ar["as-set"]) === "yes",
        summaryOnly: str(ar["summary-only"]) === "yes",
        sameMed: str(ar["same-med"]) === "yes",
        type: isIpv4 ? "ipv4" as const : ipv6 ? "ipv6" as const : null,
        summaryPrefix: detail ? (str(detail["summary-prefix"]) ?? null) : null,
        suppressMap: str(ipv4?.["suppress-map"] ?? ipv6?.["suppress-map"]) ?? null,
        attributeMap: str(ipv4?.["attribute-map"] ?? ipv6?.["attribute-map"]) ?? null,
      }
    }),
  }
}

function extractLrRibFilter(ribFilterEl: Record<string, unknown> | undefined): PanwLrRibFilter | undefined {
  if (!ribFilterEl) return undefined
  const ipv4 = ribFilterEl["ipv4"] as Record<string, unknown> | undefined
  const ipv6 = ribFilterEl["ipv6"] as Record<string, unknown> | undefined
  const routeMap = (proto: Record<string, unknown> | undefined) =>
    proto ? (str(proto["route-map"]) ?? null) : null
  return {
    ipv4: {
      bgp: routeMap(ipv4?.["bgp"] as Record<string, unknown> | undefined),
      ospf: routeMap(ipv4?.["ospf"] as Record<string, unknown> | undefined),
      static: routeMap(ipv4?.["static"] as Record<string, unknown> | undefined),
      rip: routeMap(ipv4?.["rip"] as Record<string, unknown> | undefined),
    },
    ipv6: {
      bgp: routeMap(ipv6?.["bgp"] as Record<string, unknown> | undefined),
      ospfv3: routeMap(ipv6?.["ospfv3"] as Record<string, unknown> | undefined),
      static: routeMap(ipv6?.["static"] as Record<string, unknown> | undefined),
    },
  }
}

function extractLrMsdpRefs(multicastEl: Record<string, unknown> | undefined): PanwLrMsdpRefs | undefined {
  const msdpEl = multicastEl?.["msdp"] as Record<string, unknown> | undefined
  if (!msdpEl) return undefined
  return {
    globalTimerName: str(msdpEl["global-timer"]) ?? null,
    globalAuthName: str(msdpEl["global-authentication"]) ?? null,
    peers: entries(msdpEl["peer"]).map((p) => ({
      name: entryName(p),
      authProfile: str(p["authentication"]) ?? null,
      inboundSaFilter: str(p["inbound-sa-filter"]) ?? null,
      outboundSaFilter: str(p["outbound-sa-filter"]) ?? null,
    })),
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXTRACTORS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Virtual Routers ──────────────────────────────────────────────────────────

/**
 * Extract Virtual Routers from a template's <network> element.
 * Path: networkEl → virtual-router → entry[]
 */
export function extractVirtualRouters(
  networkEl: unknown,
  templateName: string | null
): PanwVirtualRouter[] {
  if (!networkEl || typeof networkEl !== "object") return []
  const net = networkEl as Record<string, unknown>
  const vrEl = net["virtual-router"]

  return entries(vrEl).map((entry) => {
    const ifaces = membersAt(entry, "interface")
    const protocolEl = entry["protocol"] as Record<string, unknown> | undefined
    const routingTableEl = entry["routing-table"] as Record<string, unknown> | undefined

    const staticRoutes = extractStaticRoutes(dig(routingTableEl, "ip", "static-route"))
    const staticRoutesV6 = extractStaticRoutes(dig(routingTableEl, "ipv6", "static-route"))

    const ecmpEl = entry["ecmp"] as Record<string, unknown> | undefined
    const ecmp = extractEcmpConfig(ecmpEl)

    const adminDists = extractAdminDistances(entry["admin-dists"])

    return {
      name: entryName(entry),
      interfaces: ifaces,
      staticRoutes,
      staticRoutesV6,
      templateName,
      ecmp,
      bgp: extractBgpConfig(protocolEl),
      ospf: extractOspfConfig(protocolEl),
      ospfv3: extractOspfv3Config(protocolEl),
      rip: extractRipConfig(protocolEl),
      redistProfiles: extractRedistProfiles(protocolEl),
      multicast: extractMulticastConfig(entry),
      adminDistances: adminDists,
    }
  })
}

// ─── Logical Routers ──────────────────────────────────────────────────────────

/**
 * Extract Logical Routers from a template's <network> element.
 * Path: networkEl → logical-router → entry[] → vrf → entry[]
 */
export function extractLogicalRouters(
  networkEl: unknown,
  templateName: string | null
): PanwVirtualRouter[] {
  if (!networkEl || typeof networkEl !== "object") return []
  const net = networkEl as Record<string, unknown>
  const lrEl = net["logical-router"]
  if (!lrEl) return []

  return entries(lrEl).flatMap((lrEntry) => {
    const lrName = entryName(lrEntry)
    return entries(dig(lrEntry, "vrf")).map((vrfEntry) => {
      const vrfName = entryName(vrfEntry)
      const displayName = vrfName === "default" ? lrName : `${lrName}/${vrfName}`

      const ifaces = membersAt(vrfEntry, "interface")
      const routingTableEl = vrfEntry["routing-table"] as Record<string, unknown> | undefined

      const staticRoutes = extractStaticRoutes(dig(routingTableEl, "ip", "static-route"))
      const staticRoutesV6 = extractStaticRoutes(dig(routingTableEl, "ipv6", "static-route"))

      const ecmpEl = vrfEntry["ecmp"] as Record<string, unknown> | undefined
      const ecmp = extractEcmpConfig(ecmpEl)

      const vrfAsProtocol = vrfEntry as unknown

      return {
        name: displayName,
        interfaces: ifaces,
        staticRoutes,
        staticRoutesV6,
        templateName,
        ecmp,
        ospf: extractOspfConfig(vrfAsProtocol),
        ospfv3: extractOspfv3Config(vrfAsProtocol),
        bgp: extractBgpConfig(vrfAsProtocol),
        rip: extractRipConfig(vrfAsProtocol),
        redistProfiles: extractRedistProfiles(vrfAsProtocol),
        multicast: extractMulticastConfig(vrfEntry),
        adminDistances: extractAdminDistances(vrfEntry["admin-dists"]),
        ospfRefs: extractLrOspfRefs(vrfEntry["ospf"] as Record<string, unknown> | undefined),
        ospfv3Refs: extractLrOspfRefs(vrfEntry["ospfv3"] as Record<string, unknown> | undefined),
        ripRefs: extractLrRipRefs(vrfEntry["rip"] as Record<string, unknown> | undefined),
        bgpRefs: extractLrBgpRefs(vrfEntry["bgp"] as Record<string, unknown> | undefined),
        ribFilter: extractLrRibFilter(vrfEntry["rib-filter"] as Record<string, unknown> | undefined),
        msdpRefs: extractLrMsdpRefs(vrfEntry["multicast"] as Record<string, unknown> | undefined),
      }
    })
  })
}

// ─── DHCP Relay Interface Detection ───────────────────────────────────────────

/**
 * Extract interface names that have DHCP relay configured.
 * Path: networkEl → dhcp → interface → entry[] (those with relay enabled)
 */
export function extractDhcpRelayInterfaces(networkEl: unknown): string[] {
  if (!networkEl || typeof networkEl !== "object") return []
  const net = networkEl as Record<string, unknown>
  const dhcpIfaceEntries = entries(dig(net, "dhcp", "interface"))
  return dhcpIfaceEntries
    .filter((entry) => {
      const ipEnabled = str(dig(entry, "relay", "ip", "enabled"))
      const ipv6Enabled = str(dig(entry, "relay", "ipv6", "enabled"))
      return ipEnabled === "yes" || ipv6Enabled === "yes"
    })
    .map((entry) => entryName(entry))
    .filter(Boolean)
}