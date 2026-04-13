// @/lib/panw-parser/general/config/config.ts
//
// Top-level configuration types and extractors: parsed config shapes, Panorama
// template/device-group structures, template variables, and parse result types.

import { entries, entryName, str } from "../../xml-helpers"

// ─── Network imports ──────────────────────────────────────────────────────────
import type { PanwInterface, PanwSdwanInterface, PanwCellularInterface, PanwFailOpen } from "../../network/interfaces"
import type { PanwZone } from "../../network/zones"
import type { PanwVlan } from "../../network/vlans"
import type { PanwVirtualWire } from "../../network/virtual-wires"
import type { PanwVirtualRouter } from "../../network/routers"
import type { PanwGreTunnel } from "../../network/gre-tunnels"
import type { PanwIpsecTunnel } from "../../network/ipsec-tunnels"
import type { PanwDhcpServer, PanwDhcpRelay } from "../../network/dhcp"
import type { PanwDnsProxy } from "../../network/dns-proxy"
import type { PanwProxy } from "../../network/proxy"
import type {
  PanwBfdProfile,
  PanwBgpRoutingProfiles,
  PanwMulticastRoutingProfiles,
  PanwOspfRoutingProfiles,
  PanwOspfv3RoutingProfiles,
  PanwRipRoutingProfiles,
  PanwRoutingFilters,
} from "../../network/routing-profiles"
import type { PanwQosInterface } from "../../network/qos-interfaces"
import type {
  PanwGpPortal,
  PanwGpGateway,
  PanwGpClientlessApp,
  PanwGpClientlessAppGroup,
  PanwGpMdmServer,
  PanwGpDhcpProfile,
} from "../../network/global-protect"
import type { PanwLldpGeneral } from "../../network/lldp-general"
import type {
  PanwInterfaceMgmtProfile,
  PanwMonitorProfile,
  PanwZoneProtectionProfile,
  PanwIkeCryptoProfile,
  PanwIpsecCryptoProfile,
  PanwIkeGateway,
  PanwGpIpsecCryptoProfile,
  PanwNetworkBfdProfile,
  PanwLldpProfile,
  PanwMacsecProfile,
  PanwQosProfile,
} from "../../network/network-profiles"
import type { PanwSdwanInterfaceProfile } from "../../network/sd-wan-interface-profile"

// ─── Objects imports ──────────────────────────────────────────────────────────
import type { PanwTag } from "../../objects/tags"
import type { PanwAddress, PanwAddressGroup } from "../../objects/addresses"
import type { PanwService, PanwServiceGroup } from "../../objects/services"
import type { PanwApplicationGroup, PanwApplicationFilter } from "../../objects/applications"
import type { PanwProfileGroup } from "../../objects/profile-groups"

// ─── Policies imports ─────────────────────────────────────────────────────────
import type { PanwSecurityRule } from "../../policies/security-rules"
import type { PanwNatRule } from "../../policies/nat-rules"

// ─── Template Variables ──────────────────────────────────────────────────────

export type TemplateVariableType = "ip-netmask" | "ip-range" | "fqdn" | "ip-wildcard"

export interface PanwTemplateVariable {
  /** Variable name including $ prefix, e.g. "$DOMAIN_SERVICES_IPV4_SUBNET" */
  name: string
  /** The variable type (ip-netmask, fqdn, etc.) */
  type: TemplateVariableType
  /** The resolved value, e.g. "10.11.11.62/26" or "dc01.ndit.io" */
  value: string
  /** Human-readable description */
  description: string | null
}

// ─── Panorama Template ───────────────────────────────────────────────────────

export interface PanwTemplate {
  name: string
  description: string | null
  interfaces: PanwInterface[]
  virtualRouters: PanwVirtualRouter[]
  logicalRouters: PanwVirtualRouter[]
  zones: PanwZone[]
  dhcpServers: PanwDhcpServer[]
  dhcpRelays: PanwDhcpRelay[]
  variables: PanwTemplateVariable[]
  vlans: PanwVlan[]
  virtualWires: PanwVirtualWire[]
  bfdProfiles: PanwBfdProfile[]
  bgpRoutingProfiles: PanwBgpRoutingProfiles
  ospfRoutingProfiles: PanwOspfRoutingProfiles
  ospfv3RoutingProfiles: PanwOspfv3RoutingProfiles
  ripRoutingProfiles: PanwRipRoutingProfiles
  multicastRoutingProfiles: PanwMulticastRoutingProfiles
  routingFilters: PanwRoutingFilters
  interfaceMgmtProfiles: PanwInterfaceMgmtProfile[]
  monitorProfiles: PanwMonitorProfile[]
  zoneProtectionProfiles: PanwZoneProtectionProfile[]
  ikeCryptoProfiles: PanwIkeCryptoProfile[]
  ipsecCryptoProfiles: PanwIpsecCryptoProfile[]
  ikeGateways: PanwIkeGateway[]
  gpIpsecCryptoProfiles: PanwGpIpsecCryptoProfile[]
  networkBfdProfiles: PanwNetworkBfdProfile[]
  lldpProfiles: PanwLldpProfile[]
  macsecProfiles: PanwMacsecProfile[]
  qosProfiles: PanwQosProfile[]
  ipsecTunnels: PanwIpsecTunnel[]
  greTunnels: PanwGreTunnel[]
  dnsProxies: PanwDnsProxy[]
  qosInterfaces: PanwQosInterface[]
  lldpGeneral: PanwLldpGeneral | null
  proxy: PanwProxy | null
  sdwanInterfaceProfiles: PanwSdwanInterfaceProfile[]
  sdwanInterfaces: PanwSdwanInterface[]
  cellularInterfaces: PanwCellularInterface[]
  failOpen: PanwFailOpen | null
  gpPortals: PanwGpPortal[]
  gpGateways: PanwGpGateway[]
  gpClientlessApps: PanwGpClientlessApp[]
  gpClientlessAppGroups: PanwGpClientlessAppGroup[]
  gpMdmServers: PanwGpMdmServer[]
  gpDhcpProfiles: PanwGpDhcpProfile[]
}

