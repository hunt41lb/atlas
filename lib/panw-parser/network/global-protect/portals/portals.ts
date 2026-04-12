// @/lib/panw-parser/network/global-protect/portals/portals.ts
//
// GlobalProtect Portal types, defaults, and extractor.
// Path (vsys): vsysEntry → global-protect → global-protect-portal → entry[]
// Path (network): networkEl → global-protect-gateway (for future gateway support)

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

// ─── General (portal-config) ──────────────────────────────────────────────────

export interface PanwGpPortalGeneral {
  // Network Settings
  interface: string | null
  ipAddressFamily: string | null            // "ipv4", "ipv6", "ipv4_ipv6"
  ipv4: string | null
  ipv6: string | null
  // Appearance
  customLoginPage: string | null
  customHomePage: string | null
  customHelpPage: string | null
  // Log Settings
  logSuccess: boolean
  logSetting: string | null
  // Profiles
  sslTlsServiceProfile: string | null
  certificateProfile: string | null
}

// ─── Portal Data Collection (portal-config → config-selection) ────────────────

export interface PanwGpPortalConfigSelection {
  certificateProfile: string | null
}

// ─── Agent Config — root CAs + configs wrapper (client-config) ────────────────

export interface PanwGpRootCa {
  name: string
  installInCertStore: boolean
}

export interface PanwGpPortalAgentConfig {
  rootCas: PanwGpRootCa[]
  hasAgentUserOverrideKey: boolean
  configs: PanwGpPortalConfigEntry[]
}

// ─── Config Entry (client-config → configs → entry) ──────────────────────────

export interface PanwGpPortalConfigEntry {
  name: string
  sourceUsers: string[]
  os: string[]
  authentication: PanwGpConfigAuthentication
  configSelection: PanwGpConfigSelection
  internal: PanwGpConfigInternal
  external: PanwGpConfigExternal
  appConfig: PanwGpAppConfig
  agentUi: PanwGpAgentUi
  hipCollection: PanwGpHipCollection
  mdm: PanwGpMdm
}

// ── Config Entry > Authentication ─────────────────────────────────────────────

export interface PanwGpConfigAuthentication {
  clientCertificateType: string | null      // "local", "SCEP", etc.
  clientCertificateName: string | null
  saveUserCredentials: number | null        // 0=No, 1=Save, 2=Prompt, 3=Fingerprint
  authOverride: PanwGpAuthOverride
  twoFactor: PanwGpTwoFactor
}

export interface PanwGpTwoFactor {
  portal: boolean
  manualOnlyGateway: boolean
  internalGateway: boolean
  autoDiscoveryExternalGateway: boolean
}

// ── Config Entry > Config Selection Criteria ──────────────────────────────────

export interface PanwGpConfigSelection {
  certificateProfile: string | null
  machineAccountSerialNo: boolean
}

// ── Config Entry > Internal ───────────────────────────────────────────────────

export interface PanwGpHostDetection {
  ipAddress: string | null
  hostname: string | null
}

export interface PanwGpInternalGateway {
  name: string
  fqdn: string | null
  sourceIps: string[]
}

export interface PanwGpConfigInternal {
  hostDetectionIpv4: PanwGpHostDetection
  hostDetectionIpv6: PanwGpHostDetection
  gateways: PanwGpInternalGateway[]
}

// ── Config Entry > External ───────────────────────────────────────────────────

export interface PanwGpExternalGatewayPriorityRule {
  name: string
  priority: number
}

export interface PanwGpExternalGateway {
  name: string
  fqdn: string | null
  ipv4: string | null
  priorityRules: PanwGpExternalGatewayPriorityRule[]
  manual: boolean
}

export interface PanwGpConfigExternal {
  cutoffTime: number | null
  gateways: PanwGpExternalGateway[]
  thirdPartyVpnClients: string[]
}

// ── Config Entry > App Config (gp-app-config key/values) ──────────────────────

