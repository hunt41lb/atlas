// @/app/(main)/device/_components/setup/management-view.tsx

"use client"

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
} from "@/lib/panw-parser/device/setup/management"

import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import { resolveDeviceData } from "@/app/(main)/_lib/resolve-config-data"

import { GeneralSettingsCard } from "./management/general-settings-card"
import { SettingsCard, Field, BoolField, QuotaField, ColorSwatch } from "./management/_shared"

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
        <GeneralSettingsCard generalSettings={sm.generalSettings} />
        <AuthenticationCard data={sm.authenticationSettings} />
        <LoggingReportingCard data={sm.loggingAndReportingSettings} />
        <LogInterfaceCard data={sm.logInterface} />
        <AutoFocusCard data={sm.autoFocus} />
        <CloudLoggingCard data={sm.cloudLogging} />
        <AccountingServerCard data={sm.accountingServerSettings} />
        <SshManagementCard data={sm.sshManagementProfileSetting} />
      </div>

      {/* Right column */}
      <div className="space-y-4">
        <PanoramaCard data={sm.panoramaSettings} />
        <SecureCommunicationCard data={sm.secureCommunicationSettings} />
        <BannersMessagesCard data={sm.bannersAndMessages} />
        <PasswordComplexityCard data={sm.minimumPasswordComplexity} />
        <EdgeServiceCard data={sm.panOsEdgeServiceSettings} />
        <DnsSecurityCard data={sm.advancedDnsSecurity} />
      </div>
    </div>
  )
}

// ─── Authentication Settings ──────────────────────────────────────────────────

function AuthenticationCard({ data: as }: { data: AuthenticationSettings }) {
  return (
    <SettingsCard title="Authentication Settings">
      <Field label="Authentication Profile" value={as.authenticationProfile} />
      <Field label="Authentication Profile (Non-UI)" value={as.nonUiAuthenticationProfile} />
      <Field label="Certificate Profile" value={as.certificateProfile} />
      <Field label="Idle Timeout (min)" value={as.idleTimeoutMin} />
      <Field label="API Key Lifetime (min)" value={as.apiKeyLifetimeMin} />
      <Field label="API Key Certificate" value={as.apiKeyCertificate} />
      <Field label="Failed Attempts" value={as.failedAttempts} />
      <Field label="Lockout Time (min)" value={as.lockoutTimeMin} />
      <Field label="Max Session Count (number)" value={as.maxSessionCount} />
      <Field label="Max Session Time (min)" value={as.maxSessionTimeMin} />
    </SettingsCard>
  )
}

// ─── Logging and Reporting Settings ───────────────────────────────────────────

function LoggingReportingCard({ data: lr }: { data: LoggingAndReportingSettings }) {
  const le = lr.logExportAndReporting

  return (
    <SettingsCard title="Logging and Reporting Settings">
      <QuotaField label="Device Quota Storage" entries={lr.singleDiskStorage.entries} />
      <QuotaField label="Session Log Quota Storage" entries={lr.multiDiskStorage.sessionLogStorage.entries} />
      <QuotaField label="Management Log Quota Storage" entries={lr.multiDiskStorage.managementLogStorage.entries} />
      <Field label="Number of Versions for Config Audit" value={le.numberOfVersionsForConfigAudit} />
      <Field label="Max Rows in CSV Export" value={le.maxRowsInCsvExport} />
      <Field label="Max Rows in User Activity Report" value={le.maxRowsInUserActivityReport} />
      <Field label="Average Browse Time (sec)" value={le.averageBrowseTimeSec} />
      <Field label="Page Load Threshold (sec)" value={le.pageLoadThresholdSec} />
      <Field label="Send HOSTNAME in Syslog" value={le.syslogHostnameFormat} />
      <Field label="Report Runtime" value={le.reportRuntime} />
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
    </SettingsCard>
  )
}

// ─── Log Interface ────────────────────────────────────────────────────────────

