// @/app/(main)/network/_components/interfaces/interface-dialog.tsx

"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { DetailDialog } from "@/components/ui/detail-dialog"
import { DisplayField } from "@/components/ui/display-field"
import { Fieldset, FieldsetLegend, FieldsetContent } from "@/components/ui/fieldset"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table"
import { MonoValue } from "@/app/(main)/_components/ui/category-shell"
import { MODE_LABELS, RouterCell, ZoneCell, MgmtProfileCell } from "./interface-helpers"
import type { PanwInterface, PanwSubInterface, PanwIpv6Entry } from "@/lib/panw-parser/network/interfaces"
import { DDNS_CONFIG_LABELS, DDNS_VENDOR_LABELS } from "@/lib/panw-defaults"

// ─── Shared types ────────────────────────────────────────────────────────────

type DialogItem = PanwInterface | PanwSubInterface

function isParentInterface(item: DialogItem): item is PanwInterface {
  return "type" in item
}

function isAeMember(item: DialogItem): boolean {
  return isParentInterface(item) && item.type === "ethernet" && item.aggregateGroup !== null
}

function isAeParent(item: DialogItem): boolean {
  return isParentInterface(item) && item.type === "ae"
}

// ─── IPv6 Address Detail Dialog ──────────────────────────────────────────────

