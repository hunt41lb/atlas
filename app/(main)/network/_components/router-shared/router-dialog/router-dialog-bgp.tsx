// @/app/(main)/network/_components/router-shared/router-dialog/router-dialog-bgp.tsx

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MonoValue } from "@/app/(main)/_components/ui/category-shell"
import type { PanwLrBgpPeerGroup, PanwLrBgpAggregateRoute } from "@/lib/panw-parser/types"
import type { RouterDialogPageProps } from "./router-dialog-general"

// ─── Shared label width ───────────────────────────────────────────────────────

const LW = "w-50"
const GLW = "w-35"

// ─── General Tab ──────────────────────────────────────────────────────────────

function GeneralTab({ router }: { router: RouterDialogPageProps["router"] }) {
  const refs = router.bgpRefs
  const cfg = router.bgp

  const gr = cfg?.gracefulRestart as { enabled?: boolean; staleRouteTime?: number | null; maxPeerRestartTime?: number | null; localRestartTime?: number | null } | undefined

  return (
    <div className="space-y-4 px-1">
      {/* Header row */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 py-1">
            <Checkbox checked={refs?.enabled ?? cfg?.enabled ?? false} disabled />
            <span className="text-xs">Enable</span>
          </Label>
          <DisplayField label="Router ID" value={refs?.routerId ?? cfg?.routerId ?? "None"} labelWidth={GLW} />
          <DisplayField label="Local AS" value={refs?.localAs ?? cfg?.localAs ?? "None"} labelWidth={GLW} />
          <DisplayField label="Global BFD Profile" value={refs?.globalBfdProfile ?? (cfg as { globalBfdProfile?: string | null })?.globalBfdProfile ?? "None"} labelWidth={GLW} />
        </div>
      </div>

      {/* Options */}
      <Fieldset>
        <FieldsetLegend>Options</FieldsetLegend>
        <FieldsetContent>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
            <div className="space-y-1">
              <Label className="flex items-center gap-2 py-1">
                <Checkbox checked={(cfg as { installRoute?: boolean })?.installRoute ?? false} disabled />
                <span className="text-xs">Install Route</span>
              </Label>
              <Label className="flex items-center gap-2 py-1">
                <Checkbox checked={(cfg as { fastExternalFailover?: boolean })?.fastExternalFailover ?? false} disabled />
                <span className="text-xs">Fast Failover</span>
              </Label>
              <Label className="flex items-center gap-2 py-1">
                <Checkbox checked={(cfg as { gracefulShutdown?: boolean })?.gracefulShutdown ?? false} disabled />
                <span className="text-xs">Graceful Shutdown</span>
              </Label>
            </div>
            <div className="space-y-1">
              <Label className="flex items-center gap-2 py-1">
                <Checkbox checked={(cfg as { ecmpMultiAs?: boolean })?.ecmpMultiAs ?? false} disabled />
                <span className="text-xs">ECMP Multiple AS Support</span>
              </Label>
              <Label className="flex items-center gap-2 py-1">
                <Checkbox checked={(cfg as { enforceFirstAs?: boolean })?.enforceFirstAs ?? false} disabled />
                <span className="text-xs">Enforce First AS</span>
              </Label>
              <DisplayField label="Default Local Preference" value={String((cfg as { defaultLocalPreference?: number | null })?.defaultLocalPreference ?? "—")} />
            </div>
          </div>
        </FieldsetContent>
      </Fieldset>

      {/* Graceful Restart */}
      <Fieldset disabled={!gr?.enabled}>
        <FieldsetLegend>
          <Label className="flex items-center gap-2">
            <Checkbox checked={gr?.enabled ?? false} disabled />
            Graceful Restart
          </Label>
        </FieldsetLegend>
        {gr?.enabled && (
          <FieldsetContent>
            <DisplayField label="Stale Route Time (sec)" value={String(gr?.staleRouteTime ?? "—")} labelWidth={LW} />
            <DisplayField label="Max Peer Restart Time (sec)" value={String(gr?.maxPeerRestartTime ?? "—")} labelWidth={LW} />
            <DisplayField label="Local Restart Time" value={String(gr?.localRestartTime ?? "—")} labelWidth={LW} />
          </FieldsetContent>
        )}
      </Fieldset>

      {/* Path Selection */}
      <Fieldset>
        <FieldsetLegend>Path Selection</FieldsetLegend>
        <FieldsetContent>
          <Label className="flex items-center gap-2 py-1">
            <Checkbox checked={(cfg as { alwaysCompareMed?: boolean })?.alwaysCompareMed ?? false} disabled />
            <span className="text-xs">Always Compare MED</span>
          </Label>
          <Label className="flex items-center gap-2 py-1">
            <Checkbox checked={(cfg as { deterministicMedComparison?: boolean })?.deterministicMedComparison ?? false} disabled />
            <span className="text-xs">Deterministic MED Comparison</span>
          </Label>
        </FieldsetContent>
      </Fieldset>
    </div>
  )
}

// ─── Peer Group Detail Dialog ─────────────────────────────────────────────────

function PeerGroupDetailDialog({
  pg,
  open,
  onOpenChange,
}: {
  pg: PanwLrBgpPeerGroup | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!pg) return null

  return (
    <DetailDialog title="BGP - Peer Group" open={open} onOpenChange={onOpenChange} maxWidth="sm:max-w-4xl">
      <div className="grid grid-cols-2 gap-4">
        <Fieldset className="h-full">
          <FieldsetLegend>Peer Group</FieldsetLegend>
          <FieldsetContent>
            <DisplayField label="Name" value={pg.name} />
            <Label className="flex items-center gap-2 py-1">
              <Checkbox checked={pg.enabled} disabled />
              <span className="text-xs">Enable</span>
            </Label>
            <DisplayField label="Type" value={pg.type ?? "—"} />
            <DisplayField label="IPv4 Address Family" value={pg.addressFamily.ipv4 ?? "None"} />
            <DisplayField label="IPv6 Address Family" value={pg.addressFamily.ipv6 ?? "None"} />
            <DisplayField label="IPv4 Filtering Profile" value={pg.filteringProfile.ipv4 ?? "None"} />
            <DisplayField label="IPv6 Filtering Profile" value={pg.filteringProfile.ipv6 ?? "None"} />
          </FieldsetContent>
        </Fieldset>
        <Fieldset className="h-full">
          <FieldsetLegend>Connection Options</FieldsetLegend>
          <FieldsetContent>
            <DisplayField label="Auth Profile" value={pg.connectionOptions.auth ?? "None"} />
            <DisplayField label="Timer Profile" value={pg.connectionOptions.timers ?? "None"} />
            <DisplayField label="Multi Hop" value={pg.connectionOptions.multihop ?? "None"} />
            <DisplayField label="Dampening Profile" value={pg.connectionOptions.dampening ?? "None"} />
          </FieldsetContent>
        </Fieldset>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[11px]">PEER</TableHead>
              <TableHead className="text-[11px]">ENABLE</TableHead>
              <TableHead className="text-[11px]">PEER AS</TableHead>
              <TableHead className="text-[11px]">INHERIT</TableHead>
              <TableHead className="text-[11px]">LOCAL ADDRESS</TableHead>
              <TableHead className="text-[11px]">PEER ADDRESS</TableHead>
              <TableHead className="text-[11px]">PASSIVE</TableHead>
              <TableHead className="text-[11px]">LOOP DETECT</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pg.peers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-6 text-center text-xs text-muted-foreground">No peers configured.</TableCell>
              </TableRow>
            ) : pg.peers.map((peer) => (
              <TableRow key={peer.name}>
                <TableCell><span className="text-xs font-medium">{peer.name}</span></TableCell>
                <TableCell><Checkbox checked={peer.enabled} disabled /></TableCell>
                <TableCell><span className="text-xs">{peer.peerAs ?? "—"}</span></TableCell>
                <TableCell><span className="text-xs">{peer.inherit ? "yes" : "no"}</span></TableCell>
                <TableCell><MonoValue className="text-xs">{peer.localAddress ?? "—"}</MonoValue></TableCell>
                <TableCell><MonoValue className="text-xs">{peer.peerAddress ?? "—"}</MonoValue></TableCell>
                <TableCell><Checkbox checked={peer.passive} disabled /></TableCell>
                <TableCell><Checkbox checked={peer.senderSideLoopDetection} disabled /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DetailDialog>
  )
}

// ─── Peer Group Tab ───────────────────────────────────────────────────────────

function PeerGroupTab({ router }: { router: RouterDialogPageProps["router"] }) {
  const refs = router.bgpRefs
  const [selectedPg, setSelectedPg] = React.useState<PanwLrBgpPeerGroup | null>(null)

  const peerGroups = refs?.peerGroups ?? []

  const peerSummary = (pg: PanwLrBgpPeerGroup) => {
    const enabled = pg.peers.filter(p => p.enabled).length
    return `${enabled} enabled/ ${pg.peers.length}`
  }

  return (
    <>
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[11px]">NAME</TableHead>
              <TableHead className="text-[11px]">ENABLE</TableHead>
              <TableHead className="text-[11px]">TYPE</TableHead>
              <TableHead className="text-[11px]">IPV4 AF</TableHead>
              <TableHead className="text-[11px]">IPV6 AF</TableHead>
              <TableHead className="text-[11px]">IPV4 FILTER</TableHead>
              <TableHead className="text-[11px]">IPV6 FILTER</TableHead>
              <TableHead className="text-[11px]">AUTH</TableHead>
              <TableHead className="text-[11px]">TIMERS</TableHead>
              <TableHead className="text-[11px]">MULTI HOP</TableHead>
              <TableHead className="text-[11px]">DAMPENING</TableHead>
              <TableHead className="text-[11px]">PEERS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {peerGroups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="py-6 text-center text-xs text-muted-foreground">No peer groups configured.</TableCell>
              </TableRow>
            ) : peerGroups.map((pg) => (
              <TableRow
                key={pg.name}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => setSelectedPg(pg)}
              >
                <TableCell><span className="text-xs font-medium">{pg.name}</span></TableCell>
                <TableCell><Checkbox checked={pg.enabled} disabled /></TableCell>
                <TableCell><span className="text-xs">{pg.type ?? "—"}</span></TableCell>
                <TableCell><span className="text-xs truncate max-w-24 block">{pg.addressFamily.ipv4 ?? "—"}</span></TableCell>
                <TableCell><span className="text-xs truncate max-w-24 block">{pg.addressFamily.ipv6 ?? "—"}</span></TableCell>
                <TableCell><span className="text-xs truncate max-w-24 block">{pg.filteringProfile.ipv4 ?? "—"}</span></TableCell>
                <TableCell><span className="text-xs truncate max-w-24 block">{pg.filteringProfile.ipv6 ?? "—"}</span></TableCell>
                <TableCell><span className="text-xs truncate max-w-20 block">{pg.connectionOptions.auth ?? "—"}</span></TableCell>
                <TableCell><span className="text-xs truncate max-w-20 block">{pg.connectionOptions.timers ?? "—"}</span></TableCell>
                <TableCell><span className="text-xs">{pg.connectionOptions.multihop ?? "—"}</span></TableCell>
                <TableCell><span className="text-xs truncate max-w-24 block">{pg.connectionOptions.dampening ?? "—"}</span></TableCell>
                <TableCell><span className="text-xs">{peerSummary(pg)}</span></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PeerGroupDetailDialog
        pg={selectedPg}
        open={selectedPg !== null}
        onOpenChange={(open) => { if (!open) setSelectedPg(null) }}
      />
    </>
  )
}

// ─── Network Tab ──────────────────────────────────────────────────────────────

function NetworkTab({ router }: { router: RouterDialogPageProps["router"] }) {
  const cfg = router.bgp
  const ipv4 = (cfg as { ipv4Networks?: { network: string; unicast: boolean; multicast: boolean; backdoor: boolean }[] })?.ipv4Networks ?? []
  const ipv6 = (cfg as { ipv6Networks?: { network: string; unicast: boolean }[] })?.ipv6Networks ?? []
  const alwaysAdvertise = (cfg as { alwaysAdvertiseNetworkRoute?: boolean })?.alwaysAdvertiseNetworkRoute ?? false

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2 py-1">
        <Checkbox checked={alwaysAdvertise} disabled />
        <span className="text-xs">Always Advertise Network Route</span>
      </Label>

      <Tabs defaultValue="ipv4" className="flex flex-col min-h-0">
        <div className="shrink-0">
          <TabsList variant="line" className="overflow-visible">
            <TabsTrigger value="ipv4">IPv4</TabsTrigger>
            <TabsTrigger value="ipv6">IPv6</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto pt-3">
          <TabsContent value="ipv4">
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[11px]">NETWORK</TableHead>
                    <TableHead className="text-[11px]">UNICAST</TableHead>
                    <TableHead className="text-[11px]">MULTICAST</TableHead>
                    <TableHead className="text-[11px]">BACKDOOR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ipv4.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-6 text-center text-xs text-muted-foreground">No IPv4 networks configured.</TableCell>
                    </TableRow>
                  ) : ipv4.map((n) => (
                    <TableRow key={n.network}>
                      <TableCell><MonoValue className="text-xs">{n.network}</MonoValue></TableCell>
                      <TableCell><Checkbox checked={n.unicast} disabled /></TableCell>
                      <TableCell><Checkbox checked={n.multicast} disabled /></TableCell>
                      <TableCell><Checkbox checked={n.backdoor} disabled /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="ipv6">
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[11px]">NETWORK</TableHead>
                    <TableHead className="text-[11px]">UNICAST</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ipv6.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="py-6 text-center text-xs text-muted-foreground">No IPv6 networks configured.</TableCell>
                    </TableRow>
                  ) : ipv6.map((n) => (
                    <TableRow key={n.network}>
                      <TableCell><MonoValue className="text-xs">{n.network}</MonoValue></TableCell>
                      <TableCell><Checkbox checked={n.unicast} disabled /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

// ─── Redistribution Tab ───────────────────────────────────────────────────────

function RedistributionTab({ router }: { router: RouterDialogPageProps["router"] }) {
  const refs = router.bgpRefs

  return (
    <div className="space-y-3 px-1">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground shrink-0 w-50">IPv4 Redistribution Profile</span>
        <span className="text-xs shrink-0">Unicast</span>
        <Input readOnly value={refs?.redistProfile.ipv4Unicast ?? "None"} size="sm" className="w-full" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground shrink-0 w-50">IPv6 Redistribution Profile</span>
        <span className="text-xs shrink-0">Unicast</span>
        <Input readOnly value={refs?.redistProfile.ipv6Unicast ?? "None"} size="sm" className="w-full" />
      </div>
    </div>
  )
}

// ─── Aggregate Route Detail Dialog ────────────────────────────────────────────

function AggregateRouteDetailDialog({
  ar,
  open,
  onOpenChange,
}: {
  ar: PanwLrBgpAggregateRoute | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!ar) return null

  return (
    <DetailDialog title="BGP - Aggregate Routes" open={open} onOpenChange={onOpenChange} maxWidth="sm:max-w-2xl">
      <DisplayField label="Name" value={ar.name} />
      <DisplayField label="Description" value={ar.description ?? ""} className={!ar.description ? "opacity-50" : ""} />

      <Fieldset>
        <FieldsetLegend>Options</FieldsetLegend>
        <FieldsetContent>
          <Label className="flex items-center gap-2 py-1">
            <Checkbox checked={ar.enabled} disabled />
            <span className="text-xs">Enable</span>
          </Label>
          <Label className="flex items-center gap-2 py-1">
            <Checkbox checked={ar.summaryOnly} disabled />
            <span className="text-xs">Summary Only</span>
          </Label>
          <Label className="flex items-center gap-2 py-1">
            <Checkbox checked={ar.asSet} disabled />
            <span className="text-xs">AS Set</span>
          </Label>
          <Label className="flex items-center gap-2 py-1">
            <Checkbox checked={ar.sameMed} disabled />
            <span className="text-xs">Aggregate Same MED Only</span>
          </Label>
          <DisplayField label="Type" value={ar.type === "ipv4" ? "IPv4" : ar.type === "ipv6" ? "IPv6" : "—"} />
        </FieldsetContent>
      </Fieldset>

      <DisplayField label="Summary Prefix" value={ar.summaryPrefix ?? "None"} />
      <DisplayField label="Suppress Map" value={ar.suppressMap ?? "None"} />
      <DisplayField label="Attribute Map" value={ar.attributeMap ?? "None"} />
    </DetailDialog>
  )
}

// ─── Aggregate Route Tab ──────────────────────────────────────────────────────

function AggregateRouteTab({ router }: { router: RouterDialogPageProps["router"] }) {
  const refs = router.bgpRefs
  const [selectedAr, setSelectedAr] = React.useState<PanwLrBgpAggregateRoute | null>(null)

  const routes = refs?.aggregateRoutes ?? []

  return (
    <>
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[11px]">NAME</TableHead>
              <TableHead className="text-[11px]">PREFIX</TableHead>
              <TableHead className="text-[11px]">SUPPRESS MAP</TableHead>
              <TableHead className="text-[11px]">ATTRIBUTE MAP</TableHead>
              <TableHead className="text-[11px]">AS SET</TableHead>
              <TableHead className="text-[11px]">SUMMARY ONLY</TableHead>
              <TableHead className="text-[11px]">SAME MED</TableHead>
              <TableHead className="text-[11px]">ENABLE</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-6 text-center text-xs text-muted-foreground">No aggregate routes configured.</TableCell>
              </TableRow>
            ) : routes.map((ar) => (
              <TableRow
                key={ar.name}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => setSelectedAr(ar)}
              >
                <TableCell><span className="text-xs font-medium">{ar.name}</span></TableCell>
                <TableCell><MonoValue className="text-xs">{ar.summaryPrefix ?? "—"}</MonoValue></TableCell>
                <TableCell><span className="text-xs">{ar.suppressMap ?? "—"}</span></TableCell>
                <TableCell><span className="text-xs">{ar.attributeMap ?? "—"}</span></TableCell>
                <TableCell><Checkbox checked={ar.asSet} disabled /></TableCell>
                <TableCell><Checkbox checked={ar.summaryOnly} disabled /></TableCell>
                <TableCell><Checkbox checked={ar.sameMed} disabled /></TableCell>
                <TableCell><Checkbox checked={ar.enabled} disabled /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AggregateRouteDetailDialog
        ar={selectedAr}
        open={selectedAr !== null}
        onOpenChange={(open) => { if (!open) setSelectedAr(null) }}
      />
    </>
  )
}

// ─── BGP Page (exported) ──────────────────────────────────────────────────────

export function BgpPage({ router }: RouterDialogPageProps) {
  return (
    <Tabs defaultValue="general" className="flex h-full flex-col min-h-0">
      <div className="shrink-0 border-b px-4">
        <TabsList variant="line">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="peer-group">Peer Group</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="redistribution">Redistribution</TabsTrigger>
          <TabsTrigger value="aggregate-route">Aggregate Route</TabsTrigger>
        </TabsList>
      </div>

      <div className="flex-1 min-h-0 p-4">
        <TabsContent value="general" className="overflow-y-auto">
          <GeneralTab router={router} />
        </TabsContent>
        <TabsContent value="peer-group" className="overflow-y-auto">
          <PeerGroupTab router={router} />
        </TabsContent>
        <TabsContent value="network" className="overflow-y-auto">
          <NetworkTab router={router} />
        </TabsContent>
        <TabsContent value="redistribution" className="overflow-y-auto">
          <RedistributionTab router={router} />
        </TabsContent>
        <TabsContent value="aggregate-route" className="overflow-y-auto">
          <AggregateRouteTab router={router} />
        </TabsContent>
      </div>
    </Tabs>
  )
}