function LogInterfaceCard({ data: li }: { data: LogInterface }) {
  return (
    <SettingsCard title="Log Interface">
      <Field label="IP Address" value={li.ipAddress} />
      <Field label="Netmask" value={li.netmask} />
      <Field label="Default Gateway" value={li.defaultGateway} />
      <Field label="IPv6 Address" value={li.ipv6Address} />
      <Field label="IPv6 Default Gateway" value={li.ipv6DefaultGateway} />
      <Field label="Link Speed" value={li.linkSpeed} />
      <Field label="Link Duplex" value={li.linkDuplex} />
      <Field label="Link State" value={li.linkState} />
    </SettingsCard>
  )
}

// ─── AutoFocus ────────────────────────────────────────────────────────────────

function AutoFocusCard({ data: af }: { data: AutoFocusSettings }) {
  return (
    <SettingsCard title="AutoFocus">
      <BoolField label="Enabled" checked={af.enabled} />
      <Field label="AutoFocus URL" value={af.autoFocusUrl} />
      <Field label="Query Timeout (sec)" value={af.queryTimeoutSec} />
    </SettingsCard>
  )
}

// ─── Cloud Logging ────────────────────────────────────────────────────────────

function CloudLoggingCard({ data: cl }: { data: CloudLoggingSettings }) {
  return (
    <SettingsCard title="Cloud Logging">
      <BoolField label="Enable cloud logging" checked={cl.enableCloudLogging} />
      <BoolField label="Enable duplicate logging (cloud and on-premise)" checked={cl.enableDuplicateLogging} />
      <BoolField label="Enable enhanced application logging" checked={cl.enableEnhancedApplicationLogging} />
      <Field label="Region" value={cl.region} />
      <Field
        label="Connection count to Strata Logging Service for PA-7000s, PA-5200s, and PA-5450s"
        value={cl.connectionCountStrataLoggingService}
      />
    </SettingsCard>
  )
}

// ─── Accounting Server Settings ───────────────────────────────────────────────

function AccountingServerCard({ data: as }: { data: AccountingServerSettings }) {
  return (
    <SettingsCard title="Accounting Server Settings">
      <Field label="Accounting Server Profile" value={as.accountingServerProfile} />
    </SettingsCard>
  )
}

// ─── SSH Management Profile Setting ───────────────────────────────────────────

function SshManagementCard({ data: ssh }: { data: SshManagementProfileSetting }) {
  return (
    <SettingsCard title="SSH Management Profile Setting">
      <Field label="Server Profile" value={ssh.serverProfile} />
    </SettingsCard>
  )
}

// ─── Panorama Settings ────────────────────────────────────────────────────────

function PanoramaCard({ data: ps }: { data: PanoramaSettings }) {
  // Build "Managed By" display — PAN-OS shows type + server addresses
  const managedByLines: string[] = []
  if (ps.managedBy === "local") {
    managedByLines.push("Panorama")
    if (ps.panoramaServer) managedByLines.push(`Panorama Server 1: ${ps.panoramaServer}`)
    if (ps.panoramaServer2) managedByLines.push(`Panorama Server 2: ${ps.panoramaServer2}`)
  } else if (ps.managedBy === "cloud") {
    managedByLines.push("Cloud Service")
  }

  return (
    <SettingsCard title="Panorama Settings">
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
      <Field label="Receive Timeout for Connection to Panorama (sec)" value={ps.receiveTimeoutSec} />
      <Field label="Send Timeout for Connection to Panorama (sec)" value={ps.sendTimeoutSec} />
      <Field label="Retry Count for SSL Send to Panorama" value={ps.retryCountSslSend} />
      <BoolField label="Enable automated commit recovery" checked={ps.enableAutomatedCommitRecovery} />
      <Field label="Number of attempts to check for Panorama connectivity on automated commit recovery" value={ps.commitRecoveryRetry} />
      <Field label="Interval between retries (sec) on automated commit recovery" value={ps.commitRecoveryTimeoutSec} />
    </SettingsCard>
  )
}

// ─── Secure Communication Settings ────────────────────────────────────────────

function SecureCommunicationCard({ data: sc }: { data: SecureCommunicationSettings }) {
  const c = sc.client
  const s = sc.server

  // Build certificate type display — PAN-OS shows type + cert name + profile
  const certLines: string[] = []
  if (c.certificateType) {
    certLines.push(c.certificateType === "local" ? "Local" : "SCEP")
    if (c.certificate) certLines.push(`Certificate:${c.certificate}`)
    if (c.certificateProfile) certLines.push(`Certificate Profile:${c.certificateProfile}`)
  }

  return (
    <SettingsCard title="Secure Communication Settings">
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
        <Field label="Certificate Type" value={null} />
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
    </SettingsCard>
  )
}

