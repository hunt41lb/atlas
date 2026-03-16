// @/lib/panw-parser/extractors.ts

import { resolvePanwColor, resolveFirstTagColor } from "./color"
import { str, members, entries, entryName, entryUuid, dig, membersAt, yesNo } from "./xml-helpers"
import type {
  PanwTag, PanwAddress, PanwAddressGroup, PanwService, PanwServiceGroup,
  PanwApplicationGroup, PanwApplicationFilter, PanwProfileGroup,
  PanwZone, PanwInterface, PanwSubInterface, PanwVirtualRouter, PanwStaticRoute,
  PanwSecurityRule, PanwNatRule, PanwColorKey, PolicyRulebase,
  PolicyAction, RuleType, ZoneType, InterfaceType, InterfaceMode,
  SourceTranslationType, TemplateVariableType, PanwTemplateVariable,
  PanwVlan, PanwVlanMac, PanwVirtualWire, PanwRedistProfile,
  PanwAdminDistances, PanwRipConfig, PanwRipInterface, PanwRipTimers,
  PanwOspfConfig, PanwOspfArea, PanwOspfv3Config, PanwOspfv3Area, PanwBgpConfig,
  PanwBgpPeerGroup, PanwMulticastConfig, PanwMulticastInterfaceGroup,
} from "./types"

// ─── Tags ────────────────────────────────────────────────────────────────────

export function extractTags(tagEl: unknown): PanwTag[] {
  return entries(tagEl).map((entry) => {
    const colorKey = str(entry["color"]) as PanwColorKey | null
    return {
      name: entryName(entry),
      colorKey,
      color: resolvePanwColor(colorKey),
      comments: str(entry["comments"]),
    }
  })
}

/** Build a name→colorKey lookup map from extracted tags */
export function buildTagColorMap(tags: PanwTag[]): Map<string, PanwColorKey | null> {
  return new Map(tags.map((t) => [t.name, t.colorKey]))
}

// ─── Addresses ───────────────────────────────────────────────────────────────

export function extractAddresses(
  addrEl: unknown,
  tagColorMap: Map<string, PanwColorKey | null>
): PanwAddress[] {
  return entries(addrEl).map((entry) => {
    const tagNames = membersAt(entry, "tag")
    const ipNetmask = str(entry["ip-netmask"])
    const ipRange = str(entry["ip-range"])
    const fqdn = str(entry["fqdn"])
    const ipWildcard = str(entry["ip-wildcard"])

    const type = ipNetmask ? "ip-netmask"
      : ipRange ? "ip-range"
      : fqdn ? "fqdn"
      : "ip-wildcard"

    const value = ipNetmask ?? ipRange ?? fqdn ?? ipWildcard ?? ""

    return {
      name: entryName(entry),
      type,
      value,
      description: str(entry["description"]),
      tags: tagNames,
      color: resolveFirstTagColor(tagNames, tagColorMap),
    }
  })
}

// ─── Address Groups ───────────────────────────────────────────────────────────

export function extractAddressGroups(
  agEl: unknown,
  tagColorMap: Map<string, PanwColorKey | null>
): PanwAddressGroup[] {
  return entries(agEl).map((entry) => {
    const tagNames = membersAt(entry, "tag")
    const staticEl = entry["static"]
    const dynamicEl = entry["dynamic"]
    const isStatic = staticEl !== undefined && staticEl !== null

    const staticMembers = isStatic ? members(staticEl) : []
    const dynamicFilter = isStatic ? null : str(dig(dynamicEl, "filter"))

    return {
      name: entryName(entry),
      type: isStatic ? "static" : "dynamic",
      members: staticMembers,
      dynamicFilter,
      description: str(entry["description"]),
      tags: tagNames,
      color: resolveFirstTagColor(tagNames, tagColorMap),
    }
  })
}

// ─── Services ────────────────────────────────────────────────────────────────