function Ipv6AddressDialog({
  entry,
  open,
  onOpenChange,
}: {
  entry: PanwIpv6Entry | null
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  if (!entry) return null

  return (
    <DetailDialog title="Address" open={open} onOpenChange={onOpenChange} maxWidth="sm:max-w-lg">
      <DisplayField label="Address" value={entry.address} />
      <Label className="flex items-center gap-2 pl-1">
        <Checkbox checked={entry.enabled} disabled />
        <span>Enable address on interface</span>
      </Label>
      <Label className="flex items-center gap-2 pl-1">
        <Checkbox checked={entry.prefix} disabled />
        <span>Use interface ID as host portion</span>
      </Label>
      <Label className="flex items-center gap-2 pl-1">
        <Checkbox checked={entry.anycast} disabled />
        <span>Anycast</span>
      </Label>

      <Fieldset>
        <FieldsetLegend>
          <Label className="flex items-center gap-2">
            <Checkbox checked={entry.sendRa} disabled />
            Send Router Advertisement
          </Label>
        </FieldsetLegend>
        {entry.sendRa && (
          <FieldsetContent>
            <DisplayField label="Valid Lifetime (sec)" value={String(entry.validLifetime ?? 2592000)} />
            <DisplayField label="Preferred Lifetime (sec)" value={String(entry.preferredLifetime ?? 604800)} />
            <Label className="flex items-center gap-2 pl-1">
              <Checkbox checked={entry.onLink} disabled />
              <span>On-link</span>
            </Label>
            <Label className="flex items-center gap-2 pl-1">
              <Checkbox checked={entry.autonomous} disabled />
              <span>Autonomous</span>
            </Label>
          </FieldsetContent>
        )}
      </Fieldset>
    </DetailDialog>
  )
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface InterfaceDialogProps {
  item: DialogItem | null
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

export function InterfaceDialog({
  item,
  open,
  onOpenChange,
  ifaceToVirtualRouter,
  ifaceToLogicalRouter,
  ifaceToZone,
  zoneColorMap,
  onRouterClick,
  onMgmtProfileClick,
}: InterfaceDialogProps) {
  const [selectedIpv6, setSelectedIpv6] = useState<PanwIpv6Entry | null>(null)

  if (!item) return null

  const isParent = isParentInterface(item)
  const isMember = isAeMember(item)
  const isAe = isAeParent(item)
  const zoneName = ifaceToZone.get(item.name)
  const ipv4Type = item.dhcpClient ? "dhcp" : (isParent && item.pppoeEnabled) ? "pppoe" : "static"
  const ipAddresses = isParent ? item.ipAddresses : item.ipEntries
  const ipv6Addresses = isParent ? item.ipv6Addresses : item.ipv6Entries

  return (
    <DetailDialog
      title={
        !isParent ? "Layer3 Subinterface"
        : isMember ? "Ethernet Interface"
        : isAe ? "Aggregate Ethernet Interface"
        : "Ethernet Interface"
      }
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="sm:max-w-3xl"
    >
      <DisplayField labelWidth={LW} label="Interface Name" value={item.name} />
      <DisplayField labelWidth={LW} label="Comment" value={item.comment ?? "None"} />
      {!isParent && (
        <DisplayField labelWidth={LW} label="Tag" value={item.tag !== null ? String(item.tag) : "Untagged"} />
      )}
      {isParent && (
        <DisplayField labelWidth={LW} label="Interface Type" value={item.mode !== "none" ? (MODE_LABELS[item.mode] ?? item.mode) : "None"} />
      )}
      {isParent && isMember && (
        <DisplayField labelWidth={LW} label="Aggregate Group" value={item.aggregateGroup ?? "None"} />
      )}
      {!isMember && (
        <DisplayField labelWidth={LW} label="Netflow Profile" value={item.netflowProfile ?? "None"} />
      )}

      {/* AE member — simplified view (no tabs) */}
      {isMember && isParent && (
        <div className="mt-3 space-y-4">
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
                  <Label className="flex items-center gap-2"><Checkbox checked={item.poeEnabled} disabled /><span>PoE Enable</span></Label>
                </div>
              </FieldsetContent>
            </Fieldset>
          )}
          <DisplayField label="LACP Port Priority" value={String(item.lacpPortPriority ?? 32768)} />
        </div>
      )}

      {/* Full tabbed view — for AE parents, ethernet parents (non-member), and subinterfaces */}
      {!isMember && (
      <Tabs defaultValue="config" className="mt-3 flex flex-col">
        <div className="shrink-0 border-b">
          <TabsList variant="line">
            <TabsTrigger value="config">Config</TabsTrigger>
            <TabsTrigger value="ipv4">IPv4</TabsTrigger>
            <TabsTrigger value="ipv6">IPv6</TabsTrigger>
            {isAe && <TabsTrigger value="lacp">LACP</TabsTrigger>}
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

          <div className="flex items-center gap-4">
            <span className="shrink-0 font-medium text-foreground">Type</span>
            <RadioGroup value={ipv4Type} disabled className="flex flex-row gap-4">
              <Label className="flex items-center gap-1.5 font-normal"><RadioGroupItem value="static" />Static</Label>
              {isParent && <Label className="flex items-center gap-1.5 font-normal"><RadioGroupItem value="pppoe" />PPPoE</Label>}
              <Label className="flex items-center gap-1.5 font-normal"><RadioGroupItem value="dhcp" />DHCP Client</Label>
            </RadioGroup>
          </div>

          {ipv4Type === "static" && (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[11px]">IP</TableHead>
                    <TableHead className="text-[11px]">NEXT HOP GATEWAY</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ipAddresses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="py-4 text-center text-muted-foreground">No IPv4 addresses configured.</TableCell>
                    </TableRow>
                  ) : ipAddresses.map((ip) => (
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
          <div className="flex items-center justify-between gap-4">
            <Label className="flex items-center gap-2 pl-1">
              <Checkbox checked={item.ipv6Enabled} disabled />
              <span>Enable IPv6 on the interface</span>
            </Label>
            <div className="flex items-center gap-4">
              <Label className="flex items-center gap-2">
                <Checkbox checked={item.ipv6SdwanEnabled} disabled />
                <span>Enable SD-WAN</span>
              </Label>
              <span className="text-xs">{item.ipv6InterfaceId ?? "EUI-64"}</span>
            </div>
          </div>

          <DisplayField label="Type" value="Static" />

          {item.ipv6Enabled && (
            <Tabs defaultValue="addr-assignment" className="flex flex-col">
              <div className="shrink-0 border-b">
                <TabsList variant="line">
                  <TabsTrigger value="addr-assignment">Address Assignment</TabsTrigger>
                  <TabsTrigger value="addr-resolution">Address Resolution</TabsTrigger>
                  <TabsTrigger value="router-advert">Router Advertisement</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="addr-assignment" className="pt-3">
                {ipv6Addresses.length === 0 ? (
                  <p className="py-4 text-center text-muted-foreground">No IPv6 addresses configured.</p>
                ) : (
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-[11px]">ADDRESS</TableHead>
                          <TableHead className="text-[11px]">ENABLED</TableHead>
                          <TableHead className="text-[11px]">INTERFACE ID AS HOST</TableHead>
                          <TableHead className="text-[11px]">ANYCAST</TableHead>
                          <TableHead className="text-[11px]">SEND RA</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ipv6Addresses.map((ip) => (
                          <TableRow key={ip.address} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedIpv6(ip)}>
                            <TableCell><MonoValue className="text-xs text-foreground hover:underline">{ip.address}</MonoValue></TableCell>
                            <TableCell><Checkbox checked={ip.enabled} disabled /></TableCell>
                            <TableCell><Checkbox checked={ip.prefix} disabled /></TableCell>
                            <TableCell><Checkbox checked={ip.anycast} disabled /></TableCell>
                            <TableCell><Checkbox checked={ip.sendRa} disabled /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="addr-resolution" className="pt-3 space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <DisplayField label="DAD Attempts" value={String(item.ipv6DadAttempts ?? 1)} />
                  <DisplayField label="Reachable Time (sec)" value={String(item.ipv6ReachableTime ?? 30)} />
                  <DisplayField label="NS Interval (sec)" value={String(item.ipv6NsInterval ?? 1)} />
                </div>
                <div className="flex gap-6">
                  <Label className="flex items-center gap-2"><Checkbox checked={item.ipv6DadEnabled} disabled /><span>Enable Duplicate Address Detection</span></Label>
                  <Label className="flex items-center gap-2"><Checkbox checked={item.ipv6NdpMonitor} disabled /><span>Enable NDP Monitoring</span></Label>
                </div>
              </TabsContent>

              <TabsContent value="router-advert" className="pt-3">
                <Fieldset>
                  <FieldsetLegend>
                    <Label className="flex items-center gap-2"><Checkbox checked={item.ipv6RaEnabled} disabled />Enable Router Advertisement</Label>
                  </FieldsetLegend>
                  {item.ipv6RaEnabled && (
                    <FieldsetContent>
                      <div className="grid grid-cols-3 gap-4">
                        <DisplayField label="Min Interval (sec)" value={String(item.ipv6RaMinInterval ?? 200)} />
                        <DisplayField label="Reachable Time (ms)" value={item.ipv6RaReachableTime !== null ? String(item.ipv6RaReachableTime) : "unspecified"} />
                        <Label className="flex items-center gap-2"><Checkbox checked={item.ipv6RaManagedConfig} disabled /><span>Managed Configuration</span></Label>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <DisplayField label="Max Interval (sec)" value={String(item.ipv6RaMaxInterval ?? 600)} />
                        <DisplayField label="Retrans Time (ms)" value={item.ipv6RaRetransTime !== null ? String(item.ipv6RaRetransTime) : "unspecified"} />
                        <Label className="flex items-center gap-2"><Checkbox checked={item.ipv6RaOtherConfig} disabled /><span>Other Configuration</span></Label>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <DisplayField label="Hop Limit" value={String(item.ipv6RaHopLimit ?? 64)} />
                        <DisplayField label="Router Lifetime (sec)" value={String(item.ipv6RaLifetime ?? 1800)} />
                        <Label className="flex items-center gap-2"><Checkbox checked={item.ipv6RaConsistencyCheck} disabled /><span>Consistency Check</span></Label>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <DisplayField label="Link MTU" value={item.ipv6RaLinkMtu ?? "unspecified"} />
                        <DisplayField label="Router Preference" value={item.ipv6RaRouterPreference ?? "Medium"} />
                        <div />
                      </div>
                    </FieldsetContent>
                  )}
                </Fieldset>
              </TabsContent>
            </Tabs>
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
                  <div className="flex items-center gap-4">
                    <span className="shrink-0 font-medium text-foreground">NAT IP Address Type</span>
                    <RadioGroup value={item.upstreamNatType ?? "static-ip"} disabled className="flex flex-row gap-4">
                      <Label className="flex items-center gap-1.5 font-normal"><RadioGroupItem value="static-ip" />Static IP</Label>
                      <Label className="flex items-center gap-1.5 font-normal"><RadioGroupItem value="ddns" />DDNS</Label>
                    </RadioGroup>
                  </div>
                  {item.upstreamNatType === "static-ip" && (
                    <>
                      <DisplayField label="Type" value="IP Address" />
                      <DisplayField label="IP Address" value={item.upstreamNatAddress ?? "None"} />
                    </>
                  )}
                </>
              )}
            </FieldsetContent>
          </Fieldset>
        </TabsContent>

        {/* ── LACP (AE only) ── */}
        {isParent && isAe && (
          <TabsContent value="lacp" className="pt-3 space-y-3">
            <Fieldset>
              <FieldsetLegend>
                <Label className="flex items-center gap-2">
                  <Checkbox checked={item.lacpEnabled} disabled />
                  Enable LACP
                </Label>
              </FieldsetLegend>
              {item.lacpEnabled && (
                <FieldsetContent>
                  <div className="flex items-center gap-4">
                    <span className="shrink-0 font-medium text-foreground">Mode</span>
                    <RadioGroup value={item.lacpMode ?? "passive"} disabled className="flex flex-row gap-4">
                      <Label className="flex items-center gap-1.5 font-normal"><RadioGroupItem value="passive" />Passive</Label>
                      <Label className="flex items-center gap-1.5 font-normal"><RadioGroupItem value="active" />Active</Label>
                    </RadioGroup>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="shrink-0 font-medium text-foreground">Transmission Rate</span>
                    <RadioGroup value={item.lacpTransmissionRate ?? "slow"} disabled className="flex flex-row gap-4">
                      <Label className="flex items-center gap-1.5 font-normal"><RadioGroupItem value="fast" />Fast</Label>
                      <Label className="flex items-center gap-1.5 font-normal"><RadioGroupItem value="slow" />Slow</Label>
                    </RadioGroup>
                  </div>
                  <Label className="flex items-center gap-2 pl-1">
                    <Checkbox checked={item.lacpFastFailover} disabled />
                    <span>Fast Failover</span>
                  </Label>
                  <DisplayField label="System Priority" value={String(item.lacpSystemPriority ?? 32768)} />
                  <DisplayField label="Maximum Interfaces" value={String(item.lacpMaxPorts ?? 8)} />
                </FieldsetContent>
              )}
            </Fieldset>

            <Fieldset>
              <FieldsetLegend>High Availability Options</FieldsetLegend>
              <FieldsetContent>
                <Label className="flex items-center gap-2 pl-1">
                  <Checkbox checked={item.lacpHaPassive} disabled />
                  <span>Enable in HA Passive State</span>
                </Label>
              </FieldsetContent>
            </Fieldset>
          </TabsContent>
        )}

        {/* ── Advanced ── */}
        <TabsContent value="advanced" className="pt-3 space-y-4">
          {/* Link Settings & PoE — parent only */}
          {isParent && !isAe && (
            <>
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
                      <Label className="flex items-center gap-2"><Checkbox checked={item.poeEnabled} disabled /><span>PoE Enable</span></Label>
                    </div>
                  </FieldsetContent>
                </Fieldset>
              )}
            </>
          )}

          <Tabs defaultValue="other-info" className="flex flex-col">
            <div className="shrink-0 border-b">
              <TabsList variant="line">
                <TabsTrigger value="other-info">Other Info</TabsTrigger>
                <TabsTrigger value="arp-entries">ARP Entries</TabsTrigger>
                <TabsTrigger value="nd-entries">ND Entries</TabsTrigger>
                <TabsTrigger value="ndp-proxy">NDP Proxy</TabsTrigger>
                {isParent && <TabsTrigger value="lldp">LLDP</TabsTrigger>}
                <TabsTrigger value="ddns">DDNS</TabsTrigger>
                {isParent && <TabsTrigger value="cluster">Cluster</TabsTrigger>}
              </TabsList>
            </div>

            {/* Other Info */}
            <TabsContent value="other-info" className="pt-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-40 shrink-0 font-medium text-foreground">Management Profile</span>
                <MgmtProfileCell name={item.managementProfile} onClick={onMgmtProfileClick} />
              </div>
              <DisplayField labelWidth="w-40" label="MTU" value={item.mtu !== null ? String(item.mtu) : "None"} />
              <Label className="flex items-center gap-2 pl-1">
                <Checkbox checked={isParent ? item.networkPacketBroker : item.networkPacketBroker} disabled />
                <span>Network Packet Broker</span>
              </Label>

              <Fieldset>
                <FieldsetLegend>
                  <Label className="flex items-center gap-2"><Checkbox checked={item.adjustTcpMss} disabled />Adjust TCP MSS</Label>
                </FieldsetLegend>
                {item.adjustTcpMss && (
                  <FieldsetContent>
                    <DisplayField label="IPv4 MSS Adjustment" value={item.ipv4MssAdjustment !== null ? String(item.ipv4MssAdjustment) : "40"} />
                    <DisplayField label="IPv6 MSS Adjustment" value={item.ipv6MssAdjustment !== null ? String(item.ipv6MssAdjustment) : "60"} />
                  </FieldsetContent>
                )}
              </Fieldset>

              {isParent && (
                <Label className="flex items-center gap-2 pl-1">
                  <Checkbox checked={item.untaggedSubInterface} disabled />
                  <span>Untagged Subinterface</span>
                </Label>
              )}
            </TabsContent>

            {/* ARP Entries */}
            <TabsContent value="arp-entries" className="pt-3">
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[11px]">IP ADDRESS</TableHead>
                      <TableHead className="text-[11px]">MAC ADDRESS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {item.arpEntries.length === 0 ? (
                      <TableRow><TableCell colSpan={2} className="py-4 text-center text-muted-foreground">No ARP entries configured.</TableCell></TableRow>
                    ) : item.arpEntries.map((e) => (
                      <TableRow key={e.ip}>
                        <TableCell><MonoValue className="text-xs">{e.ip}</MonoValue></TableCell>
                        <TableCell><MonoValue className="text-xs">{e.mac}</MonoValue></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* ND Entries */}
            <TabsContent value="nd-entries" className="pt-3">
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[11px]">IPV6 ADDRESS</TableHead>
                      <TableHead className="text-[11px]">MAC ADDRESS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {item.ndEntries.length === 0 ? (
                      <TableRow><TableCell colSpan={2} className="py-4 text-center text-muted-foreground">No ND entries configured.</TableCell></TableRow>
                    ) : item.ndEntries.map((e) => (
                      <TableRow key={e.ipv6}>
                        <TableCell><MonoValue className="text-xs">{e.ipv6}</MonoValue></TableCell>
                        <TableCell><MonoValue className="text-xs">{e.mac}</MonoValue></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* NDP Proxy */}
            <TabsContent value="ndp-proxy" className="pt-3">
              <Fieldset>
                <FieldsetLegend>
                  <Label className="flex items-center gap-2"><Checkbox checked={item.ndpProxy} disabled />Enable NDP Proxy</Label>
                </FieldsetLegend>
                {item.ndpProxy && (
                  <FieldsetContent>
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-[11px]">ADDRESS</TableHead>
                            <TableHead className="text-[11px]">NEGATE</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {item.ndpProxyAddresses.length === 0 ? (
                            <TableRow><TableCell colSpan={2} className="py-4 text-center text-muted-foreground">No proxy addresses configured.</TableCell></TableRow>
                          ) : item.ndpProxyAddresses.map((e) => (
                            <TableRow key={e.address}>
                              <TableCell><MonoValue className="text-xs">{e.address}</MonoValue></TableCell>
                              <TableCell><Checkbox checked={e.negate} disabled /></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </FieldsetContent>
                )}
              </Fieldset>
            </TabsContent>

            {/* LLDP — parent only */}
            {isParent && (
              <TabsContent value="lldp" className="pt-3 space-y-3">
                <Fieldset>
                  <FieldsetLegend>
                    <Label className="flex items-center gap-2"><Checkbox checked={item.lldpEnabled} disabled />Enable LLDP</Label>
                  </FieldsetLegend>
                  {item.lldpEnabled && (
                    <FieldsetContent>
                      <DisplayField label="LLDP Profile" value={item.lldpProfile ?? "None"} />
                    </FieldsetContent>
                  )}
                </Fieldset>
                <Fieldset>
                  <FieldsetLegend>High Availability Options</FieldsetLegend>
                  <FieldsetContent>
                    <Label className="flex items-center gap-2 pl-1"><Checkbox checked={item.lldpHaPassive} disabled /><span>Enable in HA Passive State</span></Label>
                  </FieldsetContent>
                </Fieldset>
              </TabsContent>
            )}

            {/* DDNS */}
            <TabsContent value="ddns" className="pt-3">
              <Fieldset disabled={!item.ddnsEnabled}>
                <FieldsetLegend>
                  <Label className="flex items-center gap-2"><Checkbox checked={item.ddnsEnabled} disabled />Settings</Label>
                </FieldsetLegend>
                {item.ddnsEnabled ? (
                  <FieldsetContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <Label className="flex items-center gap-2 pl-1"><Checkbox checked={item.ddnsEnabled} disabled /><span>Enable</span></Label>
                        <DisplayField label="Update Interval (days)" value={String(item.ddnsUpdateInterval ?? 1)} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <DisplayField label="Certificate Profile" value={item.ddnsCertProfile ?? "None"} />
                        <DisplayField label="Hostname" value={item.ddnsHostname ?? "None"} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div />
                        <DisplayField label="Vendor" value={item.ddnsVendor ? (DDNS_VENDOR_LABELS[item.ddnsVendor] ?? item.ddnsVendor) : "None"} />
                      </div>

                      <Tabs defaultValue="ddns-ipv4" className="flex flex-col">
                        <div className="shrink-0 border-b">
                          <TabsList variant="line">
                            <TabsTrigger value="ddns-ipv4">IPv4</TabsTrigger>
                            <TabsTrigger value="ddns-ipv6">IPv6</TabsTrigger>
                          </TabsList>
                        </div>
                        <TabsContent value="ddns-ipv4" className="pt-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-lg border overflow-hidden">
                              <Table>
                                <TableHeader><TableRow><TableHead className="text-[11px]">IP</TableHead></TableRow></TableHeader>
                                <TableBody>
                                  {item.ddnsIpv4.length === 0 ? (
                                    <TableRow><TableCell className="py-4 text-center text-muted-foreground">No IPs configured.</TableCell></TableRow>
                                  ) : item.ddnsIpv4.map((ip) => (
                                    <TableRow key={ip}><TableCell><MonoValue className="text-xs">{ip}</MonoValue></TableCell></TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                            <div className="rounded-lg border overflow-hidden">
                              <Table>
                                <TableHeader><TableRow><TableHead className="text-[11px]">NAME</TableHead><TableHead className="text-[11px]">VALUE</TableHead></TableRow></TableHeader>
                                <TableBody>
                                  {item.ddnsVendorConfig.length === 0 ? (
                                    <TableRow><TableCell colSpan={2} className="py-4 text-center text-muted-foreground">No vendor config.</TableCell></TableRow>
                                  ) : item.ddnsVendorConfig.map((vc) => (
                                    <TableRow key={vc.name}>
                                      <TableCell className="font-medium">{DDNS_CONFIG_LABELS[vc.name] ?? vc.name}</TableCell>
                                      <TableCell className="tabular-nums">{vc.value}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </TabsContent>
                        <TabsContent value="ddns-ipv6" className="pt-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-lg border overflow-hidden">
                              <Table>
                                <TableHeader><TableRow><TableHead className="text-[11px]">IPV6</TableHead></TableRow></TableHeader>
                                <TableBody>
                                  {item.ddnsIpv6.length === 0 ? (
                                    <TableRow><TableCell className="py-4 text-center text-muted-foreground">No IPv6 addresses configured.</TableCell></TableRow>
                                  ) : item.ddnsIpv6.map((ip) => (
                                    <TableRow key={ip}><TableCell><MonoValue className="text-xs">{ip}</MonoValue></TableCell></TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                            <div className="rounded-lg border overflow-hidden">
                              <Table>
                                <TableHeader><TableRow><TableHead className="text-[11px]">NAME</TableHead><TableHead className="text-[11px]">VALUE</TableHead></TableRow></TableHeader>
                                <TableBody>
                                  {item.ddnsVendorConfig.length === 0 ? (
                                    <TableRow><TableCell colSpan={2} className="py-4 text-center text-muted-foreground">No vendor config.</TableCell></TableRow>
                                  ) : item.ddnsVendorConfig.map((vc) => (
                                    <TableRow key={vc.name}>
                                      <TableCell className="font-medium">{DDNS_CONFIG_LABELS[vc.name] ?? vc.name}</TableCell>
                                      <TableCell className="tabular-nums">{vc.value}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </FieldsetContent>
                ) : (
                  <FieldsetContent>
                    <p className="py-2 text-center text-muted-foreground">DDNS is not enabled on this interface.</p>
                  </FieldsetContent>
                )}
              </Fieldset>
            </TabsContent>

            {/* Cluster — parent only */}
            {isParent && (
              <TabsContent value="cluster" className="pt-3">
                <Label className="flex items-center gap-2 pl-1"><Checkbox checked={item.trafficInterconnect} disabled /><span>Traffic Interconnect</span></Label>
              </TabsContent>
            )}
          </Tabs>
        </TabsContent>
      </Tabs>
      )}

      <Ipv6AddressDialog
        entry={selectedIpv6}
        open={selectedIpv6 !== null}
        onOpenChange={(open) => { if (!open) setSelectedIpv6(null) }}
      />
    </DetailDialog>
  )
}
