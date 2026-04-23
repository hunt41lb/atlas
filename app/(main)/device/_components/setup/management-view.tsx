// @/app/(main)/device/_components/setup/management-view.tsx

"use client"

import { Textarea } from "@/components/ui/textarea"
import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import { resolveDeviceData } from "@/app/(main)/_lib/resolve-config-data"
import { SETUP_MANAGEMENT_DEFAULTS as DEFAULTS } from "@/lib/panw-defaults"

import type {
  AuthenticationSettings,
  LogInterface,
  PanoramaSettings,
  SecureCommunicationSettings,
  LoggingAndReportingSettings,
  AutoFocusSettings,
  CloudLoggingSettings,
  AccountingServerSettings,
  SshManagementProfileSetting,
  AdvancedDnsSecurity,
  PanOsEdgeServiceSettings,
  BannersAndMessages,
  MinimumPasswordComplexity,
  GeneralSettings,
} from "@/lib/panw-parser/device/setup/management"

import { SettingsSection, Field, BoolField, QuotaField, ColorSwatch } from "./management/_shared"

// ─── Main view ────────────────────────────────────────────────────────────────

export function ManagementView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()

  if (!activeConfig) return null

  const { setupManagement: sm } = resolveDeviceData(activeConfig.parsedConfig, selectedScope)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
      {/* Left column — order mirrors PAN-OS */}
      <div className="space-y-4">
        <GeneralSettingsSection data={sm.generalSettings} />
        <AuthenticationSection data={sm.authenticationSettings} />
        <LoggingReportingSection data={sm.loggingAndReportingSettings} />
        <LogInterfaceSection data={sm.logInterface} />
        <AutoFocusSection data={sm.autoFocus} />
        <CloudLoggingSection data={sm.cloudLogging} />
        <AccountingServerSection data={sm.accountingServerSettings} />
        <SshManagementSection data={sm.sshManagementProfileSetting} />
      </div>

      {/* Right column */}
      <div className="space-y-4">
        <PanoramaSection data={sm.panoramaSettings} />
        <SecureCommunicationSection data={sm.secureCommunicationSettings} />
        <BannersMessagesSection data={sm.bannersAndMessages} />
        <PasswordComplexitySection data={sm.minimumPasswordComplexity} />
        <EdgeServiceSection data={sm.panOsEdgeServiceSettings} />
        <DnsSecuritySection data={sm.advancedDnsSecurity} />
      </div>
    </div>
  )
}

// ─── General Settings ─────────────────────────────────────────────────────────

function GeneralSettingsSection({ data: gs }: { data: GeneralSettings }) {
  const d = DEFAULTS.generalSettings
  const geoLocation = gs.latitude !== null && gs.longitude !== null
    ? `Latitude: ${gs.latitude}, Longitude: ${gs.longitude}`
    : null

  return (
    <SettingsSection title="General Settings">
      <Field label="Hostname" value={gs.hostname ?? d.hostname} />
      <Field label="Domain" value={gs.domain} />
      {gs.loginBanner ? (
        <div className="flex gap-3 py-px">
          <span className="w-72 shrink-0 text-right text-xs text-muted-foreground">Login Banner</span>
          <Textarea value={gs.loginBanner} readOnly className="min-h-10 text-xs" />
        </div>
      ) : (
        <Field label="Login Banner" value={null} />
      )}
      <BoolField label="Force Admins to Acknowledge Login Banner" checked={gs.forceAckLoginBanner} />
      <Field label="SSL/TLS Service Profile" value={gs.sslTlsServiceProfile ?? d.sslTlsServiceProfile} />
      <Field label="Time Zone" value={gs.timezone ?? d.timezone} />
      <Field label="Locale" value={gs.locale ?? d.locale} />
      <Field label="Geo Location" value={geoLocation} />
      <BoolField label="Automatically Acquire Commit Lock" checked={gs.automaticallyAcquireCommitLock} />
      <BoolField label="Certificate Expiration Check" checked={gs.certificateExpirationCheck} />
      <BoolField label="Use Hypervisor Assigned MAC Addresses" checked={gs.useHypervisorAssignedMacAddresses} />
      <BoolField label="Tunnel Acceleration" checked={gs.tunnelAcceleration} />
    </SettingsSection>
  )
}

