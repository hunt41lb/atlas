// @/app/(main)/network/_components/routing-profiles/filters/route-map-entry-dialogs.tsx
//
// Entry-level detail dialogs for Route Map entries.
// Shows 3 tabs: Entry | Match | Set — matching the PAN-OS GUI.
//
// Design principles:
//   - All fields always rendered (shows "None" when not configured)
//   - RadioGroup for option-set fields (Metric Type, Action)
//   - Card grouping to separate logical sections on Set tab

"use client"

import * as React from "react"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

import type {
  PanwBgpRouteMapEntry,
  PanwBgpRouteMapMatch,
  PanwBgpRouteMapSet,
  PanwRedistRouteMapEntry,
  PanwRedistRouteMapMatch,
  PanwRedistRouteMapSet,
  PanwRouteMapFilterRef,
} from "@/lib/panw-parser/routing-profiles"

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED FIELD RENDERERS
// ═══════════════════════════════════════════════════════════════════════════════

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  const display = value !== null && value !== undefined && value !== "" ? String(value) : "None"
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="w-30 shrink-0 text-right text-[13px] text-muted-foreground">{label}</span>
      <Input readOnly value={display} className="h-7 flex-1 text-[13px]" />
    </div>
  )
}

function CheckboxField({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="w-30 shrink-0 text-right text-[13px] text-muted-foreground" />
      <label className="flex items-center gap-2 text-[13px]">
        <input type="checkbox" checked={checked} readOnly className="accent-primary" />
        {label}
      </label>
    </div>
  )
}

function RadioField({
  label,
  value,
  options,
}: {
  label: string
  value: string | null | undefined
  options: { value: string; label: string }[]
}) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="w-30 shrink-0 text-right text-[13px] text-muted-foreground">{label}</span>
      <RadioGroup value={value ?? ""} disabled className="flex gap-5">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2">
            <RadioGroupItem value={opt.value} />
            <span className="text-[13px]">{opt.label}</span>
          </label>
        ))}
      </RadioGroup>
    </div>
  )
}

function ActionDisplay({ action }: { action: string }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="w-30 shrink-0 text-right text-[13px] text-muted-foreground">Action</span>
      <RadioGroup value={action} disabled className="flex gap-5">
        <label className="flex items-center gap-2">
          <RadioGroupItem value="deny" />
          <span className="text-[13px]">Deny</span>
        </label>
        <label className="flex items-center gap-2">
          <RadioGroupItem value="permit" />
          <span className="text-[13px]">Permit</span>
        </label>
      </RadioGroup>
    </div>
  )
}

function FilterRefFields({ filterRef }: { filterRef: PanwRouteMapFilterRef | null }) {
  return (
    <>
      <Field label="Access List" value={filterRef?.accessList} />
      <Field label="Prefix List" value={filterRef?.prefixList} />
    </>
  )
}

function ListPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md border">
      <div className="border-b bg-muted/50 px-3 py-1.5">
        <span className="text-[11px] font-semibold tracking-wider text-muted-foreground">{title}</span>
      </div>
      <div className="p-2 min-h-10">
        {items.length === 0
          ? <span className="text-xs text-muted-foreground">None</span>
          : items.map((item, i) => (
              <div key={i} className="text-xs font-mono py-0.5">{item}</div>
            ))
        }
      </div>
    </div>
  )
}