// ─── Panorama Device Group ───────────────────────────────────────────────────

export interface PanwDeviceGroup {
  name: string
  description: string | null
  addresses: PanwAddress[]
  addressGroups: PanwAddressGroup[]
  services: PanwService[]
  serviceGroups: PanwServiceGroup[]
  tags: PanwTag[]
  preSecurityRules: PanwSecurityRule[]
  postSecurityRules: PanwSecurityRule[]
  preNatRules: PanwNatRule[]
  postNatRules: PanwNatRule[]
  qosRules: number
  pbfRules: number
  decryptionRules: number
  tunnelInspectionRules: number
  appOverrideRules: number
  authenticationRules: number
  dosRules: number
  sdwanPolicyRules: number
  externalDynamicLists: number
  schedules: number
  regions: number
  securityProfiles: number
  logForwardingProfiles: number
  authenticationProfiles: number
  decryptionProfiles: number
}

// ─── Panorama Template Stack ─────────────────────────────────────────────────

export interface PanwTemplateStack {
  name: string
  templates: string[]
  deviceSerials: string[]
  zoneOverrides: PanwZone[]
}

// ─── Parsed Config (Firewall) ────────────────────────────────────────────────

export interface ParsedFirewallConfig {
  deviceType: "firewall"
  hostname: string | null
  panOsVersion: string
  panOsDetailVersion: string
  serialNumber: string | null
  ipAddress: string | null
  platformModel: string | null
  tags: PanwTag[]
  addresses: PanwAddress[]
  addressGroups: PanwAddressGroup[]
  services: PanwService[]
  serviceGroups: PanwServiceGroup[]
  applicationGroups: PanwApplicationGroup[]
  applicationFilters: PanwApplicationFilter[]
  profileGroups: PanwProfileGroup[]
  interfaces: PanwInterface[]
  zones: PanwZone[]
  dhcpServers: PanwDhcpServer[]
  dhcpRelays: PanwDhcpRelay[]
  virtualRouters: PanwVirtualRouter[]
  logicalRouters: PanwVirtualRouter[]
  securityRules: PanwSecurityRule[]
  natRules: PanwNatRule[]
  qosRules: number
  pbfRules: number
  decryptionRules: number
  tunnelInspectionRules: number
  appOverrideRules: number
  authenticationRules: number
  dosRules: number
  sdwanPolicyRules: number
  externalDynamicLists: number
  schedules: number
  regions: number
  securityProfiles: number
  logForwardingProfiles: number
  authenticationProfiles: number
  decryptionProfiles: number
  vlans: PanwVlan[]
  virtualWires: PanwVirtualWire[]
  ipsecTunnels: PanwIpsecTunnel[]
  greTunnels: PanwGreTunnel[]
  dnsProxies: PanwDnsProxy[]
  qosInterfaces: PanwQosInterface[]
  lldpGeneral: PanwLldpGeneral | null
  proxy: PanwProxy | null
  sdwanInterfaceProfiles: PanwSdwanInterfaceProfile[]
  gpPortals: PanwGpPortal[]
  gpGateways: PanwGpGateway[]
  gpClientlessApps: PanwGpClientlessApp[]
  gpClientlessAppGroups: PanwGpClientlessAppGroup[]
  gpMdmServers: PanwGpMdmServer[]
  gpDhcpProfiles: PanwGpDhcpProfile[]
}

// ─── Parsed Config (Panorama) ────────────────────────────────────────────────

export interface ParsedPanoramaConfig {
  deviceType: "panorama"
  hostname: string | null
  panOsVersion: string
  panOsDetailVersion: string
  serialNumber: string | null
  ipAddress: string | null
  platformModel: string | null
  sharedTags: PanwTag[]
  sharedAddresses: PanwAddress[]
  sharedAddressGroups: PanwAddressGroup[]
  sharedServices: PanwService[]
  sharedServiceGroups: PanwServiceGroup[]
  sharedApplicationGroups: PanwApplicationGroup[]
  sharedApplicationFilters: PanwApplicationFilter[]
  sharedProfileGroups: PanwProfileGroup[]
  sharedPreSecurityRules: PanwSecurityRule[]
  sharedPostSecurityRules: PanwSecurityRule[]
  sharedExternalDynamicLists: number
  sharedSchedules: number
  sharedRegions: number
  sharedSecurityProfiles: number
  sharedLogForwardingProfiles: number
  sharedAuthenticationProfiles: number
  sharedDecryptionProfiles: number
  deviceGroups: PanwDeviceGroup[]
  templates: PanwTemplate[]
  templateStacks: PanwTemplateStack[]
}

// ─── Parse Result ────────────────────────────────────────────────────────────

export type ParsedConfig = ParsedFirewallConfig | ParsedPanoramaConfig

export interface ParseError {
  code: "INVALID_XML" | "UNKNOWN_DEVICE_TYPE" | "MISSING_ROOT" | "PARSE_FAILED"
  message: string
}

export type ParseResult =
  | { success: true; config: ParsedConfig }
  | { success: false; error: ParseError }

// ─── Extractor ───────────────────────────────────────────────────────────────

/**
 * Extract Template Variables from a Panorama template element.
 * Path: variableEl → entry[]
 */
export function extractTemplateVariables(variableEl: unknown): PanwTemplateVariable[] {
  return entries(variableEl).map((entry) => {
    const typeEl = entry["type"] as Record<string, unknown> | undefined

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
