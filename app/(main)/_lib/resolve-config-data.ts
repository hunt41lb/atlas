// @/app/(main)/_lib/resolve-config-data.ts

// General Imports
import type { ParsedConfig, ParsedPanoramaConfig, } from "@/lib/panw-parser/general/config"

// Device Imports
import type { SetupManagement } from "@/lib/panw-parser/device/setup/management"

// Network Imports
import type { PanwInterface, PanwSdwanInterface, PanwCellularInterface, PanwFailOpen } from "@/lib/panw-parser/network/interfaces"
import type { PanwZone } from "@/lib/panw-parser/network/zones"
import type { PanwVirtualRouter } from "@/lib/panw-parser/network/routers"
import type { PanwVlan } from "@/lib/panw-parser/network/vlans"
import type { PanwVirtualWire } from "@/lib/panw-parser/network/virtual-wires"
import type { PanwIpsecTunnel } from "@/lib/panw-parser/network/ipsec-tunnels"
import type {
  PanwBfdProfile, PanwBgpRoutingProfiles, PanwRoutingFilters,
  PanwOspfRoutingProfiles, PanwOspfv3RoutingProfiles,PanwRipRoutingProfiles,
  PanwMulticastRoutingProfiles,
} from "@/lib/panw-parser/network/routing-profiles"
import type { PanwQosInterface } from "@/lib/panw-parser/network/qos-interfaces"
import type {
  PanwGpPortal,
  PanwGpGateway,
  PanwGpClientlessApp,
  PanwGpMdmServer,
  PanwGpDhcpProfile,
  PanwGpClientlessAppGroup,
} from "@/lib/panw-parser/network/global-protect"
import type { PanwLldpGeneral } from "@/lib/panw-parser/network/lldp-general"
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
} from "@/lib/panw-parser/network/network-profiles"
import { PanwGreTunnel } from "@/lib/panw-parser/network/gre-tunnels"
import { PanwDhcpServer, PanwDhcpRelay } from "@/lib/panw-parser/network/dhcp"
import { PanwDnsProxy } from "@/lib/panw-parser/network/dns-proxy"
import type { PanwProxy } from "@/lib/panw-parser/network/proxy"
import type { PanwSdwanInterfaceProfile } from "@/lib/panw-parser/network/sd-wan-interface-profile"

// Objects Imports
import type { PanwAddress, PanwAddressGroup } from "@/lib/panw-parser/objects/addresses"
import type { PanwService, PanwServiceGroup } from "@/lib/panw-parser/objects/services"
import type { PanwApplicationGroup, PanwApplicationFilter } from "@/lib/panw-parser/objects/applications"
import type { PanwProfileGroup } from "@/lib/panw-parser/objects/profile-groups"
import type { PanwTag } from "@/lib/panw-parser/objects/tags"

// Policies Imports
import type { PanwSecurityRule } from "@/lib/panw-parser/policies/security-rules"
import type { PanwNatRule } from "@/lib/panw-parser/policies/nat-rules"

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
  vlans: PanwVlan[]
  virtualWires: PanwVirtualWire[]
  bfdProfiles: PanwBfdProfile[]
  bgpRoutingProfiles: PanwBgpRoutingProfiles
  routingFilters: PanwRoutingFilters
  ospfRoutingProfiles: PanwOspfRoutingProfiles
  ospfv3RoutingProfiles: PanwOspfv3RoutingProfiles
  ripRoutingProfiles: PanwRipRoutingProfiles
  multicastRoutingProfiles: PanwMulticastRoutingProfiles
  interfaceMgmtProfiles: PanwInterfaceMgmtProfile[]
  monitorProfiles: PanwMonitorProfile[]
  zoneProtectionProfiles: PanwZoneProtectionProfile[]
  ikeCryptoProfiles: PanwIkeCryptoProfile[]
  ipsecCryptoProfiles: PanwIpsecCryptoProfile[]
  ikeGateways: PanwIkeGateway[]
  ipsecTunnels: PanwIpsecTunnel[]
  greTunnels: PanwGreTunnel[]
  dhcpServers: PanwDhcpServer[]
  dhcpRelays: PanwDhcpRelay[]
  dnsProxies: PanwDnsProxy[]
  gpIpsecCryptoProfiles: PanwGpIpsecCryptoProfile[]
  networkBfdProfiles: PanwNetworkBfdProfile[]
  lldpProfiles: PanwLldpProfile[]
  macsecProfiles: PanwMacsecProfile[]
  qosProfiles: PanwQosProfile[]
  qosInterfaces: PanwQosInterface[]
  lldpGeneral: PanwLldpGeneral[]
  proxy: PanwProxy[]
  sdwanInterfaceProfiles: PanwSdwanInterfaceProfile[]
  sdwanInterfaces: PanwSdwanInterface[]
  cellularInterfaces: PanwCellularInterface[]
  failOpen: PanwFailOpen[]
  gpPortals: PanwGpPortal[]
  gpGateways: PanwGpGateway[]
  gpClientlessApps: PanwGpClientlessApp[]
  gpClientlessAppGroups: PanwGpClientlessAppGroup[]
  gpMdmServers: PanwGpMdmServer[]
  gpDhcpProfiles: PanwGpDhcpProfile[]
}

