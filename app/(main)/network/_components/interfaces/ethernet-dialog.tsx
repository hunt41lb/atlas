// @/app/(main)/network/_components/interfaces/ethernet-dialog.tsx

"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { DetailDialog } from "@/components/ui/detail-dialog"
import { DisplayField } from "@/components/ui/display-field"
import { Fieldset, FieldsetLegend, FieldsetContent } from "@/components/ui/fieldset"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table"
import { MonoValue } from "@/app/(main)/_components/ui/category-shell"
import { MODE_LABELS, RouterCell, ZoneCell, MgmtProfileCell } from "./interface-helpers"
import type { PanwInterface } from "@/lib/panw-parser/network/interfaces"

// ─── Props ───────────────────────────────────────────────────────────────────

interface EthernetDialogProps {
  item: PanwInterface | null
  open: boolean
  onOpenChange: (o: boolean) => void
  ifaceToVirtualRouter: Map<string, string>
  ifaceToLogicalRouter: Map<string, string>
  ifaceToZone: Map<string, string>
  zoneColorMap: Map<string, string>
  onRouterClick?: (name: string) => void
  onMgmtProfileClick?: (name: string) => void
}

// ─── Component ───────────────────────────────────────────────────────────────

const LW = "w-44"

export function EthernetDialog({
  item,
  open,
  onOpenChange,
  ifaceToVirtualRouter,
  ifaceToLogicalRouter,
  ifaceToZone,
  zoneColorMap,
  onRouterClick,
  onMgmtProfileClick,
}: EthernetDialogProps) {
  if (!item) return null

  const modeLabel = item.mode !== "none" ? (MODE_LABELS[item.mode] ?? item.mode) : "None"
  const zoneName = ifaceToZone.get(item.name)

  return (
    <DetailDialog title="Ethernet Interface" open={open} onOpenChange={onOpenChange} maxWidth="sm:max-w-3xl">
      <DisplayField labelWidth={LW} label="Interface Name" value={item.name} />
      <DisplayField labelWidth={LW} label="Comment" value={item.comment ?? "None"} />
      <DisplayField labelWidth={LW} label="Interface Type" value={modeLabel} />
      <DisplayField labelWidth={LW} label="Netflow Profile" value={item.netflowProfile ?? "None"} />

      <Tabs defaultValue="config" className="mt-3 flex flex-col">
        <div className="shrink-0 border-b">
          <TabsList variant="line">
            <TabsTrigger value="config">Config</TabsTrigger>
            <TabsTrigger value="ipv4">IPv4</TabsTrigger>
            <TabsTrigger value="ipv6">IPv6</TabsTrigger>
            <TabsTrigger value="sdwan">SD-WAN</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
        </div>

        {/* ── Config ── */}
        <TabsContent value="config" className="pt-3">
          <Fieldset>
            <FieldsetLegend>Assign Interface To</FieldsetLegend>
            <FieldsetContent>
              <div className="flex items-center gap-2">
                <span className="w-32 shrink-0 font-medium text-foreground">Virtual Router</span>
                <RouterCell name={ifaceToVirtualRouter.get(item.name)} onClick={onRouterClick} />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-32 shrink-0 font-medium text-foreground">Logical Router</span>
                <RouterCell name={ifaceToLogicalRouter.get(item.name)} onClick={onRouterClick} />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-32 shrink-0 font-medium text-foreground">Security Zone</span>
                <ZoneCell name={zoneName} color={zoneColorMap.get(zoneName ?? "")} />
              </div>
            </FieldsetContent>
          </Fieldset>
        </TabsContent>

        {/* ── IPv4 ── */}
        <TabsContent value="ipv4" className="pt-3 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 pl-1">
              <Checkbox checked={item.sdwanEnabled} disabled />
              <span>Enable SD-WAN</span>
            </Label>
            <Label className="flex items-center gap-2">
              <Checkbox checked={item.bonjourEnabled} disabled />
              <span>Enable Bonjour Reflector</span>
            </Label>
          </div>

          {item.dhcpClient ? (
            <DisplayField labelWidth={LW} label="Type" value="DHCP Client" />
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[11px]">IP</TableHead>
                    <TableHead className="text-[11px]">NEXT HOP GATEWAY</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {item.ipAddresses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="py-4 text-center text-muted-foreground">No IPv4 addresses configured.</TableCell>
                    </TableRow>
                  ) : item.ipAddresses.map((ip) => (
                    <TableRow key={ip.address}>
                      <TableCell><MonoValue className="text-xs">{ip.address}</MonoValue></TableCell>
                      <TableCell>{ip.sdwanGateway ? <MonoValue className="text-xs">{ip.sdwanGateway}</MonoValue> : <span className="text-muted-foreground text-xs">—</span>}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* ── IPv6 ── */}
        <TabsContent value="ipv6" className="pt-3 space-y-3">
          <Label className="flex items-center gap-2 pl-1">
            <Checkbox checked={item.ipv6Enabled} disabled />
            <span>Enable IPv6 on the interface</span>
          </Label>

          {item.ipv6Addresses.length > 0 && (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[11px]">ADDRESS</TableHead>
                    <TableHead className="text-[11px]">ENABLED</TableHead>
                    <TableHead className="text-[11px]">ANYCAST</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {item.ipv6Addresses.map((ip) => (
                    <TableRow key={ip.address}>
                      <TableCell><MonoValue className="text-xs">{ip.address}</MonoValue></TableCell>
                      <TableCell><Checkbox checked={ip.enabled} disabled /></TableCell>
                      <TableCell><Checkbox checked={ip.anycast} disabled /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* ── SD-WAN ── */}
        <TabsContent value="sdwan" className="pt-3 space-y-3">
          <DisplayField labelWidth={LW} label="SD-WAN Interface Status" value={item.sdwanEnabled ? "Enabled" : "Disabled"} />
          <DisplayField labelWidth={LW} label="SD-WAN Interface Profile" value={item.sdwanInterfaceProfile ?? "None"} />

          <Fieldset>
            <FieldsetLegend>Upstream NAT</FieldsetLegend>
            <FieldsetContent>
              <Label className="flex items-center gap-2 pl-1">
                <Checkbox checked={item.upstreamNatEnabled} disabled />
                <span>Enable</span>
              </Label>
              {item.upstreamNatEnabled && (
                <>
                  <DisplayField label="NAT IP Address Type" value={item.upstreamNatType === "static-ip" ? "Static IP" : item.upstreamNatType === "ddns" ? "DDNS" : "None"} />
                  {item.upstreamNatType === "static-ip" && (
                    <DisplayField label="IP Address" value={item.upstreamNatAddress ?? "None"} />
                  )}
                </>
              )}
            </FieldsetContent>
          </Fieldset>
        </TabsContent>

        {/* ── Advanced ── */}
        <TabsContent value="advanced" className="pt-3 space-y-4">
          <Fieldset>
            <FieldsetLegend>Link Settings</FieldsetLegend>
            <FieldsetContent>
              <div className="grid grid-cols-3 gap-4">
                <DisplayField label="Link Speed" value={item.linkSpeed ?? "auto"} />
                <DisplayField label="Link Duplex" value={item.linkDuplex ?? "auto"} />
                <DisplayField label="Link State" value={item.linkState ?? "auto"} />
              </div>
            </FieldsetContent>
          </Fieldset>

          {item.poeConfigured && (
            <Fieldset>
              <FieldsetLegend>PoE Settings</FieldsetLegend>
              <FieldsetContent>
                <div className="flex items-center justify-between">
                  <DisplayField label="PoE Reserved Power" value={String(item.poeReservedPower ?? 0)} />
                  <Label className="flex items-center gap-2">
                    <Checkbox checked={item.poeEnabled} disabled />
                    <span>PoE Enable</span>
                  </Label>
                </div>
              </FieldsetContent>
            </Fieldset>
          )}

          {/* Sub-tabs */}
          <Tabs defaultValue="other-info" className="flex flex-col">
            <div className="shrink-0 border-b">
              <TabsList variant="line">
                <TabsTrigger value="other-info">Other Info</TabsTrigger>
                <TabsTrigger value="ndp-proxy">NDP Proxy</TabsTrigger>
                <TabsTrigger value="lldp">LLDP</TabsTrigger>
                <TabsTrigger value="ddns">DDNS</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="other-info" className="pt-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-40 shrink-0 font-medium text-foreground">Management Profile</span>
                <MgmtProfileCell name={item.managementProfile} onClick={onMgmtProfileClick} />
              </div>
              <DisplayField labelWidth="w-40" label="MTU" value={item.mtu !== null ? String(item.mtu) : "None"} />

              <Fieldset>
                <FieldsetLegend>
                  <Label className="flex items-center gap-2">
                    <Checkbox checked={item.adjustTcpMss} disabled />
                    Adjust TCP MSS
                  </Label>
                </FieldsetLegend>
                {item.adjustTcpMss && (
                  <FieldsetContent>
                    <DisplayField label="IPv4 MSS Adjustment" value={item.ipv4MssAdjustment !== null ? String(item.ipv4MssAdjustment) : "40"} />
                    <DisplayField label="IPv6 MSS Adjustment" value={item.ipv6MssAdjustment !== null ? String(item.ipv6MssAdjustment) : "60"} />
                  </FieldsetContent>
                )}
              </Fieldset>
            </TabsContent>

            <TabsContent value="ndp-proxy" className="pt-3">
              <Fieldset>
                <FieldsetLegend>
                  <Label className="flex items-center gap-2">
                    <Checkbox checked={item.ndpProxy} disabled />
                    Enable NDP Proxy
                  </Label>
                </FieldsetLegend>
              </Fieldset>
            </TabsContent>

            <TabsContent value="lldp" className="pt-3 space-y-2">
              <Fieldset>
                <FieldsetLegend>
                  <Label className="flex items-center gap-2">
                    <Checkbox checked={item.lldpEnabled} disabled />
                    Enable LLDP
                  </Label>
                </FieldsetLegend>
                {item.lldpEnabled && (
                  <FieldsetContent>
                    <DisplayField label="LLDP Profile" value={item.lldpProfile ?? "None"} />
                  </FieldsetContent>
                )}
              </Fieldset>
            </TabsContent>

            <TabsContent value="ddns" className="pt-3">
              <Fieldset disabled={!item.ddnsEnabled}>
                <FieldsetLegend>
                  <Label className="flex items-center gap-2">
                    <Checkbox checked={item.ddnsEnabled} disabled />
                    Settings
                  </Label>
                </FieldsetLegend>
                {!item.ddnsEnabled && (
                  <FieldsetContent>
                    <p className="py-2 text-center text-muted-foreground">DDNS is not enabled on this interface.</p>
                  </FieldsetContent>
                )}
              </Fieldset>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </DetailDialog>
  )
}