// ─── Authentication Settings ──────────────────────────────────────────────────

function AuthenticationSection({ data: as }: { data: AuthenticationSettings }) {
  const d = DEFAULTS.authenticationSettings
  return (
    <SettingsSection title="Authentication Settings">
      <Field label="Authentication Profile" value={as.authenticationProfile ?? d.authenticationProfile} />
      <Field label="Authentication Profile (Non-UI)" value={as.nonUiAuthenticationProfile ?? d.nonUiAuthenticationProfile} />
      <Field label="Certificate Profile" value={as.certificateProfile ?? d.certificateProfile} />
      <Field label="Idle Timeout (min)" value={as.idleTimeoutMin ?? d.idleTimeoutMin} />
      <Field label="API Key Lifetime (min)" value={as.apiKeyLifetimeMin ?? d.apiKeyLifetimeMin} />
      <Field label="API Key Certificate" value={as.apiKeyCertificate ?? d.apiKeyCertificate} />
      <Field label="Failed Attempts" value={as.failedAttempts ?? d.failedAttempts} />
      <Field label="Lockout Time (min)" value={as.lockoutTimeMin ?? d.lockoutTimeMin} />
      <Field label="Max Session Count (number)" value={as.maxSessionCount ?? d.maxSessionCount} />
      <Field label="Max Session Time (min)" value={as.maxSessionTimeMin ?? d.maxSessionTimeMin} />
    </SettingsSection>
  )
}

// ─── Logging and Reporting Settings ───────────────────────────────────────────

function LoggingReportingSection({ data: lr }: { data: LoggingAndReportingSettings }) {
  const le = lr.logExportAndReporting
  const d = DEFAULTS.loggingAndReporting

  return (
    <SettingsSection title="Logging and Reporting Settings">
      <QuotaField label="Device Quota Storage" entries={lr.singleDiskStorage.entries} />
      <QuotaField label="Session Log Quota Storage" entries={lr.multiDiskStorage.sessionLogStorage.entries} />
      <QuotaField label="Management Log Quota Storage" entries={lr.multiDiskStorage.managementLogStorage.entries} />
      <Field label="Number of Versions for Config Audit" value={le.numberOfVersionsForConfigAudit ?? d.numberOfVersionsForConfigAudit} />
      <Field label="Max Rows in CSV Export" value={le.maxRowsInCsvExport ?? d.maxRowsInCsvExport} />
      <Field label="Max Rows in User Activity Report" value={le.maxRowsInUserActivityReport ?? d.maxRowsInUserActivityReport} />
      <Field label="Average Browse Time (sec)" value={le.averageBrowseTimeSec ?? d.averageBrowseTimeSec} />
      <Field label="Page Load Threshold (sec)" value={le.pageLoadThresholdSec ?? d.pageLoadThresholdSec} />
      <Field label="Send HOSTNAME in Syslog" value={le.syslogHostnameFormat ?? d.syslogHostnameFormat} />
      <Field label="Report Runtime" value={le.reportRuntime ?? d.reportRuntime} />
      <Field label="Report Expiration Period (days)" value={le.reportExpirationPeriodDays} />
      <BoolField label="Stop Traffic when LogDb Full" checked={le.stopTrafficWhenLogDbFull} />
      <BoolField label="Enable Configuration Logs for Revert Operations" checked={le.enableConfigurationLogsForRevertOperations} />
      <BoolField label="Enable Threat Vault Access" checked={le.enableThreatVaultAccess} />
      <BoolField label="Enable Log on High DP Load" checked={le.enableLogOnHighDpLoad} />
      <BoolField label="Enable High Speed Log Forwarding" checked={le.enableHighSpeedLogForwarding} />
      <BoolField label="Support UTF-8 For Log Output" checked={le.supportUtf8ForLogOutput} />
      <BoolField label="Improved DNS Security Logging" checked={le.improvedDnsSecurityLogging} />
      <BoolField
        label="Log Admin Activity"
        checked={le.logAdminActivity.debugAndOperationalCommands || le.logAdminActivity.uiActions}
      />
    </SettingsSection>
  )
}