// ─── Banners and Messages ─────────────────────────────────────────────────────

function BannersMessagesCard({ data: bm }: { data: BannersAndMessages }) {
  const motd = bm.messageOfTheDay
  const b = bm.banners

  return (
    <SettingsCard title="Banners and Messages">
      <Field label="Message of the Day" value={motd.message} />
      <BoolField label="Allow Do Not Display Again" checked={motd.allowDoNotDisplayAgain} />
      <Field label="Title" value={motd.title} />
      <ColorSwatch label="Background Color" color={motd.backgroundColor} />
      <Field label="Icon" value={motd.icon} />
      <Field label="Header Banner" value={b.headerBanner} />
      <ColorSwatch label="Header Color" color={b.headerColor} />
      <ColorSwatch label="Header Text Color" color={b.headerTextColor} />
      <BoolField label="Banner Header Footer Match" checked={b.sameBannerForHeaderAndFooter} />
      <Field label="Footer Banner" value={b.footerBanner} />
      <ColorSwatch label="Footer Color" color={b.footerColor} />
      <ColorSwatch label="Footer Text Color" color={b.footerTextColor} />
    </SettingsCard>
  )
}

// ─── Minimum Password Complexity ──────────────────────────────────────────────

function PasswordComplexityCard({ data: pc }: { data: MinimumPasswordComplexity }) {
  const f = pc.format
  const fn = pc.functionality

  return (
    <SettingsCard title="Minimum Password Complexity">
      <BoolField label="Enabled" checked={pc.enabled} />
      <Field label="Minimum Length" value={f.minimumLength} />
      <Field label="Minimum Uppercase Letters" value={f.minimumUppercaseLetters} />
      <Field label="Minimum Lowercase Letters" value={f.minimumLowercaseLetters} />
      <Field label="Minimum Numeric Letters" value={f.minimumNumericLetters} />
      <Field label="Minimum Special Characters" value={f.minimumSpecialCharacters} />
      <Field label="Block Repeated Characters" value={f.blockRepeatedCharacters} />
      <BoolField label="Block Username Inclusion (including reversed)" checked={f.blockUsernameInclusion} />
      <Field label="New Password Differs By Characters" value={fn.newPasswordDiffersByCharacters} />
      <BoolField label="Require Password Change on First Login" checked={fn.requirePasswordChangeOnFirstLogin} />
      <Field label="Prevent Password Reuse Limit" value={fn.preventPasswordReuseLimit} />
      <Field label="Block Password Change Period (days)" value={fn.blockPasswordChangePeriodDays} />
      <Field label="Required Password Change Period (days)" value={fn.requiredPasswordChangePeriodDays} />
      <Field label="Expiration Warning Period (days)" value={fn.expirationWarningPeriodDays} />
      <Field label="Post Expiration Admin Login Count" value={fn.postExpirationAdminLoginCount} />
      <Field label="Post Expiration Grace Period (days)" value={fn.postExpirationGracePeriodDays} />
    </SettingsCard>
  )
}

// ─── PAN-OS Edge Service Settings ─────────────────────────────────────────────

function EdgeServiceCard({ data: es }: { data: PanOsEdgeServiceSettings }) {
  return (
    <SettingsCard title="PAN-OS Edge Service Settings">
      <BoolField label="Enable third party device verdicts" checked={es.enableThirdPartyDeviceVerdicts} />
      <BoolField label="Enable User Context Cloud Service" checked={es.enableUserContextCloudService} />
      <Field label="Device-ID Operation Mode" value={es.deviceIdOperationMode} />
      <BoolField label="Enable Cloud Host Compliance Service" checked={es.enableCloudHostComplianceService} />
    </SettingsCard>
  )
}

// ─── Advanced DNS Security ────────────────────────────────────────────────────

function DnsSecurityCard({ data: dns }: { data: AdvancedDnsSecurity }) {
  return (
    <SettingsCard title="Advanced DNS Security">
      <Field label="DNS Security Server" value={dns.dnsSecurityServer} />
    </SettingsCard>
  )
}
