// @/lib/panw-parser/network/interfaces/interfaces.ts
//
// Interface types and extractor.
// Path: network > interface > ethernet|aggregate-ethernet|loopback|vlan|tunnel

import { entries, entryName, str, dig, members } from "../../xml-helpers"

// ─── Types ────────────────────────────────────────────────────────────────────

export type InterfaceType = "ethernet" | "loopback" | "vlan" | "tunnel" | "ae"
export type InterfaceMode = "layer3" | "layer2" | "virtual-wire" | "tap" | "ha" | "decrypt-mirror" | "none"

export interface PanwSubInterface {
  name: string
  tag: number | null
  ipAddresses: string[]
  ipEntries: PanwIpEntry[]
  ipv6Addresses: string[]
  ipv6Entries: PanwIpv6Entry[]
  comment: string | null
  managementProfile: string | null
  mtu: number | null
  netflowProfile: string | null
  // ── Feature flags ──────────────────────────────────────────────────────
  bonjourEnabled: boolean
  ndpProxy: boolean
  adjustTcpMss: boolean
  sdwanEnabled: boolean
  dhcpClient: boolean
  pppoeEnabled: boolean
  networkPacketBroker: boolean
  // ── TCP MSS detail ──
  ipv4MssAdjustment: number | null
  ipv6MssAdjustment: number | null
  // ── IPv6 ──
  ipv6Enabled: boolean
  ipv6SdwanEnabled: boolean
  ipv6InterfaceId: string | null
  ipv6DadEnabled: boolean
  ipv6DadAttempts: number | null
  ipv6NdpMonitor: boolean
  ipv6ReachableTime: number | null
  ipv6NsInterval: number | null
  ipv6RaEnabled: boolean
  ipv6RaMinInterval: number | null
  ipv6RaMaxInterval: number | null
  ipv6RaHopLimit: number | null
  ipv6RaReachableTime: number | null
  ipv6RaRetransTime: number | null
  ipv6RaLifetime: number | null
  ipv6RaRouterPreference: string | null
  ipv6RaLinkMtu: string | null
  ipv6RaManagedConfig: boolean
  ipv6RaOtherConfig: boolean
  ipv6RaConsistencyCheck: boolean
  // ── SD-WAN link settings ──
  sdwanInterfaceProfile: string | null
  upstreamNatEnabled: boolean
  upstreamNatType: string | null
  upstreamNatAddress: string | null
  // ── ARP / ND ──
  arpEntries: PanwArpEntry[]
  ndEntries: PanwNdEntry[]
  ndpProxyAddresses: PanwNdpProxyAddress[]
  // ── DDNS ──
  ddnsEnabled: boolean
  ddnsHostname: string | null
  ddnsCertProfile: string | null
  ddnsVendor: string | null
  ddnsUpdateInterval: number | null
  ddnsIpv4: string[]
  ddnsIpv6: string[]
  ddnsVendorConfig: PanwDdnsVendorConfig[]
}