// ─── Log Interface ────────────────────────────────────────────────────────────

function LogInterfaceSection({ data: li }: { data: LogInterface }) {
  const d = DEFAULTS.logInterface
  return (
    <SettingsSection title="Log Interface">
      <Field label="IP Address" value={li.ipAddress} />
      <Field label="Netmask" value={li.netmask} />
      <Field label="Default Gateway" value={li.defaultGateway} />
      <Field label="IPv6 Address" value={li.ipv6Address} />
      <Field label="IPv6 Default Gateway" value={li.ipv6DefaultGateway} />
      <Field label="Link Speed" value={li.linkSpeed ?? d.linkSpeed} />
      <Field label="Link Duplex" value={li.linkDuplex ?? d.linkDuplex} />
      <Field label="Link State" value={li.linkState ?? d.linkState} />
    </SettingsSection>
  )
}

// ─── AutoFocus ────────────────────────────────────────────────────────────────

function AutoFocusSection({ data: af }: { data: AutoFocusSettings }) {
  const d = DEFAULTS.autoFocus
  return (
    <SettingsSection title="AutoFocus">
      <BoolField label="Enabled" checked={af.enabled} />
      <Field label="AutoFocus URL" value={af.autoFocusUrl ?? d.autoFocusUrl} />
      <Field label="Query Timeout (sec)" value={af.queryTimeoutSec ?? d.queryTimeoutSec} />
    </SettingsSection>
  )
}

// ─── Cloud Logging ────────────────────────────────────────────────────────────

function CloudLoggingSection({ data: cl }: { data: CloudLoggingSettings }) {
  const d = DEFAULTS.cloudLogging
  return (
    <SettingsSection title="Cloud Logging">
      <BoolField label="Enable cloud logging" checked={cl.enableCloudLogging} />
      <BoolField label="Enable duplicate logging (cloud and on-premise)" checked={cl.enableDuplicateLogging} />
      <BoolField label="Enable enhanced application logging" checked={cl.enableEnhancedApplicationLogging} />
      <Field label="Region" value={cl.region} />
      <Field
        label="Connection count to Strata Logging Service for PA-7000s, PA-5200s, and PA-5450s"
        value={cl.connectionCountStrataLoggingService ?? d.connectionCountStrataLoggingService}
      />
    </SettingsSection>
  )
}

// ─── Accounting Server Settings ───────────────────────────────────────────────

function AccountingServerSection({ data: as }: { data: AccountingServerSettings }) {
  return (
    <SettingsSection title="Accounting Server Settings">
      <Field label="Accounting Server Profile" value={as.accountingServerProfile} />
    </SettingsSection>
  )
}

// ─── SSH Management Profile Setting ───────────────────────────────────────────

function SshManagementSection({ data: ssh }: { data: SshManagementProfileSetting }) {
  return (
    <SettingsSection title="SSH Management Profile Setting">
      <Field label="Server Profile" value={ssh.serverProfile} />
    </SettingsSection>
  )
}

// ─── Panorama Settings ────────────────────────────────────────────────────────