const EMPTY_OSPF: PanwOspfRoutingProfiles = { spfTimerProfiles: [], authProfiles: [], ifTimerProfiles: [], redistributionProfiles: [] }
const EMPTY_OSPFV3: PanwOspfv3RoutingProfiles = { spfTimerProfiles: [], authProfiles: [], ifTimerProfiles: [], redistributionProfiles: [] }
const EMPTY_RIP: PanwRipRoutingProfiles = { globalTimerProfiles: [], authProfiles: [], redistributionProfiles: [] }
const EMPTY_MULTICAST: PanwMulticastRoutingProfiles = { pimInterfaceTimerProfiles: [], igmpInterfaceQueryProfiles: [], msdpAuthProfiles: [], msdpTimerProfiles: [] }

const EMPTY_BGP_ROUTING_PROFILES: PanwBgpRoutingProfiles = {
  authProfiles: [],
  timerProfiles: [],
  dampeningProfiles: [],
  redistributionProfiles: [],
  addressFamilyProfiles: [],
  filteringProfiles: [],
}

const EMPTY_ROUTING_FILTERS: PanwRoutingFilters = {
  accessLists: [],
  prefixLists: [],
  communityLists: [],
  asPathAccessLists: [],
  bgpRouteMaps: [],
  redistRouteMaps: [],
}

