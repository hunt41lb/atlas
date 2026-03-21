// @/lib/panw-parser/index.ts

import { XMLParser } from "fast-xml-parser"
import {
  buildTagColorMap, extractTags, extractAddresses, extractAddressGroups,
  extractServices, extractServiceGroups, extractApplicationGroups,
  extractApplicationFilters, extractProfileGroups, extractZones,
  extractInterfaces, extractVirtualRouters, extractLogicalRouters,
  extractSecurityRules, extractNatRules, extractDhcpRelayInterfaces,
  extractTemplateVariables, extractVlans, extractVirtualWires,
} from "./extractors"
import { str, entries, entryName, dig, toArray, members } from "./xml-helpers"
import type {
  ParseResult, ParsedFirewallConfig, ParsedPanoramaConfig,
  PanwDeviceGroup, PanwTemplate,
} from "./types"
import {
  extractBfdProfiles, extractBgpRoutingProfiles, extractRoutingFilters,
  extractOspfRoutingProfiles, extractOspfv3RoutingProfiles,
  extractRipRoutingProfiles, extractMulticastRoutingProfiles,
} from "./routing-profiles"

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

function countEntries(root: unknown, ...path: string[]): number {
  const el = path.reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key]
    return undefined
  }, root)
  return entries(el).length
}

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

// ─── Network counts ───────────────────────────────────────────────────────────

function extractNetworkCounts(networkEl: unknown) {
  return {
    ipsecTunnels:   countEntries(networkEl, "tunnel", "ipsec", "entry"),
    greTunnels:     countEntries(networkEl, "tunnel", "gre", "entry"),
    dhcpInterfaces: countEntries(networkEl, "dhcp", "interface", "entry"),
    dnsProxies:     countEntries(networkEl, "dns-proxy", "entry"),
  }
}

// ─── Policy counts ────────────────────────────────────────────────────────────

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

// ─── Object counts ────────────────────────────────────────────────────────────