export function extractServices(
  svcEl: unknown,
  tagColorMap: Map<string, PanwColorKey | null>
): PanwService[] {
  return entries(svcEl).map((entry) => {
    const tagNames = membersAt(entry, "tag")
    const proto = entry["protocol"] as Record<string, unknown> | undefined
    const tcpEl = dig(proto, "tcp")
    const udpEl = dig(proto, "udp")
    const sctpEl = dig(proto, "sctp")

    const protocol = tcpEl ? "tcp" : udpEl ? "udp" : "sctp"
    const protoData = (tcpEl ?? udpEl ?? sctpEl) as Record<string, unknown> | undefined
    const port = str(protoData?.["port"]) ?? ""

    return {
      name: entryName(entry),
      protocol,
      port,
      description: str(entry["description"]),
      tags: tagNames,
      color: resolveFirstTagColor(tagNames, tagColorMap),
    }
  })
}

// ─── Service Groups ───────────────────────────────────────────────────────────

export function extractServiceGroups(
  sgEl: unknown,
  tagColorMap: Map<string, PanwColorKey | null>
): PanwServiceGroup[] {
  return entries(sgEl).map((entry) => {
    const tagNames = membersAt(entry, "tag")
    return {
      name: entryName(entry),
      members: members(entry["members"]),
      tags: tagNames,
      color: resolveFirstTagColor(tagNames, tagColorMap),
    }
  })
}

// ─── Application Groups ───────────────────────────────────────────────────────

export function extractApplicationGroups(
  agEl: unknown,
  tagColorMap: Map<string, PanwColorKey | null>
): PanwApplicationGroup[] {
  return entries(agEl).map((entry) => {
    const tagNames = membersAt(entry, "tag")
    return {
      name: entryName(entry),
      members: members(entry["members"]),
      tags: tagNames,
      color: resolveFirstTagColor(tagNames, tagColorMap),
    }
  })
}

// ─── Application Filters ──────────────────────────────────────────────────────

export function extractApplicationFilters(
  afEl: unknown,
  tagColorMap: Map<string, PanwColorKey | null>
): PanwApplicationFilter[] {
  return entries(afEl).map((entry) => {
    const tagNames = membersAt(entry, "tag")
    return {
      name: entryName(entry),
      tags: tagNames,
      color: resolveFirstTagColor(tagNames, tagColorMap),
    }
  })
}

// ─── Profile Groups ───────────────────────────────────────────────────────────

export function extractProfileGroups(pgEl: unknown): PanwProfileGroup[] {
  return entries(pgEl).map((entry) => ({
    name: entryName(entry),
    virus: str(entry["virus"]),
    spyware: str(entry["spyware"]),
    vulnerability: str(entry["vulnerability"]),
    urlFiltering: str(entry["url-filtering"]),
    fileBlocking: str(entry["file-blocking"]),
    wildfireAnalysis: str(entry["wildfire-analysis"]),
    dataFiltering: str(entry["data-filtering"]),
  }))
}

// ─── Zones ────────────────────────────────────────────────────────────────────

function detectZoneType(entry: Record<string, unknown>): ZoneType {
  const net = entry["network"] as Record<string, unknown> | undefined
  if (!net) return "unknown"
  if (net["layer3"] !== undefined) return "layer3"
  if (net["layer2"] !== undefined) return "layer2"
  if (net["virtual-wire"] !== undefined) return "virtual-wire"
  if (net["tap"] !== undefined) return "tap"
  if (net["tunnel"] !== undefined) return "tunnel"
  if (net["external"] !== undefined) return "external"
  return "unknown"
}

function zoneInterfaces(entry: Record<string, unknown>, type: ZoneType): string[] {
  const net = entry["network"] as Record<string, unknown> | undefined
  if (!net) return []
  const typeEl = net[type]
  if (!typeEl) return []
  return membersAt(typeEl, "member").length > 0
    ? membersAt(typeEl, "member")
    : members(typeEl)
}