export function resolveNetworkData(config: ParsedConfig, scope: string | null): ResolvedNetworkData {
  if (config.deviceType === "firewall") {
    return {
      interfaces: config.interfaces ?? [],
      zones: config.zones ?? [],
      virtualRouters: config.virtualRouters ?? [],
      logicalRouters: config.logicalRouters ?? [],
      vlans: config.vlans ?? [],
      virtualWires: config.virtualWires ?? [],
      bfdProfiles: [],
      bgpRoutingProfiles: EMPTY_BGP_ROUTING_PROFILES,
      routingFilters: EMPTY_ROUTING_FILTERS,
      ospfRoutingProfiles: EMPTY_OSPF,
      ospfv3RoutingProfiles: EMPTY_OSPFV3,
      ripRoutingProfiles: EMPTY_RIP,
      multicastRoutingProfiles: EMPTY_MULTICAST,
      interfaceMgmtProfiles: [],
      monitorProfiles: [],
      zoneProtectionProfiles: [],
      ikeCryptoProfiles: [],
      ipsecCryptoProfiles: [],
      ikeGateways: [],
      gpIpsecCryptoProfiles: [],
      networkBfdProfiles: [],
      lldpProfiles: [],
      macsecProfiles: [],
      qosProfiles: [],
      ipsecTunnels: config.ipsecTunnels ?? [],
      greTunnels: config.greTunnels ?? [],
      dhcpServers: config.dhcpServers ?? [],
      dhcpRelays: config.dhcpRelays ?? [],
      dnsProxies: config.dnsProxies ?? [],
      qosInterfaces: config.qosInterfaces ?? [],
      lldpGeneral: config.lldpGeneral ? [config.lldpGeneral] : [],
      proxy: config.proxy != null ? [config.proxy] : [],
      sdwanInterfaceProfiles: [],
      sdwanInterfaces: [],
      cellularInterfaces: [],
      failOpen: [],
      gpPortals: [],
      gpGateways: [],
      gpClientlessApps: [],
      gpClientlessAppGroups: [],
      gpMdmServers: [],
      gpDhcpProfiles: [],
    }
  }
  const templates = resolveTemplates(config, scope)

  let zones = templates.flatMap((t) => t.zones ?? [])

  // When viewing a template stack, merge zone overrides (interface assignments)
  // from the stack's <config> block into the template-defined zones
  if (scope?.startsWith("stack:")) {
    const stackName = scope.slice(6)
    const stack = config.templateStacks.find((s) => s.name === stackName)
    if (stack?.zoneOverrides?.length) {
      zones = mergeZoneOverrides(zones, stack.zoneOverrides)
    }
  }

  return {
    interfaces: templates.flatMap((t) => t.interfaces ?? []),
    zones,
    virtualRouters: templates.flatMap((t) => t.virtualRouters ?? []),
    logicalRouters: templates.flatMap((t) => t.logicalRouters ?? []),
    vlans: templates.flatMap((t) => t.vlans ?? []),
    virtualWires: templates.flatMap((t) => t.virtualWires ?? []),
    bfdProfiles: templates.flatMap((t) => t.bfdProfiles ?? []),
    bgpRoutingProfiles: {                              // ← ADD
      authProfiles: templates.flatMap((t) => t.bgpRoutingProfiles?.authProfiles ?? []),
      timerProfiles: templates.flatMap((t) => t.bgpRoutingProfiles?.timerProfiles ?? []),
      dampeningProfiles: templates.flatMap((t) => t.bgpRoutingProfiles?.dampeningProfiles ?? []),
      redistributionProfiles: templates.flatMap((t) => t.bgpRoutingProfiles?.redistributionProfiles ?? []),
      addressFamilyProfiles: templates.flatMap((t) => t.bgpRoutingProfiles?.addressFamilyProfiles ?? []),
      filteringProfiles: templates.flatMap((t) => t.bgpRoutingProfiles?.filteringProfiles ?? []),
    },
    routingFilters: {
      accessLists: templates.flatMap((t) => t.routingFilters?.accessLists ?? []),
      prefixLists: templates.flatMap((t) => t.routingFilters?.prefixLists ?? []),
      communityLists: templates.flatMap((t) => t.routingFilters?.communityLists ?? []),
      asPathAccessLists: templates.flatMap((t) => t.routingFilters?.asPathAccessLists ?? []),
      bgpRouteMaps: templates.flatMap((t) => t.routingFilters?.bgpRouteMaps ?? []),
      redistRouteMaps: templates.flatMap((t) => t.routingFilters?.redistRouteMaps ?? []),
    },
    ospfRoutingProfiles: {
      spfTimerProfiles: templates.flatMap(t => t.ospfRoutingProfiles?.spfTimerProfiles ?? []),
      authProfiles: templates.flatMap(t => t.ospfRoutingProfiles?.authProfiles ?? []),
      ifTimerProfiles: templates.flatMap(t => t.ospfRoutingProfiles?.ifTimerProfiles ?? []),
      redistributionProfiles: templates.flatMap(t => t.ospfRoutingProfiles?.redistributionProfiles ?? []),
    },
    ospfv3RoutingProfiles: {
      spfTimerProfiles: templates.flatMap(t => t.ospfv3RoutingProfiles?.spfTimerProfiles ?? []),
      authProfiles: templates.flatMap(t => t.ospfv3RoutingProfiles?.authProfiles ?? []),
      ifTimerProfiles: templates.flatMap(t => t.ospfv3RoutingProfiles?.ifTimerProfiles ?? []),
      redistributionProfiles: templates.flatMap(t => t.ospfv3RoutingProfiles?.redistributionProfiles ?? []),
    },
    ripRoutingProfiles: {
      globalTimerProfiles: templates.flatMap(t => t.ripRoutingProfiles?.globalTimerProfiles ?? []),
      authProfiles: templates.flatMap(t => t.ripRoutingProfiles?.authProfiles ?? []),
      redistributionProfiles: templates.flatMap(t => t.ripRoutingProfiles?.redistributionProfiles ?? []),
    },
    multicastRoutingProfiles: {
      pimInterfaceTimerProfiles: templates.flatMap(t => t.multicastRoutingProfiles?.pimInterfaceTimerProfiles ?? []),
      igmpInterfaceQueryProfiles: templates.flatMap(t => t.multicastRoutingProfiles?.igmpInterfaceQueryProfiles ?? []),
      msdpAuthProfiles: templates.flatMap(t => t.multicastRoutingProfiles?.msdpAuthProfiles ?? []),
      msdpTimerProfiles: templates.flatMap(t => t.multicastRoutingProfiles?.msdpTimerProfiles ?? []),
    },
    interfaceMgmtProfiles: templates.flatMap(t => t.interfaceMgmtProfiles ?? []),
    monitorProfiles: templates.flatMap(t => t.monitorProfiles ?? []),
    zoneProtectionProfiles: templates.flatMap(t => t.zoneProtectionProfiles ?? []),
    ikeCryptoProfiles: templates.flatMap(t => t.ikeCryptoProfiles ?? []),
    ipsecCryptoProfiles: templates.flatMap(t => t.ipsecCryptoProfiles ?? []),
    ikeGateways: templates.flatMap(t => t.ikeGateways ?? []),
    gpIpsecCryptoProfiles: templates.flatMap(t => t.gpIpsecCryptoProfiles ?? []),
    networkBfdProfiles: templates.flatMap(t => t.networkBfdProfiles ?? []),
    lldpProfiles: templates.flatMap(t => t.lldpProfiles ?? []),
    macsecProfiles: templates.flatMap(t => t.macsecProfiles ?? []),
    qosProfiles: templates.flatMap(t => t.qosProfiles ?? []),
    ipsecTunnels: templates.flatMap(t => t.ipsecTunnels ?? []),
    greTunnels: templates.flatMap(t => t.greTunnels ?? []),
    dhcpServers: templates.flatMap(t => t.dhcpServers ?? []),
    dhcpRelays: templates.flatMap(t => t.dhcpRelays ?? []),
    dnsProxies: templates.flatMap(t => t.dnsProxies ?? []),
    qosInterfaces: templates.flatMap(t => t.qosInterfaces ?? []),
    lldpGeneral: templates.map(t => t.lldpGeneral).filter((g): g is PanwLldpGeneral => g != null),
    proxy: templates.map(t => t.proxy).filter((p): p is PanwProxy => p != null),
    sdwanInterfaceProfiles: templates.flatMap((t) => t.sdwanInterfaceProfiles ?? []),
    sdwanInterfaces: templates.flatMap((t) => t.sdwanInterfaces ?? []),
    cellularInterfaces: templates.flatMap((t) => t.cellularInterfaces ?? []),
    failOpen: templates.map((t) => t.failOpen).filter((f): f is PanwFailOpen => f != null),
    gpPortals: templates.flatMap((t) => t.gpPortals ?? []),
    gpGateways: templates.flatMap((t) => t.gpGateways ?? []),
    gpClientlessApps: templates.flatMap((t) => t.gpClientlessApps ?? []),
    gpClientlessAppGroups: templates.flatMap((t) => t.gpClientlessAppGroups ?? []),
    gpMdmServers: templates.flatMap((t) => t.gpMdmServers ?? []),
    gpDhcpProfiles: templates.flatMap((t) => t.gpDhcpProfiles ?? []),
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

// ─── Merge Templates & Template Stacks ─────────────────────────────────────

function mergeZoneOverrides(templateZones: PanwZone[], overrides: PanwZone[]): PanwZone[] {
  const overrideMap = new Map(overrides.map((z) => [z.name, z]))
  const merged: PanwZone[] = []
  const seen = new Set<string>()

  for (const zone of templateZones) {
    seen.add(zone.name)
    const override = overrideMap.get(zone.name)
    if (override) {
      // Keep template metadata (tags, color), take override interfaces and type
      merged.push({
        ...zone,
        interfaces: override.interfaces,
        type: override.type !== "unknown" ? override.type : zone.type,
      })
    } else {
      merged.push(zone)
    }
  }

  // Add any override zones not present in templates
  for (const override of overrides) {
    if (!seen.has(override.name)) {
      merged.push(override)
    }
  }

  return merged
}

// ─── Device ──────────────────────────────────────────────────────────────────

export interface ResolvedDeviceData {
  setupManagement: SetupManagement
}

const EMPTY_SETUP_MANAGEMENT: SetupManagement = {
  generalSettings: {
    hostname: null, domain: null, acceptDhcpHostname: false, acceptDhcpDomain: false,
    loginBanner: null, forceAckLoginBanner: false, sslTlsServiceProfile: null,
    timezone: null, locale: null, latitude: null, longitude: null,
    automaticallyAcquireCommitLock: false, certificateExpirationCheck: false,
    useHypervisorAssignedMacAddresses: true, duplicateIpAddressSupport: false,
    tunnelAcceleration: true,
  },
  authenticationSettings: {
    authenticationProfile: null, nonUiAuthenticationProfile: null, certificateProfile: null,
    idleTimeoutMin: null, apiKeyLifetimeMin: null, apiKeyCertificate: null,
    failedAttempts: null, lockoutTimeMin: null, maxSessionCount: null, maxSessionTimeMin: null,
  },
  logInterface: {
    ipAddress: null, netmask: null, defaultGateway: null,
    ipv6Address: null, ipv6DefaultGateway: null,
    linkSpeed: null, linkDuplex: null, linkState: null,
  },
  panoramaSettings: {
    managedBy: null, panoramaServer: null, panoramaServer2: null,
    enablePushingDeviceMonitoringData: true, receiveTimeoutSec: null,
    sendTimeoutSec: null, retryCountSslSend: null,
    enableAutomatedCommitRecovery: true, commitRecoveryRetry: null,
    commitRecoveryTimeoutSec: null,
  },
  secureCommunicationSettings: {
    client: {
      certificateType: null, certificate: null, certificateProfile: null,
      panDbCommunication: false, wildFireCommunication: false,
      logCollectorCommunication: false, userIdCommunication: false,
      dataRedistribution: false, checkServerIdentity: false,
    },
    server: {
      enabled: false, sslTlsServiceProfile: null, certificateProfile: null,
      userIdCommunication: false, dataRedistribution: false,
    },
  },
  loggingAndReportingSettings: {
    singleDiskStorage: { enabled: false, entries: {} },
    multiDiskStorage: {
      sessionLogStorage: { enabled: false, entries: {} },
      managementLogStorage: { enabled: false, entries: {} },
    },
    logExportAndReporting: {
      numberOfVersionsForConfigAudit: null, maxRowsInCsvExport: null,
      maxRowsInUserActivityReport: null, averageBrowseTimeSec: null,
      pageLoadThresholdSec: null, syslogHostnameFormat: null,
      reportRuntime: null, reportExpirationPeriodDays: null,
      stopTrafficWhenLogDbFull: false, enableConfigurationLogsForRevertOperations: false,
      enableThreatVaultAccess: false, enableLogOnHighDpLoad: false,
      enableHighSpeedLogForwarding: false, supportUtf8ForLogOutput: false,
      improvedDnsSecurityLogging: false,
      logAdminActivity: { debugAndOperationalCommands: false, uiActions: false, syslogServer: null },
    },
    preDefinedReports: { configured: false, disabledMembers: [] },
  },
  autoFocus: { enabled: false, autoFocusUrl: null, queryTimeoutSec: null },
  cloudLogging: {
    enableCloudLogging: false, enableDuplicateLogging: false,
    enableEnhancedApplicationLogging: false, region: null,
    connectionCountStrataLoggingService: null,
  },
  accountingServerSettings: { accountingServerProfile: null },
  sshManagementProfileSetting: { serverProfile: null },
  advancedDnsSecurity: { dnsSecurityServer: null },
  panOsEdgeServiceSettings: {
    enableThirdPartyDeviceVerdicts: false, enableUserContextCloudService: false,
    deviceIdOperationMode: null, enableCloudHostComplianceService: false,
  },
  bannersAndMessages: {
    messageOfTheDay: {
      enabled: false, message: null, allowDoNotDisplayAgain: false,
      title: null, backgroundColor: null, icon: null,
    },
    banners: {
      headerBanner: null, headerColor: null, headerTextColor: null,
      sameBannerForHeaderAndFooter: false,
      footerBanner: null, footerColor: null, footerTextColor: null,
    },
  },
  minimumPasswordComplexity: {
    enabled: false,
    format: {
      minimumLength: null, minimumUppercaseLetters: null, minimumLowercaseLetters: null,
      minimumNumericLetters: null, minimumSpecialCharacters: null,
      blockRepeatedCharacters: null, blockUsernameInclusion: false,
    },
    functionality: {
      newPasswordDiffersByCharacters: null, requirePasswordChangeOnFirstLogin: false,
      preventPasswordReuseLimit: null, blockPasswordChangePeriodDays: null,
      requiredPasswordChangePeriodDays: null, expirationWarningPeriodDays: null,
      postExpirationAdminLoginCount: null, postExpirationGracePeriodDays: null,
    },
  },
}

export function resolveDeviceData(config: ParsedConfig, scope: string | null): ResolvedDeviceData {
  if (config.deviceType === "firewall") {
    return { setupManagement: config.setupManagement }
  }

  const templates = resolveTemplates(config, scope)
  return {
    setupManagement: templates[0]?.setupManagement ?? EMPTY_SETUP_MANAGEMENT,
  }
}
