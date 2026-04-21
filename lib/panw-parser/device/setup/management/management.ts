// @/lib/panw-parser/device/setup/management/management.ts

// ============================================================================
// Types
// ============================================================================

// --- Shared primitives --------------------------------------------------------

export interface LogQuotaEntry {
  quotaPercent: number | null
  maxDays: number | null
}

export interface LogQuotaSet {
  enabled: boolean
  entries: Record<string, LogQuotaEntry>
}

// --- 1. General Settings ------------------------------------------------------

export interface GeneralSettings {
  hostname: string | null
  domain: string | null
  acceptDhcpHostname: boolean
  acceptDhcpDomain: boolean
  loginBanner: string | null
  forceAckLoginBanner: boolean
  sslTlsServiceProfile: string | null
  timezone: string | null
  locale: string | null
  latitude: number | null
  longitude: number | null
  automaticallyAcquireCommitLock: boolean
  certificateExpirationCheck: boolean
  useHypervisorAssignedMacAddresses: boolean
  duplicateIpAddressSupport: boolean
  tunnelAcceleration: boolean
}

// --- 2. Authentication Settings ----------------------------------------------

export interface AuthenticationSettings {
  authenticationProfile: string | null
  nonUiAuthenticationProfile: string | null
  certificateProfile: string | null
  idleTimeoutMin: number | null
  apiKeyLifetimeMin: number | null
  apiKeyCertificate: string | null
  failedAttempts: number | null
  lockoutTimeMin: number | null
  maxSessionCount: number | null
  maxSessionTimeMin: number | null
}

// --- 3. Log Interface ---------------------------------------------------------

export interface LogInterface {
  ipAddress: string | null
  netmask: string | null
  defaultGateway: string | null
  ipv6Address: string | null
  ipv6DefaultGateway: string | null
  linkSpeed: string | null
  linkDuplex: string | null
  linkState: string | null
}

// --- 4. Panorama Settings -----------------------------------------------------

export interface PanoramaSettings {
  managedBy: 'local' | 'cloud' | null
  panoramaServer: string | null
  panoramaServer2: string | null
  enablePushingDeviceMonitoringData: boolean
  receiveTimeoutSec: number | null
  sendTimeoutSec: number | null
  retryCountSslSend: number | null
  enableAutomatedCommitRecovery: boolean
  commitRecoveryRetry: number | null
  commitRecoveryTimeoutSec: number | null
}

// --- 5. Secure Communication Settings ----------------------------------------

export interface SecureCommunicationClient {
  certificateType: 'local' | 'scep' | null
  certificate: string | null
  certificateProfile: string | null
  panDbCommunication: boolean
  wildFireCommunication: boolean
  logCollectorCommunication: boolean
  userIdCommunication: boolean
  dataRedistribution: boolean
  checkServerIdentity: boolean
}

export interface SecureCommunicationServer {
  enabled: boolean
  sslTlsServiceProfile: string | null
  certificateProfile: string | null
  userIdCommunication: boolean
  dataRedistribution: boolean
}

export interface SecureCommunicationSettings {
  client: SecureCommunicationClient
  server: SecureCommunicationServer
}

// --- 6. Logging and Reporting Settings ---------------------------------------

export interface MultiDiskStorage {
  sessionLogStorage: LogQuotaSet
  managementLogStorage: LogQuotaSet
}

export interface LogAdminActivity {
  debugAndOperationalCommands: boolean
  uiActions: boolean
  syslogServer: string | null
}

export interface LogExportAndReporting {
  numberOfVersionsForConfigAudit: number | null
  maxRowsInCsvExport: number | null
  maxRowsInUserActivityReport: number | null
  averageBrowseTimeSec: number | null
  pageLoadThresholdSec: number | null
  syslogHostnameFormat: string | null
  reportRuntime: string | null
  reportExpirationPeriodDays: number | null
  stopTrafficWhenLogDbFull: boolean
  enableConfigurationLogsForRevertOperations: boolean
  enableThreatVaultAccess: boolean
  enableLogOnHighDpLoad: boolean
  enableHighSpeedLogForwarding: boolean
  supportUtf8ForLogOutput: boolean
  improvedDnsSecurityLogging: boolean
  logAdminActivity: LogAdminActivity
}