export function extractZones(
  zoneEl: unknown,
  tagColorMap: Map<string, PanwColorKey | null>
): PanwZone[] {
  return entries(zoneEl).map((entry) => {
    const tagNames = membersAt(entry, "tag")
    const type = detectZoneType(entry)
    const networkEl = entry["network"] as Record<string, unknown> | undefined

    const tagColor = resolveFirstTagColor(tagNames, tagColorMap)
    const color = tagColor !== "var(--muted-foreground)"
      ? tagColor
      : resolveFirstTagColor([entryName(entry)], tagColorMap)

    return {
      name: entryName(entry),
      type,
      interfaces: zoneInterfaces(entry, type),
      tags: tagNames,
      color,
      zoneProtectionProfile: str(dig(networkEl, "zone-protection-profile")) ?? null,
      logSetting: str(dig(networkEl, "log-setting")) ?? null,
      netInspection: str(dig(networkEl, "net-inspection")) === "yes",
      enableUserIdentification: str(entry["enable-user-identification"]) === "yes",
      enableDeviceIdentification: str(entry["enable-device-identification"]) === "yes",
      prenatUserIdentification: str(dig(networkEl, "prenat-identification", "enable-prenat-user-identification")) === "yes",
      prenatDeviceIdentification: str(dig(networkEl, "prenat-identification", "enable-prenat-device-identification")) === "yes",
      prenatSourceLookup: str(dig(networkEl, "prenat-identification", "enable-prenat-source-policy-lookup")) === "yes",
      prenatSourceIpDownstream: str(dig(networkEl, "prenat-identification", "enable-prenat-source-ip-downstream")) === "yes",
      userAclInclude: members(dig(entry, "user-acl", "include-list")),
      userAclExclude: members(dig(entry, "user-acl", "exclude-list")),
      deviceAclInclude: members(dig(entry, "device-acl", "include-list")),
      deviceAclExclude: members(dig(entry, "device-acl", "exclude-list")),
    }
  })
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

function extractSubInterfaces(unitsEl: unknown): PanwSubInterface[] {
  return entries(unitsEl).map((entry) => {
    const ipEntries = entries(dig(entry, "ip"))
    const ipAddresses = ipEntries.map((ip) => entryName(ip)).filter(Boolean)

    // IPv6 addresses
    const ipv6Entries = entries(dig(entry, "ipv6", "address"))
    const ipv6Addresses = ipv6Entries.map((ip) => entryName(ip)).filter(Boolean)

    // Feature flags
    const bonjourEnabled = str(dig(entry, "bonjour", "enable")) === "yes"
    const ndpProxy = str(dig(entry, "ndp-proxy", "enabled")) === "yes"
    const adjustTcpMss = str(dig(entry, "adjust-tcp-mss", "enable")) === "yes"
    const sdwanEnabled = str(dig(entry, "sdwan-link-settings", "enable")) === "yes"
    const dhcpClient = dig(entry, "dhcp-client") !== undefined

    return {
      name: entryName(entry),
      tag: entry["tag"] !== undefined ? Number(entry["tag"]) : null,
      ipAddresses,
      ipv6Addresses,
      comment: str(entry["comment"]),
      managementProfile: str(entry["interface-management-profile"]),
      bonjourEnabled,
      ndpProxy,
      adjustTcpMss,
      sdwanEnabled,
      dhcpClient,
    }
  })
}

function detectInterfaceMode(entry: Record<string, unknown>): InterfaceMode {
  if (entry["layer3"]) return "layer3"
  if (entry["layer2"]) return "layer2"
  if (entry["virtual-wire"]) return "virtual-wire"
  if (entry["tap"]) return "tap"
  if (entry["ha"]) return "ha"
  if (entry["decrypt-mirror"]) return "decrypt-mirror"
  return "none"
}

function extractInterfacesOfType(
  ifaceEl: unknown,
  type: InterfaceType,
  templateName: string | null
): PanwInterface[] {
  return entries(ifaceEl).map((entry) => {
    const mode = detectInterfaceMode(entry)
    const modeEl = mode !== "none" ? (entry[mode] as Record<string, unknown>) : null

    // For tunnel/loopback/vlan, there is no mode wrapper — IP, IPv6, units,
    // and feature elements sit directly on the entry.  For ethernet/ae they
    // live inside the mode element (e.g. <layer3>).  We use `propEl` as the
    // element to read these shared properties from.
    const propEl: Record<string, unknown> = modeEl ?? entry

    // Direct IP addresses on the interface
    const directIpEntries = entries(dig(propEl, "ip"))
    const directIps = directIpEntries.map((ip) => entryName(ip)).filter(Boolean)

    // IPv6 addresses on the parent interface
    const ipv6Entries = entries(dig(propEl, "ipv6", "address"))
    const ipv6Addresses = ipv6Entries.map((ip) => entryName(ip)).filter(Boolean)

    // Sub-interfaces (units)
    const subInterfaces = extractSubInterfaces(dig(propEl, "units"))

    // Aggregate Groups
    const aggregateGroup = str(entry["aggregate-group"]) ?? null

    // DHCP Client
    const dhcpClient =
      dig(entry["layer3"] as Record<string, unknown> | null, "dhcp-client") !== undefined

    // LLDP — lives inside the mode element (e.g. <layer3><lldp>)
    const lldpEnabled = str(dig(modeEl, "lldp", "enable")) === "yes"
    const lldpProfile = str(dig(modeEl, "lldp", "profile"))

    // NDP Proxy — can be on modeEl (ethernet) or directly on entry (vlan/loopback)
    const ndpProxy = str(dig(propEl, "ndp-proxy", "enabled")) === "yes"

    // SD-WAN Link Settings
    const sdwanEnabled = str(dig(propEl, "sdwan-link-settings", "enable")) === "yes"

    // LACP (aggregate-ethernet interfaces only)
    const lacpEnabled = str(dig(modeEl, "lacp", "enable")) === "yes"
    const lacpMode = str(dig(modeEl, "lacp", "mode"))
    const lacpTransmissionRate = str(dig(modeEl, "lacp", "transmission-rate"))

    // ── New fields ───────────────────────────────────────────────────────
    // MTU — direct on entry for tunnel/loopback/vlan, inside modeEl for ethernet
    const mtuRaw = str(propEl["mtu"]) ?? str(entry["mtu"])
    const mtu = mtuRaw ? Number(mtuRaw) : null

    // Netflow Profile — same pattern
    const netflowProfile = str(propEl["netflow-profile"]) ?? str(entry["netflow-profile"]) ?? null

    // Adjust TCP MSS — lives on propEl for all types
    const adjustTcpMss = str(dig(propEl, "adjust-tcp-mss", "enable")) === "yes"

    // DDNS Config — present on vlan interfaces
    const ddnsEnabled = dig(propEl, "ddns-config") !== undefined

    // PoE — lives directly on the ethernet entry (not inside mode)
    const poeConfigured = dig(entry, "poe") !== undefined
    const poeEnabled = str(dig(entry, "poe", "poe-enabled")) === "yes"
    const poeRsvd = str(dig(entry, "poe", "poe-rsvd-pwr"))
    const poeReservedPower = poeRsvd ? Number(poeRsvd) : null

    return {
      name: entryName(entry),
      type,
      mode,
      ipAddresses: directIps,
      ipv6Addresses,
      subInterfaces,
      comment: str(entry["comment"]),
      managementProfile: str(entry["interface-management-profile"]),
      aggregateGroup,
      dhcpClient,
      templateName,
      lldpEnabled,
      lldpProfile,
      ndpProxy,
      sdwanEnabled,
      lacpEnabled,
      lacpMode,
      lacpTransmissionRate,
      mtu,
      netflowProfile,
      adjustTcpMss,
      ddnsEnabled,
      poeConfigured,
      poeEnabled,
      poeReservedPower,
    }
  })
}

export function extractInterfaces(
  networkEl: unknown,
  templateName: string | null
): PanwInterface[] {
  if (!networkEl || typeof networkEl !== "object") return []
  const net = networkEl as Record<string, unknown>
  const ifaceEl = net["interface"] as Record<string, unknown> | undefined
  if (!ifaceEl) return []

  return [
    ...extractInterfacesOfType(ifaceEl["ethernet"], "ethernet", templateName),
    ...extractInterfacesOfType(ifaceEl["aggregate-ethernet"], "ae", templateName),
    // Loopback, VLAN, and Tunnel entries are nested inside <units>
    ...extractInterfacesOfType(dig(ifaceEl["loopback"], "units"), "loopback", templateName),
    ...extractInterfacesOfType(dig(ifaceEl["vlan"], "units"), "vlan", templateName),
    ...extractInterfacesOfType(dig(ifaceEl["tunnel"], "units"), "tunnel", templateName),
  ]
}

// ─── VLANs ────────────────────────────────────────────────────────────────────

export function extractVlans(
  networkEl: unknown,
  templateName: string | null
): PanwVlan[] {
  if (!networkEl || typeof networkEl !== "object") return []
  const net = networkEl as Record<string, unknown>
  const vlanEl = net["vlan"]

  return entries(vlanEl).map((entry) => {
    const macEntries = entries(dig(entry, "mac"))
    const staticMacs: PanwVlanMac[] = macEntries.map((m) => ({
      mac: entryName(m),
      interface: str(m["interface"]) ?? null,
    }))

    return {
      name: entryName(entry),
      virtualInterface: str(dig(entry, "virtual-interface", "interface")) ?? null,
      memberInterfaces: members(dig(entry, "interface")),
      staticMacs,
      templateName,
    }
  })
}

// ─── Virtual Wires ────────────────────────────────────────────────────────────

export function extractVirtualWires(
  networkEl: unknown,
  templateName: string | null
): PanwVirtualWire[] {
  if (!networkEl || typeof networkEl !== "object") return []
  const net = networkEl as Record<string, unknown>
  const vwEl = net["virtual-wire"]

  return entries(vwEl).map((entry) => ({
    name: entryName(entry),
    interface1: str(entry["interface1"]) ?? null,
    interface2: str(entry["interface2"]) ?? null,
    tagAllowed: str(entry["tag-allowed"]) ?? null,
    multicastFirewalling: str(dig(entry, "multicast-firewalling", "enable")) === "yes",
    templateName,
  }))
}

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

// ─── Static Routes (shared between IPv4 and IPv6) ─────────────────────────────

function extractStaticRoutes(routeEl: unknown): PanwStaticRoute[] {
  return entries(routeEl).map((r) => {
    const nexthopEl = r["nexthop"] as Record<string, unknown> | undefined

    // Detect nexthop type and value
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

    // Route table
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
      enabled: false,
      globalBfdProfile: null,
      rejectDefaultRoute: false,
      interfaces: [],
      timers: null,
    }
  }

  const interfaces: PanwRipInterface[] = entries(dig(ripEl, "interface")).map((entry) => ({
    name: entryName(entry),
    enabled: str(entry["enable"]) === "yes",
    mode: str(entry["mode"]) ?? null,
    bfdProfile: str(dig(entry, "bfd", "profile")) ?? null,
    defaultRouteAdvertise: dig(entry, "default-route", "advertise") !== undefined,
    defaultRouteMetric: dig(entry, "default-route", "advertise", "metric") !== undefined
      ? Number(str(dig(entry, "default-route", "advertise", "metric")))
      : null,
    authProfile: str(entry["auth-profile"]) ?? null,
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

function extractOspfConfig(protocolEl: unknown): PanwOspfConfig {
  const ospfEl = dig(protocolEl, "ospf") as Record<string, unknown> | undefined
  if (!ospfEl) {
    return { enabled: false, routerId: null, globalBfdProfile: null, rejectDefaultRoute: false, areas: [] }
  }

  const areas: PanwOspfArea[] = entries(dig(ospfEl, "area")).map((areaEntry) => ({
    id: entryName(areaEntry),
    type: detectAreaType(areaEntry),
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
      bfdProfile: str(dig(ifEntry, "bfd", "profile")) ?? null,
    })),
  }))

  return {
    enabled: str(ospfEl["enable"]) === "yes",
    routerId: str(ospfEl["router-id"]) ?? null,
    globalBfdProfile: str(dig(ospfEl, "global-bfd", "profile")) ?? null,
    rejectDefaultRoute: str(dig(ospfEl, "reject-default-route")) === "yes",
    areas,
  }
}

// ─── OSPFv3 ───────────────────────────────────────────────────────────────────

function extractOspfv3Config(protocolEl: unknown): PanwOspfv3Config {
  const ospfv3El = dig(protocolEl, "ospfv3") as Record<string, unknown> | undefined
  if (!ospfv3El) {
    return { enabled: false, routerId: null, globalBfdProfile: null, rejectDefaultRoute: false, areas: [] }
  }

  const areas: PanwOspfv3Area[] = entries(dig(ospfv3El, "area")).map((areaEntry) => ({
    id: entryName(areaEntry),
    type: detectAreaType(areaEntry),
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
      bfdProfile: str(dig(ifEntry, "bfd", "profile")) ?? null,
    })),
  }))

  return {
    enabled: str(ospfv3El["enable"]) === "yes",
    routerId: str(ospfv3El["router-id"]) ?? null,
    globalBfdProfile: str(dig(ospfv3El, "global-bfd", "profile")) ?? null,
    rejectDefaultRoute: str(dig(ospfv3El, "reject-default-route")) === "yes",
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
      enabled: false, routerId: null, localAs: null, installRoute: false,
      gracefulRestartEnabled: false, rejectDefaultRoute: false, peerGroups: [],
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

  return {
    enabled: str(bgpEl["enable"]) === "yes",
    routerId: str(bgpEl["router-id"]) ?? null,
    localAs: str(bgpEl["local-as"]) ?? null,
    installRoute: str(bgpEl["install-route"]) === "yes",
    gracefulRestartEnabled: str(dig(bgpEl, "routing-options", "graceful-restart", "enable")) === "yes",
    rejectDefaultRoute: str(dig(bgpEl, "reject-default-route")) === "yes",
    peerGroups,
  }
}

