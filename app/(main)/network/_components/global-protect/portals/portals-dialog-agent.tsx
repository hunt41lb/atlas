// @/app/(main)/network/_components/global-protect/portals/portals-dialog-agent.tsx

"use client"

import * as React from "react"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DisplayField } from "@/components/ui/display-field"
import { Fieldset, FieldsetLegend, FieldsetContent } from "@/components/ui/fieldset"
import type {
  PanwGpPortal,
  PanwGpPortalConfigEntry,
  PanwGpAppConfig,
} from "@/lib/panw-parser/network/global-protect"

// ─── Label width ──────────────────────────────────────────────────────────────

const LW = "w-52"

// ─── Save User Credentials labels ─────────────────────────────────────────────

const SAVE_CREDENTIALS_LABELS: Record<number, string> = {
  0: "No",
  1: "Save Username Only",
  2: "Save Username and Password",
  3: "Only with User Fingerprint",
}

// ─── Cookie Lifetime Unit labels ──────────────────────────────────────────────

const COOKIE_LIFETIME_LABELS: Record<string, string> = {
  days: "Days",
  hours: "Hours",
  minutes: "Minutes",
}

// ─── App Config display labels (ordered to match PAN-OS GUI) ──────────────────

interface AppConfigRow {
  label: string
  key: keyof PanwGpAppConfig
  format?: "bool" | "number" | "string"
}

