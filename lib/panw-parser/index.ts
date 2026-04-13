// @/lib/panw-parser/index.ts

import { XMLParser } from "fast-xml-parser"
import { str, entries, entryName, dig, toArray, members } from "./xml-helpers"
import type {
  ParseResult, ParsedFirewallConfig, ParsedPanoramaConfig,
  PanwDeviceGroup, PanwTemplate,
} from "./general/config"
import { extractTemplateVariables } from "./general/config"

// ─── Objects ──────────────────────────────────────────────────────────────────
import { extractTags, buildTagColorMap } from "./objects/tags"
import { extractAddresses, extractAddressGroups } from "./objects/addresses"
import { extractServices, extractServiceGroups } from "./objects/services"
import { extractApplicationGroups, extractApplicationFilters } from "./objects/applications"
import { extractProfileGroups } from "./objects/profile-groups"

// ─── Network ──────────────────────────────────────────────────────────────────
import { extractInterfaces, extractSdwanInterfaces, extractCellularInterfaces, extractFailOpen } from "./network/interfaces"
import { extractZones } from "./network/zones"
import { extractVlans } from "./network/vlans"
import { extractVirtualWires } from "./network/virtual-wires"
import { extractVirtualRouters, extractLogicalRouters } from "./network/routers"
import { extractIpsecTunnels } from "./network/ipsec-tunnels"
import { extractGreTunnels } from "./network/gre-tunnels"
import { extractDhcpServers, extractDhcpRelays } from "./network/dhcp"
import { extractDnsProxies } from "./network/dns-proxy"
import { extractProxy } from "./network/proxy"
import {
  extractBfdProfiles, extractBgpRoutingProfiles, extractRoutingFilters,
  extractOspfRoutingProfiles, extractOspfv3RoutingProfiles,
  extractRipRoutingProfiles, extractMulticastRoutingProfiles,
} from "./network/routing-profiles"
import { extractQosInterfaces } from "./network/qos-interfaces"
import {
  extractGpPortals,
  extractGpGateways,
  extractGpClientlessApps,
  extractGpClientlessAppGroups,
  extractGpMdmServers,
  extractGpDhcpProfiles,
} from "./network/global-protect"
import { extractLldpGeneral } from "./network/lldp-general"
import {
  extractInterfaceMgmtProfiles,
  extractMonitorProfiles,
  extractZoneProtectionProfiles,
  extractIkeCryptoProfiles,
  extractIpsecCryptoProfiles,
  extractIkeGateways,
  extractGpIpsecCryptoProfiles,
  extractNetworkBfdProfiles,
  extractLldpProfiles,
  extractMacsecProfiles,
  extractQosProfiles,
} from "./network/network-profiles"
import { extractSdwanInterfaceProfiles } from "./network/sd-wan-interface-profile"

// ─── Policies ─────────────────────────────────────────────────────────────────
import { extractSecurityRules } from "./policies/security-rules"
import { extractNatRules } from "./policies/nat-rules"

// ─── XML Parser config ───────────────────────────────────────────────────────

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  isArray: (tagName) => {
    const alwaysArray = new Set(["entry", "member"])
    return alwaysArray.has(tagName)
  },
  parseAttributeValue: false,
  parseTagValue: false,
  trimValues: true,
  tagValueProcessor: (tagName, tagValue) => {
    const credentialFields = new Set([
      "password", "private-key", "bind-password", "secret",
      "key", "authpwd", "privpwd", "wmi-password",
    ])
    if (credentialFields.has(tagName)) return "[REDACTED]"
    return tagValue
  },
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Count entries at a path. Safe — returns 0 if path doesn't exist. */
function countEntries(root: unknown, ...path: string[]): number {
  const el = path.reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key]
    return undefined
  }, root)
  return entries(el).length
}

/** Sum a counter across all rulebase types (pre + post) for Panorama DGs */
function countRulebaseEntries(
  dgEntry: Record<string, unknown>,
  ruleName: string
): number {
  return (
    countEntries(dgEntry, "pre-rulebase", ruleName, "rules") +
    countEntries(dgEntry, "post-rulebase", ruleName, "rules")
  )
}

// ─── Device type detection ───────────────────────────────────────────────────

function isPanorama(config: Record<string, unknown>): boolean {
  return config["panorama"] !== undefined
}

// ─── System info extraction ──────────────────────────────────────────────────

