// @/lib/panw-parser/network/interfaces/cellular-interfaces.ts
//
// Cellular interface types and extractor.
// Path: network > interface > cellular > entry[]

import { entries, entryName, str, dig, members, yesNo } from "../../xml-helpers"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PanwCellularApnProfile {
  name: string
  authType: string | null
  apn: string | null
  pdpType: string | null
  username: string | null
  hasPassword: boolean
}

export interface PanwCellularSimSlot {
  slot: number
  apnProfile: string | null
  hasPin: boolean
  networkSelection: string | null
}

export interface PanwCellularDdnsVendorConfig {
  name: string
  value: string
}

export interface PanwCellularInterface {
  name: string
  comment: string | null
  managementProfile: string | null
  netflowProfile: string | null
  mtu: number | null
  // Modem
  radio: string | null
  gps: string | null
  // Layer3 features
  adjustTcpMss: boolean
  ipv4MssAdjustment: number | null
  ipv6MssAdjustment: number | null
  ipv6Enabled: boolean
  ipv6AutoDefaultRoute: boolean
  ipv6DefaultRouteMetric: number | null
  // SD-WAN
  sdwanEnabled: boolean
  sdwanInterfaceProfile: string | null
  sdwanAutoDefaultRoute: boolean
  sdwanDefaultRouteMetric: number | null
  // Upstream NAT
  upstreamNatEnabled: boolean
  upstreamNatType: string | null
  upstreamNatAddress: string | null
  // DDNS
  ddnsEnabled: boolean
  ddnsHostname: string | null
  ddnsCertProfile: string | null
  ddnsVendor: string | null
  ddnsUpdateInterval: number | null
  ddnsIps: string[]
  ddnsVendorConfig: PanwCellularDdnsVendorConfig[]
  // Link settings
  linkState: string | null
  // SIM / APN
  simSlots: PanwCellularSimSlot[]
  apnProfiles: PanwCellularApnProfile[]
  templateName: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractSimSlots(simEl: unknown): PanwCellularSimSlot[] {
  const slotEntries = entries(dig(simEl, "slot"))
  return slotEntries.map((entry) => ({
    slot: Number(entryName(entry)),
    apnProfile: str(entry["apn-profile"]) ?? null,
    hasPin: entry["pin"] !== undefined && str(entry["pin"]) !== null,
    networkSelection: str(entry["network-sel"]) ?? null,
  }))
}

function extractApnProfiles(apnEl: unknown): PanwCellularApnProfile[] {
  return entries(apnEl).map((entry) => ({
    name: entryName(entry),
    authType: str(entry["authentication-type"]) ?? null,
    apn: str(entry["apn"]) ?? null,
    pdpType: str(entry["pdp-type"]) ?? null,
    username: str(entry["username"]) ?? null,
    hasPassword: entry["password"] !== undefined,
  }))
}

function extractDdnsVendorConfig(configEl: unknown): PanwCellularDdnsVendorConfig[] {
  return entries(configEl).map((entry) => ({
    name: entryName(entry),
    value: str(entry["value"]) ?? "",
  }))
}

// ─── Extractor ────────────────────────────────────────────────────────────────

/**
 * Extract Cellular interfaces from a template's <network> element.
 * Path: networkEl → interface → cellular → entry[]
 */
export function extractCellularInterfaces(
  networkEl: unknown,
  templateName: string | null,
): PanwCellularInterface[] {
  if (!networkEl || typeof networkEl !== "object") return []
  const ifaceEl = (networkEl as Record<string, unknown>)["interface"] as Record<string, unknown> | undefined
  if (!ifaceEl) return []

  return entries(ifaceEl["cellular"]).map((entry) => {
    const l3 = (entry["layer3"] ?? {}) as Record<string, unknown>
    const sdwanLink = (l3["sdwan-link-settings"] ?? {}) as Record<string, unknown>
    const ddns = (l3["ddns-config"] ?? {}) as Record<string, unknown>
    const tcpMss = (l3["adjust-tcp-mss"] ?? {}) as Record<string, unknown>

    // Upstream NAT — can be static-ip, dynamic-ip, or disabled
    const upstreamNat = (sdwanLink["upstream-nat"] ?? {}) as Record<string, unknown>
    let upstreamNatType: string | null = null
    let upstreamNatAddress: string | null = null
    if (upstreamNat["static-ip"]) {
      upstreamNatType = "static-ip"
      upstreamNatAddress = str(dig(upstreamNat, "static-ip", "ip-address")) ?? null
    } else if (upstreamNat["dynamic-ip"]) {
      upstreamNatType = "dynamic-ip"
    }

    return {
      name: entryName(entry),
      comment: str(entry["comment"]) ?? null,
      managementProfile: str(l3["interface-management-profile"]) ?? null,
      netflowProfile: str(l3["netflow-profile"]) ?? null,
      mtu: l3["mtu"] !== undefined ? Number(l3["mtu"]) : null,
      // Modem
      radio: str(dig(entry, "modem", "radio")) ?? null,
      gps: str(dig(entry, "modem", "gps")) ?? null,
      // Layer3 features
      adjustTcpMss: yesNo(tcpMss["enable"]),
      ipv4MssAdjustment: tcpMss["ipv4-mss-adjustment"] !== undefined ? Number(tcpMss["ipv4-mss-adjustment"]) : null,
      ipv6MssAdjustment: tcpMss["ipv6-mss-adjustment"] !== undefined ? Number(tcpMss["ipv6-mss-adjustment"]) : null,
      ipv6Enabled: yesNo(dig(l3, "ipv6", "enabled")),
      ipv6AutoDefaultRoute: dig(l3, "ipv6", "default-route-auto-create") !== undefined
        ? yesNo(dig(l3, "ipv6", "default-route-auto-create"))
        : true,
      ipv6DefaultRouteMetric: dig(l3, "ipv6", "default-route-metric") !== undefined
        ? Number(dig(l3, "ipv6", "default-route-metric"))
        : null,
      // SD-WAN
      sdwanEnabled: yesNo(sdwanLink["enable"]),
      sdwanInterfaceProfile: str(sdwanLink["sdwan-interface-profile"]) ?? null,
      sdwanAutoDefaultRoute: dig(l3, "ipv4", "default-route-auto-create") !== undefined
        ? yesNo(dig(l3, "ipv4", "default-route-auto-create"))
        : true,
      sdwanDefaultRouteMetric: dig(l3, "ipv4", "default-route-metric") !== undefined
        ? Number(dig(l3, "ipv4", "default-route-metric"))
        : null,
      // Upstream NAT
      upstreamNatEnabled: yesNo(upstreamNat["enable"]),
      upstreamNatType,
      upstreamNatAddress,
      // DDNS
      ddnsEnabled: yesNo(ddns["ddns-enabled"]),
      ddnsHostname: str(ddns["ddns-hostname"]) ?? null,
      ddnsCertProfile: str(ddns["ddns-cert-profile"]) ?? null,
      ddnsVendor: str(ddns["ddns-vendor"]) ?? null,
      ddnsUpdateInterval: ddns["ddns-update-interval"] !== undefined ? Number(ddns["ddns-update-interval"]) : null,
      ddnsIps: members(ddns["ddns-ip"]),
      ddnsVendorConfig: extractDdnsVendorConfig(ddns["ddns-vendor-config"]),
      // Link settings
      linkState: str(dig(entry, "link-settings", "link-state")) ?? str(dig(entry, "link-state")) ?? null,
      // SIM / APN
      simSlots: extractSimSlots(entry["sim"]),
      apnProfiles: extractApnProfiles(entry["apn-profile"]),
      templateName,
    }
  })
}
