// @/app/(main)/_lib/resolve-config-data.ts

import type {
  ParsedConfig, ParsedPanoramaConfig,
  PanwInterface, PanwZone, PanwVirtualRouter,
  PanwAddress, PanwAddressGroup, PanwService, PanwServiceGroup,
  PanwApplicationGroup, PanwApplicationFilter, PanwProfileGroup, PanwTag,
  PanwSecurityRule, PanwNatRule,
} from "@/lib/panw-parser/types"

// ─── Template resolution (Network scope) ─────────────────────────────────────

function resolveTemplates(panorama: ParsedPanoramaConfig, scope: string | null) {
  if (!scope) return panorama.templates
  if (scope.startsWith("stack:")) {
    const stackName = scope.slice(6)
    const stack = panorama.templateStacks.find((s) => s.name === stackName)
    const names = new Set(stack?.templates ?? [])
    return panorama.templates.filter((t) => names.has(t.name))
  }
  return panorama.templates.filter((t) => t.name === scope)
}

// ─── Device group resolution (Objects / Policies scope) ──────────────────────

function resolveDeviceGroups(panorama: ParsedPanoramaConfig, scope: string | null) {
  if (!scope) return panorama.deviceGroups
  return panorama.deviceGroups.filter((dg) => dg.name === scope)
}

// ─── Network ─────────────────────────────────────────────────────────────────

export interface ResolvedNetworkData {
  interfaces: PanwInterface[]
  zones: PanwZone[]
  virtualRouters: PanwVirtualRouter[]
  logicalRouters: PanwVirtualRouter[]
}

export function resolveNetworkData(config: ParsedConfig, scope: string | null): ResolvedNetworkData {
  if (config.deviceType === "firewall") {
    return {
      interfaces: config.interfaces ?? [],
      zones: config.zones ?? [],
      virtualRouters: config.virtualRouters ?? [],
      logicalRouters: config.logicalRouters ?? [],
    }
  }
  const templates = resolveTemplates(config, scope)
  return {
    interfaces: templates.flatMap((t) => t.interfaces ?? []),
    zones: templates.flatMap((t) => t.zones ?? []),
    virtualRouters: templates.flatMap((t) => t.virtualRouters ?? []),
    logicalRouters: templates.flatMap((t) => t.logicalRouters ?? []),
  }
}

// ─── Objects ─────────────────────────────────────────────────────────────────

export interface ResolvedObjectsData {
  tags: PanwTag[]
  addresses: PanwAddress[]
  addressGroups: PanwAddressGroup[]
  services: PanwService[]
  serviceGroups: PanwServiceGroup[]
  applicationGroups: PanwApplicationGroup[]
  applicationFilters: PanwApplicationFilter[]
  profileGroups: PanwProfileGroup[]
}

export function resolveObjectsData(config: ParsedConfig, scope: string | null): ResolvedObjectsData {
  if (config.deviceType === "firewall") {
    return {
      tags: config.tags,
      addresses: config.addresses,
      addressGroups: config.addressGroups,
      services: config.services,
      serviceGroups: config.serviceGroups,
      applicationGroups: config.applicationGroups,
      applicationFilters: config.applicationFilters,
      profileGroups: config.profileGroups,
    }
  }

  const dgs = resolveDeviceGroups(config, scope)

  return {
    tags: [
      ...config.sharedTags,
      ...dgs.flatMap((dg) => dg.tags),
    ],
    addresses: [
      ...config.sharedAddresses,
      ...dgs.flatMap((dg) => dg.addresses),
    ],
    addressGroups: [
      ...config.sharedAddressGroups,
      ...dgs.flatMap((dg) => dg.addressGroups),
    ],
    services: [
      ...config.sharedServices,
      ...dgs.flatMap((dg) => dg.services),
    ],
    serviceGroups: [
      ...config.sharedServiceGroups,
      ...dgs.flatMap((dg) => dg.serviceGroups),
    ],
    applicationGroups: config.sharedApplicationGroups,
    applicationFilters: config.sharedApplicationFilters,
    profileGroups: config.sharedProfileGroups,
  }
}

// ─── Policies ────────────────────────────────────────────────────────────────

export interface ResolvedPoliciesData {
  securityRules: PanwSecurityRule[]
  natRules: PanwNatRule[]
}

export function resolvePoliciesData(config: ParsedConfig, scope: string | null): ResolvedPoliciesData {
  if (config.deviceType === "firewall") {
    return {
      securityRules: config.securityRules,
      natRules: config.natRules,
    }
  }

  const dgs = resolveDeviceGroups(config, scope)

  return {
    securityRules: [
      ...config.sharedPreSecurityRules,
      ...dgs.flatMap((dg) => [...dg.preSecurityRules, ...dg.postSecurityRules]),
      ...config.sharedPostSecurityRules,
    ],
    natRules: dgs.flatMap((dg) => [...dg.preNatRules, ...dg.postNatRules]),
  }
}