// ─── Multicast ────────────────────────────────────────────────────────────────

function extractMulticastConfig(vrEntry: Record<string, unknown>): PanwMulticastConfig {
  const mcEl = vrEntry["multicast"] as Record<string, unknown> | undefined
  if (!mcEl) {
    return { enabled: false, interfaceGroups: [] }
  }

  const interfaceGroups: PanwMulticastInterfaceGroup[] = entries(dig(mcEl, "interface-group")).map((igEntry) => ({
    name: entryName(igEntry),
    description: str(igEntry["description"]) ?? null,
    interfaces: members(dig(igEntry, "interface")),
    pimEnabled: str(dig(igEntry, "pim", "enable")) === "yes",
    igmpEnabled: str(dig(igEntry, "igmp", "enable")) === "yes",
    igmpVersion: str(dig(igEntry, "igmp", "version")) ?? null,
  }))

  return {
    enabled: str(mcEl["enable"]) === "yes",
    interfaceGroups,
  }
}

// ─── Virtual Routers ──────────────────────────────────────────────────────────

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

    // Static routes (IPv4 + IPv6)
    const staticRoutes = extractStaticRoutes(dig(routingTableEl, "ip", "static-route"))
    const staticRoutesV6 = extractStaticRoutes(dig(routingTableEl, "ipv6", "static-route"))

    // ECMP
    const ecmpEl = entry["ecmp"] as Record<string, unknown> | undefined
    const ecmpEnabled = str(dig(ecmpEl, "enable")) === "yes"
    let ecmpAlgorithm: string | null = null
    if (ecmpEl?.["algorithm"] && typeof ecmpEl["algorithm"] === "object") {
      const algoKeys = Object.keys(ecmpEl["algorithm"] as Record<string, unknown>)
      ecmpAlgorithm = algoKeys[0] ?? null
    }

    // Admin distances (on Logical Routers these are inside vrf > entry > admin-dists)
    // On Virtual Routers they sit directly on the entry (if configured)
    const adminDists = extractAdminDistances(entry["admin-dists"])

    return {
      name: entryName(entry),
      interfaces: ifaces,
      staticRoutes,
      staticRoutesV6,
      templateName,
      // ECMP
      ecmpEnabled,
      ecmpAlgorithm,
      ecmpStrictSourcePath: str(dig(ecmpEl, "strict-source-path")) === "yes",
      ecmpSymmetricReturn: str(dig(ecmpEl, "symmetric-return")) === "yes",
      // BGP
      bgp: extractBgpConfig(protocolEl),
      // OSPF
      ospf: extractOspfConfig(protocolEl),
      // OSPFv3
      ospfv3: extractOspfv3Config(protocolEl),
      // RIP
      rip: extractRipConfig(protocolEl),
      // Redistribution
      redistProfiles: extractRedistProfiles(protocolEl),
      // Multicast
      multicast: extractMulticastConfig(entry),
      // Admin Distances
      adminDistances: adminDists,
    }
  })
}

