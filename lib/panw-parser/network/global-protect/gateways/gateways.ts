// @/lib/panw-parser/network/global-protect/gateways/gateways.ts
//
// GlobalProtect Gateway types and extractor.
// Gateway data is split across two XML locations:
//   - vsys: global-protect → global-protect-gateway → entry[] (auth, roles, client configs, HIP)
//   - network: global-protect-gateway → entry[] (IPs, tunnel, max-user, ipsec, video, network services)
// Panorama appends "-N" to the network-level entry name. We strip it and merge.

import { entries, entryName, str, yesNo, dig, members } from "../../../xml-helpers"
import {
  type PanwGpClientAuth,
  type PanwGpAuthOverride,
  extractGpClientAuth,
  extractGpAuthOverride,
} from "../_shared"

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

// ─── General ──────────────────────────────────────────────────────────────────

export interface PanwGpGatewayGeneral {
  interface: string | null
  ipAddressFamily: string | null
  ipv4: string | null
  ipv6: string | null
  sslTlsServiceProfile: string | null
  certificateProfile: string | null
  logSuccess: boolean
  logSetting: string | null
  blockQuarantinedDevices: boolean
}

// ─── Tunnel Settings ──────────────────────────────────────────────────────────

export interface PanwGpGatewayTunnelSettings {
  tunnelMode: boolean
  tunnelInterface: string | null
  maxUser: number | null
  enableIpsec: boolean
  gpIpsecCrypto: string | null
  enableXAuth: boolean
  groupName: string | null
  hasGroupPassword: boolean
  skipAuthOnIkeRekey: boolean
}

// ─── Client Config Entry (remote-user-tunnel-configs) ─────────────────────────

export interface PanwGpGatewayConfigSourceAddress {
  regions: string[]
  ipAddresses: string[]
}

export interface PanwGpGatewayConfigIpPools {
  retrieveFramedIpAddress: boolean
  authServerIpPool: string[]
  ipPool: string[]
}

export interface PanwGpGatewayConfigSplitTunnel {
  noDirectAccessToLocalNetwork: boolean
  accessRoutes: string[]
  excludeAccessRoutes: string[]
  includeDomains: string[]
  excludeDomains: string[]
  includeApplications: string[]
  excludeApplications: string[]
}

export interface PanwGpGatewayConfigNetworkServices {
  dnsServers: string[]
  dnsSuffix: string[]
}

export interface PanwGpGatewayConfigEntry {
  name: string
  sourceUsers: string[]
  os: string[]
  sourceAddress: PanwGpGatewayConfigSourceAddress
  authOverride: PanwGpAuthOverride
  ipPools: PanwGpGatewayConfigIpPools
  splitTunnel: PanwGpGatewayConfigSplitTunnel
  networkServices: PanwGpGatewayConfigNetworkServices
}

// ─── Client IP Pool (DHCP + static) ──────────────────────────────────────────

export interface PanwGpGatewayDhcpServer {
  name: string
  type: string | null
}

export interface PanwGpGatewayClientIpPool {
  enableDhcp: boolean
  communicationTimeout: number | null
  retryTimes: number | null
  dhcpServerCircuitId: string | null
  dhcpServers: PanwGpGatewayDhcpServer[]
  staticIpPools: string[]
}

// ─── Network Services (gateway-level) ─────────────────────────────────────────

export interface PanwGpGatewayNetworkServices {
  inheritanceSource: string | null
  primaryDns: string | null
  secondaryDns: string | null
  primaryWins: string | null
  secondaryWins: string | null
  inheritDnsSuffixes: boolean
  dnsSuffix: string[]
}

// ─── Connection Settings (roles) ──────────────────────────────────────────────

export interface PanwGpGatewayConnectionSettings {
  loginLifetimeUnit: string | null
  loginLifetimeValue: number | null
  notifyBeforeLifetimeExpires: number | null
  lifetimeNotifyMessage: string | null
  inactivityLogout: number | null
  notifyBeforeInactivityLogout: number | null
  inactivityNotifyMessage: string | null
  adminLogoutNotify: boolean
  adminLogoutNotifyMessage: string | null
  disallowAutomaticRestoration: boolean
  sourceIpEnforcement: boolean
  sourceIpEnforcementType: string | null
}

// ─── Video Traffic ────────────────────────────────────────────────────────────

