// @/app/(main)/network/_components/global-protect/gateways/gateways-dialog-agent.tsx

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DetailDialog } from "@/components/ui/detail-dialog"
import { DisplayField } from "@/components/ui/display-field"
import { Fieldset, FieldsetLegend, FieldsetContent } from "@/components/ui/fieldset"
import type {
  PanwGpGateway,
  PanwGpGatewayConfigEntry,
  PanwGpHipNotification,
} from "@/lib/panw-parser/network/global-protect"

// ─── Label width ──────────────────────────────────────────────────────────────

const LW = "w-52"

// ─── Cookie Lifetime Unit labels ──────────────────────────────────────────────

const COOKIE_LIFETIME_LABELS: Record<string, string> = {
  days: "Days",
  hours: "Hours",
  minutes: "Minutes",
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGS DETAIL DIALOG — 5 sub-tabs
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Config Selection Criteria ────────────────────────────────────────────────

function ConfigSelectionTab({ config }: { config: PanwGpGatewayConfigEntry }) {
  return (
    <div className="space-y-4">
      <DisplayField label="Name" value={config.name} labelWidth={LW} />

      <Fieldset>
        <FieldsetLegend>Config Selection Criteria</FieldsetLegend>
        <FieldsetContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[11px]">SOURCE USER</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(config.sourceUsers.length === 0 ? ["any"] : config.sourceUsers).map((u) => (
                    <TableRow key={u}><TableCell className="text-xs">{u}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[11px]">OS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(config.os.length === 0 ? ["Any"] : config.os).map((o) => (
                    <TableRow key={o}><TableCell className="text-xs">{o}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </FieldsetContent>
      </Fieldset>

      <Fieldset>
        <FieldsetLegend>Source Address</FieldsetLegend>
        <FieldsetContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow><TableHead className="text-[11px]">REGION</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {config.sourceAddress.regions.length === 0 ? (
                    <TableRow><TableCell className="py-4 text-center text-xs text-muted-foreground">None</TableCell></TableRow>
                  ) : config.sourceAddress.regions.map((r) => (
                    <TableRow key={r}><TableCell className="text-xs">{r}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow><TableHead className="text-[11px]">IP ADDRESS</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {config.sourceAddress.ipAddresses.length === 0 ? (
                    <TableRow><TableCell className="py-4 text-center text-xs text-muted-foreground">None</TableCell></TableRow>
                  ) : config.sourceAddress.ipAddresses.map((ip) => (
                    <TableRow key={ip}><TableCell className="text-xs font-mono">{ip}</TableCell></TableRow>
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

// ─── Authentication Override ──────────────────────────────────────────────────

function AuthOverrideTab({ config }: { config: PanwGpGatewayConfigEntry }) {
  const ao = config.authOverride

  return (
    <div className="space-y-4">
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
    </div>
  )
}

// ─── IP Pools ─────────────────────────────────────────────────────────────────

function IpPoolsTab({ config }: { config: PanwGpGatewayConfigEntry }) {
  const ip = config.ipPools

  return (
    <div className="space-y-4">
      <Label className="flex items-center gap-2 py-1 pl-1">
        <Checkbox checked={ip.retrieveFramedIpAddress} disabled />
        <span className="text-xs">Retrieve Framed-IP-Address attribute from authentication server</span>
      </Label>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow><TableHead className="text-[11px]">AUTHENTICATION SERVER IP POOL</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {ip.authServerIpPool.length === 0 ? (
                <TableRow><TableCell className="py-6 text-center text-xs text-muted-foreground">None configured.</TableCell></TableRow>
              ) : ip.authServerIpPool.map((p) => (
                <TableRow key={p}><TableCell className="text-xs font-mono">{p}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow><TableHead className="text-[11px]">IP POOL</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {ip.ipPool.length === 0 ? (
                <TableRow><TableCell className="py-6 text-center text-xs text-muted-foreground">None configured.</TableCell></TableRow>
              ) : ip.ipPool.map((p) => (
                <TableRow key={p}><TableCell className="text-xs font-mono">{p}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

// ─── Split Tunnel ─────────────────────────────────────────────────────────────

function SplitTunnelTab({ config }: { config: PanwGpGatewayConfigEntry }) {
  const st = config.splitTunnel

  return (
    <Tabs defaultValue="access-route" className="w-full flex flex-col">
      <TabsList variant="line">
        <TabsTrigger value="access-route">Access Route</TabsTrigger>
        <TabsTrigger value="domain-app">Domain and Application</TabsTrigger>
      </TabsList>

      <div className="pt-4">
        <TabsContent value="access-route">
          <div className="space-y-4">
            <Label className="flex items-center gap-2 py-1 pl-1">
              <Checkbox checked={st.noDirectAccessToLocalNetwork} disabled />
              <span className="text-xs">No direct access to local network</span>
            </Label>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow><TableHead className="text-[11px]">INCLUDE</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {st.accessRoutes.length === 0 ? (
                      <TableRow><TableCell className="py-6 text-center text-xs text-muted-foreground">None configured.</TableCell></TableRow>
                    ) : st.accessRoutes.map((r) => (
                      <TableRow key={r}><TableCell className="text-xs font-mono">{r}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow><TableHead className="text-[11px]">EXCLUDE</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {st.excludeAccessRoutes.length === 0 ? (
                      <TableRow><TableCell className="py-6 text-center text-xs text-muted-foreground">None configured.</TableCell></TableRow>
                    ) : st.excludeAccessRoutes.map((r) => (
                      <TableRow key={r}><TableCell className="text-xs font-mono">{r}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="domain-app">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow><TableHead className="text-[11px]">INCLUDE DOMAIN</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {st.includeDomains.length === 0 ? (
                      <TableRow><TableCell className="py-6 text-center text-xs text-muted-foreground">None configured.</TableCell></TableRow>
                    ) : st.includeDomains.map((d) => (
                      <TableRow key={d}><TableCell className="text-xs font-mono">{d}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow><TableHead className="text-[11px]">EXCLUDE DOMAIN</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {st.excludeDomains.length === 0 ? (
                      <TableRow><TableCell className="py-6 text-center text-xs text-muted-foreground">None configured.</TableCell></TableRow>
                    ) : st.excludeDomains.map((d) => (
                      <TableRow key={d}><TableCell className="text-xs font-mono">{d}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow><TableHead className="text-[11px]">INCLUDE CLIENT APPLICATION PROCESS NAME</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {st.includeApplications.length === 0 ? (
                      <TableRow><TableCell className="py-6 text-center text-xs text-muted-foreground">None configured.</TableCell></TableRow>
                    ) : st.includeApplications.map((a) => (
                      <TableRow key={a}><TableCell className="text-xs font-mono">{a}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow><TableHead className="text-[11px]">EXCLUDE CLIENT APPLICATION PROCESS NAME</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {st.excludeApplications.length === 0 ? (
                      <TableRow><TableCell className="py-6 text-center text-xs text-muted-foreground">None configured.</TableCell></TableRow>
                    ) : st.excludeApplications.map((a) => (
                      <TableRow key={a}><TableCell className="text-xs font-mono">{a}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  )
}

// ─── Network Services (config-level) ──────────────────────────────────────────

function ConfigNetworkServicesTab({ config }: { config: PanwGpGatewayConfigEntry }) {
  const ns = config.networkServices

  return (
    <div className="space-y-3">
      <DisplayField label="DNS Server" value={ns.dnsServers.join(", ") || "None"} labelWidth={LW} />
      <DisplayField label="DNS Suffix" value={ns.dnsSuffix.join(", ") || "None"} labelWidth={LW} />
    </div>
  )
}

// ─── Configs Detail Dialog ────────────────────────────────────────────────────

function ConfigDetailDialog({
  config,
  open,
  onOpenChange,
}: {
  config: PanwGpGatewayConfigEntry | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!config) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[80vw] h-[min(88vh,580px)] flex flex-col gap-0 p-0 overflow-hidden"
      >
        <DialogHeader className="shrink-0 border-b px-4 py-3">
          <DialogTitle>Configs</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="config-selection" className="flex-1 flex flex-col min-h-0">
          <div className="shrink-0 border-b px-4">
            <TabsList variant="line">
              <TabsTrigger value="config-selection">Config Selection Criteria</TabsTrigger>
              <TabsTrigger value="auth-override">Authentication Override</TabsTrigger>
              <TabsTrigger value="ip-pools">IP Pools</TabsTrigger>
              <TabsTrigger value="split-tunnel">Split Tunnel</TabsTrigger>
              <TabsTrigger value="network-services">Network Services</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            <TabsContent value="config-selection"><ConfigSelectionTab config={config} /></TabsContent>
            <TabsContent value="auth-override"><AuthOverrideTab config={config} /></TabsContent>
            <TabsContent value="ip-pools"><IpPoolsTab config={config} /></TabsContent>
            <TabsContent value="split-tunnel"><SplitTunnelTab config={config} /></TabsContent>
            <TabsContent value="network-services"><ConfigNetworkServicesTab config={config} /></TabsContent>
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
// HIP NOTIFICATION DETAIL DIALOG
// ═══════════════════════════════════════════════════════════════════════════════

function HipNotificationDialog({
  notification,
  open,
  onOpenChange,
}: {
  notification: PanwGpHipNotification | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!notification) return null

  return (
    <DetailDialog title="HIP Notification" open={open} onOpenChange={onOpenChange} maxWidth="sm:max-w-2xl">
      <DisplayField label="Host Information" value={notification.name} labelWidth={LW} />

      <Tabs defaultValue="match" className="w-full flex flex-col">
        <TabsList variant="line">
          <TabsTrigger value="match">Match Message</TabsTrigger>
          <TabsTrigger value="not-match">Not Match Message</TabsTrigger>
        </TabsList>

        <div className="pt-4">
          <TabsContent value="match">
            <div className="space-y-3">
              <Label className="flex items-center gap-2 py-1 pl-1">
                <Checkbox checked={notification.matchMessage.enabled} disabled />
                <span className="text-xs">Enable</span>
              </Label>
              {notification.matchMessage.enabled && (
                <>
                  <Label className="flex items-center gap-2 py-1 pl-1">
                    <Checkbox checked={notification.matchMessage.includeAppList} disabled />
                    <span className="text-xs">Include Mobile App List</span>
                  </Label>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-foreground shrink-0 w-36">Show Notification As</span>
                    <RadioGroup value={notification.matchMessage.showNotificationAs ?? ""} disabled className="flex flex-row gap-4">
                      <Label className="flex items-center gap-1.5 text-xs font-normal">
                        <RadioGroupItem value="system-tray-balloon" />System Tray Balloon
                      </Label>
                      <Label className="flex items-center gap-1.5 text-xs font-normal">
                        <RadioGroupItem value="pop-up-message" />Pop Up Message
                      </Label>
                    </RadioGroup>
                  </div>
                  <DisplayField label="Template" value={notification.matchMessage.message ?? "None"} labelWidth="w-36" />
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="not-match">
            <div className="space-y-3">
              <Label className="flex items-center gap-2 py-1 pl-1">
                <Checkbox checked={notification.notMatchMessage.enabled} disabled />
                <span className="text-xs">Enable</span>
              </Label>
              {notification.notMatchMessage.enabled && (
                <>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-foreground shrink-0 w-36">Show Notification As</span>
                    <RadioGroup value={notification.notMatchMessage.showNotificationAs ?? ""} disabled className="flex flex-row gap-4">
                      <Label className="flex items-center gap-1.5 text-xs font-normal">
                        <RadioGroupItem value="system-tray-balloon" />System Tray Balloon
                      </Label>
                      <Label className="flex items-center gap-1.5 text-xs font-normal">
                        <RadioGroupItem value="pop-up-message" />Pop Up Message
                      </Label>
                    </RadioGroup>
                  </div>
                  <DisplayField label="Template" value={notification.notMatchMessage.message ?? "None"} labelWidth="w-36" />
                </>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </DetailDialog>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// AGENT TAB — 7 sub-tabs
// ═══════════════════════════════════════════════════════════════════════════════

// ─── 1. Tunnel Settings ───────────────────────────────────────────────────────

function TunnelSettingsTab({ gateway }: { gateway: PanwGpGateway }) {
  const ts = gateway.tunnelSettings

  return (
    <div className="space-y-4">
      <Fieldset>
        <FieldsetLegend>
          <Label className="flex items-center gap-2">
            <Checkbox checked={ts.tunnelMode} disabled />
            Tunnel Mode
          </Label>
        </FieldsetLegend>
        {ts.tunnelMode && (
          <FieldsetContent>
            <DisplayField label="Tunnel Interface" value={ts.tunnelInterface ?? "None"} labelWidth={LW} />
            <DisplayField label="Max User" value={String(ts.maxUser ?? "—")} labelWidth={LW} />

            <Label className="flex items-center gap-2 py-1 pl-1">
              <Checkbox checked={ts.enableIpsec} disabled />
              <span className="text-xs">Enable IPSec</span>
            </Label>

            <DisplayField label="GlobalProtect IPSec Crypto" value={ts.gpIpsecCrypto ?? "default"} labelWidth={LW} />

            <Label className="flex items-center gap-2 py-1 pl-1">
              <Checkbox checked={ts.enableXAuth} disabled />
              <span className="text-xs">Enable X-Auth Support</span>
            </Label>

            {ts.enableXAuth && (
              <>
                <DisplayField label="Group Name" value={ts.groupName ?? "None"} labelWidth={LW} />
                <DisplayField label="Group Password" value={ts.hasGroupPassword ? "••••••••" : "—"} labelWidth={LW} />
                {ts.hasGroupPassword && <DisplayField label="Confirm Group Password" value="••••••••" labelWidth={LW} />}
              </>
            )}

            <Label className="flex items-center gap-2 py-1 pl-1">
              <Checkbox checked={ts.skipAuthOnIkeRekey} disabled />
              <span className="text-xs">Skip Auth on IKE Rekey</span>
            </Label>
          </FieldsetContent>
        )}
      </Fieldset>
    </div>
  )
}

// ─── 2. Client Settings ───────────────────────────────────────────────────────

function ClientSettingsTab({ gateway }: { gateway: PanwGpGateway }) {
  const [selectedConfig, setSelectedConfig] = React.useState<PanwGpGatewayConfigEntry | null>(null)
  const configs = gateway.clientConfigs

  return (
    <>
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[11px]">CONFIGS</TableHead>
              <TableHead className="text-[11px]">USERS</TableHead>
              <TableHead className="text-[11px]">OS</TableHead>
              <TableHead className="text-[11px]">REGION</TableHead>
              <TableHead className="text-[11px]">IP ADDRESS</TableHead>
              <TableHead className="text-[11px]">IP POOL</TableHead>
              <TableHead className="text-[11px]">INCLUDE ACCESS ROUTE</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {configs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                  No client settings configured.
                </TableCell>
              </TableRow>
            ) : configs.map((cfg) => (
              <TableRow
                key={cfg.name}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => setSelectedConfig(cfg)}
              >
                <TableCell className="text-xs font-medium">{cfg.name}</TableCell>
                <TableCell className="text-xs">{cfg.sourceUsers.join(", ") || "any"}</TableCell>
                <TableCell className="text-xs">{cfg.os.join(", ") || "Any"}</TableCell>
                <TableCell className="text-xs">{cfg.sourceAddress.regions.join(", ") || "—"}</TableCell>
                <TableCell className="text-xs font-mono">{cfg.sourceAddress.ipAddresses.join(", ") || "—"}</TableCell>
                <TableCell className="text-xs font-mono">{cfg.ipPools.ipPool.join(", ") || "—"}</TableCell>
                <TableCell className="text-xs">
                  {cfg.splitTunnel.noDirectAccessToLocalNetwork && <div>No direct access to local network</div>}
                  {cfg.splitTunnel.accessRoutes.length > 0
                    ? <div>Access Routes: {cfg.splitTunnel.accessRoutes.join(", ")}</div>
                    : <div className="text-muted-foreground">Access Routes: Not defined</div>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfigDetailDialog
        config={selectedConfig}
        open={selectedConfig !== null}
        onOpenChange={(open) => { if (!open) setSelectedConfig(null) }}
      />
    </>
  )
}

// ─── 3. Client IP Pool ────────────────────────────────────────────────────────

function ClientIpPoolTab({ gateway }: { gateway: PanwGpGateway }) {
  const pool = gateway.clientIpPool

  return (
    <div className="grid grid-cols-2 gap-6">
      <Fieldset>
        <FieldsetLegend>
          <Label className="flex items-center gap-2">
            <Checkbox checked={pool.enableDhcp} disabled />
            Enable DHCP
          </Label>
        </FieldsetLegend>
        <FieldsetContent>
          <DisplayField label="Communication Timeout (sec)" value={String(pool.communicationTimeout ?? 5)} />
          <DisplayField label="Retry Times" value={String(pool.retryTimes ?? 0)} />
          <DisplayField label="DHCP Server Circuit ID" value={pool.dhcpServerCircuitId ?? "—"} />

          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[11px]">DHCP SERVER</TableHead>
                  <TableHead className="text-[11px]">TYPE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pool.dhcpServers.length === 0 ? (
                  <TableRow><TableCell colSpan={2} className="py-4 text-center text-xs text-muted-foreground">None configured.</TableCell></TableRow>
                ) : pool.dhcpServers.map((s) => (
                  <TableRow key={s.name}>
                    <TableCell className="text-xs">{s.name}</TableCell>
                    <TableCell className="text-xs">{s.type ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </FieldsetContent>
      </Fieldset>

      <Fieldset>
        <FieldsetLegend>Static IP Pools</FieldsetLegend>
        <FieldsetContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow><TableHead className="text-[11px]">IP POOL</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {pool.staticIpPools.length === 0 ? (
                  <TableRow><TableCell className="py-6 text-center text-xs text-muted-foreground">None configured.</TableCell></TableRow>
                ) : pool.staticIpPools.map((p) => (
                  <TableRow key={p}><TableCell className="text-xs font-mono">{p}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </FieldsetContent>
      </Fieldset>
    </div>
  )
}

// ─── 4. Network Services (gateway-level) ──────────────────────────────────────

function NetworkServicesTab({ gateway }: { gateway: PanwGpGateway }) {
  const ns = gateway.networkServices

  return (
    <div className="space-y-3">
      <DisplayField label="Inheritance Source" value={ns.inheritanceSource ?? "None"} labelWidth={LW} />
      <DisplayField label="Primary DNS" value={ns.primaryDns ?? "None"} labelWidth={LW} />
      <DisplayField label="Secondary DNS" value={ns.secondaryDns ?? "None"} labelWidth={LW} />
      <DisplayField label="Primary WINS" value={ns.primaryWins ?? "None"} labelWidth={LW} />
      <DisplayField label="Secondary WINS" value={ns.secondaryWins ?? "None"} labelWidth={LW} />

      <Label className="flex items-center gap-2 py-1 pl-1">
        <Checkbox checked={ns.inheritDnsSuffixes} disabled />
        <span className="text-xs">Inherit DNS Suffixes</span>
      </Label>

      <DisplayField label="DNS Suffix" value={ns.dnsSuffix.join(", ") || "None"} labelWidth={LW} />
    </div>
  )
}

// ─── 5. Connection Settings ───────────────────────────────────────────────────

function ConnectionSettingsTab({ gateway }: { gateway: PanwGpGateway }) {
  const cs = gateway.connectionSettings

  return (
    <div className="space-y-4">
      <Fieldset>
        <FieldsetLegend>Timeout Configuration</FieldsetLegend>
        <FieldsetContent>
          {cs.loginLifetimeUnit && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground shrink-0 w-52">Login Lifetime</span>
              <div className="flex items-center gap-2 flex-1">
                <span className="rounded border bg-muted/50 px-3 py-1 text-xs min-w-20">
                  {cs.loginLifetimeUnit === "hours" ? "Hours" : cs.loginLifetimeUnit === "days" ? "Days" : "Minutes"}
                </span>
                <span className="rounded border bg-muted/50 px-3 py-1 text-xs flex-1 tabular-nums">
                  {cs.loginLifetimeValue ?? "—"}
                </span>
              </div>
            </div>
          )}
          <DisplayField label="Notify Before Lifetime Expires (min)" value={String(cs.notifyBeforeLifetimeExpires ?? "—")} labelWidth={LW} />
          <DisplayField label="Login Lifetime Expiration Message" value={cs.lifetimeNotifyMessage ?? "—"} labelWidth={LW} />
          <DisplayField label="Inactivity Logout (min)" value={String(cs.inactivityLogout ?? "—")} labelWidth={LW} />
          <DisplayField label="Notify Before Inactivity Logout (min)" value={String(cs.notifyBeforeInactivityLogout ?? "—")} labelWidth={LW} />
          <DisplayField label="Inactivity Logout Message" value={cs.inactivityNotifyMessage ?? "—"} labelWidth={LW} />

          <Label className="flex items-center gap-2 py-1 pl-1">
            <Checkbox checked={cs.adminLogoutNotify} disabled />
            <span className="text-xs">Notify users on administrator initiated logout</span>
          </Label>

          <DisplayField label="Administrator Logout Message" value={cs.adminLogoutNotifyMessage ?? "—"} labelWidth={LW} />
        </FieldsetContent>
      </Fieldset>

      <Fieldset>
        <FieldsetLegend>Authentication Cookie Usage Restrictions</FieldsetLegend>
        <FieldsetContent>
          <Label className="flex items-center gap-2 py-1 pl-1">
            <Checkbox checked={cs.disallowAutomaticRestoration} disabled />
            <span className="text-xs">Disable Automatic Restoration of SSL VPN</span>
          </Label>

          <Label className="flex items-center gap-2 py-1 pl-1">
            <Checkbox checked={cs.sourceIpEnforcement} disabled />
            <span className="text-xs">Restrict Authentication Cookie Usage (for Automatic Restoration of VPN tunnel or Authentication Override) to:</span>
          </Label>

          {cs.sourceIpEnforcement && (
            <RadioGroup value={cs.sourceIpEnforcementType ?? "default"} disabled className="flex flex-row gap-4 pl-6">
              <Label className="flex items-center gap-1.5 text-xs font-normal">
                <RadioGroupItem value="default" />The original Source IP for which the authentication cookie was issued
              </Label>
              <Label className="flex items-center gap-1.5 text-xs font-normal">
                <RadioGroupItem value="network-range" />The original Source IP network range
              </Label>
            </RadioGroup>
          )}
        </FieldsetContent>
      </Fieldset>
    </div>
  )
}

// ─── 6. Video Traffic ─────────────────────────────────────────────────────────

function VideoTrafficTab({ gateway }: { gateway: PanwGpGateway }) {
  const vt = gateway.videoTraffic

  return (
    <div className="space-y-4">
      <Fieldset>
        <FieldsetLegend>
          <Label className="flex items-center gap-2">
            <Checkbox checked={vt.excludeVideoTraffic} disabled />
            Exclude video traffic from the tunnel (Windows and macOS only)
          </Label>
        </FieldsetLegend>
        {vt.excludeVideoTraffic && (
          <FieldsetContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow><TableHead className="text-[11px]">APPLICATIONS</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {vt.applications.length === 0 ? (
                    <TableRow><TableCell className="py-6 text-center text-xs text-muted-foreground">No applications configured.</TableCell></TableRow>
                  ) : vt.applications.map((app) => (
                    <TableRow key={app}><TableCell className="text-xs">{app}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </FieldsetContent>
        )}
      </Fieldset>
    </div>
  )
}

// ─── 7. HIP Notification ──────────────────────────────────────────────────────

function HipNotificationTab({ gateway }: { gateway: PanwGpGateway }) {
  const [selectedHip, setSelectedHip] = React.useState<PanwGpHipNotification | null>(null)
  const notifications = gateway.hipNotifications

  return (
    <>
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[11px]">HOST INFORMATION</TableHead>
              <TableHead className="text-[11px]">MATCH MESSAGE</TableHead>
              <TableHead className="text-[11px]">SHOW NOTIFICATION AS</TableHead>
              <TableHead className="text-[11px]">NOT MATCH MESSAGE</TableHead>
              <TableHead className="text-[11px]">SHOW NOTIFICATION AS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  No HIP notifications configured.
                </TableCell>
              </TableRow>
            ) : notifications.map((n) => (
              <TableRow
                key={n.name}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => setSelectedHip(n)}
              >
                <TableCell className="text-xs font-medium">{n.name}</TableCell>
                <TableCell><Checkbox checked={n.matchMessage.enabled} disabled /></TableCell>
                <TableCell className="text-xs">{n.matchMessage.showNotificationAs ?? "—"}</TableCell>
                <TableCell><Checkbox checked={n.notMatchMessage.enabled} disabled /></TableCell>
                <TableCell className="text-xs">{n.notMatchMessage.showNotificationAs ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <HipNotificationDialog
        notification={selectedHip}
        open={selectedHip !== null}
        onOpenChange={(open) => { if (!open) setSelectedHip(null) }}
      />
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// AGENT TAB (rendered inside the main gateway dialog)
// ═══════════════════════════════════════════════════════════════════════════════

export function GatewayAgentTab({ gateway }: { gateway: PanwGpGateway }) {
  return (
    <Tabs defaultValue="tunnel-settings" className="flex-1 flex flex-col min-h-0">
      <div className="shrink-0 border-b">
        <TabsList variant="line">
          <TabsTrigger value="tunnel-settings">Tunnel Settings</TabsTrigger>
          <TabsTrigger value="client-settings">Client Settings</TabsTrigger>
          <TabsTrigger value="client-ip-pool">Client IP Pool</TabsTrigger>
          <TabsTrigger value="network-services">Network Services</TabsTrigger>
          <TabsTrigger value="connection-settings">Connection Settings</TabsTrigger>
          <TabsTrigger value="video-traffic">Video Traffic</TabsTrigger>
          <TabsTrigger value="hip-notification">HIP Notification</TabsTrigger>
        </TabsList>
      </div>

      <div className="flex-1 overflow-y-auto pt-4">
        <TabsContent value="tunnel-settings"><TunnelSettingsTab gateway={gateway} /></TabsContent>
        <TabsContent value="client-settings"><ClientSettingsTab gateway={gateway} /></TabsContent>
        <TabsContent value="client-ip-pool"><ClientIpPoolTab gateway={gateway} /></TabsContent>
        <TabsContent value="network-services"><NetworkServicesTab gateway={gateway} /></TabsContent>
        <TabsContent value="connection-settings"><ConnectionSettingsTab gateway={gateway} /></TabsContent>
        <TabsContent value="video-traffic"><VideoTrafficTab gateway={gateway} /></TabsContent>
        <TabsContent value="hip-notification"><HipNotificationTab gateway={gateway} /></TabsContent>
      </div>
    </Tabs>
  )
}