const APP_CONFIG_ROWS: AppConfigRow[] = [
  { label: "Connect Method", key: "connectMethod" },
  { label: "GlobalProtect App Config Refresh Interval (hours)", key: "refreshConfigInterval", format: "number" },
  { label: "Allow user to disconnect GlobalProtect App (Always-on mode)", key: "agentUserOverride" },
  { label: "Display the following reasons to disconnect GlobalProtect (Always-on mode)", key: "disconnectReasons" },
  { label: "Allow User to Uninstall GlobalProtect App (Windows Only)", key: "uninstall" },
  { label: "Allow User to Upgrade GlobalProtect App", key: "clientUpgrade" },
  { label: "Allow user to Sign Out from GlobalProtect App", key: "enableSignout", format: "bool" },
  { label: "Allow user to extend GlobalProtect User Session", key: "allowExtendSession", format: "bool" },
  { label: "Use Single Sign-on (Windows)", key: "useSso", format: "bool" },
  { label: "Use Single Sign-on for Smart card PIN (Windows)", key: "useSsoPin", format: "bool" },
  { label: "Use Single Sign-on (macOS)", key: "useSsoMacos", format: "bool" },
  { label: "Clear Single Sign-On Credentials on Logout (Windows Only)", key: "logoutRemoveSso", format: "bool" },
  { label: "Use Default Authentication on Kerberos Authentication Failure", key: "krbAuthFailFallback", format: "bool" },
  { label: "Use Default Browser for SAML Authentication", key: "defaultBrowser", format: "bool" },
  { label: "Automatic Restoration of VPN Connection Timeout (min)", key: "retryTunnel", format: "number" },
  { label: "Wait Time Between VPN Connection Restore Attempts (sec)", key: "retryTimeout", format: "number" },
  { label: "Endpoint Traffic Policy Enforcement", key: "trafficEnforcement" },
  { label: "Enforce GlobalProtect Connection for Network Access", key: "enforceGlobalprotect", format: "bool" },
  { label: "Captive Portal Exception Timeout (sec)", key: "captivePortalExceptionTimeout", format: "number" },
  { label: "Use Default Browser for Captive Portal", key: "captivePortalUsingDefaultBrowser", format: "bool" },
  { label: "Traffic Blocking Notification Delay (sec)", key: "trafficBlockingNotificationDelay", format: "number" },
  { label: "Display Traffic Blocking Notification Message", key: "displayTrafficBlockingNotificationMsg", format: "bool" },
  { label: "Traffic Blocking Notification Message", key: "trafficBlockingNotificationMsg" },
  { label: "Allow User to Dismiss Traffic Blocking Notifications", key: "allowTrafficBlockingNotificationDismissal", format: "bool" },
  { label: "Display Captive Portal Detection Message", key: "displayCaptivePortalDetectionMsg", format: "bool" },
  { label: "Captive Portal Detection Message", key: "captivePortalDetectionMsg" },
  { label: "Captive Portal Notification Delay (sec)", key: "captivePortalNotificationDelay", format: "number" },
  { label: "Client Certificate Store Lookup", key: "certificateStoreLookup" },
  { label: "SCEP Certificate Renewal Period (days)", key: "scepCertificateRenewalPeriod", format: "number" },
  { label: "Enable Strict Certificate Check", key: "fullChainCertVerify", format: "bool" },
  { label: "Retain Connection on Smart Card Removal", key: "retainConnectionSmartcardRemoval", format: "bool" },
  { label: "Enable Advanced View", key: "enableAdvancedView", format: "bool" },
  { label: "Allow User to Dismiss Welcome Page", key: "enableDoNotDisplayWelcomePageAgain", format: "bool" },
  { label: "Have User Accept Terms Of Use before Creating Tunnel", key: "userAcceptTermsBeforeCreatingTunnel", format: "bool" },
  { label: "Enable Rediscover Network Option", key: "rediscoverNetwork", format: "bool" },
  { label: "Enable GlobalProtect Discovery for Network Transition", key: "wifiToWiredTransition", format: "bool" },
  { label: "Enable Resubmit Host Profile Option", key: "resubmitHostInfo", format: "bool" },
  { label: "Enable Intelligent Portal Selection", key: "intelligentPortal", format: "bool" },
  { label: "Allow User to Change Portal Address", key: "canChangePortal", format: "bool" },
  { label: "Allow User to Continue with Invalid Portal Server Certificate", key: "canContinueIfPortalCertInvalid", format: "bool" },
  { label: "Allow Gateway Access from GlobalProtect Only", key: "accessGatewayFromAgentOnly", format: "bool" },
  { label: "Display GlobalProtect Icon", key: "showAgentIcon", format: "bool" },
  { label: "User Switch Tunnel Rename Timeout (sec)", key: "userSwitchTunnelRenameTimeout", format: "number" },
  { label: "Pre-Logon Tunnel Rename Timeout (sec) (Windows Only)", key: "preLogonTunnelRenameTimeout", format: "number" },
  { label: "Enable Cache Portal Configuration in Absence of Pre-logon Tunnel", key: "enableCachePortalConfigAbsencePrelogonTunnel", format: "bool" },
  { label: "Preserve Tunnel on User Logoff Timeout (sec)", key: "preserveTunnelUponUserLogoffTimeout", format: "number" },
  { label: "Custom Password Expiration Message (LDAP Authentication Only)", key: "passwordExpiryMessage" },
  { label: "Automatically Use SSL When IPSec Is Unreliable (hours)", key: "ipsecFailoverSsl", format: "number" },
  { label: "Display IPSec to SSL Fallback Notification", key: "displayTunnelFallbackNotification", format: "bool" },
  { label: "GlobalProtect Connection MTU (bytes)", key: "tunnelMtu", format: "number" },
  { label: "Maximum Internal Gateway Connection Attempts", key: "maxInternalGatewayConnectionAttempts", format: "number" },
  { label: "Enable Advanced Internal Host Detection", key: "advInternalHostDetection", format: "bool" },
  { label: "Enable Intelligent Internal Host Detection", key: "delaysInternalHostDetection", format: "bool" },
  { label: "Enable Unified user-id in Internal Network", key: "unifiedUserIdHybridDeployment", format: "bool" },
  { label: "Portal Connection Timeout (sec)", key: "portalTimeout", format: "number" },
  { label: "TCP Connection Timeout (sec)", key: "connectTimeout", format: "number" },
  { label: "TCP Receive Timeout (sec)", key: "receiveTimeout", format: "number" },
  { label: "Split-Tunnel Option", key: "splitTunnelOption" },
  { label: "Resolve All FQDNs Using the Tunnel DNS Server (iOS only)", key: "splitTunnelOptionMobile" },
  { label: "Enhanced Split-Tunnel Client Certificate Public Key", key: "advancedStPublicKey" },
  { label: "Resolve All FQDNs Using DNS Servers Assigned by the Tunnel (Windows Only)", key: "enforceDns", format: "bool" },
  { label: "Append Local Search Domains to Tunnel DNS Suffixes (Mac Only)", key: "appendLocalSearchDomain", format: "bool" },
  { label: "Local Proxy Port", key: "agentProxyPort", format: "number" },
  { label: "Detect Proxy for Each Connection (Windows & Mac Only)", key: "proxyMultipleAutodetect", format: "bool" },
  { label: "Set Up Tunnel Over Proxy (Windows & Mac Only)", key: "useProxy", format: "bool" },
  { label: "HIP Process Remediation Timeout (sec)", key: "enableHipRemediation", format: "number" },
  { label: "HIP Process Remediation Retry", key: "hipRemediationRetry", format: "number" },
  { label: "Enable Inbound Authentication Prompts from MFA Gateways", key: "mfaEnabled", format: "bool" },
  { label: "Network Port for Inbound Authentication Prompts (UDP)", key: "mfaListeningPort", format: "number" },
  { label: "Inbound Authentication Message", key: "mfaNotificationMsg" },
  { label: "Suppress Multiple Inbound MFA Prompts (sec)", key: "mfaPromptSuppressTime", format: "number" },
  { label: "IPv6 Preferred", key: "ipv6Preferred", format: "bool" },
  { label: "Change Password Message", key: "changePasswordMessage" },
  { label: "Best Gateway Selection Criteria", key: "measuringEgwTcpConnection", format: "bool" },
  { label: "Log Gateway Selection Criteria", key: "logGateway", format: "bool" },
  { label: "Enable Autonomous DEM and GlobalProtect App Log Collection for Troubleshooting", key: "cdlLog", format: "bool" },
  { label: "Display Autonomous DEM Updates Notification", key: "demNotification", format: "bool" },
  { label: "Autonomous DEM endpoint agent for Prisma Access (Windows & MAC only)", key: "demAgent" },
  { label: "Access Experience (ADEM, App Acceleration, End user coaching) (Windows & MAC only)", key: "demAgentAction" },
  { label: "Device Added to Quarantine Message", key: "quarantineAddMessage" },
  { label: "Device Removed from Quarantine Message", key: "quarantineRemoveMessage" },
  { label: "Display Status Panel at Startup (Windows Only)", key: "initPanel", format: "bool" },
  { label: "Allow GlobalProtect UI to Persist for User Input", key: "userInputOnTop", format: "bool" },
  { label: "Allow users to disable Connect Before Logon", key: "allowDisableCbl", format: "bool" },
]