function extractObjectCounts(scopeEl: Record<string, unknown>) {
  const profilesEl = scopeEl["profiles"] as Record<string, unknown> | undefined
  const securityProfiles = [
    "virus", "spyware", "vulnerability", "url-filtering",
    "file-blocking", "wildfire-analysis", "data-filtering",
  ].reduce((sum, key) => sum + countEntries(profilesEl, key), 0)

  return {
    externalDynamicLists:   countEntries(scopeEl, "external-list"),
    schedules:              countEntries(scopeEl, "schedule"),
    regions:                countEntries(scopeEl, "region"),
    securityProfiles,
    logForwardingProfiles:  countEntries(scopeEl, "log-settings", "profiles"),
    authenticationProfiles: countEntries(scopeEl, "authentication-profile"),
    decryptionProfiles:     countEntries(profilesEl, "decryption"),
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

  const vsysTags = extractTags(vsysEntry["tag"])
  const sharedTags = extractTags(sharedEl?.["tag"])
  const allTags = [...vsysTags, ...sharedTags]
  const tagColorMap = buildTagColorMap(allTags)

  const addresses       = extractAddresses(vsysEntry["address"], tagColorMap)
  const addressGroups   = extractAddressGroups(vsysEntry["address-group"], tagColorMap)
  const services        = extractServices(vsysEntry["service"], tagColorMap)
  const serviceGroups   = extractServiceGroups(vsysEntry["service-group"], tagColorMap)
  const applicationGroups  = extractApplicationGroups(vsysEntry["application-group"], tagColorMap)
  const applicationFilters = extractApplicationFilters(vsysEntry["application-filter"], tagColorMap)
  const profileGroups   = extractProfileGroups(vsysEntry["profile-group"])

  const interfaces      = extractInterfaces(networkEl, null)
  const virtualRouters  = extractVirtualRouters(networkEl, null)
  const logicalRouters  = extractLogicalRouters(networkEl, null)
  const vlans           = extractVlans(networkEl, null)
  const virtualWires    = extractVirtualWires(networkEl, null)
  const zones           = extractZones(vsysEntry["zone"], tagColorMap)
  const networkCounts   = extractNetworkCounts(networkEl)

  const rulebaseEl    = vsysEntry["rulebase"]
  const securityRules = extractSecurityRules(
    dig(vsysEntry, "rulebase", "security", "rules"), "vsys1", "local", tagColorMap
  )
  const natRules = extractNatRules(
    dig(vsysEntry, "rulebase", "nat", "rules"), "vsys1", "local", tagColorMap
  )
  const policyCounts = extractPolicyCounts(rulebaseEl)
  const objectCounts = extractObjectCounts(vsysEntry)

  return {
    deviceType: "firewall",
    hostname: sys.hostname,
    panOsVersion,
    panOsDetailVersion,
    serialNumber: sys.serialNumber,
    ipAddress: sys.ipAddress,
    platformModel: sys.platformModel,
    tags: allTags,
    addresses,
    addressGroups,
    services,
    serviceGroups,
    applicationGroups,
    applicationFilters,
    profileGroups,
    interfaces,
    zones,
    virtualRouters,
    logicalRouters,
    vlans,
    virtualWires,
    securityRules,
    natRules,
    ...policyCounts,
    ...objectCounts,
    ...networkCounts,
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

  const sharedTags = extractTags(sharedEl["tag"])
  const tagColorMap = buildTagColorMap(sharedTags)

  const sharedAddresses        = extractAddresses(sharedEl["address"], tagColorMap)
  const sharedAddressGroups    = extractAddressGroups(sharedEl["address-group"], tagColorMap)
  const sharedServices         = extractServices(sharedEl["service"], tagColorMap)
  const sharedServiceGroups    = extractServiceGroups(sharedEl["service-group"], tagColorMap)
  const sharedApplicationGroups  = extractApplicationGroups(sharedEl["application-group"], tagColorMap)
  const sharedApplicationFilters = extractApplicationFilters(sharedEl["application-filter"], tagColorMap)
  const sharedProfileGroups    = extractProfileGroups(sharedEl["profile-group"])
  const sharedObjectCounts     = extractObjectCounts(sharedEl)

  const sharedPreSecurityRules = extractSecurityRules(
    dig(sharedEl, "pre-rulebase", "security", "rules"), "shared", "pre", tagColorMap
  )
  const sharedPostSecurityRules = extractSecurityRules(
    dig(sharedEl, "post-rulebase", "security", "rules"), "shared", "post", tagColorMap
  )

  const panoramaDeviceEntry = (
    toArray(dig(config, "devices", "entry") as unknown)[0] ?? {}
  ) as Record<string, unknown>

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
      description: str(tmplEntry["description"]),
      variables:      extractTemplateVariables(tmplEntry["variable"]),
      interfaces:     extractInterfaces(networkEl, tmplName),
      virtualRouters: extractVirtualRouters(networkEl, tmplName),
      logicalRouters: extractLogicalRouters(networkEl, tmplName),
      zones:          extractZones(vsysEntry["zone"], tagColorMap),
      dhcpRelayInterfaces: extractDhcpRelayInterfaces(networkEl),
      vlans:          extractVlans(networkEl, tmplName),
      virtualWires:   extractVirtualWires(networkEl, tmplName),
      bfdProfiles:    extractBfdProfiles(networkEl, tmplName),
      routingFilters:       extractRoutingFilters(networkEl, tmplName),
      bgpRoutingProfiles:   extractBgpRoutingProfiles(networkEl, tmplName),
      ospfRoutingProfiles:      extractOspfRoutingProfiles(networkEl, tmplName),
      ospfv3RoutingProfiles:    extractOspfv3RoutingProfiles(networkEl, tmplName),
      ripRoutingProfiles:       extractRipRoutingProfiles(networkEl, tmplName),
      multicastRoutingProfiles: extractMulticastRoutingProfiles(networkEl, tmplName),
      ...extractNetworkCounts(networkEl),
    }
  })

  const tmplStackRootEl = panoramaDeviceEntry["template-stack"] as Record<string, unknown> | undefined
  const templateStacks = entries(tmplStackRootEl).map((stackEntry) => {
    // Template stacks can have a <config> block with zone override assignments
    const stackDeviceEntry = (
      toArray(dig(stackEntry, "config", "devices", "entry") as unknown)[0] ?? {}
    ) as Record<string, unknown>
    const stackVsysEntry = (
      toArray(dig(stackDeviceEntry, "vsys", "entry") as unknown)[0] ?? {}
    ) as Record<string, unknown>

    // Parse zone overrides — these contain the interface assignments
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

