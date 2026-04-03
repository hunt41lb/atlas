// @/app/(main)/network/_components/router-shared/router-dialog/router-dialog-multicast.tsx

"use client"

import * as React from "react"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
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
import { DetailDialog } from "@/components/ui/detail-dialog"
import { DisplayField } from "@/components/ui/display-field"
import { Fieldset, FieldsetLegend, FieldsetContent } from "@/components/ui/fieldset"
import { Label } from "@/components/ui/label"
import { MonoValue } from "@/app/(main)/_components/ui/category-shell"
import type { RouterDialogPageProps } from "./router-dialog-general"

// ─── Type helpers (defensive casts for new fields) ────────────────────────────

type MCStaticRoute = { name: string; destination: string | null; nexthop: string | null; interface: string | null; preference: number | null }
type MCPimIface = { name: string; drPriority: number | null; ifTimer: string | null; neighborFilter: string | null; description: string | null; sendBsm: boolean }
type MCPimRp = { address: string | null; groupList: string | null; interface: string | null; override: boolean }
type MCPimExternalRp = { ipAddress: string; groupList: string | null; override: boolean }
type MCPimSpt = { groupAddress: string; threshold: string | null }
type MCPimConfig = { enabled: boolean; rpfLookupMode: string | null; routeAgeoutTime: number | null; groupPermission: string | null; ssmGroupList: string | null; interfaces: MCPimIface[]; sptThresholds: MCPimSpt[]; localRp: MCPimRp | null; externalRps: MCPimExternalRp[] }
type MCIgmpDynamic = { name: string; groupFilter: string | null; queryProfile: string | null; version: string | null; robustness: number | null; maxGroups: string | null; maxSources: string | null; routerAlertPolicing: boolean }
type MCIgmpStatic = { name: string; interface: string | null; groupAddress: string | null; sourceAddress: string | null }
type MCIgmpConfig = { enabled: boolean; dynamicInterfaces: MCIgmpDynamic[]; staticEntries: MCIgmpStatic[] }
type MCMsdpPeer = { name: string; peerAddress: string | null; localInterface: string | null; localIp: string | null; authProfile: string | null; maxSa: number | null; inboundSaFilter: string | null; outboundSaFilter: string | null }
type MCMsdpConfig = { enabled: boolean; globalTimer: string | null; globalAuth: string | null; originatorIp: string | null; originatorInterface: string | null; peers: MCMsdpPeer[] }
type MCConfig = { enabled: boolean; staticRoutes?: MCStaticRoute[]; pim?: MCPimConfig | null; igmp?: MCIgmpConfig | null; msdp?: MCMsdpConfig | null }

// ─── Static Route Detail Dialog ───────────────────────────────────────────────