export interface PanwInterface {
  name: string
  type: InterfaceType
  mode: InterfaceMode
  subInterfaces: PanwSubInterface[]
  comment: string | null
  managementProfile: string | null
  aggregateGroup: string | null
  templateName: string | null
  dhcpClient: boolean
  lldpEnabled: boolean
  lldpProfile: string | null
  ndpProxy: boolean
  sdwanEnabled: boolean
  lacpEnabled: boolean
  lacpMode: string | null
  lacpTransmissionRate: string | null
  lacpFastFailover: boolean
  lacpSystemPriority: number | null
  lacpMaxPorts: number | null
  lacpHaPassive: boolean
  lacpPortPriority: number | null
  mtu: number | null
  netflowProfile: string | null
  adjustTcpMss: boolean
  ddnsEnabled: boolean
  poeConfigured: boolean
  poeEnabled: boolean
  poeReservedPower: number | null
  // ── NEW: Richer IP addresses (replaces string[]) ──
  ipAddresses: PanwIpEntry[]        // was string[] → now { address, sdwanGateway }
  ipv6Addresses: PanwIpv6Entry[]    // was string[] → now { address, enabled, anycast }
  // ── NEW: IPv4 details ──
  bonjourEnabled: boolean
  ipv4MssAdjustment: number | null
  ipv6MssAdjustment: number | null
  // ── NEW: IPv6 ──
  ipv6Enabled: boolean
  // ── NEW: SD-WAN link settings ──
  sdwanInterfaceProfile: string | null
  upstreamNatEnabled: boolean
  upstreamNatType: string | null     // "static-ip" | "ddns"
  upstreamNatAddress: string | null
  // ── NEW: Link settings (Advanced) ──
  linkSpeed: string | null           // "auto", "10", "100", etc.
  linkDuplex: string | null          // "auto", "full", "half"
  linkState: string | null           // "auto", "up", "down"
  // ── IPv4 type detection ──
  pppoeEnabled: boolean
  // ── IPv6 details ──
  ipv6SdwanEnabled: boolean
  ipv6InterfaceId: string | null     // "EUI-64" etc.
  // Address Resolution (neighbor-discovery)
  ipv6DadEnabled: boolean
  ipv6DadAttempts: number | null
  ipv6NdpMonitor: boolean
  ipv6ReachableTime: number | null
  ipv6NsInterval: number | null
  // Router Advertisement
  ipv6RaEnabled: boolean
  ipv6RaMinInterval: number | null
  ipv6RaMaxInterval: number | null
  ipv6RaHopLimit: number | null
  ipv6RaReachableTime: number | null
  ipv6RaRetransTime: number | null
  ipv6RaLifetime: number | null
  ipv6RaRouterPreference: string | null
  ipv6RaLinkMtu: string | null
  ipv6RaManagedConfig: boolean
  ipv6RaOtherConfig: boolean
  ipv6RaConsistencyCheck: boolean
  // ── ARP / ND entries ──
  arpEntries: PanwArpEntry[]
  ndEntries: PanwNdEntry[]
  // ── NDP Proxy addresses ──
  ndpProxyAddresses: PanwNdpProxyAddress[]
  // ── LLDP HA ──
  lldpHaPassive: boolean
  // ── Other Info ──
  networkPacketBroker: boolean
  untaggedSubInterface: boolean
  // ── Cluster ──
  trafficInterconnect: boolean
  // ── DDNS detail (richer than ddnsEnabled flag) ──
  ddnsHostname: string | null
  ddnsCertProfile: string | null
  ddnsVendor: string | null
  ddnsUpdateInterval: number | null
  ddnsIpv4: string[]
  ddnsIpv6: string[]
  ddnsVendorConfig: PanwDdnsVendorConfig[]
}

// New helper types
export interface PanwIpEntry {
  address: string
  sdwanGateway: string | null
}

export interface PanwIpv6Entry {
  address: string
  enabled: boolean
  anycast: boolean
  prefix: boolean
  // ── Send RA (advertise) ──
  sendRa: boolean
  validLifetime: number | null
  preferredLifetime: number | null
  onLink: boolean
  autonomous: boolean
}

export interface PanwArpEntry {
  ip: string
  mac: string
}

export interface PanwNdEntry {
  ipv6: string
  mac: string
}

export interface PanwNdpProxyAddress {
  address: string
  negate: boolean
}