export interface PanwGpGatewayVideoTraffic {
  excludeVideoTraffic: boolean
  applications: string[]
}

// ─── HIP Notification ─────────────────────────────────────────────────────────

export interface PanwGpHipNotificationMessage {
  enabled: boolean
  message: string | null
  showNotificationAs: string | null
  includeAppList: boolean
}

export interface PanwGpHipNotification {
  name: string
  matchMessage: PanwGpHipNotificationMessage
  notMatchMessage: PanwGpHipNotificationMessage
}

// ─── Top-level Gateway ────────────────────────────────────────────────────────

export interface PanwGpGateway {
  name: string
  general: PanwGpGatewayGeneral
  clientAuth: PanwGpClientAuth[]
  tunnelSettings: PanwGpGatewayTunnelSettings
  clientConfigs: PanwGpGatewayConfigEntry[]
  clientIpPool: PanwGpGatewayClientIpPool
  networkServices: PanwGpGatewayNetworkServices
  connectionSettings: PanwGpGatewayConnectionSettings
  videoTraffic: PanwGpGatewayVideoTraffic
  hipNotifications: PanwGpHipNotification[]
  templateName: string | null
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXTRACTION HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Connection Settings (from roles > entry "default") ───────────────────────

function extractConnectionSettings(
  vsysEntry: Record<string, unknown>
): PanwGpGatewayConnectionSettings {
  const rolesEntry = entries(vsysEntry["roles"])[0] as Record<string, unknown> | undefined
  const secEl = vsysEntry["security-restrictions"] as Record<string, unknown> | undefined
  const sipEl = secEl?.["source-ip-enforcement"] as Record<string, unknown> | undefined

  if (!rolesEntry) {
    return {
      loginLifetimeUnit: null, loginLifetimeValue: null,
      notifyBeforeLifetimeExpires: null, lifetimeNotifyMessage: null,
      inactivityLogout: null, notifyBeforeInactivityLogout: null,
      inactivityNotifyMessage: null,
      adminLogoutNotify: false, adminLogoutNotifyMessage: null,
      disallowAutomaticRestoration: false,
      sourceIpEnforcement: false, sourceIpEnforcementType: null,
    }
  }

  const llEl = rolesEntry["login-lifetime"] as Record<string, unknown> | undefined
  let loginLifetimeUnit: string | null = null
  let loginLifetimeValue: number | null = null
  if (llEl) {
    if (llEl["hours"] !== undefined) {
      loginLifetimeUnit = "hours"
      loginLifetimeValue = Number(llEl["hours"])
    } else if (llEl["days"] !== undefined) {
      loginLifetimeUnit = "days"
      loginLifetimeValue = Number(llEl["days"])
    } else if (llEl["minutes"] !== undefined) {
      loginLifetimeUnit = "minutes"
      loginLifetimeValue = Number(llEl["minutes"])
    }
  }

  // Determine source IP enforcement type
  let sourceIpEnforcementType: string | null = null
  if (sipEl) {
    if (sipEl["default"] !== undefined) sourceIpEnforcementType = "default"
    else if (sipEl["network-range"] !== undefined) sourceIpEnforcementType = "network-range"
  }

  return {
    loginLifetimeUnit,
    loginLifetimeValue,
    notifyBeforeLifetimeExpires: rolesEntry["lifetime-notify-prior"] !== undefined
      ? Number(rolesEntry["lifetime-notify-prior"]) : null,
    lifetimeNotifyMessage: str(rolesEntry["lifetime-notify-message"]) ?? null,
    inactivityLogout: rolesEntry["inactivity-logout"] !== undefined
      ? Number(rolesEntry["inactivity-logout"]) : null,
    notifyBeforeInactivityLogout: rolesEntry["inactivity-notify-prior"] !== undefined
      ? Number(rolesEntry["inactivity-notify-prior"]) : null,
    inactivityNotifyMessage: str(rolesEntry["inactivity-notify-message"]) ?? null,
    adminLogoutNotify: yesNo(rolesEntry["admin-logout-notify"]),
    adminLogoutNotifyMessage: str(rolesEntry["admin-logout-notify-message"]) ?? null,
    disallowAutomaticRestoration: yesNo(secEl?.["disallow-automatic-restoration"]),
    sourceIpEnforcement: yesNo(sipEl?.["enable"]),
    sourceIpEnforcementType,
  }
}

// ─── Client Config Entry ─────────────────────────────────────────────────────

function extractGatewayConfigEntry(entry: Record<string, unknown>): PanwGpGatewayConfigEntry {
  const srcAddrEl = entry["source-address"] as Record<string, unknown> | undefined
  const splitEl = entry["split-tunneling"] as Record<string, unknown> | undefined

  return {
    name: entryName(entry),
    sourceUsers: members(entry["source-user"]),
    os: members(entry["os"]),
    sourceAddress: {
      regions: members(srcAddrEl?.["region"]),
      ipAddresses: members(srcAddrEl?.["ip-address"]),
    },
    authOverride: extractGpAuthOverride(entry["authentication-override"]),
    ipPools: {
      retrieveFramedIpAddress: yesNo(entry["retrieve-framed-ip-address"]),
      authServerIpPool: members(entry["authentication-server-ip-pool"]),
      ipPool: members(entry["ip-pool"]),
    },
    splitTunnel: {
      noDirectAccessToLocalNetwork: yesNo(entry["no-direct-access-to-local-network"]),
      accessRoutes: members(splitEl?.["access-route"]),
      excludeAccessRoutes: members(splitEl?.["exclude-access-route"]),
      includeDomains: members(dig(splitEl, "include-domains", "list")),
      excludeDomains: members(dig(splitEl, "exclude-domains", "list")),
      includeApplications: members(splitEl?.["include-applications"]),
      excludeApplications: members(splitEl?.["exclude-applications"]),
    },
    networkServices: {
      dnsServers: members(entry["dns-server"]),
      dnsSuffix: members(entry["dns-suffix"]),
    },
  }
}

// ─── HIP Notifications ───────────────────────────────────────────────────────

function extractHipNotifications(hipEl: unknown): PanwGpHipNotification[] {
  return entries(hipEl).map((entry) => {
    const matchEl = entry["match-message"] as Record<string, unknown> | undefined
    const notMatchEl = entry["not-match-message"] as Record<string, unknown> | undefined

    return {
      name: entryName(entry),
      matchMessage: {
        enabled: matchEl !== undefined,
        message: str(matchEl?.["message"]) ?? null,
        showNotificationAs: str(matchEl?.["show-notification-as"]) ?? null,
        includeAppList: yesNo(matchEl?.["include-app-list"]),
      },
      notMatchMessage: {
        enabled: notMatchEl !== undefined,
        message: str(notMatchEl?.["message"]) ?? null,
        showNotificationAs: str(notMatchEl?.["show-notification-as"]) ?? null,
        includeAppList: false,
      },
    }
  })
}

// ─── Client IP Pool (from vsys gp-gw-dhcp) ──────────────────────────────────

function extractClientIpPool(
  vsysEntry: Record<string, unknown>,
  networkIpPool: string[]
): PanwGpGatewayClientIpPool {
  const dhcpEl = vsysEntry["gp-gw-dhcp"] as Record<string, unknown> | undefined

  return {
    enableDhcp: yesNo(dhcpEl?.["enable-dhcp"]),
    communicationTimeout: dhcpEl?.["communication-timeout"] !== undefined
      ? Number(dhcpEl["communication-timeout"]) : null,
    retryTimes: dhcpEl?.["retry-times"] !== undefined
      ? Number(dhcpEl["retry-times"]) : null,
    dhcpServerCircuitId: str(dhcpEl?.["circuit-id"]) ?? null,
    dhcpServers: entries(dhcpEl?.["gp-dhcp-server"]).map((e) => ({
      name: entryName(e),
      type: str(e["type"]) ?? null,
    })),
    staticIpPools: networkIpPool,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// NETWORK-LEVEL PARSING
// ═══════════════════════════════════════════════════════════════════════════════

interface NetworkGatewayData {
  interface: string | null
  ipAddressFamily: string | null
  ipv4: string | null
  ipv6: string | null
  tunnelInterface: string | null
  maxUser: number | null
  enableXAuth: boolean
  groupName: string | null
  hasGroupPassword: boolean
  videoTraffic: PanwGpGatewayVideoTraffic
  networkServices: PanwGpGatewayNetworkServices
  ipPool: string[]
}

function parseNetworkEntry(entry: Record<string, unknown>): NetworkGatewayData {
  const localAddr = entry["local-address"] as Record<string, unknown> | undefined
  const ipEl = localAddr?.["ip"] as Record<string, unknown> | undefined
  const clientEl = entry["client"] as Record<string, unknown> | undefined
  const videoEl = clientEl?.["exclude-video-traffic"] as Record<string, unknown> | undefined
  const ipsecEl = dig(entry, "ipsec", "third-party-client") as Record<string, unknown> | undefined
  const dnsEl = clientEl?.["dns-server"] as Record<string, unknown> | undefined
  const winsEl = clientEl?.["wins-server"] as Record<string, unknown> | undefined
  const inheritEl = clientEl?.["inheritance"] as Record<string, unknown> | undefined

  return {
    interface: str(localAddr?.["interface"]) ?? null,
    ipAddressFamily: str(localAddr?.["ip-address-family"]) ?? null,
    ipv4: str(ipEl?.["ipv4"]) ?? null,
    ipv6: str(ipEl?.["ipv6"]) ?? null,
    tunnelInterface: str(entry["tunnel-interface"]) ?? null,
    maxUser: entry["max-user"] !== undefined ? Number(entry["max-user"]) : null,
    enableXAuth: yesNo(ipsecEl?.["enable"]),
    groupName: str(ipsecEl?.["group-name"]) ?? null,
    hasGroupPassword: ipsecEl?.["group-password"] !== undefined,
    videoTraffic: {
      excludeVideoTraffic: yesNo(videoEl?.["enabled"]),
      applications: members(videoEl?.["applications"]),
    },
    networkServices: {
      inheritanceSource: str(inheritEl?.["source"]) ?? null,
      primaryDns: str(dnsEl?.["primary"]) ?? null,
      secondaryDns: str(dnsEl?.["secondary"]) ?? null,
      primaryWins: str(winsEl?.["primary"]) ?? null,
      secondaryWins: str(winsEl?.["secondary"]) ?? null,
      inheritDnsSuffixes: yesNo(clientEl?.["dns-suffix-inherited"]),
      dnsSuffix: members(clientEl?.["dns-suffix"]),
    },
    ipPool: members(entry["ip-pool"]),
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// VSYS-LEVEL PARSING + MERGE
// ═══════════════════════════════════════════════════════════════════════════════

const EMPTY_NETWORK_DATA: NetworkGatewayData = {
  interface: null, ipAddressFamily: null, ipv4: null, ipv6: null,
  tunnelInterface: null, maxUser: null,
  enableXAuth: false, groupName: null, hasGroupPassword: false,
  videoTraffic: { excludeVideoTraffic: false, applications: [] },
  networkServices: {
    inheritanceSource: null, primaryDns: null, secondaryDns: null,
    primaryWins: null, secondaryWins: null, inheritDnsSuffixes: false, dnsSuffix: [],
  },
  ipPool: [],
}

function mergeGateway(
  vsysEntry: Record<string, unknown>,
  networkData: NetworkGatewayData,
  templateName: string | null
): PanwGpGateway {
  const vsysLocalAddr = vsysEntry["local-address"] as Record<string, unknown> | undefined

  return {
    name: entryName(vsysEntry),
    general: {
      // Network is authoritative for interface/IPs; fall back to vsys
      interface: networkData.interface ?? str(vsysLocalAddr?.["interface"]) ?? null,
      ipAddressFamily: networkData.ipAddressFamily ?? str(vsysLocalAddr?.["ip-address-family"]) ?? null,
      ipv4: networkData.ipv4,
      ipv6: networkData.ipv6,
      sslTlsServiceProfile: str(vsysEntry["ssl-tls-service-profile"]) ?? null,
      certificateProfile: str(vsysEntry["certificate-profile"]) ?? null,
      logSuccess: yesNo(vsysEntry["log-success"]),
      logSetting: str(vsysEntry["log-setting"]) ?? null,
      blockQuarantinedDevices: vsysEntry["block-quarantined-devices"] !== undefined
        ? yesNo(vsysEntry["block-quarantined-devices"])
        : true,
    },
    clientAuth: extractGpClientAuth(vsysEntry["client-auth"]),
    tunnelSettings: {
      tunnelMode: yesNo(vsysEntry["tunnel-mode"]),
      tunnelInterface: networkData.tunnelInterface ?? str(vsysEntry["remote-user-tunnel"]) ?? null,
      maxUser: networkData.maxUser,
      enableIpsec: yesNo(vsysEntry["tunnel-mode"]),
      gpIpsecCrypto: str(vsysEntry["gp-ipsec-crypto"]) ?? null,
      enableXAuth: networkData.enableXAuth,
      groupName: networkData.groupName,
      hasGroupPassword: networkData.hasGroupPassword,
      skipAuthOnIkeRekey: vsysEntry["skip-auth-on-ike-rekey"] !== undefined
        ? yesNo(vsysEntry["skip-auth-on-ike-rekey"])
        : true,
    },
    clientConfigs: entries(vsysEntry["remote-user-tunnel-configs"]).map(extractGatewayConfigEntry),
    clientIpPool: extractClientIpPool(vsysEntry, networkData.ipPool),
    networkServices: networkData.networkServices,
    connectionSettings: extractConnectionSettings(vsysEntry),
    videoTraffic: networkData.videoTraffic,
    hipNotifications: extractHipNotifications(vsysEntry["hip-notification"]),
    templateName,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXTRACTOR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extract GlobalProtect Gateways.
 * Merges data from both networkEl and vsysEl.
 * Network entries use "{name}-N" suffix — we strip it and merge with vsys entries.
 * Path (vsys): global-protect → global-protect-gateway → entry[]
 * Path (network): global-protect-gateway → entry[]
 */
export function extractGpGateways(
  networkEl: unknown,
  templateName: string | null,
  vsysEl?: unknown
): PanwGpGateway[] {
  // 1. Parse network entries into a lookup map (strip "-N" suffix)
  const networkMap = new Map<string, NetworkGatewayData>()
  if (networkEl && typeof networkEl === "object") {
    const netEntries = entries(dig(networkEl, "tunnel", "global-protect-gateway"))
    for (const entry of netEntries) {
      const rawName = entryName(entry)
      const name = rawName.endsWith("-N") ? rawName.slice(0, -2) : rawName
      networkMap.set(name, parseNetworkEntry(entry))
    }
  }

  // 2. Parse vsys entries and merge with network data
  const vsysEntries = (vsysEl && typeof vsysEl === "object")
    ? entries(dig(vsysEl, "global-protect", "global-protect-gateway"))
    : []

  const gateways = vsysEntries.map((vsysEntry) => {
    const name = entryName(vsysEntry)
    const networkData = networkMap.get(name) ?? EMPTY_NETWORK_DATA
    networkMap.delete(name) // consumed
    return mergeGateway(vsysEntry, networkData, templateName)
  })

  // 3. Any remaining network-only entries (no vsys counterpart)
  for (const [name, networkData] of networkMap) {
    gateways.push({
      name,
      general: {
        interface: networkData.interface,
        ipAddressFamily: networkData.ipAddressFamily,
        ipv4: networkData.ipv4,
        ipv6: networkData.ipv6,
        sslTlsServiceProfile: null,
        certificateProfile: null,
        logSuccess: false,
        logSetting: null,
        blockQuarantinedDevices: false,
      },
      clientAuth: [],
      tunnelSettings: {
        tunnelMode: false,
        tunnelInterface: networkData.tunnelInterface,
        maxUser: networkData.maxUser,
        enableIpsec: false,
        gpIpsecCrypto: null,
        enableXAuth: networkData.enableXAuth,
        groupName: networkData.groupName,
        hasGroupPassword: networkData.hasGroupPassword,
        skipAuthOnIkeRekey: false,
      },
      clientConfigs: [],
      clientIpPool: { enableDhcp: false, communicationTimeout: null, retryTimes: null, dhcpServerCircuitId: null, dhcpServers: [], staticIpPools: networkData.ipPool },
      networkServices: networkData.networkServices,
      connectionSettings: {
        loginLifetimeUnit: null, loginLifetimeValue: null,
        notifyBeforeLifetimeExpires: null, lifetimeNotifyMessage: null,
        inactivityLogout: null, notifyBeforeInactivityLogout: null,
        inactivityNotifyMessage: null,
        adminLogoutNotify: false, adminLogoutNotifyMessage: null,
        disallowAutomaticRestoration: false,
        sourceIpEnforcement: false, sourceIpEnforcementType: null,
      },
      videoTraffic: networkData.videoTraffic,
      hipNotifications: [],
      templateName,
    })
  }

  return gateways
}