// ─── Logical Routers ──────────────────────────────────────────────────────────

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
    // Each LR has one or more VRFs; flatten them (usually just "default")
    return entries(dig(lrEntry, "vrf")).map((vrfEntry) => {
      const vrfName = entryName(vrfEntry)
      const displayName = vrfName === "default" ? lrName : `${lrName}/${vrfName}`

      const ifaces = membersAt(vrfEntry, "interface")
      const staticRoutes = extractStaticRoutes(dig(vrfEntry, "routing-table", "ip", "static-route"))

      return {
        name: displayName,
        interfaces: ifaces,
        staticRoutes,
        staticRoutesV6: [],
        templateName,
        ecmpEnabled: false,
        ecmpAlgorithm: null,
        ecmpStrictSourcePath: false,
        ecmpSymmetricReturn: false,
        bgp: { enabled: false, routerId: null, localAs: null, installRoute: false, gracefulRestartEnabled: false, rejectDefaultRoute: false, peerGroups: [] },
        ospf: { enabled: false, routerId: null, globalBfdProfile: null, rejectDefaultRoute: false, areas: [] },
        ospfv3: { enabled: false, routerId: null, globalBfdProfile: null, rejectDefaultRoute: false, areas: [] },
        rip: { enabled: false, globalBfdProfile: null, rejectDefaultRoute: false, interfaces: [], timers: null },
        redistProfiles: [],
        multicast: { enabled: false, interfaceGroups: [] },
        adminDistances: null,
      }
    })
  })
}