export interface PreDefinedReports {
  configured: boolean           // true when <disable-predefined-reports> element exists
  disabledMembers: string[]
}

export interface LoggingAndReportingSettings {
  singleDiskStorage: LogQuotaSet
  multiDiskStorage: MultiDiskStorage
  logExportAndReporting: LogExportAndReporting
  preDefinedReports: PreDefinedReports
}

// --- 7. AutoFocus -------------------------------------------------------------

export interface AutoFocusSettings {
  enabled: boolean
  autoFocusUrl: string | null
  queryTimeoutSec: number | null
}

// --- 8. Cloud Logging ---------------------------------------------------------

export interface CloudLoggingSettings {
  enableCloudLogging: boolean
  enableDuplicateLogging: boolean
  enableEnhancedApplicationLogging: boolean
  region: string | null
  connectionCountStrataLoggingService: number | null
}

// --- 9. Accounting Server Settings -------------------------------------------

export interface AccountingServerSettings {
  accountingServerProfile: string | null
}

// --- 10. SSH Management Profile Setting --------------------------------------

export interface SshManagementProfileSetting {
  serverProfile: string | null
}

// --- 11. Advanced DNS Security -----------------------------------------------

export interface AdvancedDnsSecurity {
  dnsSecurityServer: string | null
}

// --- 12. PAN-OS Edge Service Settings ----------------------------------------

export interface PanOsEdgeServiceSettings {
  enableThirdPartyDeviceVerdicts: boolean
  enableUserContextCloudService: boolean
  deviceIdOperationMode: 'legacy-mode' | 'hybrid-mode' | 'advanced-mode' | null
  enableCloudHostComplianceService: boolean
}

// --- 13. Banners and Messages ------------------------------------------------

export interface MessageOfTheDay {
  enabled: boolean
  message: string | null
  allowDoNotDisplayAgain: boolean
  title: string | null
  backgroundColor: string | null
  icon: 'info' | 'warning' | 'critical' | null
}

export interface Banners {
  headerBanner: string | null
  headerColor: string | null
  headerTextColor: string | null
  sameBannerForHeaderAndFooter: boolean
  footerBanner: string | null
  footerColor: string | null
  footerTextColor: string | null
}

export interface BannersAndMessages {
  messageOfTheDay: MessageOfTheDay
  banners: Banners
}

// --- 14. Minimum Password Complexity -----------------------------------------

export interface PasswordFormatRequirements {
  minimumLength: number | null
  minimumUppercaseLetters: number | null
  minimumLowercaseLetters: number | null
  minimumNumericLetters: number | null
  minimumSpecialCharacters: number | null
  blockRepeatedCharacters: number | null
  blockUsernameInclusion: boolean
}

export interface PasswordFunctionalityRequirements {
  newPasswordDiffersByCharacters: number | null
  requirePasswordChangeOnFirstLogin: boolean
  preventPasswordReuseLimit: number | null
  blockPasswordChangePeriodDays: number | null
  requiredPasswordChangePeriodDays: number | null
  expirationWarningPeriodDays: number | null
  postExpirationAdminLoginCount: number | null
  postExpirationGracePeriodDays: number | null
}

export interface MinimumPasswordComplexity {
  enabled: boolean
  format: PasswordFormatRequirements
  functionality: PasswordFunctionalityRequirements
}

// --- Combined top-level type --------------------------------------------------

