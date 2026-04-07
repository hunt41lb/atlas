// @/app/(main)/network/_components/ipsec-tunnels/ipsec-tunnels-dialog.tsx

"use client"

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DetailDialog } from "@/components/ui/detail-dialog"
import { DisplayField } from "@/components/ui/display-field"
import { Fieldset, FieldsetLegend, FieldsetContent } from "@/components/ui/fieldset"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type {
  PanwIpsecTunnel,
  PanwIpsecProxyId,
} from "@/lib/panw-parser/ipsec-tunnels"

// ─── Shared label width ───────────────────────────────────────────────────────

const LW = "w-48"

// ─── Proxy ID table (reused for IPv4 and IPv6) ───────────────────────────────

function ProxyIdTable({ proxyIds }: { proxyIds: PanwIpsecProxyId[] }) {
  if (proxyIds.length === 0) {
    return <span className="text-xs text-muted-foreground">No proxy IDs configured</span>
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-[11px]">Proxy ID</TableHead>
            <TableHead className="text-[11px]">Local</TableHead>
            <TableHead className="text-[11px]">Remote</TableHead>
            <TableHead className="text-[11px]">Protocol</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {proxyIds.map((pid) => {
            const proto = pid.protocol
            const parts: string[] = [proto.type]
            if (proto.localPort != null) parts.push(`Local Port:${proto.localPort}`)
            if (proto.remotePort != null) parts.push(`Remote Port:${proto.remotePort}`)
            if (proto.number != null) parts.push(`Protocol:${proto.number}`)

            return (
              <TableRow key={pid.name}>
                <TableCell className="text-xs">{pid.name}</TableCell>
                <TableCell className="text-xs font-mono">{pid.local ?? "—"}</TableCell>
                <TableCell className="text-xs font-mono">{pid.remote ?? "—"}</TableCell>
                <TableCell className="text-xs">
                  {parts.map((p) => (
                    <div key={p}>{p}</div>
                  ))}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

// ─── Auto Key General Tab ─────────────────────────────────────────────────────

function AutoKeyGeneralTab({ tunnel }: { tunnel: PanwIpsecTunnel }) {
  const ak = tunnel.autoKey!

  return (
    <div className="space-y-4">
      <DisplayField label="Name" value={tunnel.name} labelWidth={LW} />
      <DisplayField label="Tunnel Interface" value={tunnel.tunnelInterface ?? "None"} labelWidth={LW} />

      <div className="flex items-center gap-4">
        <span className={`text-sm font-medium text-foreground shrink-0 ${LW}`}>HW Crypto Acceleration</span>
        <RadioGroup value={tunnel.hwAcceleration ?? "none"} disabled className="flex flex-row gap-4">
          <Label className="flex items-center gap-1.5 text-xs">
            <RadioGroupItem value="none" />
            None
          </Label>
          <Label className="flex items-center gap-1.5 text-xs">
            <RadioGroupItem value="assist" />
            Assist
          </Label>
        </RadioGroup>
      </div>

      <div className="flex items-center gap-4">
        <span className={`text-sm font-medium text-foreground shrink-0 ${LW}`}>Type</span>
        <RadioGroup value="auto-key" disabled className="flex flex-row gap-4">
          <Label className="flex items-center gap-1.5 text-xs"><RadioGroupItem value="auto-key" />Auto Key</Label>
          <Label className="flex items-center gap-1.5 text-xs"><RadioGroupItem value="manual-key" />Manual Key</Label>
          <Label className="flex items-center gap-1.5 text-xs"><RadioGroupItem value="global-protect-satellite" />GlobalProtect Satellite</Label>
        </RadioGroup>
      </div>

      <Fieldset>
        <FieldsetLegend>
          <Label className="flex items-center gap-2">
            <Checkbox checked={ak.ikeGateways.length > 0} disabled />
            IKE Gateway
          </Label>
        </FieldsetLegend>
        {ak.ikeGateways.length > 0 && (
          <FieldsetContent>
            <DisplayField label="IKE Gateway" value={ak.ikeGateways.join(", ")} labelWidth={LW} />
          </FieldsetContent>
        )}
      </Fieldset>

      <DisplayField label="IPSec Crypto Profile" value={ak.ipsecCryptoProfile ?? "None"} labelWidth={LW} />

      <Fieldset>
        <FieldsetLegend>Advanced Options</FieldsetLegend>
        <FieldsetContent>
          <Label className="flex items-center gap-2 py-1">
            <Checkbox checked={ak.antiReplay} disabled />
            <span className="text-xs">Enable Replay Protection</span>
          </Label>
          {ak.antiReplayWindow != null && (
            <DisplayField label="Anti Replay Window" value={String(ak.antiReplayWindow)} labelWidth={LW} />
          )}
          <Label className="flex items-center gap-2 py-1">
            <Checkbox checked={ak.copyTos} disabled />
            <span className="text-xs">Copy ToS Header</span>
          </Label>

          <div className="flex items-center gap-4">
            <span className={`text-sm font-medium text-foreground shrink-0 ${LW}`}>IPSec Mode</span>
            <RadioGroup value={ak.ipsecMode} disabled className="flex flex-row gap-4">
              <Label className="flex items-center gap-1.5 text-xs"><RadioGroupItem value="tunnel" />Tunnel</Label>
              <Label className="flex items-center gap-1.5 text-xs"><RadioGroupItem value="transport" />Transport</Label>
            </RadioGroup>
          </div>

          <Label className="flex items-center gap-2 py-1 pl-6">
            <Checkbox checked={ak.enableGreEncapsulation} disabled />
            <span className="text-xs">Add GRE Encapsulation</span>
          </Label>
        </FieldsetContent>
      </Fieldset>

      <Fieldset>
        <FieldsetLegend>Tunnel Monitor</FieldsetLegend>
        <FieldsetContent>
          <Label className="flex items-center gap-2 py-1">
            <Checkbox checked={tunnel.tunnelMonitor.enabled} disabled />
            <span className="text-xs">Tunnel Monitor</span>
          </Label>
          {tunnel.tunnelMonitor.enabled && (
            <>
              <DisplayField label="Destination IP" value={tunnel.tunnelMonitor.destinationIp ?? "None"} labelWidth={LW} />
              <DisplayField label="Profile" value={tunnel.tunnelMonitor.monitorProfile ?? "None"} labelWidth={LW} />
            </>
          )}
        </FieldsetContent>
      </Fieldset>

      <DisplayField label="Comment" value={tunnel.comment ?? ""} labelWidth={LW} />
    </div>
  )
}

// ─── Auto Key Proxy IDs Tab ───────────────────────────────────────────────────

function ProxyIdsTab({ tunnel }: { tunnel: PanwIpsecTunnel }) {
  const ak = tunnel.autoKey!

  return (
    <div className="space-y-4">
      <Tabs defaultValue="ipv4" className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 border-b">
          <TabsList variant="line">
            <TabsTrigger value="ipv4">IPv4</TabsTrigger>
            <TabsTrigger value="ipv6">IPv6</TabsTrigger>
          </TabsList>
        </div>

        <div className="pt-4">
          <TabsContent value="ipv4">
            <ProxyIdTable proxyIds={ak.proxyIds} />
          </TabsContent>
          <TabsContent value="ipv6">
            <ProxyIdTable proxyIds={ak.proxyIdsV6} />
          </TabsContent>
        </div>
      </Tabs>

      <Label className="flex items-center gap-2 py-1">
        <Checkbox checked={ak.proxyIdStrictMatching} disabled />
        <span className="text-xs">Proxy-ID Strict Matching Mode</span>
      </Label>
    </div>
  )
}

// ─── Manual Key General Tab ───────────────────────────────────────────────────

function ManualKeyGeneralTab({ tunnel }: { tunnel: PanwIpsecTunnel }) {
  const mk = tunnel.manualKey!

  return (
    <div className="space-y-4">
      <DisplayField label="Name" value={tunnel.name} labelWidth={LW} />
      <DisplayField label="Tunnel Interface" value={tunnel.tunnelInterface ?? "None"} labelWidth={LW} />

      <div className="flex items-center gap-4">
        <span className={`text-sm font-medium text-foreground shrink-0 ${LW}`}>HW Crypto Acceleration</span>
        <RadioGroup value={tunnel.hwAcceleration ?? "none"} disabled className="flex flex-row gap-4">
          <Label className="flex items-center gap-1.5 text-xs"><RadioGroupItem value="none" />None</Label>
          <Label className="flex items-center gap-1.5 text-xs"><RadioGroupItem value="assist" />Assist</Label>
        </RadioGroup>
      </div>

      <div className="flex items-center gap-4">
        <span className={`text-sm font-medium text-foreground shrink-0 ${LW}`}>Type</span>
        <RadioGroup value="manual-key" disabled className="flex flex-row gap-4">
          <Label className="flex items-center gap-1.5 text-xs"><RadioGroupItem value="auto-key" />Auto Key</Label>
          <Label className="flex items-center gap-1.5 text-xs"><RadioGroupItem value="manual-key" />Manual Key</Label>
          <Label className="flex items-center gap-1.5 text-xs"><RadioGroupItem value="global-protect-satellite" />GlobalProtect Satellite</Label>
        </RadioGroup>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <DisplayField label="Local SPI" value={mk.localSpi ?? "None"} labelWidth="w-28" />
          <DisplayField label="Interface" value={mk.localAddress.interface ?? "None"} labelWidth="w-28" />
          <DisplayField label="Local Address" value={mk.localAddress.ip ?? "None"} labelWidth="w-28" />
          <DisplayField label="Remote SPI" value={mk.remoteSpi ?? "None"} labelWidth="w-28" />
          <DisplayField label="Remote Address" value={mk.peerAddress ?? "None"} labelWidth="w-28" />
        </div>
        <div className="space-y-3">
          <DisplayField label="Protocol" value={mk.protocol.toUpperCase()} labelWidth="w-28" />
          <DisplayField label="Authentication" value={mk.authenticationAlgorithm ?? "None"} labelWidth="w-28" />
          <DisplayField label="Encryption" value={mk.encryptionAlgorithm ?? "None"} labelWidth="w-28" />
          {mk.encryptionSalt && (
            <DisplayField label="Salt" value={mk.encryptionSalt} labelWidth="w-28" />
          )}
        </div>
      </div>

      <Fieldset>
        <FieldsetLegend>Tunnel Monitor</FieldsetLegend>
        <FieldsetContent>
          <Label className="flex items-center gap-2 py-1">
            <Checkbox checked={tunnel.tunnelMonitor.enabled} disabled />
            <span className="text-xs">Tunnel Monitor</span>
          </Label>
        </FieldsetContent>
      </Fieldset>

      <DisplayField label="Comment" value={tunnel.comment ?? ""} labelWidth={LW} />
    </div>
  )
}

// ─── GP Satellite General Tab ─────────────────────────────────────────────────

function GpSatelliteGeneralTab({ tunnel }: { tunnel: PanwIpsecTunnel }) {
  const gp = tunnel.gpSatellite!

  return (
    <div className="space-y-4">
      <DisplayField label="Name" value={tunnel.name} labelWidth={LW} />
      <DisplayField label="Tunnel Interface" value={tunnel.tunnelInterface ?? "None"} labelWidth={LW} />

      <div className="flex items-center gap-4">
        <span className={`text-sm font-medium text-foreground shrink-0 ${LW}`}>HW Crypto Acceleration</span>
        <RadioGroup value={tunnel.hwAcceleration ?? "none"} disabled className="flex flex-row gap-4">
          <Label className="flex items-center gap-1.5 text-xs"><RadioGroupItem value="none" />None</Label>
          <Label className="flex items-center gap-1.5 text-xs"><RadioGroupItem value="assist" />Assist</Label>
        </RadioGroup>
      </div>

      <DisplayField label="Portal Address" value={gp.portalAddress ?? "None"} labelWidth={LW} />

      <Label className="flex items-center gap-2 py-1">
        <Checkbox checked={gp.ipv6Preferred} disabled />
        <span className="text-xs">IPv6 preferred for portal registration</span>
      </Label>

      <DisplayField label="Interface" value={gp.localAddress.interface ?? "None"} labelWidth={LW} />
      <DisplayField label="IPv4 Address" value={gp.localAddress.ipv4 ?? "None"} labelWidth={LW} />
      <DisplayField label="IPv6 Address" value={gp.localAddress.ipv6 ?? "None"} labelWidth={LW} />

      <Fieldset>
        <FieldsetLegend>Tunnel Monitor</FieldsetLegend>
        <FieldsetContent>
          <Label className="flex items-center gap-2 py-1">
            <Checkbox checked={tunnel.tunnelMonitor.enabled} disabled />
            <span className="text-xs">Tunnel Monitor</span>
          </Label>
        </FieldsetContent>
      </Fieldset>

      <DisplayField label="Comment" value={tunnel.comment ?? ""} labelWidth={LW} />
    </div>
  )
}

// ─── GP Satellite Advanced Tab ────────────────────────────────────────────────

function GpSatelliteAdvancedTab({ tunnel }: { tunnel: PanwIpsecTunnel }) {
  const gp = tunnel.gpSatellite!

  return (
    <div className="space-y-4">
      <Label className="flex items-center gap-2 py-1">
        <Checkbox checked={gp.publishConnectedRoutes} disabled />
        <span className="text-xs">Publish all static and connected routes to Gateway</span>
      </Label>

      {gp.publishRoutes.length > 0 && (
        <Fieldset>
          <FieldsetLegend>Routes Published to GlobalProtect Gateways</FieldsetLegend>
          <FieldsetContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[11px]">Subnet</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gp.publishRoutes.map((route) => (
                    <TableRow key={route}>
                      <TableCell className="text-xs font-mono">{route}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </FieldsetContent>
        </Fieldset>
      )}

      <Fieldset disabled={!gp.externalCa}>
        <FieldsetLegend>
          <Label className="flex items-center gap-2">
            <Checkbox checked={gp.externalCa !== null} disabled />
            External Certificate Authority
          </Label>
        </FieldsetLegend>
        {gp.externalCa && (
          <FieldsetContent>
            <DisplayField label="Local Certificate" value={gp.externalCa.localCertificate ?? "None"} labelWidth={LW} />
            <DisplayField label="Certificate Profile" value={gp.externalCa.certificateProfile ?? "None"} labelWidth={LW} />
          </FieldsetContent>
        )}
      </Fieldset>
    </div>
  )
}

// ─── Main Dialog ──────────────────────────────────────────────────────────────

export function IpsecTunnelDialog({
  tunnel,
  open,
  onOpenChange,
}: {
  tunnel: PanwIpsecTunnel | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!tunnel) return null

  const isAutoKey = tunnel.keyType === "auto-key"
  const isGpSatellite = tunnel.keyType === "global-protect-satellite"
  const hasTabs = isAutoKey || isGpSatellite

  if (!hasTabs) {
    // Manual key — single General tab, no tab bar needed
    return (
      <DetailDialog title="IPSec Tunnel" open={open} onOpenChange={onOpenChange} maxWidth="sm:max-w-3xl">
        <ManualKeyGeneralTab tunnel={tunnel} />
      </DetailDialog>
    )
  }

  return (
    <DetailDialog title="IPSec Tunnel" open={open} onOpenChange={onOpenChange} maxWidth="sm:max-w-4xl" height="h-[min(90vh,850px)]" noPadding>
      <Tabs defaultValue="general" className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 border-b px-5">
          <TabsList variant="line">
            <TabsTrigger value="general">General</TabsTrigger>
            {isAutoKey && <TabsTrigger value="proxy-ids">Proxy IDs</TabsTrigger>}
            {isGpSatellite && <TabsTrigger value="advanced">Advanced</TabsTrigger>}
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <TabsContent value="general">
            {isAutoKey && <AutoKeyGeneralTab tunnel={tunnel} />}
            {isGpSatellite && <GpSatelliteGeneralTab tunnel={tunnel} />}
          </TabsContent>
          {isAutoKey && (
            <TabsContent value="proxy-ids">
              <ProxyIdsTab tunnel={tunnel} />
            </TabsContent>
          )}
          {isGpSatellite && (
            <TabsContent value="advanced">
              <GpSatelliteAdvancedTab tunnel={tunnel} />
            </TabsContent>
          )}
        </div>
      </Tabs>
    </DetailDialog>
  )
}