// ───  DHCP Relay ──────────────────────────────────────────────────────────────

export function extractDhcpRelayInterfaces(networkEl: unknown): string[] {
  if (!networkEl || typeof networkEl !== "object") return []
  const net = networkEl as Record<string, unknown>
  const dhcpIfaceEntries = entries(dig(net, "dhcp", "interface"))
  return dhcpIfaceEntries
    .filter((entry) => {
      // Check if relay is configured (IPv4 or IPv6 enabled)
      const ipEnabled = str(dig(entry, "relay", "ip", "enabled"))
      const ipv6Enabled = str(dig(entry, "relay", "ipv6", "enabled"))
      return ipEnabled === "yes" || ipv6Enabled === "yes"
    })
    .map((entry) => entryName(entry))
    .filter(Boolean)
}

// ─── Security Rules ───────────────────────────────────────────────────────────

export function extractSecurityRules(
  rulesEl: unknown,
  scope: string,
  rulebase: PolicyRulebase,
  tagColorMap: Map<string, PanwColorKey | null>
): PanwSecurityRule[] {
  return entries(rulesEl).map((entry) => {
    const tagNames = membersAt(entry, "tag")
    const profileSetting = entry["profile-setting"] as Record<string, unknown> | undefined
    const profileGroup = profileSetting ? str(profileSetting["group"]) ?? str(members(profileSetting["group"])[0]) : null

    return {
      name: entryName(entry),
      uuid: entryUuid(entry),
      description: str(entry["description"]),
      tags: tagNames,
      color: resolveFirstTagColor(tagNames, tagColorMap),
      groupTag: str(entry["group-tag"]),
      rulebase,
      scope,
      from: membersAt(entry, "from"),
      to: membersAt(entry, "to"),
      source: membersAt(entry, "source"),
      destination: membersAt(entry, "destination"),
      sourceUser: membersAt(entry, "source-user"),
      application: membersAt(entry, "application"),
      service: membersAt(entry, "service"),
      category: membersAt(entry, "category"),
      sourceHip: membersAt(entry, "source-hip"),
      destinationHip: membersAt(entry, "destination-hip"),
      action: (str(entry["action"]) ?? "deny") as PolicyAction,
      ruleType: (str(entry["rule-type"]) ?? "universal") as RuleType,
      profileGroup,
      logSetting: str(entry["log-setting"]),
      logStart: yesNo(entry["log-start"]),
      logEnd: yesNo(entry["log-end"]),
      disabled: yesNo(entry["disabled"]),
    }
  })
}

