// @/src/lib/panw-parser/network/interfaces/interfaces.ts
//
// Interface types and extractor.
// Path: network > interface > ethernet|aggregate-ethernet|loopback|vlan|tunnel

import { entries, entryName, str, dig } from "../../xml-helpers"

// ─── Types ────────────────────────────────────────────────────────────────────

export type InterfaceType = "ethernet" | "loopback" | "vlan" | "tunnel" | "ae"
export type InterfaceMode = "layer3" | "layer2" | "virtual-wire" | "tap" | "ha" | "decrypt-mirror" | "none"

export interface PanwSubInterface {
  name: string
  tag: number | null
  ipAddresses: string[]
  ipv6Addresses: string[]
  comment: string | null
  managementProfile: string | null
  // ── Feature flags ──────────────────────────────────────────────────────
  bonjourEnabled: boolean
  ndpProxy: boolean
  adjustTcpMss: boolean
  sdwanEnabled: boolean
  dhcpClient: boolean
}

export interface PanwInterface {
  name: string
  type: InterfaceType
  mode: InterfaceMode
  ipAddresses: string[]
  ipv6Addresses: string[]            // ← NEW: was missing on parent
  subInterfaces: PanwSubInterface[]
  comment: string | null
  managementProfile: string | null
  aggregateGroup: string | null
  /** Panorama: which template this came from */
  templateName: string | null
  // ── Feature flags ──────────────────────────────────────────────────────
  dhcpClient: boolean
  lldpEnabled: boolean
  lldpProfile: string | null
  ndpProxy: boolean
  sdwanEnabled: boolean
  // ── LACP (AE interfaces only) ──────────────────────────────────────────
  lacpEnabled: boolean
  lacpMode: string | null
  lacpTransmissionRate: string | null
  mtu: number | null
  netflowProfile: string | null
  adjustTcpMss: boolean
  ddnsEnabled: boolean
  poeConfigured: boolean
  poeEnabled: boolean
  poeReservedPower: number | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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