function PanoramaSection({ data: ps }: { data: PanoramaSettings }) {
  const d = DEFAULTS.panoramaSettings

  const managedByLines: string[] = []
  if (ps.managedBy === "local") {
    managedByLines.push("Panorama")
    if (ps.panoramaServer) managedByLines.push(`Panorama Server 1: ${ps.panoramaServer}`)
    if (ps.panoramaServer2) managedByLines.push(`Panorama Server 2: ${ps.panoramaServer2}`)
  } else if (ps.managedBy === "cloud") {
    managedByLines.push("Cloud Service")
  }

  return (
    <SettingsSection title="Panorama Settings">
      {managedByLines.length > 0 ? (
        <div className="flex gap-3 py-px">
          <span className="w-72 shrink-0 text-right text-xs text-muted-foreground">Managed By</span>
          <div className="flex flex-col gap-0.5">
            {managedByLines.map((line) => (
              <span key={line} className="text-xs">{line}</span>
            ))}
          </div>
        </div>
      ) : (
        <Field label="Managed By" value={null} />
      )}
      <BoolField label="Enable pushing device monitoring data to Panorama" checked={ps.enablePushingDeviceMonitoringData} />
      <Field label="Receive Timeout for Connection to Panorama (sec)" value={ps.receiveTimeoutSec ?? d.receiveTimeoutSec} />
      <Field label="Send Timeout for Connection to Panorama (sec)" value={ps.sendTimeoutSec ?? d.sendTimeoutSec} />
      <Field label="Retry Count for SSL Send to Panorama" value={ps.retryCountSslSend ?? d.retryCountSslSend} />
      <BoolField label="Enable automated commit recovery" checked={ps.enableAutomatedCommitRecovery} />
      <Field label="Number of attempts to check for Panorama connectivity on automated commit recovery" value={ps.commitRecoveryRetry ?? d.commitRecoveryRetry} />
      <Field label="Interval between retries (sec) on automated commit recovery" value={ps.commitRecoveryTimeoutSec ?? d.commitRecoveryTimeoutSec} />
    </SettingsSection>
  )
}

// ─── Secure Communication Settings ────────────────────────────────────────────

function SecureCommunicationSection({ data: sc }: { data: SecureCommunicationSettings }) {
  const c = sc.client
  const s = sc.server

  const certLines: string[] = []
  if (c.certificateType) {
    certLines.push(c.certificateType === "local" ? "Local" : "SCEP")
    if (c.certificate) certLines.push(`Certificate:${c.certificate}`)
    if (c.certificateProfile) certLines.push(`Certificate Profile:${c.certificateProfile}`)
  }

  return (
    <SettingsSection title="Secure Communication Settings">
      {certLines.length > 0 ? (
        <div className="flex gap-3 py-px">
          <span className="w-72 shrink-0 text-right text-xs text-muted-foreground">Certificate Type</span>
          <div className="flex flex-col gap-0.5">
            {certLines.map((line) => (
              <span key={line} className="text-xs">{line}</span>
            ))}
          </div>
        </div>
      ) : (
        <Field label="Certificate Type" value={DEFAULTS.secureCommunication.defaultCertificateType} />
      )}
      <BoolField label="PAN-DB Communication" checked={c.panDbCommunication} />
      <BoolField label="WildFire Communication" checked={c.wildFireCommunication} />
      <BoolField label="Check Server Identity" checked={c.checkServerIdentity} />
      <BoolField label="Log Collector Communication" checked={c.logCollectorCommunication} />
      <BoolField label="Data Redistribution(Client)" checked={c.dataRedistribution} />
      {s.enabled && (
        <>
          <Field label="SSL/TLS Service Profile" value={s.sslTlsServiceProfile} />
          <Field label="Certificate Profile" value={s.certificateProfile} />
          <BoolField label="Data Redistribution(Server)" checked={s.dataRedistribution} />
        </>
      )}
    </SettingsSection>
  )
}

// ─── Banners and Messages ─────────────────────────────────────────────────────