function DialogFooterBar() {
  return (
    <div className="shrink-0 border-t bg-muted/50 rounded-b-xl px-5 py-3 flex justify-end">
      <DialogClose render={<Button variant="outline">Close</Button>} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENTRY TAB (shared)
// ═══════════════════════════════════════════════════════════════════════════════

function EntryTab({ entry }: { entry: { sequence: string; description: string | null; action: string } }) {
  return (
    <div className="p-5">
      <Field label="Seq" value={entry.sequence} />
      <Field label="Description" value={entry.description} />
      <ActionDisplay action={entry.action} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// BGP ROUTE MAP — MATCH TAB
// ═══════════════════════════════════════════════════════════════════════════════

function BgpMatchTab({ match }: { match: PanwBgpRouteMapMatch }) {
  const [ipVersion, setIpVersion] = React.useState<"ipv4" | "ipv6">("ipv4")
  const [addressTab, setAddressTab] = React.useState("address")

  const filterRef = ipVersion === "ipv4"
    ? (addressTab === "address" ? match.ipv4Address : addressTab === "next-hop" ? match.ipv4NextHop : match.ipv4RouteSource)
    : (addressTab === "address" ? match.ipv6Address : match.ipv6NextHop)

  return (
    <div className="p-5 space-y-4">
      <Card size="sm">
        <CardContent>
          <div className="grid grid-cols-2 gap-x-6">
            <div>
              <Field label="AS Path Access List" value={match.asPathAccessList} />
              <Field label="Regular Community" value={match.regularCommunity} />
              <Field label="Large Community" value={match.largeCommunity} />
              <Field label="Extended Community" value={match.extendedCommunity} />
              <Field label="Metric" value={match.metric} />
            </div>
            <div>
              <Field label="Interface" value={match.interface} />
              <Field label="Origin" value={match.origin} />
              <Field label="Tag" value={match.tag} />
              <Field label="Local Preference" value={match.localPreference} />
              <Field label="Peer" value={match.peer} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader className="border-b">
          <Tabs value={ipVersion} onValueChange={(v) => { setIpVersion(v as "ipv4" | "ipv6"); setAddressTab("address") }}>
            <TabsList variant="line">
              <TabsTrigger value="ipv4">IPv4</TabsTrigger>
              <TabsTrigger value="ipv6">IPv6</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <Tabs value={addressTab} onValueChange={setAddressTab} className="flex flex-col">
            <TabsList variant="line">
              <TabsTrigger value="address">Address</TabsTrigger>
              <TabsTrigger value="next-hop">Next Hop</TabsTrigger>
              {ipVersion === "ipv4" && (
                <TabsTrigger value="route-source">Route Source</TabsTrigger>
              )}
            </TabsList>
            <TabsContent value={addressTab}>
              <FilterRefFields filterRef={filterRef} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// BGP ROUTE MAP — SET TAB
// ═══════════════════════════════════════════════════════════════════════════════

function BgpSetTab({ set }: { set: PanwBgpRouteMapSet }) {
  return (
    <div className="p-5 space-y-4">
      <CheckboxField label="Enable BGP atomic aggregate" checked={set.atomicAggregate} />

      <div className="grid grid-cols-2 gap-4">
        {/* Left column */}
        <div className="space-y-4">
          <Card size="sm">
            <CardHeader className="border-b">
              <CardTitle>Aggregator</CardTitle>
            </CardHeader>
            <CardContent>
              <Field label="Aggregator AS" value={set.aggregator?.as} />
              <Field label="Router ID" value={set.aggregator?.routerId} />
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader className="border-b">
              <CardTitle>IP</CardTitle>
            </CardHeader>
            <CardContent>
              <Field label="Source Address" value={set.ipv4SourceAddress} />
              <Field label="IPv4 Next-Hop" value={set.ipv4NextHop} />
              <Field label="IPv6 Next-Hop" value={set.ipv6NextHop} />
              <CheckboxField label="IPv6 Next-Hop prefer global" checked={set.ipv6NextHopPreferGlobal} />
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <Card size="sm">
            <CardHeader className="border-b">
              <CardTitle>Attributes</CardTitle>
            </CardHeader>
            <CardContent>
              <Field label="Local Preference" value={set.localPreference} />
              <Field label="Tag" value={set.tag} />
              <Field label="Metric Action" value={set.metric?.action} />
              <Field label="Metric Value" value={set.metric?.value} />
              <Field label="Weight" value={set.weight} />
              <Field label="Origin" value={set.origin} />
              <Field label="Originator ID" value={set.originatorId} />
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader className="border-b">
              <CardTitle>Community Removal</CardTitle>
            </CardHeader>
            <CardContent>
              <Field label="Delete Regular" value={set.removeRegularCommunity} />
              <Field label="Delete Large" value={set.removeLargeCommunity} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom list panels */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <ListPanel title="ASPATH EXCLUDE" items={set.aspathExclude} />
        <ListPanel title="ASPATH PREPEND" items={set.aspathPrepend} />
        <div className="space-y-1">
          <CheckboxField label="Overwrite Regular Community" checked={set.overwriteRegularCommunity} />
          <ListPanel title="REGULAR COMMUNITY" items={set.regularCommunity} />
        </div>
        <div className="space-y-1">
          <CheckboxField label="Overwrite Large Community" checked={set.overwriteLargeCommunity} />
          <ListPanel title="LARGE COMMUNITY" items={set.largeCommunity} />
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// BGP ROUTE MAP ENTRY DIALOG
// ═══════════════════════════════════════════════════════════════════════════════

export function BgpRouteMapEntryDialog({
  entry,
  open,
  onOpenChange,
}: {
  entry: PanwBgpRouteMapEntry | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!entry) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl h-[min(85vh,680px)] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="shrink-0 border-b px-5 pt-4 pb-3">
          <DialogTitle>Filters Route Map - BGP</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="entry" className="flex h-full flex-col min-h-0">
            <div className="shrink-0 border-b px-5">
              <TabsList variant="line">
                <TabsTrigger value="entry">Entry</TabsTrigger>
                <TabsTrigger value="match">Match</TabsTrigger>
                <TabsTrigger value="set">Set</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="entry"><EntryTab entry={entry} /></TabsContent>
            <TabsContent value="match"><BgpMatchTab match={entry.match} /></TabsContent>
            <TabsContent value="set"><BgpSetTab set={entry.set} /></TabsContent>
          </Tabs>
        </div>

        <DialogFooterBar />
      </DialogContent>
    </Dialog>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// REDISTRIBUTION ROUTE MAP — MATCH TAB
// ═══════════════════════════════════════════════════════════════════════════════

function RedistMatchTab({
  match,
  sourceProtocol,
}: {
  match: PanwRedistRouteMapMatch
  sourceProtocol: string
}) {
  const isBgpSource = sourceProtocol === "bgp"
  const [ipVersion, setIpVersion] = React.useState<"ipv4" | "ipv6">("ipv4")
  const [addressTab, setAddressTab] = React.useState("address")

  // Resolve filter ref based on IP version and address tab
  const getFilterRef = (tab: string) => {
    if (ipVersion === "ipv6") {
      return tab === "address" ? match.ipv6Address : match.ipv6NextHop
    }
    // IPv4 — check wrapped first, then direct
    const hasIpv4Wrapped = match.ipv4Address !== null || match.ipv4NextHop !== null
    if (hasIpv4Wrapped) {
      return tab === "address" ? match.ipv4Address
        : tab === "next-hop" ? match.ipv4NextHop
        : (match.ipv4RouteSource ?? null)
    }
    return tab === "address" ? match.address : match.nextHop
  }

  const filterRef = getFilterRef(addressTab)

  return (
    <div className="p-5">
      {isBgpSource ? (
        <div className="space-y-4">
          <Card size="sm">
            <CardContent>
              <div className="grid grid-cols-2 gap-x-6">
                <div>
                  <Field label="AS Path Access List" value={match.asPathAccessList} />
                  <Field label="Regular Community" value={match.regularCommunity} />
                  <Field label="Large Community" value={match.largeCommunity} />
                  <Field label="Extended Community" value={match.extendedCommunity} />
                  <Field label="Metric" value={match.metric} />
                </div>
                <div>
                  <Field label="Interface" value={match.interface} />
                  <Field label="Origin" value={match.origin} />
                  <Field label="Tag" value={match.tag} />
                  <Field label="Local Preference" value={match.localPreference} />
                  <Field label="Peer" value={match.peer} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader className="border-b">
              <Tabs value={ipVersion} onValueChange={(v) => { setIpVersion(v as "ipv4" | "ipv6"); setAddressTab("address") }}>
                <TabsList variant="line">
                  <TabsTrigger value="ipv4">IPv4</TabsTrigger>
                  <TabsTrigger value="ipv6">IPv6</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <Tabs value={addressTab} onValueChange={setAddressTab} className="flex flex-col">
                <TabsList variant="line">
                  <TabsTrigger value="address">Address</TabsTrigger>
                  <TabsTrigger value="next-hop">Next Hop</TabsTrigger>
                  {ipVersion === "ipv4" && (
                    <TabsTrigger value="route-source">Route Source</TabsTrigger>
                  )}
                </TabsList>
                <TabsContent value={addressTab}>
                  <FilterRefFields filterRef={filterRef} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          <Card size="sm">
            <CardContent>
              <Field label="Metric" value={match.metric} />
              <Field label="Interface" value={match.interface} />
              <Field label="Tag" value={match.tag} />
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader className="border-b">
              <Tabs value={ipVersion} onValueChange={(v) => { setIpVersion(v as "ipv4" | "ipv6"); setAddressTab("address") }}>
                <TabsList variant="line">
                  <TabsTrigger value="ipv4">IPv4</TabsTrigger>
                  <TabsTrigger value="ipv6">IPv6</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <Tabs value={addressTab} onValueChange={setAddressTab} className="flex flex-col">
                <TabsList variant="line">
                  <TabsTrigger value="address">Address</TabsTrigger>
                  <TabsTrigger value="next-hop">Next Hop</TabsTrigger>
                </TabsList>
                <TabsContent value={addressTab}>
                  <FilterRefFields filterRef={filterRef} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// REDISTRIBUTION ROUTE MAP — SET TAB
// ═══════════════════════════════════════════════════════════════════════════════

function RedistSetTab({
  set,
  destProtocol,
}: {
  set: PanwRedistRouteMapSet
  destProtocol: string
}) {
  const isBgpDest = destProtocol === "bgp"

  if (isBgpDest) {
    return (
      <div className="p-5 space-y-4">
        <CheckboxField label="Enable BGP atomic aggregate" checked={set.atomicAggregate} />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <Card size="sm">
              <CardHeader className="border-b">
                <CardTitle>Aggregator</CardTitle>
              </CardHeader>
              <CardContent>
                <Field label="Aggregator AS" value={set.aggregator?.as} />
                <Field label="Router ID" value={set.aggregator?.routerId} />
              </CardContent>
            </Card>

            <Card size="sm">
              <CardHeader className="border-b">
                <CardTitle>IP</CardTitle>
              </CardHeader>
              <CardContent>
                <Field label="Source Address" value={set.ipv4SourceAddress} />
                <Field label="IPv4 Next-Hop" value={set.ipv4NextHop} />
                <Field label="IPv6 Source Address" value={set.ipv6SourceAddress} />
                <Field label="IPv6 Next-Hop" value={set.ipv6NextHop} />
              </CardContent>
            </Card>
          </div>

          <Card size="sm">
            <CardHeader className="border-b">
              <CardTitle>Attributes</CardTitle>
            </CardHeader>
            <CardContent>
              <Field label="Local Preference" value={set.localPreference} />
              <Field label="Tag" value={set.tag} />
              <Field label="Metric Action" value={set.metric?.action} />
              <Field label="Metric Value" value={set.metric?.value} />
              <Field label="Weight" value={set.weight} />
              <Field label="Origin" value={set.origin} />
              <Field label="Originator ID" value={set.originatorId} />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <ListPanel title="ASPATH PREPEND" items={set.aspathPrepend} />
          <ListPanel title="REGULAR COMMUNITY" items={set.regularCommunity} />
          <ListPanel title="LARGE COMMUNITY" items={set.largeCommunity} />
        </div>
      </div>
    )
  }

  const isOspfDest = destProtocol === "ospf" || destProtocol === "ospfv3"
  const isRibDest = destProtocol === "rib"

  // Non-BGP destination — OSPF, OSPFv3, RIP, or Rib
  return (
    <div className="p-5 space-y-4">
      <Card size="sm">
        <CardHeader className="border-b">
          <CardTitle>Metric</CardTitle>
        </CardHeader>
        <CardContent>
          <Field label="Metric Action" value={set.metric?.action} />
          <Field label="Metric Value" value={set.metric?.value} />
        </CardContent>
      </Card>

      <Card size="sm">
        <CardContent>
          {isOspfDest && (
            <RadioField
              label="Metric Type"
              value={set.metricType}
              options={[
                { value: "type-1", label: "Type 1" },
                { value: "type-2", label: "Type 2" },
              ]}
            />
          )}
          <Field label="Next Hop" value={set.nextHop} />
          <Field label="Tag" value={set.tag} />
          {isRibDest && (
            <Field label="Source Address" value={set.sourceAddress} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// REDISTRIBUTION ROUTE MAP ENTRY DIALOG
// ═══════════════════════════════════════════════════════════════════════════════

const SOURCE_LABELS: Record<string, string> = {
  "connected-static": "Static/Connected",
  rip: "RIP",
  bgp: "BGP",
  ospf: "OSPF",
  ospfv3: "OSPFv3",
}

const DEST_LABELS: Record<string, string> = {
  ospf: "OSPF",
  bgp: "BGP",
  ospfv3: "OSPFv3",
  rip: "RIP",
  rib: "RIB",
}

export function RedistRouteMapEntryDialog({
  entry,
  sourceProtocol,
  destProtocol,
  open,
  onOpenChange,
}: {
  entry: PanwRedistRouteMapEntry | null
  sourceProtocol: string
  destProtocol: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!entry) return null

  const srcLabel = SOURCE_LABELS[sourceProtocol] ?? sourceProtocol
  const destLabel = DEST_LABELS[destProtocol] ?? destProtocol

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl h-[min(85vh,680px)] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="shrink-0 border-b px-5 pt-4 pb-3">
          <DialogTitle>Redistribution - {srcLabel} - {destLabel}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="entry" className="flex h-full flex-col min-h-0">
            <div className="shrink-0 border-b px-5">
              <TabsList variant="line">
                <TabsTrigger value="entry">Entry</TabsTrigger>
                <TabsTrigger value="match">Match</TabsTrigger>
                <TabsTrigger value="set">Set</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="entry"><EntryTab entry={entry} /></TabsContent>
            <TabsContent value="match"><RedistMatchTab match={entry.match} sourceProtocol={sourceProtocol} /></TabsContent>
            <TabsContent value="set"><RedistSetTab set={entry.set} destProtocol={destProtocol} /></TabsContent>
          </Tabs>
        </div>

        <DialogFooterBar />
      </DialogContent>
    </Dialog>
  )
}