function formatAppValue(value: unknown, format?: string): string {
  if (value === null || value === undefined) return ""
  if (format === "bool") return value ? "Yes" : "No"
  if (format === "number") return String(value)
  return String(value)
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIG DETAIL DIALOG — sub-tabs
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Authentication sub-tab ───────────────────────────────────────────────────

function AuthenticationSubTab({ config }: { config: PanwGpPortalConfigEntry }) {
  const auth = config.authentication
  const ao = auth.authOverride

  // Determine client cert type label
  const certTypeLabel = auth.clientCertificateType === "local" ? "Local"
    : auth.clientCertificateType === "SCEP" ? "SCEP"
    : "None"
  const showCertName = auth.clientCertificateType !== null && auth.clientCertificateType !== "None"

  return (
    <div className="space-y-4">
      <DisplayField label="Name" value={config.name} labelWidth={LW} />

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-foreground shrink-0 w-52">Client Certificate</span>
        <div className="flex items-center gap-2 flex-1">
          <span className="rounded border bg-muted/50 px-3 py-1 text-xs min-w-20">{certTypeLabel}</span>
          {showCertName && (
            <span className="rounded border bg-muted/50 px-3 py-1 text-xs flex-1">{auth.clientCertificateName ?? "—"}</span>
          )}
        </div>
      </div>

      <DisplayField label="Save User Credentials" value={SAVE_CREDENTIALS_LABELS[auth.saveUserCredentials ?? 0] ?? String(auth.saveUserCredentials)} labelWidth={LW} />

      <Fieldset>
        <FieldsetLegend>Authentication Override</FieldsetLegend>
        <FieldsetContent>
          <Label className="flex items-center gap-2 py-1 pl-1">
            <Checkbox checked={ao.generateCookie} disabled />
            <span className="text-xs">Generate cookie for authentication override</span>
          </Label>
          <Label className="flex items-center gap-2 py-1 pl-1">
            <Checkbox checked={ao.acceptCookie} disabled />
            <span className="text-xs">Accept cookie for authentication override</span>
          </Label>
          {ao.acceptCookie && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground shrink-0 w-52">Cookie Lifetime</span>
              <div className="flex items-center gap-2 flex-1">
                <span className="rounded border bg-muted/50 px-3 py-1 text-xs min-w-20">
                  {COOKIE_LIFETIME_LABELS[ao.cookieLifetimeUnit ?? ""] ?? ao.cookieLifetimeUnit ?? "—"}
                </span>
                <span className="rounded border bg-muted/50 px-3 py-1 text-xs flex-1 tabular-nums">
                  {ao.cookieLifetimeValue ?? "—"}
                </span>
              </div>
            </div>
          )}
          <DisplayField label="Certificate to Encrypt/Decrypt Cookie" value={ao.cookieEncryptDecryptCert ?? "None"} labelWidth={LW} />
        </FieldsetContent>
      </Fieldset>

      <Fieldset>
        <FieldsetLegend>Components that Require Dynamic Passwords (Two-Factor Authentication)</FieldsetLegend>
        <FieldsetContent>
          <div className="grid grid-cols-2 gap-2">
            <Label className="flex items-center gap-2 py-1 pl-1">
              <Checkbox checked={auth.twoFactor.portal} disabled />
              <span className="text-xs">Portal</span>
            </Label>
            <Label className="flex items-center gap-2 py-1 pl-1">
              <Checkbox checked={auth.twoFactor.manualOnlyGateway} disabled />
              <span className="text-xs">External gateways-manual only</span>
            </Label>
            <Label className="flex items-center gap-2 py-1 pl-1">
              <Checkbox checked={auth.twoFactor.internalGateway} disabled />
              <span className="text-xs">Internal gateways-all</span>
            </Label>
            <Label className="flex items-center gap-2 py-1 pl-1">
              <Checkbox checked={auth.twoFactor.autoDiscoveryExternalGateway} disabled />
              <span className="text-xs">External gateways-auto discovery</span>
            </Label>
          </div>
        </FieldsetContent>
      </Fieldset>
    </div>
  )
}