function BannersMessagesSection({ data: bm }: { data: BannersAndMessages }) {
  const motd = bm.messageOfTheDay
  const b = bm.banners
  const d = DEFAULTS.bannersAndMessages

  return (
    <SettingsSection title="Banners and Messages">
      <Field label="Message of the Day" value={motd.message} />
      <BoolField label="Allow Do Not Display Again" checked={motd.allowDoNotDisplayAgain} />
      <Field label="Title" value={motd.title ?? d.title} />
      <ColorSwatch label="Background Color" color={motd.backgroundColor} />
      <Field label="Icon" value={motd.icon} />
      <Field label="Header Banner" value={b.headerBanner} />
      <ColorSwatch label="Header Color" color={b.headerColor} />
      <ColorSwatch label="Header Text Color" color={b.headerTextColor} />
      <BoolField label="Banner Header Footer Match" checked={b.sameBannerForHeaderAndFooter} />
      <Field label="Footer Banner" value={b.footerBanner} />
      <ColorSwatch label="Footer Color" color={b.footerColor} />
      <ColorSwatch label="Footer Text Color" color={b.footerTextColor} />
    </SettingsSection>
  )
}

// ─── Minimum Password Complexity ──────────────────────────────────────────────

function PasswordComplexitySection({ data: pc }: { data: MinimumPasswordComplexity }) {
  const f = pc.format
  const fn = pc.functionality

  return (
    <SettingsSection title="Minimum Password Complexity">
      <BoolField label="Enabled" checked={pc.enabled} />
      <Field label="Minimum Length" value={f.minimumLength ?? 0} />
      <Field label="Minimum Uppercase Letters" value={f.minimumUppercaseLetters ?? 0} />
      <Field label="Minimum Lowercase Letters" value={f.minimumLowercaseLetters ?? 0} />
      <Field label="Minimum Numeric Letters" value={f.minimumNumericLetters ?? 0} />
      <Field label="Minimum Special Characters" value={f.minimumSpecialCharacters ?? 0} />
      <Field label="Block Repeated Characters" value={f.blockRepeatedCharacters ?? 0} />
      <BoolField label="Block Username Inclusion (including reversed)" checked={f.blockUsernameInclusion} />
      <Field label="New Password Differs By Characters" value={fn.newPasswordDiffersByCharacters ?? 0} />
      <BoolField label="Require Password Change on First Login" checked={fn.requirePasswordChangeOnFirstLogin} />
      <Field label="Prevent Password Reuse Limit" value={fn.preventPasswordReuseLimit ?? 0} />
      <Field label="Block Password Change Period (days)" value={fn.blockPasswordChangePeriodDays ?? 0} />
      <Field label="Required Password Change Period (days)" value={fn.requiredPasswordChangePeriodDays ?? 0} />
      <Field label="Expiration Warning Period (days)" value={fn.expirationWarningPeriodDays ?? 0} />
      <Field label="Post Expiration Admin Login Count" value={fn.postExpirationAdminLoginCount ?? 0} />
      <Field label="Post Expiration Grace Period (days)" value={fn.postExpirationGracePeriodDays ?? 0} />
    </SettingsSection>
  )
}

// ─── PAN-OS Edge Service Settings ─────────────────────────────────────────────

function EdgeServiceSection({ data: es }: { data: PanOsEdgeServiceSettings }) {
  const d = DEFAULTS.edgeServiceSettings
  return (
    <SettingsSection title="PAN-OS Edge Service Settings">
      <BoolField label="Enable third party device verdicts" checked={es.enableThirdPartyDeviceVerdicts} />
      <BoolField label="Enable User Context Cloud Service" checked={es.enableUserContextCloudService} />
      <Field label="Device-ID Operation Mode" value={es.deviceIdOperationMode ?? d.deviceIdOperationMode} />
      <BoolField label="Enable Cloud Host Compliance Service" checked={es.enableCloudHostComplianceService} />
    </SettingsSection>
  )
}

// ─── Advanced DNS Security ────────────────────────────────────────────────────

function DnsSecuritySection({ data: dns }: { data: AdvancedDnsSecurity }) {
  const d = DEFAULTS.advancedDnsSecurity
  return (
    <SettingsSection title="Advanced DNS Security">
      <Field label="DNS Security Server" value={dns.dnsSecurityServer ?? d.dnsSecurityServer} />
    </SettingsSection>
  )
}