export interface SetupManagement {
  generalSettings: GeneralSettings
  authenticationSettings: AuthenticationSettings
  logInterface: LogInterface
  panoramaSettings: PanoramaSettings
  secureCommunicationSettings: SecureCommunicationSettings
  loggingAndReportingSettings: LoggingAndReportingSettings
  autoFocus: AutoFocusSettings
  cloudLogging: CloudLoggingSettings
  accountingServerSettings: AccountingServerSettings
  sshManagementProfileSetting: SshManagementProfileSetting
  advancedDnsSecurity: AdvancedDnsSecurity
  panOsEdgeServiceSettings: PanOsEdgeServiceSettings
  bannersAndMessages: BannersAndMessages
  minimumPasswordComplexity: MinimumPasswordComplexity
}

// ============================================================================
// Helpers
// ============================================================================

const isPresent = (value: unknown): boolean => value !== undefined && value !== null

const yesNo = (value: unknown): boolean => value === 'yes' || value === true

const yesNoOrDefault = (value: unknown, defaultValue: boolean): boolean =>
  isPresent(value) && value !== '' ? yesNo(value) : defaultValue

const toStr = (value: unknown): string | null => {
  if (!isPresent(value)) return null
  const s = String(value)
  return s === '' ? null : s
}

const toNum = (value: unknown): number | null => {
  if (!isPresent(value) || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

const toMembers = (value: unknown): string[] => {
  if (!isPresent(value)) return []
  if (Array.isArray(value)) return value.map((v) => String(v))
  return [String(value)]
}

const extractMemberList = (container: unknown): string[] => {
  if (!isPresent(container)) return []
  const obj = container as { member?: unknown }
  return toMembers(obj.member)
}

// Zip two parallel XML trees (e.g. <disk-quota> and <log-expiration-period>)
// into a unified quota set. Iterates keys actually present in the XML so the
// parser automatically picks up any new log types PAN-OS adds.
const buildQuotaSet = (
  quotaEl: Record<string, unknown> | undefined,
  maxDaysEl: Record<string, unknown> | undefined,
): LogQuotaSet => {
  const enabled = isPresent(quotaEl) || isPresent(maxDaysEl)
  const entries: Record<string, LogQuotaEntry> = {}
  const keys = new Set<string>([
    ...Object.keys(quotaEl ?? {}),
    ...Object.keys(maxDaysEl ?? {}),
  ])
  for (const key of keys) {
    entries[key] = {
      quotaPercent: toNum(quotaEl?.[key]),
      maxDays: toNum(maxDaysEl?.[key]),
    }
  }
  return { enabled, entries }
}

// ============================================================================
// Section Extractors
// ============================================================================

const extractGeneralSettings = (
  sEl: Record<string, unknown>,
  mgmtEl: Record<string, unknown>,
): GeneralSettings => {
  const geo = (sEl['geo-location'] ?? {}) as Record<string, unknown>
  return {
    hostname: toStr(sEl.hostname),
    domain: toStr(sEl.domain),
    acceptDhcpHostname: yesNo(sEl['accept-dhcp-hostname']),
    acceptDhcpDomain: yesNo(sEl['accept-dhcp-domain']),
    loginBanner: toStr(sEl['login-banner']),
    forceAckLoginBanner: yesNo(sEl['ack-login-banner']),
    sslTlsServiceProfile: toStr(sEl['ssl-tls-service-profile']),
    timezone: toStr(sEl.timezone),
    locale: toStr(sEl.locale),
    latitude: toNum(geo.latitude),
    longitude: toNum(geo.longitude),
    automaticallyAcquireCommitLock: yesNo(mgmtEl['auto-acquire-commit-lock']),
    certificateExpirationCheck: yesNo(mgmtEl['enable-certificate-expiration-check']),
    useHypervisorAssignedMacAddresses: yesNoOrDefault(mgmtEl['use-vm-assigned-mac'], true),
    duplicateIpAddressSupport: yesNo(mgmtEl['enable-duplicate-ip-address']),
    tunnelAcceleration: yesNoOrDefault(mgmtEl['tunnel-acceleration'], true),
  }
}

const extractAuthenticationSettings = (
  sEl: Record<string, unknown>,
  mgmtEl: Record<string, unknown>,
): AuthenticationSettings => {
  const lockout = (mgmtEl['admin-lockout'] ?? {}) as Record<string, unknown>
  const session = (mgmtEl['admin-session'] ?? {}) as Record<string, unknown>
  const apiKey = (((mgmtEl.api ?? {}) as Record<string, unknown>).key ?? {}) as Record<string, unknown>
  return {
    authenticationProfile: toStr(sEl['authentication-profile']),
    nonUiAuthenticationProfile: toStr(sEl['non-ui-authentication-profile']),
    certificateProfile: toStr(sEl['certificate-profile']),
    idleTimeoutMin: toNum(mgmtEl['idle-timeout']),
    apiKeyLifetimeMin: toNum(apiKey.lifetime),
    apiKeyCertificate: toStr(apiKey.certificate),
    failedAttempts: toNum(lockout['failed-attempts']),
    lockoutTimeMin: toNum(lockout['lockout-time']),
    maxSessionCount: toNum(session['max-session-count']),
    maxSessionTimeMin: toNum(session['max-session-time']),
  }
}

const extractLogInterface = (sEl: Record<string, unknown>): LogInterface => {
  const li = (sEl['log-interface'] ?? {}) as Record<string, unknown>
  return {
    ipAddress: toStr(li['ip-address']),
    netmask: toStr(li.netmask),
    defaultGateway: toStr(li['default-gateway']),
    ipv6Address: toStr(li['ipv6-address']),
    ipv6DefaultGateway: toStr(li['ipv6-default-gateway']),
    linkSpeed: toStr(li['link-speed']),
    linkDuplex: toStr(li['link-duplex']),
    linkState: toStr(li['link-state']),
  }
}

const extractPanoramaSettings = (
  sEl: Record<string, unknown>,
  mgmtEl: Record<string, unknown>,
): PanoramaSettings => {
  const pan = (sEl.panorama ?? {}) as Record<string, unknown>
  const local = pan['local-panorama'] as Record<string, unknown> | undefined
  const cloud = pan['cloud-service'] as Record<string, unknown> | undefined
  const managedBy: 'local' | 'cloud' | null = local ? 'local' : cloud ? 'cloud' : null
  return {
    managedBy,
    panoramaServer: toStr(local?.['panorama-server']),
    panoramaServer2: toStr(local?.['panorama-server-2']),
    enablePushingDeviceMonitoringData: yesNoOrDefault(mgmtEl['enable-device-monitoring-data'], true),
    receiveTimeoutSec: toNum(mgmtEl['panorama-tcp-receive-timeout']),
    sendTimeoutSec: toNum(mgmtEl['panorama-tcp-send-timeout']),
    retryCountSslSend: toNum(mgmtEl['panorama-ssl-send-retries']),
    enableAutomatedCommitRecovery: !yesNo(mgmtEl['disable-commit-recovery']),
    commitRecoveryRetry: toNum(mgmtEl['commit-recovery-retry']),
    commitRecoveryTimeoutSec: toNum(mgmtEl['commit-recovery-timeout']),
  }
}

const extractSecureCommunicationSettings = (
  mgmtEl: Record<string, unknown>,
): SecureCommunicationSettings => {
  const client = (mgmtEl['secure-conn-client'] ?? {}) as Record<string, unknown>
  const server = mgmtEl['secure-conn-server'] as Record<string, unknown> | undefined

  const certTypeEl = (client['certificate-type'] ?? {}) as Record<string, unknown>
  const localCert = certTypeEl.local as Record<string, unknown> | undefined
  const scepCert = certTypeEl.scep as Record<string, unknown> | undefined
  const certificateType: 'local' | 'scep' | null = localCert ? 'local' : scepCert ? 'scep' : null
  const activeCert = localCert ?? scepCert

  return {
    client: {
      certificateType,
      certificate: toStr(activeCert?.certificate),
      certificateProfile: toStr(activeCert?.['certificate-profile']),
      panDbCommunication: yesNo(client['enable-secure-pandb-communication']),
      wildFireCommunication: yesNo(client['enable-secure-wildfire-communication']),
      logCollectorCommunication: yesNo(client['enable-secure-lc-communication']),
      userIdCommunication: yesNo(client['enable-secure-user-id-communication']),
      dataRedistribution: yesNo(client['enable-secure-panorama-communication']),
      checkServerIdentity: yesNo(client['check-server-identity']),
    },
    server: {
      enabled: isPresent(server),
      sslTlsServiceProfile: toStr(server?.['ssl-tls-service-profile']),
      certificateProfile: toStr(server?.['certificate-profile']),
      userIdCommunication: yesNo(server?.['enable-secure-user-id-communication']),
      dataRedistribution: yesNo(server?.['enable-secure-panorama-communication']),
    },
  }
}

const extractLoggingAndReportingSettings = (
  mgmtEl: Record<string, unknown>,
  settingEl: Record<string, unknown>,
): LoggingAndReportingSettings => {
  const quotas = (mgmtEl['quota-settings'] ?? {}) as Record<string, unknown>
  const diskQuota = quotas['disk-quota'] as Record<string, unknown> | undefined
  const logExpiration = quotas['log-expiration-period'] as Record<string, unknown> | undefined
  const chassis = (quotas['chassis-quota'] ?? {}) as Record<string, unknown>
  const chassisExpiration = (quotas['chassis-log-expiration-period'] ?? {}) as Record<string, unknown>

  const auditTracking = (mgmtEl['audit-tracking'] ?? {}) as Record<string, unknown>
  const browse = (mgmtEl['browse-activity-report-setting'] ?? {}) as Record<string, unknown>
  const ctd = (settingEl.ctd ?? {}) as Record<string, unknown>

  const preDefinedEl = mgmtEl['disable-predefined-reports']

  return {
    singleDiskStorage: buildQuotaSet(diskQuota, logExpiration),
    multiDiskStorage: {
      sessionLogStorage: buildQuotaSet(
        chassis['log-card'] as Record<string, unknown> | undefined,
        chassisExpiration['log-card'] as Record<string, unknown> | undefined,
      ),
      managementLogStorage: buildQuotaSet(
        chassis['mgmt-card'] as Record<string, unknown> | undefined,
        chassisExpiration['mgmt-card'] as Record<string, unknown> | undefined,
      ),
    },
    logExportAndReporting: {
      numberOfVersionsForConfigAudit: toNum(mgmtEl['max-audit-versions']),
      maxRowsInCsvExport: toNum(mgmtEl['max-rows-in-csv-export']),
      maxRowsInUserActivityReport: toNum(mgmtEl['max-rows-in-pdf-report']),
      averageBrowseTimeSec: toNum(browse['average-browse-time']),
      pageLoadThresholdSec: toNum(browse['page-load-threshold']),
      syslogHostnameFormat: toStr(mgmtEl['hostname-type-in-syslog']),
      reportRuntime: toStr(mgmtEl['report-run-time']),
      reportExpirationPeriodDays: toNum(mgmtEl['report-expiration-period']),
      stopTrafficWhenLogDbFull: yesNo(mgmtEl['traffic-stop-on-logdb-full']),
      enableConfigurationLogsForRevertOperations: yesNo(mgmtEl['log-revert-operations']),
      enableThreatVaultAccess: yesNo(mgmtEl['enable-threat-vault-access']),
      enableLogOnHighDpLoad: yesNo(mgmtEl['enable-log-high-dp-load']),
      enableHighSpeedLogForwarding: yesNo(mgmtEl['enable-high-speed-log-forwarding']),
      supportUtf8ForLogOutput: yesNo(mgmtEl['support-utf8-for-log-output']),
      improvedDnsSecurityLogging: yesNo(ctd['improved-dns-logging']),
      logAdminActivity: {
        debugAndOperationalCommands: yesNo(auditTracking['op-commands']),
        uiActions: yesNo(auditTracking['ui-actions']),
        syslogServer: toStr(auditTracking['syslog-server']),
      },
    },
    preDefinedReports: {
      configured: isPresent(preDefinedEl),
      disabledMembers: extractMemberList(preDefinedEl),
    },
  }
}

const extractAutoFocus = (settingEl: Record<string, unknown>): AutoFocusSettings => {
  const af = settingEl.autofocus as Record<string, unknown> | undefined
  return {
    enabled: yesNo(af?.enabled),
    autoFocusUrl: toStr(af?.['autofocus-url']),
    queryTimeoutSec: toNum(af?.['query-timeout']),
  }
}

const extractCloudLogging = (settingEl: Record<string, unknown>): CloudLoggingSettings => {
  const cloudapp = (settingEl.cloudapp ?? {}) as Record<string, unknown>
  return {
    enableCloudLogging: isPresent(cloudapp.disable) ? !yesNo(cloudapp.disable) : false,
    enableDuplicateLogging: yesNo(cloudapp['duplicate-logging']),
    enableEnhancedApplicationLogging: yesNo(cloudapp['enhanced-application-logging']),
    region: toStr(cloudapp.region),
    connectionCountStrataLoggingService: toNum(cloudapp['connection-count']),
  }
}

const extractAccountingServerSettings = (
  sEl: Record<string, unknown>,
): AccountingServerSettings => ({
  accountingServerProfile: toStr(sEl['accounting-server-profile']),
})

const extractSshManagementProfileSetting = (
  sEl: Record<string, unknown>,
): SshManagementProfileSetting => {
  const ssh = (sEl.ssh ?? {}) as Record<string, unknown>
  const mgmt = (ssh.mgmt ?? {}) as Record<string, unknown>
  return { serverProfile: toStr(mgmt['server-profile']) }
}

const extractAdvancedDnsSecurity = (settingEl: Record<string, unknown>): AdvancedDnsSecurity => {
  const dns = (settingEl.dns ?? {}) as Record<string, unknown>
  return { dnsSecurityServer: toStr(dns['dns-cloud-server']) }
}

const extractPanOsEdgeServiceSettings = (
  settingEl: Record<string, unknown>,
): PanOsEdgeServiceSettings => {
  const iot = (settingEl.iot ?? {}) as Record<string, unknown>
  const edge = (iot.edge ?? {}) as Record<string, unknown>
  const cloudUserid = settingEl['cloud-userid'] as Record<string, unknown> | undefined
  const cloudCompliance = settingEl['cloud-host-compliance'] as Record<string, unknown> | undefined

  const mode = toStr(iot['device-id-operational-mode'])
  const deviceIdOperationMode =
    mode === 'legacy-mode' || mode === 'hybrid-mode' || mode === 'advanced-mode' ? mode : null

  return {
    enableThirdPartyDeviceVerdicts: yesNo(edge['enable-3rd-party']),
    enableUserContextCloudService: isPresent(cloudUserid?.disabled)
      ? !yesNo(cloudUserid?.disabled)
      : false,
    deviceIdOperationMode,
    enableCloudHostComplianceService: isPresent(cloudCompliance?.disabled)
      ? !yesNo(cloudCompliance?.disabled)
      : false,
  }
}

const extractBannersAndMessages = (sEl: Record<string, unknown>): BannersAndMessages => {
  const mb = (sEl['motd-and-banner'] ?? {}) as Record<string, unknown>
  const icon = toStr(mb.severity)
  return {
    messageOfTheDay: {
      enabled: yesNo(mb['motd-enable']),
      message: toStr(mb.message),
      allowDoNotDisplayAgain: yesNo(mb['motd-do-not-display-again']),
      title: toStr(mb['motd-title']),
      backgroundColor: toStr(mb['motd-color']),
      icon: icon === 'info' || icon === 'warning' || icon === 'critical' ? icon : null,
    },
    banners: {
      headerBanner: toStr(mb['banner-header']),
      headerColor: toStr(mb['banner-header-color']),
      headerTextColor: toStr(mb['banner-header-text-color']),
      sameBannerForHeaderAndFooter: yesNo(mb['banner-header-footer-match']),
      footerBanner: toStr(mb['banner-footer']),
      footerColor: toStr(mb['banner-footer-color']),
      footerTextColor: toStr(mb['banner-footer-text-color']),
    },
  }
}

const extractMinimumPasswordComplexity = (
  mgtConfigEl: Record<string, unknown>,
): MinimumPasswordComplexity => {
  const pc = (mgtConfigEl['password-complexity'] ?? {}) as Record<string, unknown>
  const change = (pc['password-change'] ?? {}) as Record<string, unknown>
  return {
    enabled: yesNo(pc.enabled),
    format: {
      minimumLength: toNum(pc['minimum-length']),
      minimumUppercaseLetters: toNum(pc['minimum-uppercase-letters']),
      minimumLowercaseLetters: toNum(pc['minimum-lowercase-letters']),
      minimumNumericLetters: toNum(pc['minimum-numeric-letters']),
      minimumSpecialCharacters: toNum(pc['minimum-special-characters']),
      blockRepeatedCharacters: toNum(pc['block-repeated-characters']),
      blockUsernameInclusion: yesNo(pc['block-username-inclusion']),
    },
    functionality: {
      newPasswordDiffersByCharacters: toNum(pc['new-password-differs-by-characters']),
      requirePasswordChangeOnFirstLogin: yesNo(pc['password-change-on-first-login']),
      preventPasswordReuseLimit: toNum(pc['password-history-count']),
      blockPasswordChangePeriodDays: toNum(pc['password-change-period-block']),
      requiredPasswordChangePeriodDays: toNum(change['expiration-period']),
      expirationWarningPeriodDays: toNum(change['expiration-warning-period']),
      postExpirationAdminLoginCount: toNum(change['post-expiration-admin-login-count']),
      postExpirationGracePeriodDays: toNum(change['post-expiration-grace-period']),
    },
  }
}

// ============================================================================
// Main Extractor
// ============================================================================

/**
 * Extract the full Device > Setup > Management configuration from a template's
 * <deviceconfig> and <mgt-config> elements.
 *
 * @param deviceconfig - Parsed <deviceconfig> element (contains <setting> and <s>)
 * @param mgtConfig    - Parsed <mgt-config> element (contains <password-complexity>)
 */
export const extractSetupManagement = (
  deviceconfig: Record<string, unknown> | undefined,
  mgtConfig: Record<string, unknown> | undefined,
): SetupManagement => {
  const dc = deviceconfig ?? {}
  const mc = mgtConfig ?? {}
  const sEl = (dc.system ?? {}) as Record<string, unknown>
  const settingEl = (dc.setting ?? {}) as Record<string, unknown>
  const mgmtEl = (settingEl.management ?? {}) as Record<string, unknown>

  return {
    generalSettings: extractGeneralSettings(sEl, mgmtEl),
    authenticationSettings: extractAuthenticationSettings(sEl, mgmtEl),
    logInterface: extractLogInterface(sEl),
    panoramaSettings: extractPanoramaSettings(sEl, mgmtEl),
    secureCommunicationSettings: extractSecureCommunicationSettings(mgmtEl),
    loggingAndReportingSettings: extractLoggingAndReportingSettings(mgmtEl, settingEl),
    autoFocus: extractAutoFocus(settingEl),
    cloudLogging: extractCloudLogging(settingEl),
    accountingServerSettings: extractAccountingServerSettings(sEl),
    sshManagementProfileSetting: extractSshManagementProfileSetting(sEl),
    advancedDnsSecurity: extractAdvancedDnsSecurity(settingEl),
    panOsEdgeServiceSettings: extractPanOsEdgeServiceSettings(settingEl),
    bannersAndMessages: extractBannersAndMessages(sEl),
    minimumPasswordComplexity: extractMinimumPasswordComplexity(mc),
  }
}