// ─── Config Selection Criteria sub-tab (with nested tabs) ─────────────────────

function ConfigSelectionSubTab({ config }: { config: PanwGpPortalConfigEntry }) {
  const cs = config.configSelection

  return (
    <Tabs defaultValue="user-group" className="flex-1 flex flex-col min-h-0">
      <div className="shrink-0 border-b">
        <TabsList variant="line">
          <TabsTrigger value="user-group">User/User Group</TabsTrigger>
          <TabsTrigger value="device-checks">Device Checks</TabsTrigger>
          <TabsTrigger value="custom-checks">Custom Checks</TabsTrigger>
        </TabsList>
      </div>

      <div className="flex-1 overflow-y-auto pt-4">
        <TabsContent value="user-group" className="h-87.5">
          <div className="grid grid-cols-2 gap-4 h-full">
            <div className="rounded-lg border overflow-hidden h-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[11px]">OS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(config.os.length === 0 ? ["Any"] : config.os).map((os) => (
                    <TableRow key={os}>
                      <TableCell className="text-xs">{os}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[11px]">USER/USER GROUP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(config.sourceUsers.length === 0 ? ["any"] : config.sourceUsers).map((user) => (
                    <TableRow key={user}>
                      <TableCell className="text-xs">{user}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="device-checks">
          <div className="space-y-4">
            <Fieldset>
              <FieldsetLegend>Serial Number Check</FieldsetLegend>
              <FieldsetContent>
                <DisplayField
                  label="Machine account exists with device serial number"
                  value={cs.machineAccountSerialNo ? "Yes" : "No"}
                  labelWidth={LW}
                />
              </FieldsetContent>
            </Fieldset>
            <Fieldset>
              <FieldsetLegend>Machine Certificate Check</FieldsetLegend>
              <FieldsetContent>
                <DisplayField label="Certificate Profile" value={cs.certificateProfile ?? "None"} labelWidth={LW} />
              </FieldsetContent>
            </Fieldset>
          </div>
        </TabsContent>

        <TabsContent value="custom-checks">
          <Fieldset>
            <FieldsetLegend>
              <Label className="flex items-center gap-2">
                <Checkbox checked={false} disabled />
                Custom Checks
              </Label>
            </FieldsetLegend>
            <FieldsetContent>
              <Tabs defaultValue="registry-key" className="w-full flex flex-col">
                <TabsList variant="line">
                  <TabsTrigger value="registry-key">Registry Key</TabsTrigger>
                  <TabsTrigger value="plist">Plist</TabsTrigger>
                </TabsList>
                <div className="pt-4">
                  <TabsContent value="registry-key">
                    <div className="rounded-lg border overflow-hidden opacity-50 w-full">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-[11px]">REGISTRY KEY</TableHead>
                            <TableHead className="text-[11px]">(DEFAULT) VALUE DATA</TableHead>
                            <TableHead className="text-[11px]">NEGATE</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell colSpan={3} className="py-6 text-center text-sm text-muted-foreground">
                              No registry keys configured.
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                  <TabsContent value="plist">
                    <div className="rounded-lg border overflow-hidden opacity-50 w-full">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-[11px]">PLIST</TableHead>
                            <TableHead className="text-[11px]">NEGATE</TableHead>
                            <TableHead className="text-[11px]">KEY</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell colSpan={3} className="py-6 text-center text-sm text-muted-foreground">
                              No plist entries configured.
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </FieldsetContent>
          </Fieldset>
        </TabsContent>
      </div>
    </Tabs>
  )
}

// ─── Internal sub-tab ─────────────────────────────────────────────────────────

function InternalSubTab({ config }: { config: PanwGpPortalConfigEntry }) {
  const int = config.internal

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Fieldset className="h-full">
          <FieldsetLegend>
            <Label className="flex items-center gap-2">
              <Checkbox checked={!!int.hostDetectionIpv4.ipAddress || !!int.hostDetectionIpv4.hostname} disabled />
              Internal Host Detection IPv4
            </Label>
          </FieldsetLegend>
          <FieldsetContent>
            <DisplayField label="IP Address" value={int.hostDetectionIpv4.ipAddress ?? "None"} />
            <DisplayField label="Hostname" value={int.hostDetectionIpv4.hostname ?? "None"} />
          </FieldsetContent>
        </Fieldset>
        <Fieldset className="h-full">
          <FieldsetLegend>
            <Label className="flex items-center gap-2">
              <Checkbox checked={!!int.hostDetectionIpv6.ipAddress || !!int.hostDetectionIpv6.hostname} disabled />
              Internal Host Detection IPv6
            </Label>
          </FieldsetLegend>
          <FieldsetContent>
            <DisplayField label="IP Address" value={int.hostDetectionIpv6.ipAddress ?? "None"} />
            <DisplayField label="Hostname" value={int.hostDetectionIpv6.hostname ?? "None"} />
          </FieldsetContent>
        </Fieldset>
      </div>

      <Fieldset>
        <FieldsetLegend>Internal Gateways</FieldsetLegend>
        <FieldsetContent>
          <div className="grid grid-cols-[1fr_auto] gap-0 rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[11px]">NAME</TableHead>
                  <TableHead className="text-[11px]">ADDRESS</TableHead>
                  <TableHead className="text-[11px]">SOURCE IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {int.gateways.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-6 text-center text-sm text-muted-foreground">
                      No internal gateways configured.
                    </TableCell>
                  </TableRow>
                ) : int.gateways.map((gw) => (
                  <TableRow key={gw.name}>
                    <TableCell className="text-xs font-medium">{gw.name}</TableCell>
                    <TableCell className="text-xs font-mono">{gw.fqdn ?? "—"}</TableCell>
                    <TableCell className="text-xs font-mono">{gw.sourceIps.join(", ") || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="border-l">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[11px]">DHCP OPTION 43 CODE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(int.gateways.length === 0 ? [null] : int.gateways).map((gw, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs text-muted-foreground">{gw ? "—" : ""}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </FieldsetContent>
      </Fieldset>
    </div>
  )
}

// ─── External sub-tab ─────────────────────────────────────────────────────────

function ExternalSubTab({ config }: { config: PanwGpPortalConfigEntry }) {
  const ext = config.external

  return (
    <div className="space-y-4">
      <DisplayField label="Cutoff Time (sec)" value={String(ext.cutoffTime ?? "—")} labelWidth={LW} />

      <Fieldset>
        <FieldsetLegend>External Gateways</FieldsetLegend>
        <FieldsetContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[11px]">NAME</TableHead>
                  <TableHead className="text-[11px]">ADDRESS</TableHead>
                  <TableHead className="text-[11px]">PRIORITY RULE</TableHead>
                  <TableHead className="text-[11px]">MANUAL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ext.gateways.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                      No external gateways configured.
                    </TableCell>
                  </TableRow>
                ) : ext.gateways.map((gw) => (
                  <TableRow key={gw.name}>
                    <TableCell className="text-xs font-medium">{gw.name}</TableCell>
                    <TableCell className="text-xs font-mono">{gw.fqdn ?? gw.ipv4 ?? "—"}</TableCell>
                    <TableCell className="text-xs">
                      {gw.priorityRules.map((pr) => `${pr.name} (Highest)`).join(", ") || "—"}
                    </TableCell>
                    <TableCell><Checkbox checked={gw.manual} disabled /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </FieldsetContent>
      </Fieldset>

      {ext.thirdPartyVpnClients.length > 0 && (
        <Fieldset>
          <FieldsetLegend>Third Party VPN</FieldsetLegend>
          <FieldsetContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[11px]">THIRD PARTY VPN</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ext.thirdPartyVpnClients.map((vpn) => (
                    <TableRow key={vpn}>
                      <TableCell className="text-xs">{vpn}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </FieldsetContent>
        </Fieldset>
      )}
    </div>
  )
}

// ─── App sub-tab (50/50 layout) ───────────────────────────────────────────────

function AppSubTab({ config }: { config: PanwGpPortalConfigEntry }) {
  const app = config.appConfig
  const ui = config.agentUi
  const mdm = config.mdm

  return (
    <div className="grid grid-cols-[1fr_1fr] gap-6">
      {/* Left 50% — App Configurations table */}
      <Fieldset className="min-h-0 min-w-0 overflow-hidden">
        <FieldsetLegend>App Configurations</FieldsetLegend>
        <FieldsetContent>
          <div className="rounded-lg border overflow-hidden max-h-105 overflow-y-auto">
            <Table>
              <TableBody>
                {APP_CONFIG_ROWS.map((row) => {
                  const value = app[row.key]
                  return (
                    <TableRow key={row.key}>
                      <TableCell className="text-xs py-1.5 w-1/2 wrap-break-word whitespace-normal">{row.label}</TableCell>
                      <TableCell className="text-xs py-1.5 font-mono wrap-break-word whitespace-normal">{formatAppValue(value, row.format)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </FieldsetContent>
      </Fieldset>

      {/* Right 50% — Welcome Page, Disconnect, Uninstall, MDM */}
      <div className="space-y-4">
        <DisplayField label="Welcome Page" value={ui.welcomePage ?? "factory-default"} />

        <Fieldset>
          <FieldsetLegend>Disconnect GlobalProtect App (Always-on mode)</FieldsetLegend>
          <FieldsetContent>
            <DisplayField label="Passcode" value={ui.hasPasscode ? "••••••••" : "—"} />
            {ui.hasPasscode && <DisplayField label="Confirm Passcode" value="••••••••" />}
            <DisplayField label="Max Times User Can Disconnect" value={String(ui.maxAgentUserOverrides ?? "—")} />
            <DisplayField label="Disconnect Timeout (min)" value={String(ui.agentUserOverrideTimeout ?? "—")} />
          </FieldsetContent>
        </Fieldset>

        <Fieldset>
          <FieldsetLegend>Uninstall GlobalProtect App</FieldsetLegend>
          <FieldsetContent>
            <DisplayField label="Uninstall Password" value={ui.hasUninstallPassword ? "••••••••" : "—"} />
            {ui.hasUninstallPassword && <DisplayField label="Confirm Uninstall Password" value="••••••••" />}
          </FieldsetContent>
        </Fieldset>

        <Fieldset>
          <FieldsetLegend>Mobile Security Manager Settings</FieldsetLegend>
          <FieldsetContent>
            <DisplayField label="Mobile Security Manager" value={mdm.address ?? "None"} />
            <DisplayField label="Enrollment Port" value={String(mdm.enrollmentPort ?? 443)} />
          </FieldsetContent>
        </Fieldset>
      </div>
    </div>
  )
}

// ─── HIP Data Collection sub-tab (with Exclude Categories + Custom Checks) ───

function HipDataCollectionSubTab({ config }: { config: PanwGpPortalConfigEntry }) {
  const hip = config.hipCollection

  return (
    <div className="space-y-4">
      <Label className="flex items-center gap-2 py-1 pl-1">
        <Checkbox checked={hip.collectHipData} disabled />
        <span className="text-xs">Collect HIP Data</span>
      </Label>

      {hip.collectHipData && (
        <>
          <DisplayField label="Max Wait Time (sec)" value={String(hip.maxWaitTime ?? "—")} labelWidth={LW} />

          <Fieldset>
            <FieldsetLegend>Certificate Profile for HIP Processing</FieldsetLegend>
            <FieldsetContent>
              <DisplayField label="Certificate Profile" value={hip.certificateProfile ?? "None"} labelWidth={LW} />
            </FieldsetContent>
          </Fieldset>

          <Tabs defaultValue="exclude-categories" className="flex-1 flex flex-col min-h-0">
            <div className="shrink-0 border-b">
              <TabsList variant="line">
                <TabsTrigger value="exclude-categories">Exclude Categories</TabsTrigger>
                <TabsTrigger value="custom-checks">Custom Checks</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto pt-4">
              <TabsContent value="exclude-categories">
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[11px]">CATEGORY</TableHead>
                        <TableHead className="text-[11px]">VENDOR</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hip.exclusionCategories.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={2} className="py-6 text-center text-sm text-muted-foreground">
                            No exclusion categories configured.
                          </TableCell>
                        </TableRow>
                      ) : hip.exclusionCategories.map((cat) => (
                        <TableRow key={cat.name}>
                          <TableCell className="text-xs">{cat.name}</TableCell>
                          <TableCell className="text-xs">
                            {cat.vendors.map((v) => `${v.name}: ${v.products.join(", ")}`).join("; ") || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="custom-checks">
                <Tabs defaultValue="windows" className="flex-1 flex flex-col min-h-0">
                  <div className="shrink-0 border-b">
                    <TabsList variant="line">
                      <TabsTrigger value="windows">Windows</TabsTrigger>
                      <TabsTrigger value="mac">Mac</TabsTrigger>
                      <TabsTrigger value="linux">Linux</TabsTrigger>
                    </TabsList>
                  </div>
                  <div className="flex-1 overflow-y-auto pt-4">
                    <TabsContent value="windows">
                      <div className="space-y-4">
                        <div className="rounded-lg border overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-[11px]">REGISTRY KEY</TableHead>
                                <TableHead className="text-[11px]">REGISTRY VALUE</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell colSpan={2} className="py-6 text-center text-sm text-muted-foreground">
                                  No registry keys configured.
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                        <div className="rounded-lg border overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-[11px]">PROCESS LIST</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell className="py-6 text-center text-sm text-muted-foreground">
                                  No processes configured.
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="mac">
                      <div className="space-y-4">
                        <div className="rounded-lg border overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-[11px]">PLIST</TableHead>
                                <TableHead className="text-[11px]">KEY</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell colSpan={2} className="py-6 text-center text-sm text-muted-foreground">
                                  No plist entries configured.
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                        <div className="rounded-lg border overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-[11px]">PROCESS LIST</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell className="py-6 text-center text-sm text-muted-foreground">
                                  No processes configured.
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="linux">
                      <div className="rounded-lg border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-[11px]">PROCESS LIST</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="py-6 text-center text-sm text-muted-foreground">
                                No processes configured.
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </TabsContent>
            </div>
          </Tabs>
        </>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIG DETAIL DIALOG
// ═══════════════════════════════════════════════════════════════════════════════

function ConfigDetailDialog({
  config,
  open,
  onOpenChange,
}: {
  config: PanwGpPortalConfigEntry | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!config) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[85vw] h-[min(90vh,620px)] flex flex-col gap-0 p-0 overflow-hidden"
      >
        <DialogHeader className="shrink-0 border-b px-4 py-3">
          <DialogTitle>Configs</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="authentication" className="flex-1 flex flex-col min-h-0">
          <div className="shrink-0 border-b px-4">
            <TabsList variant="line">
              <TabsTrigger value="authentication">Authentication</TabsTrigger>
              <TabsTrigger value="config-selection">Config Selection Criteria</TabsTrigger>
              <TabsTrigger value="internal">Internal</TabsTrigger>
              <TabsTrigger value="external">External</TabsTrigger>
              <TabsTrigger value="app">App</TabsTrigger>
              <TabsTrigger value="hip">HIP Data Collection</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            <TabsContent value="authentication"><AuthenticationSubTab config={config} /></TabsContent>
            <TabsContent value="config-selection"><ConfigSelectionSubTab config={config} /></TabsContent>
            <TabsContent value="internal"><InternalSubTab config={config} /></TabsContent>
            <TabsContent value="external"><ExternalSubTab config={config} /></TabsContent>
            <TabsContent value="app"><AppSubTab config={config} /></TabsContent>
            <TabsContent value="hip"><HipDataCollectionSubTab config={config} /></TabsContent>
          </div>
        </Tabs>

        <div className="shrink-0 border-t bg-muted/50 rounded-b-xl px-4 py-3 flex justify-end">
          <DialogClose render={<Button variant="outline" size="sm">Close</Button>} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// AGENT TAB (rendered inside the main portal dialog)
// ═══════════════════════════════════════════════════════════════════════════════

export function AgentTab({ portal }: { portal: PanwGpPortal }) {
  const agent = portal.agentConfig
  const [selectedConfig, setSelectedConfig] = React.useState<PanwGpPortalConfigEntry | null>(null)

  return (
    <>
      <div className="space-y-4">
        {/* Configs table */}
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[11px]">CONFIGS</TableHead>
                <TableHead className="text-[11px]">USER/USER GROUP</TableHead>
                <TableHead className="text-[11px]">OS</TableHead>
                <TableHead className="text-[11px]">EXTERNAL GATEWAYS</TableHead>
                <TableHead className="text-[11px]">CLIENT CERTIFICATE</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agent.configs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                    No configs configured.
                  </TableCell>
                </TableRow>
              ) : agent.configs.map((cfg) => (
                <TableRow
                  key={cfg.name}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedConfig(cfg)}
                >
                  <TableCell className="text-xs font-medium">{cfg.name}</TableCell>
                  <TableCell className="text-xs">{cfg.sourceUsers.join(", ") || "any"}</TableCell>
                  <TableCell className="text-xs">{cfg.os.join(", ") || "Any"}</TableCell>
                  <TableCell className="text-xs">
                    <div className="flex flex-col gap-0.5">
                      {cfg.external.gateways.map((gw) => (
                        <span key={gw.name}>{gw.name}</span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">{cfg.authentication.clientCertificateType ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Root CAs table */}
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[11px]">TRUSTED ROOT CA</TableHead>
                <TableHead className="text-[11px]">INSTALL IN LOCAL ROOT CERTIFICATE STORE</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agent.rootCas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="py-6 text-center text-sm text-muted-foreground">
                    No trusted root CAs configured.
                  </TableCell>
                </TableRow>
              ) : agent.rootCas.map((ca) => (
                <TableRow key={ca.name}>
                  <TableCell className="text-xs">{ca.name}</TableCell>
                  <TableCell><Checkbox checked={ca.installInCertStore} disabled /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Agent User Override Key */}
        <div className="flex items-center gap-4">
          <DisplayField label="Agent User Override Key" value={agent.hasAgentUserOverrideKey ? "••••••••" : "—"} labelWidth={LW} />
          {agent.hasAgentUserOverrideKey && (
            <DisplayField label="Confirm Agent User Override Key" value="••••••••" labelWidth={LW} />
          )}
        </div>
      </div>

      <ConfigDetailDialog
        config={selectedConfig}
        open={selectedConfig !== null}
        onOpenChange={(open) => { if (!open) setSelectedConfig(null) }}
      />
    </>
  )
}
