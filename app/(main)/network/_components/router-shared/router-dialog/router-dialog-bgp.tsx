// @/app/(main)/network/_components/router-shared/router-dialog/router-dialog-bgp.tsx

"use client"

import * as React from "react"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"

import type {
  PanwLrBgpPeerGroup,
  PanwLrBgpAggregateRoute
} from "@/lib/panw-parser/types"
import {
  ReadOnlyCheckbox,
  FieldGroup,
  LabeledValue,
  HeaderField,
  Dash,
  DetailDialog
} from "./field-display"
import { MonoValue } from "@/app/(main)/_components/ui/category-shell"
import type { RouterDialogPageProps } from "./router-dialog-general"

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
          <ReadOnlyCheckbox checked={refs?.enabled ?? cfg?.enabled ?? false} label="Enable" />
          <HeaderField label="Router ID" value={refs?.routerId ?? cfg?.routerId ?? "None"} />
          <HeaderField label="Local AS" value={refs?.localAs ?? cfg?.localAs ?? "None"} />
          <HeaderField label="Global BFD Profile" value={refs?.globalBfdProfile ?? (cfg as { globalBfdProfile?: string | null })?.globalBfdProfile ?? "None"} />
        </div>
      </div>

      {/* Options */}
      <FieldGroup title="Options">
        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
          <div className="space-y-1">
            <ReadOnlyCheckbox checked={(cfg as { installRoute?: boolean })?.installRoute ?? false} label="Install Route" />
            <ReadOnlyCheckbox checked={(cfg as { fastExternalFailover?: boolean })?.fastExternalFailover ?? false} label="Fast Failover" />
            <ReadOnlyCheckbox checked={(cfg as { gracefulShutdown?: boolean })?.gracefulShutdown ?? false} label="Graceful Shutdown" />
          </div>
          <div className="space-y-1">
            <ReadOnlyCheckbox checked={(cfg as { ecmpMultiAs?: boolean })?.ecmpMultiAs ?? false} label="ECMP Multiple AS Support" />
            <ReadOnlyCheckbox checked={(cfg as { enforceFirstAs?: boolean })?.enforceFirstAs ?? false} label="Enforce First AS" />
            <LabeledValue label="Default Local Preference" value={(cfg as { defaultLocalPreference?: number | null })?.defaultLocalPreference ?? "—"} />
          </div>
        </div>
      </FieldGroup>

      {/* Graceful Restart */}
      <FieldGroup title="Graceful Restart">
        <ReadOnlyCheckbox checked={gr?.enabled ?? false} label="Enable" />
        <LabeledValue label="Stale Route Time (sec)" value={gr?.staleRouteTime ?? "—"} />
        <LabeledValue label="Max Peer Restart Time (sec)" value={gr?.maxPeerRestartTime ?? "—"} />
        <LabeledValue label="Local Restart Time" value={gr?.localRestartTime ?? "—"} />
      </FieldGroup>

      {/* Path Selection */}
      <FieldGroup title="Path Selection">
        <ReadOnlyCheckbox checked={(cfg as { alwaysCompareMed?: boolean })?.alwaysCompareMed ?? false} label="Always Compare MED" />
        <ReadOnlyCheckbox checked={(cfg as { deterministicMedComparison?: boolean })?.deterministicMedComparison ?? false} label="Deterministic MED Comparison" />
      </FieldGroup>
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
        <FieldGroup title="Peer Group">
          <LabeledValue label="Name" value={pg.name} />
          <ReadOnlyCheckbox checked={pg.enabled} label="Enable" />
          <LabeledValue label="Type" value={pg.type ?? "—"} />
          <LabeledValue label="IPv4 Address Family" value={pg.addressFamily.ipv4 ?? "None"} />
          <LabeledValue label="IPv6 Address Family" value={pg.addressFamily.ipv6 ?? "None"} />
          <LabeledValue label="IPv4 Filtering Profile" value={pg.filteringProfile.ipv4 ?? "None"} />
          <LabeledValue label="IPv6 Filtering Profile" value={pg.filteringProfile.ipv6 ?? "None"} />
        </FieldGroup>
        <FieldGroup title="Connection Options">
          <LabeledValue label="Auth Profile" value={pg.connectionOptions.auth ?? "None"} />
          <LabeledValue label="Timer Profile" value={pg.connectionOptions.timers ?? "None"} />
          <LabeledValue label="Multi Hop" value={pg.connectionOptions.multihop ?? "None"} />
          <LabeledValue label="Dampening Profile" value={pg.connectionOptions.dampening ?? "None"} />
        </FieldGroup>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[11px]">PEER</TableHead>
              <TableHead className="text-[11px]">ENABLE</TableHead>
              <TableHead className="text-[11px]">PEER AS</TableHead>
              <TableHead className="text-[11px]">INHERIT</TableHead>
              <TableHead className="text-[11px]">LOCAL ADDRESS</TableHead>
              <TableHead className="text-[11px]">PEER ADDRESS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pg.peers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-6 text-center text-xs text-muted-foreground">No peers configured.</TableCell>
              </TableRow>
            ) : pg.peers.map((peer) => (
              <TableRow key={peer.name}>
                <TableCell><span className="text-xs font-medium">{peer.name}</span></TableCell>
                <TableCell>{peer.enabled ? <Checkbox checked disabled /> : <Checkbox disabled />}</TableCell>
                <TableCell><span className="text-xs">{peer.peerAs ?? <Dash />}</span></TableCell>
                <TableCell><span className="text-xs">{peer.inherit ? "yes" : "no"}</span></TableCell>
                <TableCell><MonoValue className="text-xs">{peer.localAddress ?? "—"}</MonoValue></TableCell>
                <TableCell><MonoValue className="text-xs">{peer.peerAddress ?? "—"}</MonoValue></TableCell>
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

  // Count enabled peers
  const peerSummary = (pg: PanwLrBgpPeerGroup) => {
    const enabled = pg.peers.filter(p => p.enabled).length
    return `${enabled} enabled/ ${pg.peers.length}`
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[11px]">NAME</TableHead>
              <TableHead className="text-[11px]">ENABLE</TableHead>
              <TableHead className="text-[11px]">TYPE</TableHead>
              <TableHead className="text-[11px]">IPV4 ADDRESS FAMILY</TableHead>
              <TableHead className="text-[11px]">IPV6 ADDRESS FAMILY</TableHead>
              <TableHead className="text-[11px]">IPV4 FILTERING PROFILE</TableHead>
              <TableHead className="text-[11px]">IPV6 FILTERING PROFILE</TableHead>
              <TableHead className="text-[11px]">AUTH PROFILE</TableHead>
              <TableHead className="text-[11px]">TIMER PROFILE</TableHead>
              <TableHead className="text-[11px]">MULTI HOP</TableHead>
              <TableHead className="text-[11px]">DAMPENING PROFILE</TableHead>
              <TableHead className="text-[11px]">PEER</TableHead>
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
                <TableCell>{pg.enabled ? <Checkbox checked disabled /> : <Checkbox disabled />}</TableCell>
                <TableCell><span className="text-xs">{pg.type ?? <Dash />}</span></TableCell>
                <TableCell><span className="text-xs truncate max-w-24 block">{pg.addressFamily.ipv4 ?? <Dash />}</span></TableCell>
                <TableCell><span className="text-xs truncate max-w-24 block">{pg.addressFamily.ipv6 ?? <Dash />}</span></TableCell>
                <TableCell><span className="text-xs truncate max-w-24 block">{pg.filteringProfile.ipv4 ?? <Dash />}</span></TableCell>
                <TableCell><span className="text-xs truncate max-w-24 block">{pg.filteringProfile.ipv6 ?? <Dash />}</span></TableCell>
                <TableCell><span className="text-xs truncate max-w-20 block">{pg.connectionOptions.auth ?? <Dash />}</span></TableCell>
                <TableCell><span className="text-xs truncate max-w-20 block">{pg.connectionOptions.timers ?? <Dash />}</span></TableCell>
                <TableCell><span className="text-xs">{pg.connectionOptions.multihop ?? <Dash />}</span></TableCell>
                <TableCell><span className="text-xs truncate max-w-24 block">{pg.connectionOptions.dampening ?? <Dash />}</span></TableCell>
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
      <ReadOnlyCheckbox checked={alwaysAdvertise} label="Always Advertise Network Route" />

      <Tabs defaultValue="ipv4" className="flex flex-col min-h-0">
        <div className="shrink-0">
          <TabsList variant="line" className="overflow-visible">
            <TabsTrigger value="ipv4">IPv4</TabsTrigger>
            <TabsTrigger value="ipv6">IPv6</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto pt-3">
        <TabsContent value="ipv4">
          <div className="rounded-md border">
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
                    <TableCell>{n.unicast ? <Checkbox checked disabled /> : <Checkbox disabled />}</TableCell>
                    <TableCell>{n.multicast ? <Checkbox checked disabled /> : <Checkbox disabled />}</TableCell>
                    <TableCell>{n.backdoor ? <Checkbox checked disabled /> : <Checkbox disabled />}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="ipv6">
          <div className="rounded-md border">
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
                    <TableCell>{n.unicast ? <Checkbox checked disabled /> : <Checkbox disabled />}</TableCell>
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
      <div className="flex items-center gap-4">
        <span className="text-xs text-muted-foreground w-44 text-right">IPv4 Redistribution Profile</span>
        <span className="text-xs">Unicast</span>
        <Input readOnly value={refs?.redistProfile.ipv4Unicast ?? "None"} className="h-7 flex-1 text-xs" />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-muted-foreground w-44 text-right">IPv6 Redistribution Profile</span>
        <span className="text-xs">Unicast</span>
        <Input readOnly value={refs?.redistProfile.ipv6Unicast ?? "None"} className="h-7 flex-1 text-xs" />
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
      <HeaderField labelWidth="w-44" label="Name" value={ar.name} />
      <HeaderField labelWidth="w-44" label="Description" value={ar.description ?? ""} />

      <div className="space-y-1 pl-46">
        <ReadOnlyCheckbox checked={ar.enabled} label="Enable" />
        <ReadOnlyCheckbox checked={ar.summaryOnly} label="Summary Only" />
        <ReadOnlyCheckbox checked={ar.asSet} label="AS Set" />
        <ReadOnlyCheckbox checked={ar.sameMed} label="Aggregate Same MED Only" />
      </div>

      <div className="flex items-center gap-4 pl-46">
        <span className="text-xs text-muted-foreground">Type</span>
        <span className="text-xs font-medium">{ar.type === "ipv4" ? "IPv4" : ar.type === "ipv6" ? "IPv6" : "—"}</span>
      </div>

      <HeaderField labelWidth="w-44" label="Summary Prefix" value={ar.summaryPrefix ?? "None"} />
      <HeaderField labelWidth="w-44" label="Suppress Map" value={ar.suppressMap ?? "None"} />
      <HeaderField labelWidth="w-44" label="Attribute Map" value={ar.attributeMap ?? "None"} />
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[11px]">NAME</TableHead>
              <TableHead className="text-[11px]">PREFIX</TableHead>
              <TableHead className="text-[11px]">SUPPRESS MAP</TableHead>
              <TableHead className="text-[11px]">ATTRIBUTE MAP</TableHead>
              <TableHead className="text-[11px]">AS SET</TableHead>
              <TableHead className="text-[11px]">SUMMARY ONLY</TableHead>
              <TableHead className="text-[11px]">AGGREGATE SAME MED</TableHead>
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
                <TableCell><MonoValue className="text-xs">{ar.summaryPrefix ?? <Dash />}</MonoValue></TableCell>
                <TableCell><span className="text-xs">{ar.suppressMap ?? <Dash />}</span></TableCell>
                <TableCell><span className="text-xs">{ar.attributeMap ?? <Dash />}</span></TableCell>
                <TableCell>{ar.asSet ? <Checkbox checked disabled /> : <Checkbox disabled />}</TableCell>
                <TableCell>{ar.summaryOnly ? <Checkbox checked disabled /> : <Checkbox disabled />}</TableCell>
                <TableCell><span className="text-xs">{ar.sameMed ? "true" : "false"}</span></TableCell>
                <TableCell>{ar.enabled ? <Checkbox checked disabled /> : <Checkbox disabled />}</TableCell>
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