function extractSystemInfo(config: Record<string, unknown>) {
  const devEntries = toArray(dig(config, "devices", "entry") as unknown)
  const firstEntry = devEntries[0] as Record<string, unknown> | undefined
  const sysEl = firstEntry
    ? dig(firstEntry, "deviceconfig", "system") as Record<string, unknown> | undefined
    : undefined

  if (!sysEl) return { hostname: null, serialNumber: null, ipAddress: null, platformModel: null }

  return {
    hostname: str(sysEl["hostname"]),
    serialNumber: str(sysEl["serial"]),
    ipAddress: str(sysEl["ip-address"]),
    platformModel: str(sysEl["platform-model"]) ?? str(sysEl["model"]),
  }
}

// ─── Policy counts (shared between firewall vsys and DG extractions) ─────────

function extractPolicyCounts(rulebaseEl: unknown) {
  const rb = rulebaseEl as Record<string, unknown> | undefined
  return {
    qosRules:              countEntries(rb, "qos", "rules"),
    pbfRules:              countEntries(rb, "pbf", "rules"),
    decryptionRules:       countEntries(rb, "decryption", "rules"),
    tunnelInspectionRules: countEntries(rb, "tunnel-inspect", "rules"),
    appOverrideRules:      countEntries(rb, "application-override", "rules"),
    authenticationRules:   countEntries(rb, "authentication", "rules"),
    dosRules:              countEntries(rb, "dos", "rules"),
    sdwanPolicyRules:      countEntries(rb, "sdwan", "rules"),
  }
}

// ─── Object counts (shared between firewall vsys and DG/shared extractions) ──

function extractObjectCounts(scopeEl: Record<string, unknown>) {
  const profilesEl = scopeEl["profiles"] as Record<string, unknown> | undefined
  const securityProfiles = [
    "virus", "spyware", "vulnerability", "url-filtering",
    "file-blocking", "wildfire-analysis", "data-filtering",
  ].reduce((sum, key) => sum + countEntries(profilesEl, key), 0)

  return {
    externalDynamicLists:  countEntries(scopeEl, "external-list"),
    schedules:             countEntries(scopeEl, "schedule"),
    regions:               countEntries(scopeEl, "region"),
    securityProfiles,
    logForwardingProfiles: countEntries(scopeEl, "log-settings", "profiles"),
    authenticationProfiles:countEntries(scopeEl, "authentication-profile"),
    decryptionProfiles:    countEntries(profilesEl, "decryption"),
  }
}

// ─── Firewall parser ─────────────────────────────────────────────────────────

function parseFirewall(
  config: Record<string, unknown>,
  panOsVersion: string,
  panOsDetailVersion: string
): ParsedFirewallConfig {
  const sys = extractSystemInfo(config)

  const deviceEntry = (
    toArray(dig(config, "devices", "entry") as unknown)[0] ?? {}
  ) as Record<string, unknown>

  const networkEl = deviceEntry["network"]
  const vsysEntry = (
    toArray(dig(deviceEntry, "vsys", "entry") as unknown)[0] ?? {}
  ) as Record<string, unknown>

  const sharedEl = config["shared"] as Record<string, unknown> | undefined

  // Tags
  const vsysTags = extractTags(vsysEntry["tag"])
  const sharedTags = extractTags(sharedEl?.["tag"])
  const allTags = [...vsysTags, ...sharedTags]
  const tagColorMap = buildTagColorMap(allTags)

  // Objects
  const addresses       = extractAddresses(vsysEntry["address"], tagColorMap)
  const addressGroups   = extractAddressGroups(vsysEntry["address-group"], tagColorMap)
  const services        = extractServices(vsysEntry["service"], tagColorMap)
  const serviceGroups   = extractServiceGroups(vsysEntry["service-group"], tagColorMap)
  const applicationGroups  = extractApplicationGroups(vsysEntry["application-group"], tagColorMap)
  const applicationFilters = extractApplicationFilters(vsysEntry["application-filter"], tagColorMap)
  const profileGroups   = extractProfileGroups(vsysEntry["profile-group"])

  // Network
  const interfaces     = extractInterfaces(networkEl, null)
  const virtualRouters = extractVirtualRouters(networkEl, null)
  const logicalRouters = extractLogicalRouters(networkEl, null)
  const zones          = extractZones(vsysEntry["zone"], tagColorMap)
  const vlans          = extractVlans(networkEl, null)
  const virtualWires   = extractVirtualWires(networkEl, null)

  // Policies
  const rulebaseEl    = vsysEntry["rulebase"]
  const securityRules = extractSecurityRules(
    dig(vsysEntry, "rulebase", "security", "rules"), "vsys1", "local", tagColorMap
  )
  const natRules = extractNatRules(
    dig(vsysEntry, "rulebase", "nat", "rules"), "vsys1", "local", tagColorMap
  )
  const policyCounts = extractPolicyCounts(rulebaseEl)

  // Object counts
  const objectCounts = extractObjectCounts(vsysEntry)

  return {
    deviceType: "firewall",
    hostname: sys.hostname,
    panOsVersion,
    panOsDetailVersion,
    serialNumber: sys.serialNumber,
    ipAddress: sys.ipAddress,
    platformModel: sys.platformModel,
    // Objects
    tags: allTags,
    addresses,
    addressGroups,
    services,
    serviceGroups,
    applicationGroups,
    applicationFilters,
    profileGroups,
    // Network
    interfaces,
    zones,
    virtualRouters,
    logicalRouters,
    vlans,
    virtualWires,
    // Policies
    securityRules,
    natRules,
    ipsecTunnels: extractIpsecTunnels(networkEl, null),
    greTunnels: extractGreTunnels(networkEl, null),
    dhcpServers: extractDhcpServers(networkEl, null),
    dhcpRelays:  extractDhcpRelays(networkEl, null),
    dnsProxies: extractDnsProxies(networkEl, null, vsysEntry),
    qosInterfaces: extractQosInterfaces(networkEl, null),
    lldpGeneral:   extractLldpGeneral(networkEl, null),
    proxy: extractProxy(networkEl, null),
    sdwanInterfaceProfiles: extractSdwanInterfaceProfiles(networkEl, null, vsysEntry),
    gpPortals: extractGpPortals(networkEl, null, vsysEntry),
    gpGateways: extractGpGateways(networkEl, null, vsysEntry),
    gpClientlessApps:      extractGpClientlessApps(networkEl, null, vsysEntry),
    gpClientlessAppGroups: extractGpClientlessAppGroups(networkEl, null, vsysEntry),
    gpMdmServers:          extractGpMdmServers(networkEl, null, vsysEntry),
    gpDhcpProfiles:        extractGpDhcpProfiles(networkEl, null, vsysEntry),
    ...policyCounts,
    // Object counts
    ...objectCounts,
  }
}