export interface PanwDdnsVendorConfig {
  name: string
  value: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractSubInterfaces(unitsEl: unknown): PanwSubInterface[] {
  return entries(unitsEl).map((entry) => {
    const ipEntries = entries(dig(entry, "ip"))
    const ipAddresses = ipEntries.map((ip) => entryName(ip)).filter(Boolean)

    const ipv6RawEntries = entries(dig(entry, "ipv6", "address"))
    const ipv6Addresses = ipv6RawEntries.map((ip) => entryName(ip)).filter(Boolean)

    const ipEntryList: PanwIpEntry[] = ipEntries.map((ip) => ({
      address: entryName(ip),
      sdwanGateway: str(ip["sdwan-gateway"]) ?? null,
    }))

    const ipv6EntryList: PanwIpv6Entry[] = ipv6RawEntries.map((ip) => ({
      address: entryName(ip),
      enabled: str(ip["enable-on-interface"]) === "yes",
      anycast: dig(ip, "anycast") !== undefined,
      prefix: dig(ip, "prefix") !== undefined,
      sendRa: str(dig(ip, "advertise", "enable")) === "yes",
      validLifetime: dig(ip, "advertise", "valid-lifetime") !== undefined ? Number(dig(ip, "advertise", "valid-lifetime")) : null,
      preferredLifetime: dig(ip, "advertise", "preferred-lifetime") !== undefined ? Number(dig(ip, "advertise", "preferred-lifetime")) : null,
      onLink: str(dig(ip, "advertise", "onlink-flag")) === "yes",
      autonomous: str(dig(ip, "advertise", "auto-config-flag")) === "yes",
    }))

    // TCP MSS
    const adjustTcpMss = str(dig(entry, "adjust-tcp-mss", "enable")) === "yes"
    const tcpMssEl = dig(entry, "adjust-tcp-mss") as Record<string, unknown> | undefined
    const ipv4MssAdjustment = tcpMssEl?.["ipv4-mss-adjustment"] !== undefined ? Number(tcpMssEl["ipv4-mss-adjustment"]) : null
    const ipv6MssAdjustment = tcpMssEl?.["ipv6-mss-adjustment"] !== undefined ? Number(tcpMssEl["ipv6-mss-adjustment"]) : null

    // SD-WAN link settings
    const sdwanEnabled = str(dig(entry, "sdwan-link-settings", "enable")) === "yes"
    const sdwanLinkEl = dig(entry, "sdwan-link-settings") as Record<string, unknown> | undefined
    const sdwanInterfaceProfile = str(sdwanLinkEl?.["sdwan-interface-profile"]) ?? null
    const upstreamNatEl = dig(sdwanLinkEl, "upstream-nat") as Record<string, unknown> | undefined
    const upstreamNatEnabled = str(upstreamNatEl?.["enable"]) === "yes"
    let upstreamNatType: string | null = null
    let upstreamNatAddress: string | null = null
    if (upstreamNatEl?.["static-ip"]) {
      upstreamNatType = "static-ip"
      upstreamNatAddress = str(dig(upstreamNatEl, "static-ip", "ip-address")) ?? null
    } else if (upstreamNatEl?.["ddns"]) {
      upstreamNatType = "ddns"
    }

    // IPv6
    const ipv6El = dig(entry, "ipv6") as Record<string, unknown> | undefined
    const ipv6Enabled = str(ipv6El?.["enabled"]) === "yes"
    const ipv6SdwanEnabled = str(sdwanLinkEl?.["ipv6-enable"]) === "yes"
    const ipv6InterfaceId = str(ipv6El?.["interface-id"]) ?? null

    const ndEl = dig(ipv6El, "neighbor-discovery") as Record<string, unknown> | undefined
    const ipv6DadEnabled = str(ndEl?.["enable-dad"]) === "yes"
    const ipv6DadAttempts = ndEl?.["dad-attempts"] !== undefined ? Number(ndEl["dad-attempts"]) : null
    const ipv6NdpMonitor = str(ndEl?.["enable-ndp-monitor"]) === "yes"
    const ipv6ReachableTime = ndEl?.["reachable-time"] !== undefined ? Number(ndEl["reachable-time"]) : null
    const ipv6NsInterval = ndEl?.["ns-interval"] !== undefined ? Number(ndEl["ns-interval"]) : null

    const raEl = dig(ndEl, "router-advertisement") as Record<string, unknown> | undefined
    const ipv6RaEnabled = str(raEl?.["enable"]) === "yes"
    const ipv6RaMinInterval = raEl?.["min-interval"] !== undefined ? Number(raEl["min-interval"]) : null
    const ipv6RaMaxInterval = raEl?.["max-interval"] !== undefined ? Number(raEl["max-interval"]) : null
    const ipv6RaHopLimit = raEl?.["hop-limit"] !== undefined ? Number(raEl["hop-limit"]) : null
    const ipv6RaReachableTime = raEl?.["reachable-time"] !== undefined ? Number(raEl["reachable-time"]) : null
    const ipv6RaRetransTime = raEl?.["retransmission-timer"] !== undefined ? Number(raEl["retransmission-timer"]) : null
    const ipv6RaLifetime = raEl?.["lifetime"] !== undefined ? Number(raEl["lifetime"]) : null
    const ipv6RaRouterPreference = str(raEl?.["router-preference"]) ?? null
    const ipv6RaLinkMtu = raEl?.["link-mtu"] !== undefined ? String(raEl["link-mtu"]) : null
    const ipv6RaManagedConfig = str(raEl?.["managed-flag"]) === "yes"
    const ipv6RaOtherConfig = str(raEl?.["other-flag"]) === "yes"
    const ipv6RaConsistencyCheck = str(raEl?.["enable-consistency-check"]) === "yes"

    // ARP / ND / NDP Proxy
    const arpEntries: PanwArpEntry[] = entries(dig(entry, "arp")).map((e) => ({
      ip: entryName(e),
      mac: str(e["hw-address"]) ?? "",
    }))

    const ndEntries: PanwNdEntry[] = entries(dig(ndEl, "neighbor")).map((e) => ({
      ipv6: entryName(e),
      mac: str(e["hw-address"]) ?? "",
    }))

    const ndpProxyAddresses: PanwNdpProxyAddress[] = entries(dig(entry, "ndp-proxy", "address")).map((e) => ({
      address: entryName(e),
      negate: str(e["negate"]) === "yes",
    }))

    // DDNS
    const ddnsEl = dig(entry, "ddns-config") as Record<string, unknown> | undefined
    const ddnsEnabled = ddnsEl !== undefined
    const ddnsHostname = str(ddnsEl?.["ddns-hostname"]) ?? null
    const ddnsCertProfile = str(ddnsEl?.["ddns-cert-profile"]) ?? null
    const ddnsVendor = str(ddnsEl?.["ddns-vendor"]) ?? null
    const ddnsUpdateIntervalRaw = ddnsEl?.["ddns-update-interval"]
    const ddnsUpdateInterval = ddnsUpdateIntervalRaw !== undefined ? Number(ddnsUpdateIntervalRaw) : null
    const ddnsIpv4 = ddnsEl ? members(ddnsEl["ddns-ip"]) : []
    const ddnsIpv6 = ddnsEl ? members(ddnsEl["ddns-ipv6"]) : []
    const ddnsVendorConfig: PanwDdnsVendorConfig[] = entries(ddnsEl?.["ddns-vendor-config"]).map((e) => ({
      name: entryName(e),
      value: str(e["value"]) ?? "",
    }))

    return {
      name: entryName(entry),
      tag: entry["tag"] !== undefined ? Number(entry["tag"]) : null,
      ipAddresses,
      ipEntries: ipEntryList,
      ipv6Addresses,
      ipv6Entries: ipv6EntryList,
      comment: str(entry["comment"]),
      managementProfile: str(entry["interface-management-profile"]),
      mtu: entry["mtu"] !== undefined ? Number(entry["mtu"]) : null,
      netflowProfile: str(entry["netflow-profile"]) ?? null,
      bonjourEnabled: str(dig(entry, "bonjour", "enable")) === "yes",
      ndpProxy: str(dig(entry, "ndp-proxy", "enabled")) === "yes",
      adjustTcpMss,
      sdwanEnabled,
      dhcpClient: dig(entry, "dhcp-client") !== undefined,
      pppoeEnabled: dig(entry, "pppoe") !== undefined,
      networkPacketBroker: str(entry["decrypt-forward"]) === "yes",
      ipv4MssAdjustment,
      ipv6MssAdjustment,
      ipv6Enabled,
      ipv6SdwanEnabled,
      ipv6InterfaceId,
      ipv6DadEnabled,
      ipv6DadAttempts,
      ipv6NdpMonitor,
      ipv6ReachableTime,
      ipv6NsInterval,
      ipv6RaEnabled,
      ipv6RaMinInterval,
      ipv6RaMaxInterval,
      ipv6RaHopLimit,
      ipv6RaReachableTime,
      ipv6RaRetransTime,
      ipv6RaLifetime,
      ipv6RaRouterPreference,
      ipv6RaLinkMtu,
      ipv6RaManagedConfig,
      ipv6RaOtherConfig,
      ipv6RaConsistencyCheck,
      sdwanInterfaceProfile,
      upstreamNatEnabled,
      upstreamNatType,
      upstreamNatAddress,
      arpEntries,
      ndEntries,
      ndpProxyAddresses,
      ddnsEnabled,
      ddnsHostname,
      ddnsCertProfile,
      ddnsVendor,
      ddnsUpdateInterval,
      ddnsIpv4,
      ddnsIpv6,
      ddnsVendorConfig,
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

    const directIpEntries = entries(dig(propEl, "ip"))
    const directIps: PanwIpEntry[] = directIpEntries.map((ip) => ({
      address: entryName(ip),
      sdwanGateway: str(ip["sdwan-gateway"]) ?? null,
    }))

    const ipv6EntryList = entries(dig(propEl, "ipv6", "address"))
    const ipv6Addresses: PanwIpv6Entry[] = ipv6EntryList.map((ip) => ({
      address: entryName(ip),
      enabled: str(ip["enable-on-interface"]) === "yes",
      anycast: dig(ip, "anycast") !== undefined,
      prefix: dig(ip, "prefix") !== undefined,
      sendRa: str(dig(ip, "advertise", "enable")) === "yes",
      validLifetime: dig(ip, "advertise", "valid-lifetime") !== undefined ? Number(dig(ip, "advertise", "valid-lifetime")) : null,
      preferredLifetime: dig(ip, "advertise", "preferred-lifetime") !== undefined ? Number(dig(ip, "advertise", "preferred-lifetime")) : null,
      onLink: str(dig(ip, "advertise", "onlink-flag")) === "yes",
      autonomous: str(dig(ip, "advertise", "auto-config-flag")) === "yes",
    }))

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
    const lacpFastFailover = str(dig(modeEl, "lacp", "fast-failover")) === "yes"
    const lacpSystemPriority = dig(modeEl, "lacp", "system-priority") !== undefined ? Number(dig(modeEl, "lacp", "system-priority")) : null
    const lacpMaxPorts = dig(modeEl, "lacp", "max-ports") !== undefined ? Number(dig(modeEl, "lacp", "max-ports")) : null
    const lacpHaPassive = str(dig(modeEl, "lacp", "high-availability", "passive-pre-negotiation")) === "yes"
    const lacpPortPriority = entry["lacp-port-priority"] !== undefined ? Number(entry["lacp-port-priority"]) : null

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
    const poeEnabled = poeConfigured && str(dig(entry, "poe", "poe-enabled")) !== "no"
    const poeRsvd = str(dig(entry, "poe", "poe-rsvd-pwr"))
    const poeReservedPower = poeRsvd ? Number(poeRsvd) : null

    const bonjourEnabled = str(dig(propEl, "bonjour", "enable")) === "yes"
    const ipv6Enabled = str(dig(propEl, "ipv6", "enabled")) === "yes"

    // TCP MSS details
    const tcpMssEl = dig(propEl, "adjust-tcp-mss") as Record<string, unknown> | undefined
    const ipv4MssAdjustment = tcpMssEl?.["ipv4-mss-adjustment"] !== undefined ? Number(tcpMssEl["ipv4-mss-adjustment"]) : null
    const ipv6MssAdjustment = tcpMssEl?.["ipv6-mss-adjustment"] !== undefined ? Number(tcpMssEl["ipv6-mss-adjustment"]) : null

    // SD-WAN link settings
    const sdwanLinkEl = dig(propEl, "sdwan-link-settings") as Record<string, unknown> | undefined
    const sdwanInterfaceProfile = str(sdwanLinkEl?.["sdwan-interface-profile"]) ?? null
    const upstreamNatEl = dig(sdwanLinkEl, "upstream-nat") as Record<string, unknown> | undefined
    const upstreamNatEnabled = str(upstreamNatEl?.["enable"]) === "yes"
    let upstreamNatType: string | null = null
    let upstreamNatAddress: string | null = null
    if (upstreamNatEl?.["static-ip"]) {
      upstreamNatType = "static-ip"
      upstreamNatAddress = str(dig(upstreamNatEl, "static-ip", "ip-address")) ?? null
    } else if (upstreamNatEl?.["ddns"]) {
      upstreamNatType = "ddns"
    }

    // Link settings (Advanced)
    const linkSpeed = str(dig(entry, "link-speed")) ?? null
    const linkDuplex = str(dig(entry, "link-duplex")) ?? null
    const linkState = str(dig(entry, "link-state")) ?? null

    // IPv4 type detection
    const pppoeEnabled = dig(propEl, "pppoe") !== undefined

    // IPv6 details
    const ipv6El = dig(propEl, "ipv6") as Record<string, unknown> | undefined
    const ipv6SdwanEnabled = str(sdwanLinkEl?.["ipv6-enable"]) === "yes"
    const ipv6InterfaceId = str(ipv6El?.["interface-id"]) ?? null

    // Neighbor discovery
    const ndEl = dig(ipv6El, "neighbor-discovery") as Record<string, unknown> | undefined
    const ipv6DadEnabled = str(ndEl?.["enable-dad"]) === "yes"
    const ipv6DadAttempts = ndEl?.["dad-attempts"] !== undefined ? Number(ndEl["dad-attempts"]) : null
    const ipv6NdpMonitor = str(ndEl?.["enable-ndp-monitor"]) === "yes"
    const ipv6ReachableTime = ndEl?.["reachable-time"] !== undefined ? Number(ndEl["reachable-time"]) : null
    const ipv6NsInterval = ndEl?.["ns-interval"] !== undefined ? Number(ndEl["ns-interval"]) : null

    // Router advertisement
    const raEl = dig(ndEl, "router-advertisement") as Record<string, unknown> | undefined
    const ipv6RaEnabled = str(raEl?.["enable"]) === "yes"
    const ipv6RaMinInterval = raEl?.["min-interval"] !== undefined ? Number(raEl["min-interval"]) : null
    const ipv6RaMaxInterval = raEl?.["max-interval"] !== undefined ? Number(raEl["max-interval"]) : null
    const ipv6RaHopLimit = raEl?.["hop-limit"] !== undefined ? Number(raEl["hop-limit"]) : null
    const ipv6RaReachableTime = raEl?.["reachable-time"] !== undefined ? Number(raEl["reachable-time"]) : null
    const ipv6RaRetransTime = raEl?.["retransmission-timer"] !== undefined ? Number(raEl["retransmission-timer"]) : null
    const ipv6RaLifetime = raEl?.["lifetime"] !== undefined ? Number(raEl["lifetime"]) : null
    const ipv6RaRouterPreference = str(raEl?.["router-preference"]) ?? null
    const ipv6RaLinkMtu = raEl?.["link-mtu"] !== undefined ? String(raEl["link-mtu"]) : null
    const ipv6RaManagedConfig = str(raEl?.["managed-flag"]) === "yes"
    const ipv6RaOtherConfig = str(raEl?.["other-flag"]) === "yes"
    const ipv6RaConsistencyCheck = str(raEl?.["enable-consistency-check"]) === "yes"

    // ARP entries
    const arpEntries: PanwArpEntry[] = entries(dig(propEl, "arp")).map((e) => ({
      ip: entryName(e),
      mac: str(e["hw-address"]) ?? "",
    }))

    // ND entries (neighbor-discovery > neighbor)
    const ndEntries: PanwNdEntry[] = entries(dig(ndEl, "neighbor")).map((e) => ({
      ipv6: entryName(e),
      mac: str(e["hw-address"]) ?? "",
    }))

    // NDP Proxy addresses
    const ndpProxyAddresses: PanwNdpProxyAddress[] = entries(dig(propEl, "ndp-proxy", "address")).map((e) => ({
      address: entryName(e),
      negate: str(e["negate"]) === "yes",
    }))

    // LLDP HA passive
    const lldpHaPassive = str(dig(propEl, "lldp", "high-availability", "passive-pre-negotiation")) === "yes"

    // Other Info
    const networkPacketBroker = str(propEl["decrypt-forward"]) === "yes"
    const untaggedSubInterface = str(propEl["untagged-sub-interface"]) === "yes"

    // Cluster
    const trafficInterconnect = str(propEl["traffic-interconnect"]) === "yes"

    // DDNS config detail
    const ddnsEl = dig(propEl, "ddns-config") as Record<string, unknown> | undefined
    const ddnsHostname = str(ddnsEl?.["ddns-hostname"]) ?? null
    const ddnsCertProfile = str(ddnsEl?.["ddns-cert-profile"]) ?? null
    const ddnsVendor = str(ddnsEl?.["ddns-vendor"]) ?? null
    const ddnsUpdateIntervalRaw = ddnsEl?.["ddns-update-interval"]
    const ddnsUpdateInterval = ddnsUpdateIntervalRaw !== undefined ? Number(ddnsUpdateIntervalRaw) : null
    const ddnsIpv4 = ddnsEl ? members(ddnsEl["ddns-ip"]) : []
    const ddnsIpv6 = ddnsEl ? members(ddnsEl["ddns-ipv6"]) : []
    const ddnsVendorConfig: PanwDdnsVendorConfig[] = entries(ddnsEl?.["ddns-vendor-config"]).map((e) => ({
      name: entryName(e),
      value: str(e["value"]) ?? "",
    }))

    return {
      name: entryName(entry),
      type,
      mode,
      ipAddresses: directIps,
      ipv6Addresses,
      subInterfaces,
      comment: str(entry["comment"]),
      managementProfile: str(propEl["interface-management-profile"]) ?? str(entry["interface-management-profile"]),
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
      lacpFastFailover,
      lacpSystemPriority,
      lacpMaxPorts,
      lacpHaPassive,
      lacpPortPriority,
      mtu,
      netflowProfile,
      adjustTcpMss,
      ddnsEnabled,
      poeConfigured,
      poeEnabled,
      poeReservedPower,
      // New fields
      bonjourEnabled,
      ipv4MssAdjustment,
      ipv6MssAdjustment,
      ipv6Enabled,
      sdwanInterfaceProfile,
      upstreamNatEnabled,
      upstreamNatType,
      upstreamNatAddress,
      linkSpeed,
      linkDuplex,
      linkState,
      pppoeEnabled,
      ipv6SdwanEnabled,
      ipv6InterfaceId,
      ipv6DadEnabled,
      ipv6DadAttempts,
      ipv6NdpMonitor,
      ipv6ReachableTime,
      ipv6NsInterval,
      ipv6RaEnabled,
      ipv6RaMinInterval,
      ipv6RaMaxInterval,
      ipv6RaHopLimit,
      ipv6RaReachableTime,
      ipv6RaRetransTime,
      ipv6RaLifetime,
      ipv6RaRouterPreference,
      ipv6RaLinkMtu,
      ipv6RaManagedConfig,
      ipv6RaOtherConfig,
      ipv6RaConsistencyCheck,
      arpEntries,
      ndEntries,
      ndpProxyAddresses,
      lldpHaPassive,
      networkPacketBroker,
      untaggedSubInterface,
      trafficInterconnect,
      ddnsHostname,
      ddnsCertProfile,
      ddnsVendor,
      ddnsUpdateInterval,
      ddnsIpv4,
      ddnsIpv6,
      ddnsVendorConfig,
    }
  })
}

// ─── Extractor ────────────────────────────────────────────────────────────────

/**
 * Extract all interfaces from a template's <network> element.
 * Path: networkEl → interface → ethernet|aggregate-ethernet|loopback|vlan|tunnel
 */
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