export interface PanwGpAppConfig {
  // Connection
  connectMethod: string
  refreshConfigInterval: number
  // Disconnect
  agentUserOverride: string
  disconnectReasons: string
  // Agent management
  uninstall: string
  clientUpgrade: string
  enableSignout: boolean
  allowExtendSession: boolean
  // SSO
  useSso: boolean
  useSsoPin: boolean
  useSsoMacos: boolean
  logoutRemoveSso: boolean
  krbAuthFailFallback: boolean
  defaultBrowser: boolean
  // Tunnel
  retryTunnel: number
  retryTimeout: number
  // Traffic enforcement
  trafficEnforcement: string
  enforceGlobalprotect: boolean
  captivePortalExceptionTimeout: number
  captivePortalUsingDefaultBrowser: boolean
  trafficBlockingNotificationDelay: number
  displayTrafficBlockingNotificationMsg: boolean
  trafficBlockingNotificationMsg: string | null
  allowTrafficBlockingNotificationDismissal: boolean
  displayCaptivePortalDetectionMsg: boolean
  captivePortalDetectionMsg: string | null
  captivePortalNotificationDelay: number
  // Certificate
  certificateStoreLookup: string
  scepCertificateRenewalPeriod: number
  fullChainCertVerify: boolean
  retainConnectionSmartcardRemoval: boolean
  // UI
  enableAdvancedView: boolean
  enableDoNotDisplayWelcomePageAgain: boolean
  userAcceptTermsBeforeCreatingTunnel: boolean
  // Network
  rediscoverNetwork: boolean
  wifiToWiredTransition: boolean
  resubmitHostInfo: boolean
  intelligentPortal: boolean
  // Portal
  canChangePortal: boolean
  canContinueIfPortalCertInvalid: boolean
  accessGatewayFromAgentOnly: boolean
  showAgentIcon: boolean
  // Timeouts
  userSwitchTunnelRenameTimeout: number
  preLogonTunnelRenameTimeout: number
  enableCachePortalConfigAbsencePrelogonTunnel: boolean
  preserveTunnelUponUserLogoffTimeout: number
  // IPSec / Tunnel
  passwordExpiryMessage: string | null
  ipsecFailoverSsl: number
  displayTunnelFallbackNotification: boolean
  sslOnlySelection: number
  tunnelMtu: number
  maxInternalGatewayConnectionAttempts: number
  advInternalHostDetection: boolean
  delaysInternalHostDetection: boolean
  unifiedUserIdHybridDeployment: boolean
  portalTimeout: number
  connectTimeout: number
  receiveTimeout: number
  // Split tunnel
  splitTunnelOption: string
  splitTunnelOptionMobile: string
  advancedStPublicKey: string | null
  enforceDns: boolean
  appendLocalSearchDomain: boolean
  flushDns: boolean
  // Proxy
  agentProxyPort: number
  agentProxyMode: number
  proxyMultipleAutodetect: boolean
  useProxy: boolean
  // HIP remediation
  enableHipRemediation: number
  hipRemediationRetry: number
  wscAutodetect: boolean
  // MFA
  mfaEnabled: boolean
  mfaListeningPort: number
  mfaNotificationMsg: string | null
  mfaPromptSuppressTime: number
  // Misc
  ipv6Preferred: boolean
  changePasswordMessage: string | null
  measuringEgwTcpConnection: boolean
  logGateway: boolean
  cdlLog: boolean
  demNotification: boolean
  demAgent: string
  demAgentAction: string
  quarantineAddMessage: string | null
  quarantineRemoveMessage: string | null
  initPanel: boolean
  userInputOnTop: boolean
  allowDisableCbl: boolean
}

// ── Config Entry > Agent UI (agent-ui element) ────────────────────────────────

export interface PanwGpAgentUi {
  welcomePage: string | null
  maxAgentUserOverrides: number | null
  agentUserOverrideTimeout: number | null
  hasPasscode: boolean
  hasUninstallPassword: boolean
}

// ── Config Entry > HIP Data Collection ────────────────────────────────────────

export interface PanwGpHipExclusionVendor {
  name: string
  products: string[]
}

export interface PanwGpHipExclusionCategory {
  name: string
  vendors: PanwGpHipExclusionVendor[]
}