// ─── Panorama parser ─────────────────────────────────────────────────────────

function parsePanorama(
  config: Record<string, unknown>,
  panOsVersion: string,
  panOsDetailVersion: string
): ParsedPanoramaConfig {
  const sys = extractSystemInfo(config)

  const sharedEl = (config["shared"] ?? {}) as Record<string, unknown>

  // Shared tags first
  const sharedTags = extractTags(sharedEl["tag"])
  const tagColorMap = buildTagColorMap(sharedTags)

  // Shared objects
  const sharedAddresses        = extractAddresses(sharedEl["address"], tagColorMap)
  const sharedAddressGroups    = extractAddressGroups(sharedEl["address-group"], tagColorMap)
  const sharedServices         = extractServices(sharedEl["service"], tagColorMap)
  const sharedServiceGroups    = extractServiceGroups(sharedEl["service-group"], tagColorMap)
  const sharedApplicationGroups  = extractApplicationGroups(sharedEl["application-group"], tagColorMap)
  const sharedApplicationFilters = extractApplicationFilters(sharedEl["application-filter"], tagColorMap)
  const sharedProfileGroups    = extractProfileGroups(sharedEl["profile-group"])
  const sharedObjectCounts     = extractObjectCounts(sharedEl)

  // Shared rulebases
  const sharedPreSecurityRules = extractSecurityRules(
    dig(sharedEl, "pre-rulebase", "security", "rules"), "shared", "pre", tagColorMap
  )
  const sharedPostSecurityRules = extractSecurityRules(
    dig(sharedEl, "post-rulebase", "security", "rules"), "shared", "post", tagColorMap
  )

  // Panorama stores device-group, template, template-stack inside devices/entry
  const panoramaDeviceEntry = (
    toArray(dig(config, "devices", "entry") as unknown)[0] ?? {}
  ) as Record<string, unknown>

  // Device groups
  const dgRootEl = panoramaDeviceEntry["device-group"] as Record<string, unknown> | undefined
  const deviceGroups: PanwDeviceGroup[] = entries(dgRootEl).map((dgEntry) => {
    const dgName = entryName(dgEntry)
    const dgTags = extractTags(dgEntry["tag"])
    const dgTagMap = new Map([...tagColorMap, ...buildTagColorMap(dgTags)])

    return {
      name: dgName,
      description: str(dgEntry["description"]),
      addresses:      extractAddresses(dgEntry["address"], dgTagMap),
      addressGroups:  extractAddressGroups(dgEntry["address-group"], dgTagMap),
      services:       extractServices(dgEntry["service"], dgTagMap),
      serviceGroups:  extractServiceGroups(dgEntry["service-group"], dgTagMap),
      tags: dgTags,
      preSecurityRules: extractSecurityRules(
        dig(dgEntry, "pre-rulebase", "security", "rules"), dgName, "pre", dgTagMap
      ),
      postSecurityRules: extractSecurityRules(
        dig(dgEntry, "post-rulebase", "security", "rules"), dgName, "post", dgTagMap
      ),
      preNatRules: extractNatRules(
        dig(dgEntry, "pre-rulebase", "nat", "rules"), dgName, "pre", dgTagMap
      ),
      postNatRules: extractNatRules(
        dig(dgEntry, "post-rulebase", "nat", "rules"), dgName, "post", dgTagMap
      ),
      qosRules:              countRulebaseEntries(dgEntry, "qos"),
      pbfRules:              countRulebaseEntries(dgEntry, "pbf"),
      decryptionRules:       countRulebaseEntries(dgEntry, "decryption"),
      tunnelInspectionRules: countRulebaseEntries(dgEntry, "tunnel-inspect"),
      appOverrideRules:      countRulebaseEntries(dgEntry, "application-override"),
      authenticationRules:   countRulebaseEntries(dgEntry, "authentication"),
      dosRules:              countRulebaseEntries(dgEntry, "dos"),
      sdwanPolicyRules:      countRulebaseEntries(dgEntry, "sdwan"),
      ...extractObjectCounts(dgEntry),
    }
  })

  // Templates
  const tmplRootEl = panoramaDeviceEntry["template"] as Record<string, unknown> | undefined
  const templates: PanwTemplate[] = entries(tmplRootEl).map((tmplEntry) => {
    const tmplName = entryName(tmplEntry)
    const tmplConfig = tmplEntry["config"] as Record<string, unknown> | undefined

    const tmplDeviceEntry = (
      toArray(dig(tmplConfig, "devices", "entry") as unknown)[0] ?? {}
    ) as Record<string, unknown>

    const networkEl = tmplDeviceEntry["network"]
    const vsysEntry = (
      toArray(dig(tmplDeviceEntry, "vsys", "entry") as unknown)[0] ?? {}
    ) as Record<string, unknown>

    return {
      name: tmplName,
      description:              str(tmplEntry["description"]),
      variables:                extractTemplateVariables(tmplEntry["variable"]),
      interfaces:               extractInterfaces(networkEl, tmplName),
      virtualRouters:           extractVirtualRouters(networkEl, tmplName),
      logicalRouters:           extractLogicalRouters(networkEl, tmplName),
      zones:                    extractZones(vsysEntry["zone"], tagColorMap),
      dhcpServers:              extractDhcpServers(networkEl, tmplName),
      dhcpRelays:               extractDhcpRelays(networkEl, tmplName),
      vlans:                    extractVlans(networkEl, tmplName),
      virtualWires:             extractVirtualWires(networkEl, tmplName),
      bfdProfiles:              extractBfdProfiles(networkEl, tmplName),
      routingFilters:           extractRoutingFilters(networkEl, tmplName),
      bgpRoutingProfiles:       extractBgpRoutingProfiles(networkEl, tmplName),
      ospfRoutingProfiles:      extractOspfRoutingProfiles(networkEl, tmplName),
      ospfv3RoutingProfiles:    extractOspfv3RoutingProfiles(networkEl, tmplName),
      ripRoutingProfiles:       extractRipRoutingProfiles(networkEl, tmplName),
      multicastRoutingProfiles: extractMulticastRoutingProfiles(networkEl, tmplName),
      interfaceMgmtProfiles:    extractInterfaceMgmtProfiles(networkEl, tmplName),
      monitorProfiles:          extractMonitorProfiles(networkEl, tmplName),
      zoneProtectionProfiles:   extractZoneProtectionProfiles(networkEl, tmplName),
      ikeCryptoProfiles:        extractIkeCryptoProfiles(networkEl, tmplName),
      ipsecCryptoProfiles:      extractIpsecCryptoProfiles(networkEl, tmplName),
      ikeGateways:              extractIkeGateways(networkEl, tmplName),
      gpIpsecCryptoProfiles:    extractGpIpsecCryptoProfiles(networkEl, tmplName),
      networkBfdProfiles:       extractNetworkBfdProfiles(networkEl, tmplName),
      lldpProfiles:             extractLldpProfiles(networkEl, tmplName),
      macsecProfiles:           extractMacsecProfiles(networkEl, tmplName),
      qosProfiles:              extractQosProfiles(networkEl, tmplName),
      ipsecTunnels:             extractIpsecTunnels(networkEl, tmplName),
      greTunnels:               extractGreTunnels(networkEl, tmplName),
      dnsProxies:               extractDnsProxies(networkEl, tmplName, vsysEntry),
      qosInterfaces:            extractQosInterfaces(networkEl, tmplName),
      lldpGeneral:              extractLldpGeneral(networkEl, tmplName),
      proxy:                    extractProxy(networkEl, tmplName),
      sdwanInterfaceProfiles:   extractSdwanInterfaceProfiles(networkEl, tmplName, vsysEntry),
      sdwanInterfaces:          extractSdwanInterfaces(networkEl, tmplName),
      cellularInterfaces:       extractCellularInterfaces(networkEl, tmplName),
      failOpen:                 extractFailOpen(networkEl, tmplName),
      gpPortals:                extractGpPortals(networkEl, tmplName, vsysEntry),
      gpGateways:               extractGpGateways(networkEl, tmplName, vsysEntry),
      gpClientlessApps:         extractGpClientlessApps(networkEl, tmplName, vsysEntry),
      gpClientlessAppGroups:    extractGpClientlessAppGroups(networkEl, tmplName, vsysEntry),
      gpMdmServers:             extractGpMdmServers(networkEl, tmplName, vsysEntry),
      gpDhcpProfiles:           extractGpDhcpProfiles(networkEl, tmplName, vsysEntry),
    }
  })

  // Template stacks
  const tmplStackRootEl = panoramaDeviceEntry["template-stack"] as Record<string, unknown> | undefined
  const templateStacks = entries(tmplStackRootEl).map((stackEntry) => {
    const stackDeviceEntry = (
      toArray(dig(stackEntry, "config", "devices", "entry") as unknown)[0] ?? {}
    ) as Record<string, unknown>
    const stackVsysEntry = (
      toArray(dig(stackDeviceEntry, "vsys", "entry") as unknown)[0] ?? {}
    ) as Record<string, unknown>

    const zoneOverrides = extractZones(stackVsysEntry["zone"], tagColorMap)

    return {
      name: entryName(stackEntry),
      templates: members(stackEntry["templates"]),
      deviceSerials: entries(stackEntry["devices"]).map((d) => entryName(d)),
      zoneOverrides,
    }
  })

  return {
    deviceType: "panorama",
    hostname: sys.hostname,
    panOsVersion,
    panOsDetailVersion,
    serialNumber: sys.serialNumber,
    ipAddress: sys.ipAddress,
    platformModel: sys.platformModel,
    sharedTags,
    sharedAddresses,
    sharedAddressGroups,
    sharedServices,
    sharedServiceGroups,
    sharedApplicationGroups,
    sharedApplicationFilters,
    sharedProfileGroups,
    sharedPreSecurityRules,
    sharedPostSecurityRules,
    sharedExternalDynamicLists:   sharedObjectCounts.externalDynamicLists,
    sharedSchedules:              sharedObjectCounts.schedules,
    sharedRegions:                sharedObjectCounts.regions,
    sharedSecurityProfiles:       sharedObjectCounts.securityProfiles,
    sharedLogForwardingProfiles:  sharedObjectCounts.logForwardingProfiles,
    sharedAuthenticationProfiles: sharedObjectCounts.authenticationProfiles,
    sharedDecryptionProfiles:     sharedObjectCounts.decryptionProfiles,
    deviceGroups,
    templates,
    templateStacks,
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function parseConfigFile(xmlContent: string): Promise<ParseResult> {
  try {
    const parsed = xmlParser.parse(xmlContent) as Record<string, unknown>
    const config = parsed["config"] as Record<string, unknown> | undefined

    if (!config) {
      return {
        success: false,
        error: { code: "MISSING_ROOT", message: "No <config> root element found." },
      }
    }

    const panOsVersion       = str(config["@_version"]) ?? "unknown"
    const panOsDetailVersion = str(config["@_detail-version"]) ?? panOsVersion
    const panorama           = isPanorama(config)

    const parsedConfig = panorama
      ? parsePanorama(config, panOsVersion, panOsDetailVersion)
      : parseFirewall(config, panOsVersion, panOsDetailVersion)

    return { success: true, config: parsedConfig }
  } catch (err) {
    return {
      success: false,
      error: {
        code: "PARSE_FAILED",
        message: err instanceof Error ? err.message : "Unknown parse error",
      },
    }
  }
}

export function deriveConfigName(
  config: ParsedFirewallConfig | ParsedPanoramaConfig,
  fileName: string
): string {
  if (config.hostname) return config.hostname
  return fileName.replace(/\.(xml|cfg|conf)$/i, "").replace(/^\d{2}-\d{2}-\d{4}-/, "")
}