function StaticRouteDetailDialog({ route, open, onOpenChange }: { route: MCStaticRoute | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  if (!route) return null
  return (
    <DetailDialog title="IPv4 Multicast - Static Route" open={open} onOpenChange={onOpenChange}>
      <DisplayField label="Name" value={route.name} />
      <DisplayField label="Destination" value={route.destination ?? "None"} />
      <DisplayField label="Interface" value={route.interface ?? "None"} />
      <DisplayField label="Next Hop" value={route.nexthop ?? "None"} />
      <DisplayField label="Preference" value={String(route.preference ?? "")} />
    </DetailDialog>
  )
}

// ─── Static Tab ───────────────────────────────────────────────────────────────

function StaticTab({ router }: { router: RouterDialogPageProps["router"] }) {
  const routes = (router.multicast as MCConfig)?.staticRoutes ?? []
  const [selected, setSelected] = React.useState<MCStaticRoute | null>(null)

  return (
    <>
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[11px]">NAME</TableHead>
              <TableHead className="text-[11px]">DESTINATION</TableHead>
              <TableHead className="text-[11px]">NEXT HOP</TableHead>
              <TableHead className="text-[11px]">INTERFACE</TableHead>
              <TableHead className="text-[11px]">PREFERENCE</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routes.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="py-6 text-center text-xs text-muted-foreground">No static routes configured.</TableCell></TableRow>
            ) : routes.map((r) => (
              <TableRow key={r.name} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelected(r)}>
                <TableCell><span className="text-xs font-medium">{r.name}</span></TableCell>
                <TableCell><MonoValue className="text-xs">{r.destination ?? "—"}</MonoValue></TableCell>
                <TableCell><MonoValue className="text-xs">{r.nexthop ?? "—"}</MonoValue></TableCell>
                <TableCell><MonoValue className="text-xs">{r.interface ?? "—"}</MonoValue></TableCell>
                <TableCell><span className="tabular-nums text-xs">{r.preference ?? "—"}</span></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <StaticRouteDetailDialog route={selected} open={selected !== null} onOpenChange={(o) => { if (!o) setSelected(null) }} />
    </>
  )
}

// ─── PIM Interface Detail Dialog ──────────────────────────────────────────────

function PimInterfaceDetailDialog({ iface, open, onOpenChange }: { iface: MCPimIface | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  if (!iface) return null
  return (
    <DetailDialog title="IPv4 Multicast - PIM Interface" open={open} onOpenChange={onOpenChange}>
      <DisplayField label="Name" value={iface.name} />
      <DisplayField label="Description" value={iface.description ?? ""} className={!iface.description ? "opacity-50" : ""} />
      <DisplayField label="DR Priority" value={String(iface.drPriority ?? "")} />
      <Label className="flex items-center gap-2 py-1 pl-1">
        <Checkbox checked={iface.sendBsm} disabled />
        <span className="text-xs">Send BSM</span>
      </Label>
      <DisplayField label="Timer Profile" value={iface.ifTimer ?? "None"} />
      <DisplayField label="Neighbor Filter" value={iface.neighborFilter ?? "None"} />
    </DetailDialog>
  )
}

// ─── PIM Tab ──────────────────────────────────────────────────────────────────

function PimTab({ router }: { router: RouterDialogPageProps["router"] }) {
  const pim = (router.multicast as MCConfig)?.pim
  const [selectedIface, setSelectedIface] = React.useState<MCPimIface | null>(null)

  if (!pim) return <p className="py-6 text-xs text-muted-foreground text-center">PIM not configured.</p>

  return (
    <Tabs defaultValue="general" className="flex flex-col min-h-0">
      <div className="shrink-0">
        <TabsList variant="line">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="group-permissions">Group Permissions</TabsTrigger>
          <TabsTrigger value="interfaces">Interfaces</TabsTrigger>
          <TabsTrigger value="rendezvous-point">Rendezvous Point</TabsTrigger>
        </TabsList>
      </div>

      <div className="flex-1 overflow-y-auto pt-3">
        <TabsContent value="general">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 py-1">
                <Checkbox checked={pim.enabled} disabled />
                <span className="text-xs">Enable</span>
              </Label>
              <DisplayField label="RPF Lookup Mode" value={pim.rpfLookupMode ?? "None"} />
              <DisplayField label="Interface General Timer" value="None" />
              <DisplayField label="Route Age Out Time (sec)" value={String(pim.routeAgeoutTime ?? "—")} />
              <DisplayField label="Multicast SSM Range" value={pim.ssmGroupList ?? "None"} />
            </div>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[11px]">GROUP ADDRESS</TableHead>
                    <TableHead className="text-[11px]">THRESHOLD (KBPS)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pim.sptThresholds.length === 0 ? (
                    <TableRow><TableCell colSpan={2} className="py-4 text-center text-xs text-muted-foreground">No thresholds.</TableCell></TableRow>
                  ) : pim.sptThresholds.map((t) => (
                    <TableRow key={t.groupAddress}>
                      <TableCell><MonoValue className="text-xs">{t.groupAddress}</MonoValue></TableCell>
                      <TableCell><span className="tabular-nums text-xs">{t.threshold ?? "—"}</span></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="group-permissions">
          <DisplayField label="Group Permission Access List" value={pim.groupPermission ?? "None"} />
        </TabsContent>

        <TabsContent value="interfaces">
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[11px]">NAME</TableHead>
                  <TableHead className="text-[11px]">DESCRIPTION</TableHead>
                  <TableHead className="text-[11px]">DR PRIORITY</TableHead>
                  <TableHead className="text-[11px]">SEND BSM</TableHead>
                  <TableHead className="text-[11px]">TIMER PROFILE</TableHead>
                  <TableHead className="text-[11px]">NEIGHBOR FILTER</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pim.interfaces.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="py-4 text-center text-xs text-muted-foreground">No interfaces configured.</TableCell></TableRow>
                ) : pim.interfaces.map((iface) => (
                  <TableRow key={iface.name} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedIface(iface)}>
                    <TableCell><MonoValue className="text-xs">{iface.name}</MonoValue></TableCell>
                    <TableCell><span className="text-xs text-muted-foreground">{iface.description ?? "—"}</span></TableCell>
                    <TableCell><span className="tabular-nums text-xs">{iface.drPriority ?? "—"}</span></TableCell>
                    <TableCell><Checkbox checked={iface.sendBsm} disabled /></TableCell>
                    <TableCell><span className="text-xs">{iface.ifTimer ?? "—"}</span></TableCell>
                    <TableCell><span className="text-xs">{iface.neighborFilter ?? "—"}</span></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <PimInterfaceDetailDialog iface={selectedIface} open={selectedIface !== null} onOpenChange={(o) => { if (!o) setSelectedIface(null) }} />
        </TabsContent>

        <TabsContent value="rendezvous-point">
          <div className="grid grid-cols-2 gap-6">
            <Fieldset className="h-full">
              <FieldsetLegend>Local RP</FieldsetLegend>
              <FieldsetContent>
                <DisplayField label="RP Type" value="Static RP" />
                <DisplayField label="Interface" value={pim.localRp?.interface ?? "None"} />
                <DisplayField label="RP Address" value={pim.localRp?.address ?? "None"} />
                <Label className="flex items-center gap-2 py-1">
                  <Checkbox checked={pim.localRp?.override ?? false} disabled />
                  <span className="text-xs">Override learned RP for the same group</span>
                </Label>
                <DisplayField label="Group List" value={pim.localRp?.groupList ?? "None"} />
              </FieldsetContent>
            </Fieldset>
            <Fieldset className="h-full">
              <FieldsetLegend>External RPs</FieldsetLegend>
              <FieldsetContent>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[11px]">IPV4 ADDRESS</TableHead>
                        <TableHead className="text-[11px]">GROUP LIST</TableHead>
                        <TableHead className="text-[11px]">OVERRIDE</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(pim.externalRps ?? []).length === 0 ? (
                        <TableRow><TableCell colSpan={3} className="py-4 text-center text-xs text-muted-foreground">No external RPs.</TableCell></TableRow>
                      ) : pim.externalRps.map((rp) => (
                        <TableRow key={rp.ipAddress}>
                          <TableCell><MonoValue className="text-xs">{rp.ipAddress}</MonoValue></TableCell>
                          <TableCell><span className="text-xs">{rp.groupList ?? "—"}</span></TableCell>
                          <TableCell><Checkbox checked={rp.override} disabled /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </FieldsetContent>
            </Fieldset>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  )
}

// ─── IGMP Dynamic Interface Detail Dialog ─────────────────────────────────────

function IgmpDynamicDetailDialog({ iface, open, onOpenChange }: { iface: MCIgmpDynamic | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  if (!iface) return null
  return (
    <DetailDialog title="IPv4 Multicast - IGMP Dynamic" open={open} onOpenChange={onOpenChange}>
      <DisplayField label="Interface" value={iface.name} />
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-foreground shrink-0">Version</span>
        <div className="flex gap-4">
          <Label className="flex items-center gap-1.5 text-xs"><Checkbox checked={iface.version === "2"} disabled />2</Label>
          <Label className="flex items-center gap-1.5 text-xs"><Checkbox checked={iface.version === "3"} disabled />3</Label>
        </div>
      </div>
      <DisplayField label="Robustness" value={String(iface.robustness ?? "")} />
      <DisplayField label="Group Filter" value={iface.groupFilter ?? "None"} />
      <DisplayField label="Max Groups" value={iface.maxGroups ?? "None"} />
      <DisplayField label="Max Sources" value={iface.maxSources ?? "None"} />
      <DisplayField label="Query Profile" value={iface.queryProfile ?? "None"} />
      <Label className="flex items-center gap-2 py-1 pl-1">
        <Checkbox checked={iface.routerAlertPolicing} disabled />
        <span className="text-xs">Drop IGMP packets without Router Alert option</span>
      </Label>
    </DetailDialog>
  )
}

// ─── IGMP Static Entry Detail Dialog ──────────────────────────────────────────

function IgmpStaticDetailDialog({ entry, open, onOpenChange }: { entry: MCIgmpStatic | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  if (!entry) return null
  return (
    <DetailDialog title="IPv4 Multicast - IGMP Static" open={open} onOpenChange={onOpenChange}>
      <DisplayField label="Name" value={entry.name} />
      <DisplayField label="Interface" value={entry.interface ?? "None"} />
      <DisplayField label="Group Address" value={entry.groupAddress ?? "None"} />
      <DisplayField label="Source Address" value={entry.sourceAddress ?? "None"} />
    </DetailDialog>
  )
}

// ─── MSDP Peer Detail Dialog ──────────────────────────────────────────────────

function MsdpPeerDetailDialog({ peer, open, onOpenChange }: { peer: MCMsdpPeer | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  if (!peer) return null
  return (
    <DetailDialog title="Logical Router - MSDP - Peer Detail" open={open} onOpenChange={onOpenChange} maxWidth="sm:max-w-2xl">
      <DisplayField label="Peer" value={peer.name} />
      <Fieldset>
        <FieldsetLegend>Source Interface</FieldsetLegend>
        <FieldsetContent>
          <DisplayField label="Interface" value={peer.localInterface ?? "None"} />
          <DisplayField label="IP" value={peer.localIp ?? "None"} />
        </FieldsetContent>
      </Fieldset>
      <Fieldset>
        <FieldsetLegend>Peer Address</FieldsetLegend>
        <FieldsetContent>
          <DisplayField label="Type" value="IP" />
          <DisplayField label="Address" value={peer.peerAddress ?? "None"} />
        </FieldsetContent>
      </Fieldset>
      <DisplayField label="Remote AS" value="None" />
      <DisplayField label="Authentication" value={peer.authProfile ?? "None"} />
      <DisplayField label="Max SA" value={String(peer.maxSa ?? "—")} />
      <Fieldset disabled={!peer.inboundSaFilter}>
        <FieldsetLegend>Peer Inbound SA Filter</FieldsetLegend>
        <FieldsetContent>
          <DisplayField label="Inbound SA Filter" value={peer.inboundSaFilter ?? "None"} />
        </FieldsetContent>
      </Fieldset>
      <Fieldset disabled={!peer.outboundSaFilter}>
        <FieldsetLegend>Peer Outbound SA Filter</FieldsetLegend>
        <FieldsetContent>
          <DisplayField label="Outbound SA Filter" value={peer.outboundSaFilter ?? "None"} />
        </FieldsetContent>
      </Fieldset>
    </DetailDialog>
  )
}

// ─── IGMP Tab — Dynamic/Static sub-tabs ───────────────────────────────────────

function IgmpTab({ router }: { router: RouterDialogPageProps["router"] }) {
  const igmp = (router.multicast as MCConfig)?.igmp
  const [selectedDynamic, setSelectedDynamic] = React.useState<MCIgmpDynamic | null>(null)
  const [selectedStatic, setSelectedStatic] = React.useState<MCIgmpStatic | null>(null)

  if (!igmp) return <p className="py-6 text-xs text-muted-foreground text-center">IGMP not configured.</p>

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2 py-1">
        <Checkbox checked={igmp.enabled} disabled />
        <span className="text-xs">Enable IGMP</span>
      </Label>

      <Tabs defaultValue="dynamic" className="flex flex-col min-h-0">
        <div className="shrink-0">
          <TabsList variant="line">
            <TabsTrigger value="dynamic">Dynamic</TabsTrigger>
            <TabsTrigger value="static">Static</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto pt-3">
          <TabsContent value="dynamic">
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[11px]">INTERFACE</TableHead>
                    <TableHead className="text-[11px]">VERSION</TableHead>
                    <TableHead className="text-[11px]">MAX SOURCES</TableHead>
                    <TableHead className="text-[11px]">MAX GROUPS</TableHead>
                    <TableHead className="text-[11px]">GROUP FILTER</TableHead>
                    <TableHead className="text-[11px]">QUERY PROFILE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {igmp.dynamicInterfaces.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="py-4 text-center text-xs text-muted-foreground">No dynamic interfaces.</TableCell></TableRow>
                  ) : igmp.dynamicInterfaces.map((iface) => (
                    <TableRow key={iface.name} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedDynamic(iface)}>
                      <TableCell><MonoValue className="text-xs">{iface.name}</MonoValue></TableCell>
                      <TableCell><span className="text-xs">{iface.version ?? "—"}</span></TableCell>
                      <TableCell><span className="text-xs">{iface.maxSources ?? "—"}</span></TableCell>
                      <TableCell><span className="text-xs">{iface.maxGroups ?? "—"}</span></TableCell>
                      <TableCell><span className="text-xs">{iface.groupFilter ?? "—"}</span></TableCell>
                      <TableCell><span className="text-xs">{iface.queryProfile ?? "—"}</span></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="static">
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[11px]">NAME</TableHead>
                    <TableHead className="text-[11px]">INTERFACE</TableHead>
                    <TableHead className="text-[11px]">GROUP ADDRESS</TableHead>
                    <TableHead className="text-[11px]">SOURCE ADDRESS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {igmp.staticEntries.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="py-4 text-center text-xs text-muted-foreground">No static entries.</TableCell></TableRow>
                  ) : igmp.staticEntries.map((entry) => (
                    <TableRow key={entry.name} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedStatic(entry)}>
                      <TableCell><span className="text-xs font-medium">{entry.name}</span></TableCell>
                      <TableCell><MonoValue className="text-xs">{entry.interface ?? "—"}</MonoValue></TableCell>
                      <TableCell><MonoValue className="text-xs">{entry.groupAddress ?? "—"}</MonoValue></TableCell>
                      <TableCell><MonoValue className="text-xs">{entry.sourceAddress ?? "—"}</MonoValue></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <IgmpDynamicDetailDialog iface={selectedDynamic} open={selectedDynamic !== null} onOpenChange={(o) => { if (!o) setSelectedDynamic(null) }} />
      <IgmpStaticDetailDialog entry={selectedStatic} open={selectedStatic !== null} onOpenChange={(o) => { if (!o) setSelectedStatic(null) }} />
    </div>
  )
}

// ─── MSDP Tab — General/Peers sub-tabs ────────────────────────────────────────

function MsdpTab({ router }: { router: RouterDialogPageProps["router"] }) {
  const msdp = (router.multicast as MCConfig)?.msdp
  const msdpRefs = router.msdpRefs
  const [selectedPeer, setSelectedPeer] = React.useState<MCMsdpPeer | null>(null)

  if (!msdp) return <p className="py-6 text-xs text-muted-foreground text-center">MSDP not configured.</p>

  return (
    <>
      <Tabs defaultValue="general" className="flex flex-col min-h-0">
        <div className="shrink-0">
          <TabsList variant="line">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="peers">Peers</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto pt-3">
          <TabsContent value="general">
            <div className="space-y-3">
              <Label className="flex items-center gap-2 py-1">
                <Checkbox checked={msdp.enabled} disabled />
                <span className="text-xs">Enable</span>
              </Label>
              <DisplayField label="Global Timer" value={msdpRefs?.globalTimerName ?? msdp.globalTimer ?? "None"} />
              <DisplayField label="Global Authentication" value={msdpRefs?.globalAuthName ?? msdp.globalAuth ?? "None"} />
              <Fieldset>
                <FieldsetLegend>Originator ID</FieldsetLegend>
                <FieldsetContent>
                  <DisplayField label="Interface" value={msdp.originatorInterface ?? "None"} />
                  <DisplayField label="IP" value={msdp.originatorIp ?? "None"} />
                </FieldsetContent>
              </Fieldset>
            </div>
          </TabsContent>

          <TabsContent value="peers">
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[11px]">PEER</TableHead>
                    <TableHead className="text-[11px]">PEER ADDRESS</TableHead>
                    <TableHead className="text-[11px]">SOURCE ADDRESS</TableHead>
                    <TableHead className="text-[11px]">REMOTE AS</TableHead>
                    <TableHead className="text-[11px]">AUTHENTICATION</TableHead>
                    <TableHead className="text-[11px]">MAX SA</TableHead>
                    <TableHead className="text-[11px]">INBOUND SA FILTER</TableHead>
                    <TableHead className="text-[11px]">OUTBOUND SA FILTER</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {msdp.peers.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="py-4 text-center text-xs text-muted-foreground">No peers configured.</TableCell></TableRow>
                  ) : msdp.peers.map((peer) => (
                    <TableRow key={peer.name} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedPeer(peer)}>
                      <TableCell><span className="text-xs font-medium">{peer.name}</span></TableCell>
                      <TableCell><MonoValue className="text-xs">{peer.peerAddress ?? "—"}</MonoValue></TableCell>
                      <TableCell><MonoValue className="text-xs">{peer.localIp ?? "—"}</MonoValue></TableCell>
                      <TableCell><span className="text-xs">—</span></TableCell>
                      <TableCell><span className="text-xs">{peer.authProfile ?? "—"}</span></TableCell>
                      <TableCell><span className="tabular-nums text-xs">{peer.maxSa ?? "—"}</span></TableCell>
                      <TableCell><span className="text-xs">{peer.inboundSaFilter ?? "—"}</span></TableCell>
                      <TableCell><span className="text-xs">{peer.outboundSaFilter ?? "—"}</span></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <MsdpPeerDetailDialog peer={selectedPeer} open={selectedPeer !== null} onOpenChange={(o) => { if (!o) setSelectedPeer(null) }} />
    </>
  )
}

// ─── Multicast Page (exported) ────────────────────────────────────────────────

export function MulticastPage({ router }: RouterDialogPageProps) {
  const enabled = router.multicast?.enabled ?? false

  return (
    <div className="flex h-full flex-col min-h-0">
      <div className="shrink-0 border-b px-4 py-2.5">
        <Label className="flex items-center gap-2 py-1">
          <Checkbox checked={enabled} disabled />
          <span className="text-xs">Enable Multicast Protocol</span>
        </Label>
      </div>

      <Tabs defaultValue="static" className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 border-b px-4">
          <TabsList variant="line">
            <TabsTrigger value="static">Static</TabsTrigger>
            <TabsTrigger value="pim">PIM</TabsTrigger>
            <TabsTrigger value="igmp">IGMP</TabsTrigger>
            <TabsTrigger value="msdp">MSDP</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <TabsContent value="static">
            <StaticTab router={router} />
          </TabsContent>
          <TabsContent value="pim">
            <PimTab router={router} />
          </TabsContent>
          <TabsContent value="igmp">
            <IgmpTab router={router} />
          </TabsContent>
          <TabsContent value="msdp">
            <MsdpTab router={router} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