export interface PanwGpHipCollection {
  collectHipData: boolean
  maxWaitTime: number | null
  certificateProfile: string | null
  exclusionCategories: PanwGpHipExclusionCategory[]
}

// ── Config Entry > MDM ────────────────────────────────────────────────────────

export interface PanwGpMdm {
  address: string | null
  enrollmentPort: number | null
}

// ─── Top-level Portal ─────────────────────────────────────────────────────────

export interface PanwGpPortal {
  name: string
  general: PanwGpPortalGeneral
  clientAuth: PanwGpClientAuth[]
  configSelection: PanwGpPortalConfigSelection
  agentConfig: PanwGpPortalAgentConfig
  templateName: string | null
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULTS
// ═══════════════════════════════════════════════════════════════════════════════

export const GP_APP_CONFIG_DEFAULTS: PanwGpAppConfig = {
  // Connection
  connectMethod: "pre-logon",
  refreshConfigInterval: 24,
  // Disconnect
  agentUserOverride: "deny",
  disconnectReasons: "Any",
  // Agent management
  uninstall: "deny",
  clientUpgrade: "prompt",
  enableSignout: true,
  allowExtendSession: false,
  // SSO
  useSso: false,
  useSsoPin: false,
  useSsoMacos: false,
  logoutRemoveSso: false,
  krbAuthFailFallback: false,
  defaultBrowser: false,
  // Tunnel
  retryTunnel: 30,
  retryTimeout: 5,
  // Traffic enforcement
  trafficEnforcement: "none",
  enforceGlobalprotect: false,
  captivePortalExceptionTimeout: 0,
  captivePortalUsingDefaultBrowser: false,
  trafficBlockingNotificationDelay: 15,
  displayTrafficBlockingNotificationMsg: true,
  trafficBlockingNotificationMsg: null,
  allowTrafficBlockingNotificationDismissal: true,
  displayCaptivePortalDetectionMsg: true,
  captivePortalDetectionMsg: null,
  captivePortalNotificationDelay: 5,
  // Certificate
  certificateStoreLookup: "user-and-machine",
  scepCertificateRenewalPeriod: 7,
  fullChainCertVerify: false,
  retainConnectionSmartcardRemoval: false,
  // UI
  enableAdvancedView: false,
  enableDoNotDisplayWelcomePageAgain: false,
  userAcceptTermsBeforeCreatingTunnel: false,
  // Network
  rediscoverNetwork: false,
  wifiToWiredTransition: false,
  resubmitHostInfo: false,
  intelligentPortal: false,
  // Portal
  canChangePortal: false,
  canContinueIfPortalCertInvalid: false,
  accessGatewayFromAgentOnly: false,
  showAgentIcon: true,
  // Timeouts
  userSwitchTunnelRenameTimeout: 5,
  preLogonTunnelRenameTimeout: 0,
  enableCachePortalConfigAbsencePrelogonTunnel: false,
  preserveTunnelUponUserLogoffTimeout: 0,
  // IPSec / Tunnel
  passwordExpiryMessage: null,
  ipsecFailoverSsl: 0,
  displayTunnelFallbackNotification: true,
  sslOnlySelection: 0,
  tunnelMtu: 0,
  maxInternalGatewayConnectionAttempts: 5,
  advInternalHostDetection: false,
  delaysInternalHostDetection: false,
  unifiedUserIdHybridDeployment: false,
  portalTimeout: 5,
  connectTimeout: 5,
  receiveTimeout: 30,
  // Split tunnel
  splitTunnelOption: "no",
  splitTunnelOptionMobile: "no",
  advancedStPublicKey: null,
  enforceDns: false,
  appendLocalSearchDomain: false,
  flushDns: false,
  // Proxy
  agentProxyPort: 0,
  agentProxyMode: 0,
  proxyMultipleAutodetect: false,
  useProxy: false,
  // HIP remediation
  enableHipRemediation: 0,
  hipRemediationRetry: 0,
  wscAutodetect: false,
  // MFA
  mfaEnabled: false,
  mfaListeningPort: 4501,
  mfaNotificationMsg: null,
  mfaPromptSuppressTime: 0,
  // Misc
  ipv6Preferred: false,
  changePasswordMessage: null,
  measuringEgwTcpConnection: false,
  logGateway: false,
  cdlLog: false,
  demNotification: true,
  demAgent: "install-with-user-control",
  demAgentAction: "install",
  quarantineAddMessage: null,
  quarantineRemoveMessage: null,
  initPanel: false,
  userInputOnTop: false,
  allowDisableCbl: false,
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXTRACTOR HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Parse gp-app-config key/value entries into a lookup map.
 * XML: <gp-app-config><config><entry name="key"><value><member>val</member></value></entry>
 */
function parseAppConfigMap(configEl: unknown): Map<string, string> {
  const map = new Map<string, string>()
  const cfgEntries = entries(dig(configEl, "gp-app-config", "config") as unknown)
  for (const entry of cfgEntries) {
    const key = entryName(entry)
    const val = members(entry["value"])[0] ?? null
    if (key && val !== null) map.set(key, val)
  }
  return map
}

/** Read a string from the app config map, falling back to the default */
function appStr(map: Map<string, string>, key: string, fallback: string): string {
  return map.get(key) ?? fallback
}

/** Read a number from the app config map, falling back to the default */
function appNum(map: Map<string, string>, key: string, fallback: number): number {
  const val = map.get(key)
  return val !== undefined ? Number(val) : fallback
}

/** Read a boolean (yes/no) from the app config map, falling back to the default */
function appBool(map: Map<string, string>, key: string, fallback: boolean): boolean {
  const val = map.get(key)
  if (val === undefined) return fallback
  return val === "yes"
}

/** Read a nullable string from the app config map */
function appStrNull(map: Map<string, string>, key: string): string | null {
  return map.get(key) ?? null
}

function extractAppConfig(configEntry: Record<string, unknown>): PanwGpAppConfig {
  const m = parseAppConfigMap(configEntry)
  const d = GP_APP_CONFIG_DEFAULTS

  return {
    // Connection
    connectMethod: appStr(m, "connect-method", d.connectMethod),
    refreshConfigInterval: appNum(m, "refresh-config-interval", d.refreshConfigInterval),
    // Disconnect
    agentUserOverride: appStr(m, "agent-user-override", d.agentUserOverride),
    disconnectReasons: appStr(m, "disconnect-reasons", d.disconnectReasons),
    // Agent management
    uninstall: appStr(m, "uninstall", d.uninstall),
    clientUpgrade: appStr(m, "client-upgrade", d.clientUpgrade),
    enableSignout: appBool(m, "enable-signout", d.enableSignout),
    allowExtendSession: appBool(m, "allow-extend-session", d.allowExtendSession),
    // SSO
    useSso: appBool(m, "use-sso", d.useSso),
    useSsoPin: appBool(m, "use-sso-pin", d.useSsoPin),
    useSsoMacos: appBool(m, "use-sso-macos", d.useSsoMacos),
    logoutRemoveSso: appBool(m, "logout-remove-sso", d.logoutRemoveSso),
    krbAuthFailFallback: appBool(m, "krb-auth-fail-fallback", d.krbAuthFailFallback),
    defaultBrowser: appBool(m, "default-browser", d.defaultBrowser),
    // Tunnel
    retryTunnel: appNum(m, "retry-tunnel", d.retryTunnel),
    retryTimeout: appNum(m, "retry-timeout", d.retryTimeout),
    // Traffic enforcement
    trafficEnforcement: appStr(m, "traffic-enforcement", d.trafficEnforcement),
    enforceGlobalprotect: appBool(m, "enforce-globalprotect", d.enforceGlobalprotect),
    captivePortalExceptionTimeout: appNum(m, "captive-portal-exception-timeout", d.captivePortalExceptionTimeout),
    captivePortalUsingDefaultBrowser: appBool(m, "captive-portal-using-default-browser", d.captivePortalUsingDefaultBrowser),
    trafficBlockingNotificationDelay: appNum(m, "traffic-blocking-notification-delay", d.trafficBlockingNotificationDelay),
    displayTrafficBlockingNotificationMsg: appBool(m, "display-traffic-blocking-notification-msg", d.displayTrafficBlockingNotificationMsg),
    trafficBlockingNotificationMsg: appStrNull(m, "traffic-blocking-notification-msg"),
    allowTrafficBlockingNotificationDismissal: appBool(m, "allow-traffic-blocking-notification-dismissal", d.allowTrafficBlockingNotificationDismissal),
    displayCaptivePortalDetectionMsg: appBool(m, "display-captive-portal-detection-msg", d.displayCaptivePortalDetectionMsg),
    captivePortalDetectionMsg: appStrNull(m, "captive-portal-detection-msg"),
    captivePortalNotificationDelay: appNum(m, "captive-portal-notification-delay", d.captivePortalNotificationDelay),
    // Certificate
    certificateStoreLookup: appStr(m, "certificate-store-lookup", d.certificateStoreLookup),
    scepCertificateRenewalPeriod: appNum(m, "scep-certificate-renewal-period", d.scepCertificateRenewalPeriod),
    fullChainCertVerify: appBool(m, "full-chain-cert-verify", d.fullChainCertVerify),
    retainConnectionSmartcardRemoval: appBool(m, "retain-connection-smartcard-removal", d.retainConnectionSmartcardRemoval),
    // UI
    enableAdvancedView: appBool(m, "enable-advanced-view", d.enableAdvancedView),
    enableDoNotDisplayWelcomePageAgain: appBool(m, "enable-do-not-display-this-welcome-page-again", d.enableDoNotDisplayWelcomePageAgain),
    userAcceptTermsBeforeCreatingTunnel: appBool(m, "user-accept-terms-before-creating-tunnel", d.userAcceptTermsBeforeCreatingTunnel),
    // Network
    rediscoverNetwork: appBool(m, "rediscover-network", d.rediscoverNetwork),
    wifiToWiredTransition: appBool(m, "wifi-to-wired-transition", d.wifiToWiredTransition),
    resubmitHostInfo: appBool(m, "resubmit-host-info", d.resubmitHostInfo),
    intelligentPortal: appBool(m, "intelligent-portal", d.intelligentPortal),
    // Portal
    canChangePortal: appBool(m, "can-change-portal", d.canChangePortal),
    canContinueIfPortalCertInvalid: appBool(m, "can-continue-if-portal-cert-invalid", d.canContinueIfPortalCertInvalid),
    accessGatewayFromAgentOnly: appBool(m, "access-gateway-from-agent-only", d.accessGatewayFromAgentOnly),
    showAgentIcon: appBool(m, "show-agent-icon", d.showAgentIcon),
    // Timeouts
    userSwitchTunnelRenameTimeout: appNum(m, "user-switch-tunnel-rename-timeout", d.userSwitchTunnelRenameTimeout),
    preLogonTunnelRenameTimeout: appNum(m, "pre-logon-tunnel-rename-timeout", d.preLogonTunnelRenameTimeout),
    enableCachePortalConfigAbsencePrelogonTunnel: appBool(m, "enable-cache-portal-config-absence-prelogon-tunnel", d.enableCachePortalConfigAbsencePrelogonTunnel),
    preserveTunnelUponUserLogoffTimeout: appNum(m, "preserve-tunnel-upon-user-logoff-timeout", d.preserveTunnelUponUserLogoffTimeout),
    // IPSec / Tunnel
    passwordExpiryMessage: appStrNull(m, "password-expiry-message"),
    ipsecFailoverSsl: appNum(m, "ipsec-failover-ssl", d.ipsecFailoverSsl),
    displayTunnelFallbackNotification: appBool(m, "display-tunnel-fallback-notification", d.displayTunnelFallbackNotification),
    sslOnlySelection: appNum(m, "ssl-only-selection", d.sslOnlySelection),
    tunnelMtu: appNum(m, "tunnel-mtu", d.tunnelMtu),
    maxInternalGatewayConnectionAttempts: appNum(m, "max-internal-gateway-connection-attempts", d.maxInternalGatewayConnectionAttempts),
    advInternalHostDetection: appBool(m, "adv-internal-host-detection", d.advInternalHostDetection),
    delaysInternalHostDetection: appBool(m, "delays-internal-host-detection", d.delaysInternalHostDetection),
    unifiedUserIdHybridDeployment: appBool(m, "unified-user-id-hybrid-deployment", d.unifiedUserIdHybridDeployment),
    portalTimeout: appNum(m, "portal-timeout", d.portalTimeout),
    connectTimeout: appNum(m, "connect-timeout", d.connectTimeout),
    receiveTimeout: appNum(m, "receive-timeout", d.receiveTimeout),
    // Split tunnel
    splitTunnelOption: appStr(m, "split-tunnel-option", d.splitTunnelOption),
    splitTunnelOptionMobile: appStr(m, "split-tunnel-option-mobile", d.splitTunnelOptionMobile),
    advancedStPublicKey: appStrNull(m, "advanced-st-public-key"),
    enforceDns: appBool(m, "enforce-dns", d.enforceDns),
    appendLocalSearchDomain: appBool(m, "append-local-search-domain", d.appendLocalSearchDomain),
    flushDns: appBool(m, "flush-dns", d.flushDns),
    // Proxy
    agentProxyPort: appNum(m, "agent-proxy-port", d.agentProxyPort),
    agentProxyMode: appNum(m, "agent-proxy-mode", d.agentProxyMode),
    proxyMultipleAutodetect: appBool(m, "proxy-multiple-autodetect", d.proxyMultipleAutodetect),
    useProxy: appBool(m, "use-proxy", d.useProxy),
    // HIP remediation
    enableHipRemediation: appNum(m, "enable-hip-remediation", d.enableHipRemediation),
    hipRemediationRetry: appNum(m, "hip-remediation-retry", d.hipRemediationRetry),
    wscAutodetect: appBool(m, "wsc-autodetect", d.wscAutodetect),
    // MFA
    mfaEnabled: appBool(m, "mfa-enabled", d.mfaEnabled),
    mfaListeningPort: appNum(m, "mfa-listening-port", d.mfaListeningPort),
    mfaNotificationMsg: appStrNull(m, "mfa-notification-msg"),
    mfaPromptSuppressTime: appNum(m, "mfa-prompt-suppress-time", d.mfaPromptSuppressTime),
    // Misc
    ipv6Preferred: appBool(m, "ipv6-preferred", d.ipv6Preferred),
    changePasswordMessage: appStrNull(m, "change-password-message"),
    measuringEgwTcpConnection: appBool(m, "measuring-egw-tcp-connection", d.measuringEgwTcpConnection),
    logGateway: appBool(m, "log-gateway", d.logGateway),
    cdlLog: appBool(m, "cdl-log", d.cdlLog),
    demNotification: appBool(m, "dem-notification", d.demNotification),
    demAgent: appStr(m, "dem-agent", d.demAgent),
    demAgentAction: appStr(m, "dem-agent-action", d.demAgentAction),
    quarantineAddMessage: appStrNull(m, "quarantine-add-message"),
    quarantineRemoveMessage: appStrNull(m, "quarantine-remove-message"),
    initPanel: appBool(m, "init-panel", d.initPanel),
    userInputOnTop: appBool(m, "user-input-on-top", d.userInputOnTop),
    allowDisableCbl: appBool(m, "allow-disable-cbl", d.allowDisableCbl),
  }
}

// ─── HIP Collection ──────────────────────────────────────────────────────────

function extractHipCollection(configEntry: Record<string, unknown>): PanwGpHipCollection {
  const hipEl = configEntry["hip-collection"] as Record<string, unknown> | undefined
  if (!hipEl) return { collectHipData: false, maxWaitTime: null, certificateProfile: null, exclusionCategories: [] }

  const exclEl = hipEl["exclusion"] as Record<string, unknown> | undefined
  const categories: PanwGpHipExclusionCategory[] = entries(exclEl?.["category"]).map((catEntry) => ({
    name: entryName(catEntry),
    vendors: entries(catEntry["vendor"]).map((vendorEntry) => ({
      name: entryName(vendorEntry),
      products: members(vendorEntry["product"]),
    })),
  }))

  return {
    collectHipData: yesNo(hipEl["collect-hip-data"]),
    maxWaitTime: hipEl["max-wait-time"] !== undefined ? Number(hipEl["max-wait-time"]) : null,
    certificateProfile: str(hipEl["certificate-profile"]) ?? null,
    exclusionCategories: categories,
  }
}

// ─── Internal Gateways ───────────────────────────────────────────────────────

function extractInternalGateways(configEntry: Record<string, unknown>): PanwGpInternalGateway[] {
  const listEl = dig(configEntry, "gateways", "internal", "list")
  return entries(listEl).map((entry) => ({
    name: entryName(entry),
    fqdn: str(entry["fqdn"]) ?? null,
    sourceIps: members(entry["source-ip"]),
  }))
}

// ─── External Gateways ───────────────────────────────────────────────────────

function extractExternalGateways(configEntry: Record<string, unknown>): PanwGpExternalGateway[] {
  const listEl = dig(configEntry, "gateways", "external", "list")
  return entries(listEl).map((entry) => ({
    name: entryName(entry),
    fqdn: str(entry["fqdn"]) ?? null,
    ipv4: str(dig(entry, "ip", "ipv4")) ?? null,
    priorityRules: entries(entry["priority-rule"]).map((pr) => ({
      name: entryName(pr),
      priority: pr["priority"] !== undefined ? Number(pr["priority"]) : 1,
    })),
    manual: yesNo(entry["manual"]),
  }))
}

// ─── Config Entry ────────────────────────────────────────────────────────────

function extractConfigEntry(configEntry: Record<string, unknown>): PanwGpPortalConfigEntry {
  const agentUiEl = configEntry["agent-ui"] as Record<string, unknown> | undefined
  const ihdEl = configEntry["internal-host-detection"] as Record<string, unknown> | undefined
  const ihdIpv6El = configEntry["internal-host-detection-ipv6"] as Record<string, unknown> | undefined
  const extEl = dig(configEntry, "gateways", "external") as Record<string, unknown> | undefined
  const certEl = dig(configEntry, "certificate", "criteria") as Record<string, unknown> | undefined
  const machineEl = configEntry["machine-account-exists-with-serialno"] as Record<string, unknown> | undefined
  const clientCertEl = configEntry["client-certificate"] as Record<string, unknown> | undefined

  // Detect client certificate type
  let clientCertificateType: string | null = null
  let clientCertificateName: string | null = null
  if (clientCertEl) {
    if (clientCertEl["local"] !== undefined) {
      clientCertificateType = "local"
      clientCertificateName = str(clientCertEl["local"]) ?? null
    } else if (clientCertEl["scep"] !== undefined) {
      clientCertificateType = "SCEP"
      clientCertificateName = str(clientCertEl["scep"]) ?? null
    }
  }

  return {
    name: entryName(configEntry),
    sourceUsers: members(configEntry["source-user"]),
    os: members(configEntry["os"]),
    authentication: {
      clientCertificateType,
      clientCertificateName,
      saveUserCredentials: configEntry["save-user-credentials"] !== undefined
        ? Number(configEntry["save-user-credentials"])
        : null,
      authOverride: extractGpAuthOverride(configEntry),
      twoFactor: {
        portal: yesNo(configEntry["portal-2fa"]),
        manualOnlyGateway: yesNo(configEntry["manual-only-gateway-2fa"]),
        internalGateway: yesNo(configEntry["internal-gateway-2fa"]),
        autoDiscoveryExternalGateway: yesNo(configEntry["auto-discovery-external-gateway-2fa"]),
      },
    },
    configSelection: {
      certificateProfile: str(certEl?.["certificate-profile"]) ?? null,
      machineAccountSerialNo: machineEl?.["yes"] !== undefined,
    },
    internal: {
      hostDetectionIpv4: {
        ipAddress: str(ihdEl?.["ip-address"]) ?? null,
        hostname: str(ihdEl?.["hostname"]) ?? null,
      },
      hostDetectionIpv6: {
        ipAddress: str(ihdIpv6El?.["ip-address"]) ?? null,
        hostname: str(ihdIpv6El?.["hostname"]) ?? null,
      },
      gateways: extractInternalGateways(configEntry),
    },
    external: {
      cutoffTime: extEl?.["cutoff-time"] !== undefined ? Number(extEl["cutoff-time"]) : null,
      gateways: extractExternalGateways(configEntry),
      thirdPartyVpnClients: members(configEntry["third-party-vpn-clients"]),
    },
    appConfig: extractAppConfig(configEntry),
    agentUi: {
      welcomePage: str(dig(agentUiEl, "welcome-page", "page")) ?? null,
      maxAgentUserOverrides: agentUiEl?.["max-agent-user-overrides"] !== undefined
        ? Number(agentUiEl["max-agent-user-overrides"])
        : null,
      agentUserOverrideTimeout: agentUiEl?.["agent-user-override-timeout"] !== undefined
        ? Number(agentUiEl["agent-user-override-timeout"])
        : null,
      hasPasscode: agentUiEl?.["passcode"] !== undefined,
      hasUninstallPassword: agentUiEl?.["uninstall-password"] !== undefined,
    },
    hipCollection: extractHipCollection(configEntry),
    mdm: {
      address: str(configEntry["mdm-address"]) ?? null,
      enrollmentPort: configEntry["mdm-enrollment-port"] !== undefined
        ? Number(configEntry["mdm-enrollment-port"])
        : null,
    },
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXTRACTOR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extract GlobalProtect Portals.
 * Checks both networkEl and vsysEl (same pattern as dns-proxy / sd-wan).
 * Path: global-protect → global-protect-portal → entry[]
 */
export function extractGpPortals(
  networkEl: unknown,
  templateName: string | null,
  vsysEl?: unknown
): PanwGpPortal[] {
  const networkPortals = (networkEl && typeof networkEl === "object")
    ? entries(dig(networkEl, "global-protect", "global-protect-portal"))
    : []
  const vsysPortals = (vsysEl && typeof vsysEl === "object")
    ? entries(dig(vsysEl, "global-protect", "global-protect-portal"))
    : []
  const allEntries = [...networkPortals, ...vsysPortals]

  return allEntries.map((entry) => {
    const portalConfig = entry["portal-config"] as Record<string, unknown> | undefined
    const localAddr = portalConfig?.["local-address"] as Record<string, unknown> | undefined
    const ipEl = localAddr?.["ip"] as Record<string, unknown> | undefined
    const clientConfig = entry["client-config"] as Record<string, unknown> | undefined

    return {
      name: entryName(entry),
      general: {
        interface: str(localAddr?.["interface"]) ?? null,
        ipAddressFamily: str(localAddr?.["ip-address-family"]) ?? null,
        ipv4: str(ipEl?.["ipv4"]) ?? null,
        ipv6: str(ipEl?.["ipv6"]) ?? null,
        customLoginPage: str(portalConfig?.["custom-login-page"]) ?? null,
        customHomePage: str(portalConfig?.["custom-home-page"]) ?? null,
        customHelpPage: str(portalConfig?.["custom-help-page"]) ?? null,
        logSuccess: yesNo(portalConfig?.["log-success"]),
        logSetting: str(portalConfig?.["log-setting"]) ?? null,
        sslTlsServiceProfile: str(portalConfig?.["ssl-tls-service-profile"]) ?? null,
        certificateProfile: str(portalConfig?.["certificate-profile"]) ?? null,
      },
      clientAuth: extractGpClientAuth(portalConfig?.["client-auth"]),
      configSelection: {
        certificateProfile: str(dig(portalConfig, "config-selection", "certificate-profile")) ?? null,
      },
      agentConfig: {
        rootCas: entries(clientConfig?.["root-ca"]).map((caEntry) => ({
          name: entryName(caEntry),
          installInCertStore: yesNo(caEntry["install-in-cert-store"]),
        })),
        hasAgentUserOverrideKey: clientConfig?.["agent-user-override-key"] !== undefined,
        configs: entries(clientConfig?.["configs"]).map(extractConfigEntry),
      },
      templateName,
    }
  })
}