// ─── NAT Rules ────────────────────────────────────────────────────────────────

function detectSourceTranslationType(natEl: unknown): SourceTranslationType {
  if (!natEl || typeof natEl !== "object") return "none"
  const obj = natEl as Record<string, unknown>
  const src = obj["source-translation"] as Record<string, unknown> | undefined
  if (!src) return "none"
  if (src["dynamic-ip-and-port"]) return "dynamic-ip-and-port"
  if (src["dynamic-ip"]) return "dynamic-ip"
  if (src["static-ip"]) return "static-ip"
  return "none"
}

export function extractNatRules(
  rulesEl: unknown,
  scope: string,
  rulebase: PolicyRulebase,
  tagColorMap: Map<string, PanwColorKey | null>
): PanwNatRule[] {
  return entries(rulesEl).map((entry) => {
    const tagNames = membersAt(entry, "tag")
    return {
      name: entryName(entry),
      uuid: entryUuid(entry),
      description: str(entry["description"]),
      tags: tagNames,
      color: resolveFirstTagColor(tagNames, tagColorMap),
      groupTag: str(entry["group-tag"]),
      rulebase,
      scope,
      from: membersAt(entry, "from"),
      to: membersAt(entry, "to"),
      source: membersAt(entry, "source"),
      destination: membersAt(entry, "destination"),
      service: str(entry["service"]) ?? "any",
      toInterface: str(entry["to-interface"]),
      sourceTranslationType: detectSourceTranslationType(entry),
      disabled: yesNo(entry["disabled"]),
    }
  })
}

export function extractTemplateVariables(variableEl: unknown): PanwTemplateVariable[] {
   return entries(variableEl).map((entry) => {
     const typeEl = entry["type"] as Record<string, unknown> | undefined

     // Type contains a single key whose name is the variable type
     // and whose value is the resolved value
     let type: TemplateVariableType = "ip-netmask"
     let value = ""

     if (typeEl) {
       for (const key of ["ip-netmask", "ip-range", "fqdn", "ip-wildcard"] as const) {
         if (typeEl[key] !== undefined) {
           type = key
           value = str(typeEl[key]) ?? ""
           break
         }
       }
     }

     return {
       name: entryName(entry),
       type,
       value,
       description: str(entry["description"]),
     }
   })
}
